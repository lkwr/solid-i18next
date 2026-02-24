import type { TFunction, TOptions } from "i18next";
import {
	type Component,
	children,
	createContext,
	createEffect,
	createMemo,
	type JSX,
	onCleanup,
	Show,
	useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

const TranslateContext = createContext<
	((name: string, value: unknown) => void) | undefined
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
		<TranslateContext.Provider value={(key, value) => setVariables(key, value)}>
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

			if (token.length === 1 || token.length === 2) {
				const [index, content] = token;
				let element = elements[index];
				if (!element) continue;

				element = element.cloneNode(true);
				element.textContent = content ?? "";
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

export const Variable: Component<{
	name: string;
	value?: JSX.Element;
}> = (props) => {
	const registerVariable = useContext(TranslateContext);

	createEffect(() => {
		registerVariable?.(props.name, props.value);
	});

	return <>{props.value}</>;
};

//#region utils

const tokenizeRegex = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/g;
type Token = string | [number, string] | [number];

const tokenize = (input: string): Token[] => {
	console.log(input, "in");

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
			result.push([Number(match[1]), match[2] ?? ""]);
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
