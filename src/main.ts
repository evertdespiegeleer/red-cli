import { render } from "@opentui/react"
import { App } from "./app";
import { loadConfig } from "./config";
import { initRedis } from "./redis";
import z from "zod";
import process from "node:process"

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