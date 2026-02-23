import type { TFunction, TOptions } from "i18next";
import type { Component, JSX } from "solid-js";
import { useT } from "./trans-provider.tsx";
import { TranslatedJsx } from "./translate-jsx.tsx";

export type TransProps = {
	key: string;
	children?: JSX.Element;
	t?: TFunction;
	options?: TOptions;
};

export const Trans: Component<TransProps> = (props) => {
	const t = props.t ?? useT();

	return (
		<>
			{typeof props.children === "string" ? (
				t(props.key, props.children, props.options)
			) : (
				<TranslatedJsx t={t} key={props.key} options={props.options}>
					{props.children}
				</TranslatedJsx>
			)}
		</>
	);
};
