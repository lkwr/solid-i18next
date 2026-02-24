import type { TFunction, TOptions } from "i18next";
import type { Component, JSX } from "solid-js";
import { useT } from "./context.tsx";
import { TranslatedJsx } from "./translate-jsx.tsx";

export type TransProps = {
	key: string;
	children?: JSX.Element;
	t?: TFunction;
	replace?: TOptions["replace"];
	options?: TOptions;
};

export const Trans: Component<TransProps> = (props) => {
	const t = props.t ?? useT();

	const mergedOptions = (): TOptions => ({
		...props.options,
		replace: { ...props.replace, ...props.options?.replace },
		interpolation: { escapeValue: false, ...props.options?.interpolation },
	});

	return (
		<>
			{typeof props.children === "string" ? (
				t(props.key, props.children, mergedOptions())
			) : (
				<TranslatedJsx t={t} key={props.key} options={mergedOptions()}>
					{props.children}
				</TranslatedJsx>
			)}
		</>
	);
};
