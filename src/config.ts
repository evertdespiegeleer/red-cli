import process from "node:process";
import { cosmiconfigSync } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { z } from "zod";
import { version } from "./version.json";

type ConfigOption = {
	shorthand?: string;
};

const configOptions = {
	connectionString: {},
} satisfies Record<string, ConfigOption>;

type ConfigOptionNames = keyof typeof configOptions;

declare module "zod" {
	interface GlobalMeta {
		hideFromSchema?: boolean;
		description?: string;
		shorthand?: string;
	}
}

// Use the `hideFromSchema` meta property to hide options from the generated JSON Schema
export const zConfig = z.object({
	connectionString: z
		.string()
		.regex(/^rediss?:\/\/.+/)
		.default("redis://localhost:6379")
		.meta({
			description: "The Redis connection string",
		}),
} satisfies Record<ConfigOptionNames, z.ZodTypeAny>);

type Config = z.infer<typeof zConfig>;

let config: Config | null = null;

export const getConfig = (): Config => {
	if (!config) {
		throw new Error("Config not loaded. Call loadConfig() first.");
	}
	return config;
};

const moduleName = "red";
export const loadConfig = () => {
	const explorer = cosmiconfigSync("red", {
		searchStrategy: "global",
		loaders: {
			".ts": TypeScriptLoader(),
		},
		searchPlaces: [
			`.${moduleName}rc`,
			`.${moduleName}rc.json`,
			`.${moduleName}rc.yaml`,
			`.${moduleName}rc.yml`,
			`.${moduleName}rc.js`,
			`.${moduleName}rc.ts`,
			`.${moduleName}rc.cjs`,
			`${moduleName}.config.js`,
			`${moduleName}.config.ts`,
			`${moduleName}.config.cjs`,
		],
	});
	const configFileConfig = explorer.search()?.config || {};

	let argv = yargs(hideBin(process.argv))
		.config(configFileConfig)
		.version(version)
		.env("RED");

	for (const [configName, configOption] of Object.entries(zConfig.shape) as [
		keyof typeof zConfig.shape,
		(typeof zConfig.shape)[keyof typeof zConfig.shape],
	][]) {
		const metadata = configOption.meta();
		argv = argv.option(configName, {
			alias: metadata?.shorthand,
			describe: metadata?.description,
			type: configOption.def.innerType.type,
		});
	}
	config = zConfig.parse(argv.argv);
};
