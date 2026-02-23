import type { TFunction, TOptions } from "i18next";
import {
	type Component,
	children,
	createContext,
	createMemo,
	type JSX,
	useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { renderTranslatedString } from "./templete-renderer.ts";

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

	const translation = () =>
		props.t(props.key, {
			...props.options,
			replace: { ...variables, ...props.options?.replace },
		});

	const registerVariable = (name: string, value: unknown) => {
		setVariables(name, value);
	};

	const resolved = children(() => (
		<TranslateContext.Provider value={{ registerVariable }}>
			{props.children}
		</TranslateContext.Provider>
	));

	const transformed = createMemo((): Node[] => {
		const elementChildren = resolved
			.toArray()
			.filter((child): child is Node => child instanceof Node);
		return Array.from(
			renderTranslatedString(translation(), elementChildren).childNodes,
		);
	});

	return <>{transformed()}</>;
};

export const variable = <T extends string>(
	record: { [K in T]: JSX.Element },
): JSX.Element => {
	const firstKey = Object.keys(record)[0] as T;
	const ctx = useContext(TranslateContext);

	if (!ctx) {
		console.warn("variable used outside of Trans, returning raw value");
		return record[firstKey];
	}

	ctx?.registerVariable(firstKey, record[firstKey]);
	return `{{${firstKey}}}`;
};
