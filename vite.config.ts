import solid from "@solidjs/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwind(),
		solid({
			start: {
				app: "example/app.tsx",
			},
			ssr: false,
		}),
	],
});
