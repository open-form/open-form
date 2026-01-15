import { config } from "@open-form/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
	...config,
	{
		ignores: ["src/generated/**", "dist/generated/**"],
	},
];
