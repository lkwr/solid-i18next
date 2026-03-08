import { defineConfig } from "i18next-cli";
import solidPlugin from "./src/plugin.ts";

export default defineConfig({
	locales: ["en", "de"],
	extract: {
		input: "./example/**/*.{ts,tsx}",
		output: "./example/locale/{{language}}/{{namespace}}.json",
	},
	plugins: [solidPlugin()],
});
