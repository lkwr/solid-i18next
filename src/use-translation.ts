// Add suspense for loading?

import type { i18n, Namespace, TFunction } from "i18next";
import { type Accessor, createEffect, createResource } from "solid-js";
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

	const resolvedOptions = () =>
		(typeof options === "function" ? options() : options) ?? {};

	const resolvedI18n = () => resolvedOptions().i18n ?? contextI18n();

	const resolvedNs = (): string[] => {
		const nsParams = typeof ns === "function" ? ns() : ns;

		if (Array.isArray(nsParams)) return nsParams as string[];
		if (typeof nsParams === "string") return [nsParams];

		const defaultNs = resolvedI18n().options.defaultNS;

		if (typeof defaultNs === "string") return [defaultNs];
		if (Array.isArray(defaultNs)) return defaultNs;

		return ["translation"];
	};

	const language = useLanguage(() => resolvedI18n());

	createEffect(() => {
		console.log(" current lng:", language());
	});

	const [internalReady] = createResource(
		() => ({
			i18n: resolvedI18n(),
			ns: resolvedNs(),
			lng: language(),
		}),
		async ({ i18n, ns, lng }) => {
			console.log(" Checking ready...", lng);

			const missing = ns.filter((n) => !i18n.hasLoadedNamespace(n));

			if (missing.length > 0) {
				await i18n.loadNamespaces(missing);
			}

			return true;
		},
		{ initialValue: false },
	);

	const t = (...args: Parameters<TFunction<Ns, KPrefix>>) => {
		// track language changes
		language();

		// trigger suspense when enabled
		if (resolvedOptions().useSuspense !== false) internalReady();

		return resolvedI18n().t(...args);
	};

	const ready = () =>
		resolvedOptions().useSuspense
			? internalReady()
			: !internalReady.loading && internalReady.latest;

	return [t as TFunction<Ns, KPrefix>, () => resolvedI18n(), () => ready()];
};
