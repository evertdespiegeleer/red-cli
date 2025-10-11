import { render } from "@opentui/react"
import { App } from "./app";
import { loadConfig } from "./config";
import { initRedis } from "./redis";

loadConfig();
initRedis();

render(App());