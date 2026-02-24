import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [tailwind(), solid()],
	build: {
		target: "esnext",
		rollupOptions: {
			input: { app: "./example/index.html" },
		},
	},
	server: {
		open: "./example/index.html",
	},
});
