import { useKeyboard, useRenderer } from "@opentui/react";

export function DevConsole() {
	const renderer = useRenderer();

	useKeyboard((key) => {
		// Only if run in dev mode
		if (process.env.NODE_ENV !== "development") {
			return;
		}
		if (key.ctrl && key.name === "d") {
			renderer.console.toggle();
		}
	});

	return null;
}
