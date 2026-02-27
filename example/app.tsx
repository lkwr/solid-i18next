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

	const [namespaces, setNamespaces] = createSignal(["translation"]);

	const [t, i18n] = useTranslation(namespaces);

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
						key="welcome"
						fallback="Welcome, <bold>{{name}}</bold> (<bold>fallback</bold>)!"
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
						<Trans key="lang:de" fallback="German (fallback)" t={t} />
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("en");
						}}
					>
						<Trans key="lang:en" fallback="English (fallback)" t={t} />
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
							fallback="French (fallback, not exist)"
							t={t}
						/>
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => setNamespaces((prev) => [...prev, "lang"])}
					>
						Add lang namespace dynamically
					</button>
				</div>
			</div>
		</Suspense>
	);
};
