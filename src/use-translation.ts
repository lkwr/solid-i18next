// Add suspense for loading?

import type { i18n, Namespace, TFunction } from "i18next";
import { type Accessor, createMemo, createResource } from "solid-js";
import { useI18n } from "./context.tsx";
import { useLanguage } from "./use-language.ts";

export type UseTranslationReturn<Ns extends Namespace, KPrefix> = [
	t: TFunction<Ns, KPrefix>,
	i18n: Accessor<i18n>,
	ready: Accessor<boolean>,
];

export type UseTranslationOptions<KPrefix> = {
	i18n?: i18n;
	useSuspense?: boolean;
	keyPrefix?: KPrefix;
	lng?: string;
};

export const useTranslation = <Ns extends Namespace, KPrefix = undefined>(
	ns?: Ns | Accessor<Ns | undefined> | undefined,
	options?:
		| UseTranslationOptions<KPrefix>
		| Accessor<UseTranslationOptions<KPrefix> | undefined>
		| undefined,
): UseTranslationReturn<Ns, KPrefix> => {
	const contextI18n = useI18n();

	const resolvedOptions = createMemo(
		() => (typeof options === "function" ? options() : options) ?? {},
	);

	const resolvedI18n = createMemo(
		() => resolvedOptions().i18n ?? contextI18n(),
	);

	const resolvedNs = createMemo((): string[] => {
		const nsParams = typeof ns === "function" ? ns() : ns;
		const i18n = resolvedI18n();

		if (Array.isArray(nsParams)) return nsParams as string[];
		if (typeof nsParams === "string") return [nsParams];

		const defaultNs = i18n.options.defaultNS;

		if (typeof defaultNs === "string") return [defaultNs];
		if (Array.isArray(defaultNs)) return defaultNs;

		return ["translation"];
	});

	const [currentLanguage, requestedLanguage] = useLanguage(() =>
		resolvedI18n(),
	);

	const [internalReady] = createResource(
		() => ({
			i18n: resolvedI18n(),
			namespaces: resolvedNs(),
			currentLanguage: currentLanguage(),
			requestedLanguage: requestedLanguage(),
		}),
		async ({ i18n, namespaces, currentLanguage, requestedLanguage }) => {
			const missingNamespaces = namespaces.filter(
				(namespace) =>
					!i18n.hasLoadedNamespace(namespace, { lng: requestedLanguage }),
			);

			if (requestedLanguage !== currentLanguage) {
				await i18n.loadLanguages(requestedLanguage);
			}

			if (missingNamespaces.length > 0) {
				await i18n.loadNamespaces(missingNamespaces);
			}

			return true;
		},
		{ initialValue: false },
	);

	const trackRetranslate = () => [
		requestedLanguage(),
		currentLanguage(),
		internalReady.state,
	];

	const t = (...args: Parameters<TFunction<Ns, KPrefix>>) => {
		// track retranslation dependencies
		trackRetranslate();

		// trigger suspense when enabled
		if (resolvedOptions().useSuspense !== false) internalReady();

		return resolvedI18n().t(...args);
	};

	const ready = () => {
		if (resolvedOptions().useSuspense === false)
			return !internalReady.loading && internalReady.latest;
		return internalReady();
	};

	return [t as TFunction<Ns, KPrefix>, resolvedI18n, ready];
};
