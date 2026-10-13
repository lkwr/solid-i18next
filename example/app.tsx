/* @refresh reload */

import "./style.css";
import "./i18n.ts";
import { I18nextProvider } from "../src/index.ts";
import { Demo } from "./demo.tsx";

export default () => (
	<I18nextProvider
		components={{
			a: (props) => <span class="text-blue-500">{props.children}</span>,
			b: (props) => <span class="underline">{props.children}</span>,
		}}
	>
		<Demo />
	</I18nextProvider>
);
