import { RGBA } from "@opentui/core";
import type { BoxProps } from "@opentui/react";

export function Logo(props: { big?: boolean; style?: BoxProps["style"] }) {
	const logoPatternBig = `
		██████  ██████  ████  
		██  ██  ██      ██  ██
		████    ████    ██  ██
		██  ██  ██████  ████
	`;
	const logoPatternSmall = `
		█▀█ █▀▀ █▀▄ 
		█▀▄ ██▄ █▄▀
	`;

	return (
		<box flexDirection="column" style={props.style}>
			{(props.big ? logoPatternBig : logoPatternSmall)
				.split(/[\n\t]+/)
				.map((line, i) => (
					<text
						key={`logo-line-${
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							i
						}`}
						style={{ fg: RGBA.fromHex("#bb0e0e") }}
						selectable={false}
					>
						{line}
					</text>
				))}
		</box>
	);
}
