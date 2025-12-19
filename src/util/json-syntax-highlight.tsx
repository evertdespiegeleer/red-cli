import {
	StyledText,
	type TextChunk,
	brightBlack,
	cyan,
	green,
	magenta,
	yellow,
} from "@opentui/core";

/**
 * Syntax highlights a JSON string by parsing it and returning
 * a StyledText instance for use in OpenTUI text components.
 *
 * Color scheme:
 * - Keys: cyan
 * - String values: green
 * - Numbers: yellow
 * - Booleans: magenta
 * - null: brightBlack (grey)
 * - Structural characters: default
 */
export function syntaxHighlightJSON(jsonString: string): StyledText {
	const chunks: TextChunk[] = [];

	// Regex to match JSON tokens
	const tokenRegex =
		/"(?:[^"\\]|\\.)*"|true|false|null|-?\d+\.?\d*(?:[eE][+-]?\d+)?|[{}[\]:,]|\s+/g;
	let match: RegExpExecArray | null = tokenRegex.exec(jsonString);

	while (match !== null) {
		const token = match[0];

		if (token.startsWith('"')) {
			// Check if it's a key (followed by colon) or a value
			const remaining = jsonString.slice(tokenRegex.lastIndex);
			const isKey = /^\s*:/.test(remaining);

			if (isKey) {
				// JSON key
				chunks.push(cyan(token));
			} else {
				// String value
				chunks.push(green(token));
			}
		} else if (token === "true" || token === "false") {
			// Boolean
			chunks.push(magenta(token));
		} else if (token === "null") {
			// Null
			chunks.push(brightBlack(token));
		} else if (/^-?\d+\.?\d*(?:[eE][+-]?\d+)?$/.test(token)) {
			// Number
			chunks.push(yellow(token));
		} else {
			// Structural characters and whitespace
			chunks.push({ __isChunk: true, text: token });
		}

		match = tokenRegex.exec(jsonString);
	}

	return new StyledText(chunks);
}
