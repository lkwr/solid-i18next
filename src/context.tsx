import i18next, { type i18n } from "i18next";
import {
	type Accessor,
	type Component,
	createContext,
	type JSX,
	useContext,
} from "solid-js";

export const I18nextContext = createContext<{ i18n: Accessor<i18n> }>({
	i18n: () => i18next,
});

export type I18nextProviderProps = {
	i18n: i18n;
	children?: JSX.Element;
};

export const I18nextProvider: Component<I18nextProviderProps> = (props) => {
	return (
		<I18nextContext.Provider value={{ i18n: () => props.i18n }}>
			{props.children}
		</I18nextContext.Provider>
	);
};

export const useI18n = (): Accessor<i18n> => {
	return useContext(I18nextContext).i18n;
};
