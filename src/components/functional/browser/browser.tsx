import { useEffect, useState } from "react";
import { getRedis } from "../../../redis";

export function Browser(props: { path: string }) {
	const [entries, setEntries] = useState<string[]>([]);
	useEffect(() => {
		getRedis().keys("*").then(setEntries);
	}, []);

	return (
		<box
			borderColor="cyan"
			borderStyle="rounded"
			flexGrow={1}
			title={` ${props.path || "[root]"} `}
			titleAlignment="center"
			flexDirection="row"
		>
			<box flexDirection="column">
				{entries.map((entry) => (
					<box key={entry} paddingLeft={1}>
						<text>{entry}</text>
					</box>
				))}
			</box>
		</box>
	);
}
