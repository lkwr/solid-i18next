import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18next
	.use(
		resourcesToBackend(async (lng: string, ns: string) => {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async loading

			console.log(` Loading language "${lng}" and namespace "${ns}"...`);

			return import(`./locale/${lng}/${ns}.json`);
		}),
	)
	.init({
		lng: "en",
		debug: false,
		fallbackLng: "en",
		supportedLngs: ["en", "de"],
		interpolation: {
			escapeValue: false,
		},
	});

export const i18n = i18next;
