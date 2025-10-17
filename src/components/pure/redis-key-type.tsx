import Color from "color";
import { useMemo } from "react";

interface Props {
	type: string;
}

const colorhash = (
	text: string,
	options?: { saturation?: number; lightness: number },
) => {
	const saturation = options?.saturation ?? 50;
	const lightness = options?.lightness ?? 30;

	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = text.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Convert hash to hue (0-360)
	const hue = Math.abs(hash) % 360;
	return Color.hsl(hue, saturation, lightness).hex();
};

export function RedisKeyType(props: Props) {
	const color = useMemo(() => colorhash(props.type), [props.type]);

	return (
		<text
			style={{
				bg: color,
			}}
		>
			{` ${props.type.toUpperCase()} `}
		</text>
	);
}
