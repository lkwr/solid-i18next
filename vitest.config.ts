import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// JSX of the sources (hooks import context.tsx)
	plugins: [solid({ ssr: false })],
	resolve: {
		// client build of solid-js (reactive), not the server build
		conditions: ["browser", "development"],
	},
	test: {
		environment: "node",
		include: ["test/**/*.test.ts"],
	},
});
