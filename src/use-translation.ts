import type { i18n, KeyPrefix, Namespace, TFunction } from "i18next";
import { type Accessor, createMemo, isPending, NotReadyError } from "solid-js";
import { useI18n } from "./context.tsx";
import { useLanguage } from "./use-language.ts";

export type UseTranslationReturn<Ns extends Namespace, KPrefix> = [
	t: TFunction<Ns, KPrefix>,
	i18n: Accessor<i18n>,
	ready: Accessor<boolean>,
];

export type UseTranslationOptions<KPrefix> = {
	i18n?: i18n;
	keyPrefix?: KPrefix;
	lng?: string;
};

export const useTranslation = <
	Ns extends Namespace,
	KPrefix extends KeyPrefix<Ns> = undefined,
>(
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

		if (Array.isArray(defaultNs)) return defaultNs;
		if (typeof defaultNs === "string") return [defaultNs];

		return [];
	});

	const [currentLanguage, requestedLanguage] = useLanguage(() =>
		resolvedI18n(),
	);

	const tAccessor = createMemo<TFunction>(
		async () => {
			const options = resolvedOptions();
			const i18n = resolvedI18n();
			const namespaces = resolvedNs();
			const currentLng = currentLanguage();
			const requestedLng = options.lng ?? requestedLanguage();

			const missingNamespaces = namespaces.filter(
				(namespace) =>
					!i18n.hasLoadedNamespace(namespace, { lng: requestedLng }),
			);

			// Load language on language change
			if (currentLng !== requestedLng) {
				await i18n.loadLanguages(requestedLng);
			}

			// Load missing namespaces
			if (missingNamespaces.length > 0) {
				await i18n.loadNamespaces(missingNamespaces);
			}

			return i18n.getFixedT(requestedLng, namespaces, options.keyPrefix);
		},
		{ equals: false },
	);

	const t = (...args: Parameters<TFunction<Ns, KPrefix>>) => {
		const tFn = tAccessor();
		return tFn(...args);
	};

	const ready = () => {
		try {
			return !isPending(() => tAccessor());
		} catch (error) {
			if (error instanceof NotReadyError) return false;
			throw error;
		}
	};

	return [t as TFunction<Ns, KPrefix>, resolvedI18n, ready];
};
