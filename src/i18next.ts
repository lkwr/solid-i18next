import i18next from "i18next";

i18next.init({
	lng: "en",
	debug: true,
	resources: {
		en: {
			translation: {
				greeting: "Hello <0>{{name}}</0> <1>{{name}}</1> <2>xd</2>",
			},
		},
		de: {
			translation: {
				greeting: "Hallo <0>{{name}}</0>",
			},
		},
	},
});

export const i18n = i18next;
