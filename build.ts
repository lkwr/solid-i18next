import { build } from "tsdown";
import solid from "vite-plugin-solid";
import packageJson from "./package.json" with { type: "json" };

await build({
	entry: "./src/index.ts",
	platform: "browser",
	outDir: "./dist",
	dts: true,
	plugins: [solid()],
	format: "esm",
});

const distPackageJson = {
	name: packageJson.name,
	version: packageJson.version,
	description: packageJson.description,

	type: "module",
	module: "index.js",
	types: "index.d.ts",

	exports: {
		".": {
			types: "./index.d.ts",
			default: "./index.js",
		},
	},

	dependencies: {},
	peerDependencies: {
		i18next: packageJson.devDependencies.i18next,
		"solid-js": packageJson.devDependencies["solid-js"],
	},

	license: packageJson.license,
	author: packageJson.author,
	homepage: packageJson.homepage,
	repository: packageJson.repository,
	bugs: packageJson.bugs,
	keywords: packageJson.keywords,
};

await Promise.all([
	Bun.write("./dist/package.json", JSON.stringify(distPackageJson, null, 2)),
	Bun.write("./dist/README.md", Bun.file("./README.md")),
	Bun.write("./dist/LICENSE", Bun.file("./LICENSE")),
]);
