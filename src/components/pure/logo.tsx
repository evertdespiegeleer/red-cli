import { RGBA } from "@opentui/core";

export function Logo(props: { big?: boolean }) {
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
		<box flexDirection="column">
			{(props.big ? logoPatternBig : logoPatternSmall)
				.split(/[\n\t]+/)
				.map((line, i) => (
					<text
						key={`logo-line-${
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							i
						}`}
						style={{ fg: RGBA.fromHex("#FF0000") }}
						selectable={false}
					>
						{line}
					</text>
				))}
		</box>
	);
}
