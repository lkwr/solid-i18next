import { createEffect, createSignal, onCleanup, Suspense } from "solid-js";
import { Trans, useI18n, useT, Variable } from "../src/index.ts";

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

	const i18n = useI18n();
	const t = useT();

	const interval = setInterval(() => {
		setName(getName());
	}, 5_000);

	onCleanup(() => clearInterval(interval));

	createEffect(() => console.log("Current language:", i18n().language));

	return (
		<Suspense fallback="Loading...">
			<div class="flex flex-col gap-4">
				<p>
					<Trans key="current_lang">
						Current language:{" "}
						<Variable name="lang" value={t(i18n().language, { ns: "lang" })} />
					</Trans>
				</p>
				<p>
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
				</p>
				<p>
					<Trans key="missing_key">
						This is a fallback with a variable:{" "}
						<span class="text-red-500">
							<Variable name="name" value={name()} />
						</span>
					</Trans>
				</p>
				<p>
					<Trans key="currentDate">
						Current date: <span>let me in</span>
					</Trans>
				</p>
				<div class="flex gap-2">
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("de");
						}}
					>
						<Trans key="lang:german">German</Trans>
					</button>
					<button
						class="p-2 bg-blue-500 text-white rounded-xl"
						type="button"
						onClick={() => {
							i18n().changeLanguage("en");
						}}
					>
						<Trans key="lang:english">English</Trans>
					</button>
				</div>
			</div>
		</Suspense>
	);
};
