const tokenizeRegex = /<(\w+)>(.*?)<\/\1>|<(\w+)\/>/g;

export type Token = string | [tag: string, content: string];

export const tokenize = (input: string): Token[] => {
	const result: Token[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null = null;

	// biome-ignore lint/suspicious/noAssignInExpressions: cool
	while ((match = tokenizeRegex.exec(input)) !== null) {
		// Push text before the match
		if (match.index > lastIndex) {
			result.push(input.slice(lastIndex, match.index));
		}

		if (match[1] !== undefined) {
			// <n>text</n>
			result.push([match[1], match[2] ?? ""]);
		} else if (match[3] !== undefined) {
			// <n/>
			result.push([match[3], ""]);
		}

		lastIndex = tokenizeRegex.lastIndex;
	}

	// Push remaining text
	if (lastIndex < input.length) {
		result.push(input.slice(lastIndex));
	}

	return result;
};
