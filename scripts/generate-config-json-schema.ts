#!/usr/bin/env -S bunx tsx@4.20.6

// This script generates the JSON Schema for the configuration. It is intended to be run in the CI, after which the output can be included in the release artifacts. This way, users can refer to it when writing their configuration files.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
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

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const generatedDirPath = path.resolve(__dirname, "..", "generated");

// Write to ./generated/.redrc.schema.json
mkdirSync(generatedDirPath, { recursive: true });

writeFileSync(
	path.join(generatedDirPath, "redrc.schema.json"),
	JSON.stringify(schema, null, 4),
);

console.log("Generated JSON Schema written to ./generated/redrc.schema.json");
