import i18next, { type i18n } from "i18next";
import {
	type Accessor,
	type Component,
	createContext,
	type Element,
	type ParentComponent,
	useContext,
} from "solid-js";

export const I18nextContext = createContext<{
	i18n: Accessor<i18n>;
	components: Accessor<Record<string, ParentComponent>>;
}>({
	i18n: () => i18next,
	components: () => ({}),
});

export type I18nextProviderProps = {
	i18n?: i18n;
	/**
	 * Global components by tag name, usable by every <Trans /> under this provider.
	 * Components from an outer provider are inherited unless `inheritComponents`
	 * is false; nearer providers override outer ones.
	 */
	components?: Record<string, ParentComponent>;
	/** When false, this provider does not inherit components from an outer <I18nextProvider />. @default true */
	inheritComponents?: boolean;
	children?: Element;
};

export const I18nextProvider: Component<I18nextProviderProps> = (props) => {
	const inheritedComponents = useContext(I18nextContext).components;

	return (
		<I18nextContext
			value={{
				i18n: () => props.i18n ?? i18next,
				components: () => ({
					...(props.inheritComponents === false ? {} : inheritedComponents()),
					...props.components,
				}),
			}}
		>
			{props.children}
		</I18nextContext>
	);
};

export const useI18n = (): Accessor<i18n> => {
	return useContext(I18nextContext).i18n;
};
