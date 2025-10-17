import type { BoxProps } from "@opentui/react";
import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
	gap?: NonNullable<BoxProps["style"]>["gap"];
	style?: BoxProps["style"];
}

export function BoxTitle(props: Props) {
	return (
		<box
			style={{
				alignItems: "center",
				width: "100%",
				// height: 1,
				marginTop: -1,
				...props.style,
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
