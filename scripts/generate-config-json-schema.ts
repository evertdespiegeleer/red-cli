#!/usr/bin/env -S bunx tsx@4.20.6

// This script generates the JSON Schema for the configuration. It is intended to be run in the CI, after which the output can be included in the release artifacts. This way, users can refer to it when writing their configuration files.

import { mkdirSync, writeFileSync } from "node:fs";
import z from "zod";
import { zConfig } from "../src/config.js";

const schema = z.toJSONSchema(zConfig, {
	io: "input",
	target: "draft-7",
});

// Remove hidden properties
if (schema.properties) {
	for (const [key, propSchema] of Object.entries(schema.properties)) {
		if ((propSchema as any).hideFromSchema) {
			delete schema.properties[key];
		}
	}
}

// Write to ./generated/.redrc.schema.json
mkdirSync("./generated", { recursive: true });

writeFileSync(
	"./generated/.redrc.schema.json",
	JSON.stringify(schema, null, 4),
);

console.log("Generated JSON Schema written to ./generated/.redrc.schema.json");
