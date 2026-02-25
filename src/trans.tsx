import type { TFunction, TOptions } from "i18next";
import { type Component, createMemo, type JSX } from "solid-js";
import { useTranslation } from "./use-translation.ts";

export type TransProps = {
	key: string;
	fallback?: string;

	components?: Record<string, JSX.Element>;
	replace?: TOptions["replace"];

	t?: TFunction;
	options?: TOptions;
};

export const Trans: Component<TransProps> = (props) => {
	const [contextT] = useTranslation(() => props.options?.ns);
	const t: TFunction = props.t ?? contextT;

	const mergedOptions = (): TOptions => ({
		...props.options,
		replace: { ...props.replace, ...props.options?.replace },
		interpolation: { escapeValue: false, ...props.options?.interpolation },
	});

	const nodes = createMemo<Record<string, Node>>(
		() =>
			Object.fromEntries(
				Object.entries(props.components ?? {})
					.map<[string, Node | undefined]>(([key, value]) => {
						if (value instanceof Node) return [key, value];

						console.warn(
							`Component for key "${key}" is not a valid Node.`,
							value,
						);
						return [key, undefined];
					})
					.filter(([_, node]) => node !== undefined),
			) as Record<string, Node>,
	);

	const translated = () =>
		props.fallback
			? t(props.key, props.fallback, mergedOptions())
			: t(props.key, mergedOptions());

	const transformed = createMemo((): JSX.Element[] => {
		const currentNodes = nodes();
		const currentTranslated = translated();

		const result: JSX.Element[] = [];

		for (const token of tokenize(currentTranslated)) {
			if (typeof token === "string") {
				result.push(token);
				continue;
			}

			const [tag, content] = token;
			let element = currentNodes[tag];
			if (!element) continue;

			element = element.cloneNode(true);
			element.textContent = content;
			result.push(element);
		}

		return result;
	});

	return <>{transformed()}</>;
};

//#region utils

const tokenizeRegex = /<(\w+)>(.*?)<\/\1>|<(\w+)\/>/g;
type Token = string | [tag: string, content: string];

const tokenize = (input: string): Token[] => {
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

//#endregion
