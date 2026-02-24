import type { TFunction, TOptions } from "i18next";
import {
	type Component,
	children,
	createContext,
	createMemo,
	type JSX,
	Show,
	useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

const TranslateContext = createContext<
	| {
			registerVariable: (name: string, value: unknown) => void;
	  }
	| undefined
>(undefined);

export type TranslatedJsxProps = {
	t: TFunction;
	key: string;
	children?: JSX.Element;
	options?: TOptions;
};

export const TranslatedJsx: Component<TranslatedJsxProps> = (props) => {
	const [variables, setVariables] = createStore<Record<string, unknown>>({});

	const translated = () =>
		props.t(props.key, {
			...props.options,
			replace: { ...variables, ...props.options?.replace },
		});

	const resolved = children(() => (
		<TranslateContext.Provider
			value={{ registerVariable: (key, value) => setVariables(key, value) }}
		>
			{props.children}
		</TranslateContext.Provider>
	));

	const transformed = createMemo((): JSX.Element[] => {
		const result: JSX.Element[] = [];

		const elements = resolved
			.toArray()
			.filter((child): child is Node => child instanceof Node);

		for (const token of tokenize(translated())) {
			if (typeof token === "string") {
				result.push(token);
				continue;
			}

			if (token.length === 2) {
				const [index, content] = token;
				const element = elements[index].cloneNode(true);

				element.textContent = content;
				result.push(element);
				continue;
			}

			if (token.length === 1) {
				const [index] = token;
				const element = elements[index].cloneNode(false);

				result.push(element);
			}
		}

		return result;
	});

	return (
		<Show when={translated() !== props.key} fallback={resolved()}>
			{transformed()}
		</Show>
	);
};

export function variable(record: Record<string, unknown>): JSX.Element;
export function variable(name: string, value?: unknown): JSX.Element;
export function variable(
	arg1: Record<string, unknown> | string,
	arg2?: unknown,
): JSX.Element {
	const ctx = useContext(TranslateContext);

	const [key, value] =
		typeof arg1 === "string" ? [arg1, arg2] : Object.entries(arg1)[0];
	const resolvedValue = typeof value === "function" ? value() : value;

	ctx?.registerVariable(key, resolvedValue);

	return resolvedValue;
}

//#region utils

const tokenizeRegex = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/g;
type Token = string | [number, string] | [number];

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
			result.push([Number(match[1]), match[2]]);
		} else if (match[3] !== undefined) {
			// <n/>
			result.push([Number(match[3])]);
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
