import { createSignal, onCleanup } from "solid-js";
import { useT } from "./i18n/context.tsx";
import { Trans } from "./i18n/trans.tsx";
import { variable } from "./i18n/translate-jsx.tsx";
import { i18n } from "./i18next.ts";

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

	const t = useT();

	const interval = setInterval(() => {
		setName(getName());
	}, 1_000);

	const date = () => Intl.DateTimeFormat(i18n.language).format(new Date());

	onCleanup(() => clearInterval(interval));

	console.log("date", date());

	return (
		<div>
			asd
			<p>
				<Trans key="greeting">
					Welcome <span class="text-red-500">{variable({ name })}</span>
					.<br />
					You will{" "}
					<span class="font-bold">{variable({ action: t("action") })}</span>{" "}
					believe what happens next. BTW THIS IS MISSING KEY...{" "}
					{variable({ value: "<div>lol</div>" })}
					<br />
				</Trans>
			</p>
			<p>
				<Trans key="currentDate">
					Current date: <span>let me in</span>
				</Trans>
			</p>
			<div class="flex gap-2">
				<button
					type="button"
					onClick={() => {
						i18n.changeLanguage("de");
					}}
				>
					<Trans key="lang:german">German</Trans>
				</button>
				<button
					type="button"
					onClick={() => {
						i18n.changeLanguage("en");
					}}
				>
					<Trans key="lang:english">English</Trans>
				</button>
			</div>
		</div>
	);
};
