import i18next, { type i18n } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { createRoot, flush, NotReadyError } from "solid-js";
import { describe, expect, it } from "vitest";
import { useTranslation } from "../src/use-translation.ts";

const resources = {
	en: {
		common: { hello: "Hello" },
		lazy: { bye: "Bye" },
	},
};

const createI18n = async (): Promise<i18n> => {
	const instance = i18next.createInstance();

	await instance
		.use(
			resourcesToBackend(
				async (lng: string, ns: string) =>
					resources[lng as keyof typeof resources][
						ns as keyof (typeof resources)["en"]
					],
			),
		)
		.init({
			lng: "en",
			ns: ["common"],
			defaultNS: "common",
			fallbackLng: false,
		});

	return instance;
};

const translate = (read: () => string) => {
	try {
		return read();
	} catch (error) {
		if (error instanceof NotReadyError) return "<pending>";
		throw error;
	}
};

describe("useTranslation", () => {
	it("translates synchronously when the namespace is loaded", async () => {
		const i18n = await createI18n();

		createRoot((dispose) => {
			const [t, , ready] = useTranslation("common", { i18n });

			expect(ready()).toBe(true);
			expect(translate(() => t("hello"))).toBe("Hello");

			dispose();
		});
	});

	it("is pending until a missing namespace is loaded", async () => {
		const i18n = await createI18n();

		const { t, ready, dispose } = createRoot((dispose) => {
			const [t, , ready] = useTranslation("lazy", { i18n });
			return { t, ready, dispose };
		});

		expect(ready()).toBe(false);
		expect(translate(() => t("bye"))).toBe("<pending>");

		await i18n.loadNamespaces("lazy");
		await new Promise((resolve) => setTimeout(resolve));
		flush();

		expect(ready()).toBe(true);
		expect(translate(() => t("bye"))).toBe("Bye");

		dispose();
	});
});
