import type { TFunction, TOptions } from "i18next";
import { type Component, createMemo, type JSX } from "solid-js";
import { useTranslation } from "./use-translation.ts";

export type TransEmbeddedComponent = Component<{ children?: string }>;

export type TransProps = {
	key: string;
	fallback?: string;

	components?: Record<string, TransEmbeddedComponent>;
	replace?: TOptions["replace"];

	t?: TFunction;
	options?: TOptions;
};

export const Trans: Component<TransProps> = (props) => {
	const [contextT] = useTranslation(() => props.options?.ns);

	const t = ((...args: Parameters<TFunction>) =>
		props.t
			? props.t(...(args as Parameters<TFunction>))
			: contextT(...(args as Parameters<TFunction>))) as TFunction;

	const mergedOptions = createMemo(
		(): TOptions => ({
			...props.options,
			replace: { ...props.replace, ...props.options?.replace },
			interpolation: { escapeValue: false, ...props.options?.interpolation },
		}),
	);

	const getComponent = (tag: string): TransEmbeddedComponent | undefined => {
		const component = props.components?.[tag];
		if (!component) {
			console.warn(`No component found for tag "${tag}".`);
			return undefined;
		}

		return component;
	};

	const translated = createMemo(() => {
		const key = props.key;
		const fallback = props.fallback;
		const options = mergedOptions();

		return fallback ? t(key, fallback, options) : t(key, options);
	});

	const transformed = createMemo((): JSX.Element[] => {
		const currentTranslated = translated();

		const result: JSX.Element[] = [];

		for (const token of tokenize(currentTranslated)) {
			if (typeof token === "string") {
				result.push(token);
				continue;
			}

			const [tag, content] = token;
			const Component = getComponent(tag);
			if (!Component) continue;

			result.push(<Component>{content}</Component>);
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
