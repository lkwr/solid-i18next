import i18next, { type i18n, type TFunction } from "i18next";
import {
	type Component,
	createContext,
	createSignal,
	type JSX,
	onCleanup,
	useContext,
} from "solid-js";

const TransContext = createContext<i18n>(i18next);

export const TransProvider: Component<{
	i18n: i18n;
	children?: JSX.Element;
}> = (props) => {
	return (
		<TransContext.Provider value={props.i18n}>
			{props.children}
		</TransContext.Provider>
	);
};

export const useI18n = (): i18n => {
	return useContext(TransContext);
};

export const useT = (): TFunction => {
	const i18n = useI18n();

	const [t, setT] = createSignal(i18n.t.bind(i18n), { equals: false });

	const handleLanguageChange = () => {
		setT(() => i18n.t.bind(i18n));
	};

	i18n.on("languageChanged", handleLanguageChange);

	onCleanup(() => {
		i18n.off("languageChanged", handleLanguageChange);
	});

	return ((...args) => t()(...args)) as TFunction;
};
