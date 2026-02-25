import { createEffect, createSignal, onCleanup, Suspense } from "solid-js";
import { Trans, useTranslation } from "../src/index.ts";

const names = [
	"John",
	"Jane",
	"Doe",
	"Smith",
	"Alice",
	"Bob",
	"Charlie",
	"Eve",
	"Frank",
	"Grace",
	"Heidi",
	"Ivan",
	"Judy",
	"Ken",
	"Leo",
];

const getName = () => names[Math.floor(Math.random() * names.length)];

export const App = () => {
	const [name, setName] = createSignal(getName());

	const [t, i18n] = useTranslation(["translation", "lang"]);

	const interval = setInterval(() => {
		setName(getName());
	}, 5_000);

	onCleanup(() => clearInterval(interval));

	createEffect(() => console.log("Current language:", i18n().language));

	i18n().loadNamespaces("lang");

	return (
		<Suspense fallback="Loading...">
			<div class="flex flex-col gap-4">
				<p>
					<Trans
						key="current_lang"
						fallback="Current language: {{lang}}"
						replace={{ lang: t(i18n().language, { ns: "lang" }) }}
					/>
				</p>
				{/* <p>
					<Trans key="greeting">
						Welcome{" "}
						<span class="text-red-500">
							<Variable name="name" value={name()} />
						</span>
						.<br />
						You will{" "}
						<span class="font-bold">
							<Variable name="action" value={t("action")} />
						</span>{" "}
						believe what happens next. (Only show when missing key){" "}
						<Variable name="value" value="<div>lol</div>" />
						<br />
					</Trans>
				</p> */}
				<p>{t("lang:de")}</p>
				<p>
					<Trans
						key="missing_key123"
						fallback="This is a fallback with a variable <red>{{name}}</red>"
						components={{
							red: (
								<a href="test" class="text-red-500">
									{}
								</a>
							),
						}}
						replace={{ name: name() }}
					/>
				</p>
				<p>
					<Trans
						key="currentDate"
						fallback="Current date: <span>let me in</span>"
						components={{ span: <span /> }}
					/>
				</p>
				<div class="flex gap-2">
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("de");
						}}
					>
						<Trans key="lang:de" fallback="German (fallback)" />
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("en");
						}}
					>
						<Trans key="lang:en" fallback="English (fallback)" />
					</button>
				</div>
			</div>
		</Suspense>
	);
};
