import type { i18n } from "i18next";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { useI18n } from "./context.tsx";

export const useLanguage = (
	i18n?: Accessor<i18n>,
): [current: Accessor<string>, requested: Accessor<string>] => {
	const contextI18n = useI18n();
	const resolvedI18n = () => (i18n ? i18n() : contextI18n());

	const [currentLanguage, setCurrentLanguage] = createSignal(
		resolvedI18n().language,
	);
	const [requestedLanguage, setRequestedLanguage] = createSignal(
		resolvedI18n().language,
	);

	const handleLanguageChanging = (lng: string) => {
		setRequestedLanguage(lng);
	};

	const handleLanguageChanged = (lng: string) => {
		setCurrentLanguage(lng);
		setRequestedLanguage(lng);
	};

	createEffect(() => {
		const currentI18n = resolvedI18n();

		currentI18n.on("languageChanging", handleLanguageChanging);
		currentI18n.on("languageChanged", handleLanguageChanged);

		onCleanup(() => {
			currentI18n.off("languageChanging", handleLanguageChanging);
			currentI18n.off("languageChanged", handleLanguageChanged);
		});
	});

	return [currentLanguage, requestedLanguage];
};
