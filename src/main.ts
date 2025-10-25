import process from "node:process";
import { render } from "@opentui/react";
import z from "zod";
import { App } from "./app";
import { loadConfig } from "./config";
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

initRedis();

render(App());
