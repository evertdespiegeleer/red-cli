import type { BoxRenderable } from "@opentui/core";
import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
	gap?: BoxRenderable["gap"];
}

export function BoxTitle(props: Props) {
	return (
		<box
			style={{
				alignItems: "center",
				width: "100%",
				// height: 0,
				marginTop: -1,
			}}
		>
			<box
				style={{
					backgroundColor: "black",
					paddingLeft: 2,
					paddingRight: 2,
					flexDirection: "row",
					gap: props.gap ?? 0,
				}}
			>
				{props.children}
			</box>
		</box>
	);
}
