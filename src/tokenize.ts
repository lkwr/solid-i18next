const openTagRegex = /<(\w+)>/y;
const closeTagRegex = /<\/(\w+)>/y;
const selfClosingTagRegex = /<(\w+)\/>/y;

export type Token = string | [tag: string, content: Token[]];

type ParseResult = { tokens: Token[]; index: number };

const matchTag = (
	regex: RegExp,
	input: string,
	at: number,
): [raw: string, tag: string] | null => {
	regex.lastIndex = at;
	const match = regex.exec(input);
	const raw = match?.[0];
	const tag = match?.[1];
	return raw !== undefined && tag !== undefined ? [raw, tag] : null;
};

/**
 * Scans content starting at `index` until the closer matching `stopTag` (top
 * level: until end of input). Returns `null` when `stopTag` is set but never
 * closed, letting the caller degrade the opener to literal text and rescan.
 */
const parseContent = (
	input: string,
	index: number,
	stopTag?: string,
): ParseResult | null => {
	const tokens: Token[] = [];
	let text = "";
	let i = index;

	const flushText = () => {
		if (text) {
			tokens.push(text);
			text = "";
		}
	};

	while (i < input.length) {
		const tagStart = input.indexOf("<", i);
		if (tagStart === -1) {
			text += input.slice(i);
			i = input.length;
			break;
		}

		text += input.slice(i, tagStart);

		const open = matchTag(openTagRegex, input, tagStart);
		if (open) {
			const [raw, tag] = open;
			const child = parseContent(input, tagStart + raw.length, tag);
			if (child) {
				flushText();
				tokens.push([tag, child.tokens]);
				i = child.index;
			} else {
				// The tag is never closed: keep the opener as text and rescan
				// right after it, so its content is parsed on this level.
				text += raw;
				i = tagStart + raw.length;
			}
			continue;
		}

		const selfClosing = matchTag(selfClosingTagRegex, input, tagStart);
		if (selfClosing) {
			flushText();
			tokens.push([selfClosing[1], []]);
			i = tagStart + selfClosing[0].length;
			continue;
		}

		const close = matchTag(closeTagRegex, input, tagStart);
		if (close) {
			const [raw, tag] = close;
			if (tag === stopTag) {
				flushText();
				return { tokens, index: tagStart + raw.length };
			}
			// A closer for a tag this level never opened (or a stray closer at
			// the top level) is literal text.
			text += raw;
			i = tagStart + raw.length;
			continue;
		}

		// A "<" that starts no tag is literal text.
		text += "<";
		i = tagStart + 1;
	}

	if (stopTag !== undefined) return null;
	flushText();
	return { tokens, index: i };
};

export const tokenize = (input: string): Token[] =>
	// The top level has no stopTag and can never fail.
	parseContent(input, 0)?.tokens ?? [];
