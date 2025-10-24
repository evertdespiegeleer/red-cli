import process from "node:process";
import { z } from "zod";

interface CLIArg {
	name: string;
	configName: string;
	shorthand?: string;
}

const cliArgs = [
	// { name: "help", shorthand: "h", configName: "showHelp" },
	{ name: "version", shorthand: "v", configName: "showVersion" },
	{ name: "connection-string", configName: "connectionString" },
] as const satisfies CLIArg[];

type CLIArgConfigName = (typeof cliArgs)[number]["configName"];

export const zCliConfig = z.object({
	connectionString: z
		.string()
		.regex(/^rediss?:\/\/.+/)
		.default("redis://localhost:6379"),
	// showHelp: z.boolean().default(false),
	showVersion: z.boolean().default(false),
} satisfies Record<CLIArgConfigName, z.ZodTypeAny>);

let env: z.infer<typeof zCliConfig> | null = null;

export const loadConfig = () => {
	const args = process.argv;
	const plainConfig: Record<string, string | boolean> = {};

	let cursor = 0;
	while (cursor < args.length) {
		const arg = args[cursor];
		if (!arg?.startsWith("-")) {
			cursor++;
			continue;
		}
		const isShorthand = arg.startsWith("-") && !arg.startsWith("--");
		const argKey = arg.replace(/^-+/, "");
		const configName = !isShorthand
			? cliArgs.find((a) => a.name === argKey)?.configName
			: cliArgs.find((a) => "shorthand" in a && a.shorthand === argKey)
					?.configName;
		if (configName == null) {
			// Unrecognized argument!
			throw new Error(`Unrecognized CLI argument: ${arg}`);
		}
		// Determine the value
		let argValue: string | boolean = true;
		const nextArg = args[cursor + 1];
		if (nextArg == null || nextArg.startsWith("-")) {
			// Next arg is another flag, so this is a boolean flag
			argValue = true;
			cursor += 1;
		} else {
			// Next arg is a value for this arg
			argValue = nextArg;
			cursor += 2;
		}
		plainConfig[configName] = argValue;
	}
	env = zCliConfig.parse(plainConfig);
};

export const getConfig = () => {
	if (!env) {
		throw new Error("Config not loaded");
	}
	return env;
};
