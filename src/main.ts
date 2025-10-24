import process from "node:process";
import { render } from "@opentui/react";
import z from "zod";
import { App } from "./app";
import { getConfig, loadConfig } from "./config";
import { initRedis } from "./redis";

try {
	loadConfig();
} catch (error) {
	if (error instanceof z.ZodError) {
		console.error(`Configuration error!\n ${error.message}`);
		process.exit(1);
	}
	throw error;
}

if (getConfig().showVersion) {
	const { version } = await import("./version.json");
	console.log(version);
	process.exit(0);
}

initRedis();

render(App());
