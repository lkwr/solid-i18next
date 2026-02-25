import type { i18n } from "i18next";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { useI18n } from "./context.tsx";

export const useLanguage = (i18n?: Accessor<i18n>): Accessor<string> => {
	const contextI18n = useI18n();
	const resolvedI18n = () => (i18n ? i18n() : contextI18n());

	const [language, setLanguage] = createSignal(resolvedI18n().language);

	const handleLanguageChange = (lng: string) => {
		console.log(" languageChanged event:", lng);
		setLanguage(lng);
	};

	createEffect(() => {
		const currentI18n = resolvedI18n();

		currentI18n.on("languageChanged", handleLanguageChange);

		onCleanup(() => {
			currentI18n.off("languageChanged", handleLanguageChange);
		});
	});

	return language;
};
