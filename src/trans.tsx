import type {
	i18n,
	KeyPrefix,
	Namespace,
	ParseKeys,
	TFunction,
	TOptions,
} from "i18next";
import {
	createMemo,
	type Element,
	type ParentComponent,
	useContext,
} from "solid-js";
import { I18nextContext } from "./context.tsx";
import { type Token, tokenize } from "./tokenize.ts";
import { useTranslation } from "./use-translation.ts";

export type TransComponent = ParentComponent;

export type TransProps<
	Key extends ParseKeys<Ns, TOpt, KPrefix>,
	Ns extends Namespace,
	KPrefix extends KeyPrefix<Ns> = undefined,
	TContext extends string | undefined = undefined,
	TOpt extends TOptions = TOptions,
> = {
	key: Key | Key[];
	defaultValue?: string;
	count?: number;
	context?: TContext;
	replace?: Record<string, unknown>;
	components?: Record<string, ParentComponent>;

	ns?: Ns;
	t?: TFunction<Ns, KPrefix>;
	i18n?: i18n;
	tOptions?: TOpt;
};

export const Trans = <
	Key extends ParseKeys<Ns, TOpt, KPrefix>,
	Ns extends Namespace,
	KPrefix extends KeyPrefix<Ns> = undefined,
	TContext extends string | undefined = undefined,
	TOpt extends TOptions = TOptions,
>(
	props: TransProps<Key, Ns, KPrefix, TContext, TOpt>,
): Element => {
	const [contextT] = useTranslation(() => props.tOptions?.ns);
	const contextComponents = useContext(I18nextContext).components;

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
			count: props.count ?? props.tOptions?.count,
			context: props.context ?? props.tOptions?.context,
			replace: { ...props.replace, ...props.tOptions?.replace },

			interpolation: { escapeValue: false, ...props.tOptions?.interpolation },
		}),
	);

	const getComponent = (tag: string): TransComponent | undefined => {
		const component = props.components?.[tag] ?? contextComponents()?.[tag];
		if (!component) {
			console.warn(`No component found for tag "${tag}".`);
			return (props) => <>{props.children}</>;
		}

		return component;
	};

	const translated = createMemo(() => {
		const key = props.key;
		const options = mergedOptions();
		const defaultValue = options.defaultValue as string;

		return defaultValue
			? t(key, defaultValue, options)
			: t(key, options as TOptions & { context?: never });
	});

	const renderTokens = (tokens: Token[]): Element[] =>
		tokens.map((token): Element => {
			if (typeof token === "string") return token;

			const [tag, content] = token;
			const Component = getComponent(tag);
			if (!Component) return null;

			return <Component>{renderTokens(content)}</Component>;
		});

	const transformed = createMemo((): Element[] =>
		renderTokens(tokenize(translated())),
	);

	return <>{transformed()}</>;
};
