import type { i18n, Namespace, ParseKeys, TFunction, TOptions } from "i18next";
import { type Component, createMemo, type JSX } from "solid-js";
import { useTranslation } from "./use-translation.ts";

export type TransComponent = Component<{ children?: string }>;

export type TransProps<
	Key extends ParseKeys<Ns, TOpt, KPrefix>,
	Ns extends Namespace,
	KPrefix = undefined,
	TContext extends string | undefined = undefined,
	TOpt extends TOptions = TOptions,
> = {
	key: Key | Key[];
	defaultValue?: string;
	count?: number;
	context?: TContext;
	replace?: Record<string, unknown>;
	components?: Record<string, TransComponent>;

	ns?: Ns;
	t?: TFunction<Ns, KPrefix>;
	i18n?: i18n;
	tOptions?: TOpt;
};

export const Trans = <
	Key extends ParseKeys<Ns, TOpt, KPrefix>,
	Ns extends Namespace,
	KPrefix = undefined,
	TContext extends string | undefined = undefined,
	TOpt extends TOptions = TOptions,
>(
	props: TransProps<Key, Ns, KPrefix, TContext, TOpt>,
): JSX.Element => {
	const [contextT] = useTranslation(() => props.tOptions?.ns);

	const t = ((...args: Parameters<TFunction>) =>
		props.t
			? props.t(...args)
			: props.i18n
				? props.i18n.t(...args)
				: contextT(...args)) as TFunction;

	const mergedOptions = createMemo(
		(): TOptions => ({
			...props.tOptions,

			ns: props.ns,
			defaultValue: props.defaultValue ?? props.tOptions?.defaultValue,
			count: props.count ?? props.count,
			context: props.context ?? props.tOptions?.context,
			replace: { ...props.replace, ...props.tOptions?.replace },

			interpolation: { escapeValue: false, ...props.tOptions?.interpolation },
		}),
	);

	const getComponent = (tag: string): TransComponent | undefined => {
		const component = props.components?.[tag];
		if (!component) {
			console.warn(`No component found for tag "${tag}".`);
			return undefined;
		}

		return component;
	};

	const translated = createMemo(() => {
		const key = props.key;
		const options = mergedOptions();
		const defaultValue = options.defaultValue as string;

		return defaultValue ? t(key, defaultValue, options) : t(key, options);
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
