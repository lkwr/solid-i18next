import i18next from "i18next";

i18next.init({
	lng: "en",
	debug: true,
	interpolation: {
		escapeValue: false,
	},
	resources: {
		en: {
			translation: {
				greeting:
					"Welcome <0>{{name}}</0>.<1/>You will <2>{{action}}</2> believe what happens next.<3/> {{value}}",
				action: "never",
				currentDate: "Current date: <0/>",
			},
		},
		de: {
			lang: {
				german: "Deutsch",
				english: "Englisch",
			},
			translation: {
				greeting:
					"Willkommen <0>{{name}}</0>.<1/>Du wirst <2>{{action}}</2> glauben, was als Nächstes passiert.<3/> {{value}}",
				action: "niemals",
				currentDate: "Aktuelles Datum: <0></0>",
				lang: {
					german: "Deutsch",
					english: "Englisch",
				},
			},
		},
	},
});

export const i18n = i18next;
