import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18next
	.use(
		resourcesToBackend(async (lng: string, ns: string) => {
			await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate async loading

			return import(`./locale/${lng}/${ns}.json`);
		}),
	)
	.init({
		lng: "en",
		debug: true,
		interpolation: {
			escapeValue: false,
		},
	});

export const i18n = i18next;
