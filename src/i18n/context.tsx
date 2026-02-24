import i18next, { type i18n, type TFunction } from "i18next";
import {
	type Accessor,
	type Component,
	createContext,
	createEffect,
	createSignal,
	type JSX,
	onCleanup,
	useContext,
} from "solid-js";

const I18nContext = createContext<Accessor<i18n>>(() => i18next);

export const I18nProvider: Component<{
	i18n: i18n;
	children?: JSX.Element;
}> = (props) => {
	return (
		<I18nContext.Provider value={() => props.i18n}>
			{props.children}
		</I18nContext.Provider>
	);
};

export const useI18n = (): Accessor<i18n> => {
	const i18nGetter = useContext(I18nContext);
	const [i18n, setI18n] = createSignal(i18nGetter(), { equals: false });

	const handleChange = () => {
		setI18n(i18nGetter());
	};

	createEffect(() => {
		const i18n = i18nGetter();

		i18n.on("languageChanged", handleChange);

		onCleanup(() => {
			i18n.off("languageChanged", handleChange);
		});
	});

	return i18n;
};

// Add suspense for loading?
export const useT = (): TFunction => {
	const i18n = useI18n();

	return ((...args) => i18n().t(...args)) as TFunction;
};
