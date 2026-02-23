import type { JSX } from "solid-js";
import { Trans } from "./i18n/trans.tsx";
import { useT } from "./i18n/trans-provider.tsx";
import { variable } from "./i18n/translate-jsx.tsx";
import { i18n } from "./i18next.ts";

type A = JSX.Element;

export const App = () => {
	const t = useT();

	const name = "John12";

	return (
		<div>
			asd
			<p>
				<Trans key="greeting" options={{ replace: { name } }}>
					Welcome <span class="text-red-500">{"{{name}}"}</span>
					<div>
						lol <span>spanne1</span>
					</div>
					<span>never</span>
				</Trans>
			</p>
			<div class="flex gap-2">
				<button
					type="button"
					onClick={() => {
						i18n.changeLanguage("de");
					}}
				>
					DE
				</button>
				<button
					type="button"
					onClick={() => {
						i18n.changeLanguage("en");
					}}
				>
					EN
				</button>
			</div>
		</div>
	);
};
