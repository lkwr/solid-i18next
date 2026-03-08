import { createSignal, onCleanup, Suspense } from "solid-js";
import { Trans, useLanguage, useTranslation } from "../src/index.ts";

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

	const [t, i18n] = useTranslation(["translation"]);

	const [currentLanguage, requestedLanguage] = useLanguage();

	const interval = setInterval(() => {
		setName(getName());
	}, 5_000);

	onCleanup(() => clearInterval(interval));

	return (
		<Suspense fallback="Loading...">
			<div class="flex flex-col gap-4">
				<h1>
					<Trans
						key="nested.welcome"
						defaultValue="Welcome, <bold>{{name}}</bold> (<bold>fallback</bold>)!"
						replace={{ name: name() }}
						components={{
							bold: ({ children }) => <span class="font-bold">{children}</span>,
						}}
					/>
				</h1>

				<p>
					Current language: {currentLanguage()}
					<br />
					Requested language: {requestedLanguage()}
				</p>

				<div class="flex gap-2">
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("de");
						}}
					>
						<Trans key="lang:de" defaultValue="German (fallback)" t={t} />
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("en");
						}}
					>
						<Trans key="lang:en" defaultValue="English (fallback)" t={t} />
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							// not exist language to test fallback
							i18n().changeLanguage("fr");
						}}
					>
						<Trans
							key="lang:fr"
							defaultValue="French (fallback, not exist)"
							t={t}
						/>
					</button>
				</div>
			</div>
		</Suspense>
	);
};
