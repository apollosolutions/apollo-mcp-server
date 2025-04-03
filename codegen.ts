import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	schema: "src/schemas/platform_api.graphql",
	documents: ["src/**/*.ts"],
	generates: {
		"./src/generated/": {
			preset: "client",
		},
	},
	ignoreNoDocuments: true,
	emitLegacyCommonJSImports: false,
};

export default config;
