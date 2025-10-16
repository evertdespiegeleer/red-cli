import type { ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
import clipboard from "clipboardy";
import { useEffect, useRef, useState } from "react";
import { useRegisterKeyBind } from "../../../contexts/registered-keybinds";
import { getRedis } from "../../../redis";
import { biggestAbsolute } from "../../../util/biggest-absolute";
import { clamp } from "../../../util/clamp";
import { useExtendsTrueishDuration } from "../../../util/extend-fetching-duration";
import { useInterval } from "../../../util/use-interval";

export function Browser(props: { path: string }) {
	const query = useQuery({
		queryKey: ["redis", "keys", props.path],
		queryFn: async () => {
			const redis = getRedis();
			const keys = await redis.keys(
				[props.path, "*"].filter(Boolean).join(":"),
			);
			return keys;
		},
	});

	const showIsFetching = useExtendsTrueishDuration(query.isFetching, 500);

	const [highlightedKey, setHighlightedKey] = useState<string | undefined>();
	const scrollboxRef = useRef<ScrollBoxRenderable>(null!);
	useKeyboard((key) => {
		const indexDelta = key.name === "down" ? 1 : key.name === "up" ? -1 : 0;
		if (query.data != null && indexDelta !== 0) {
			setHighlightedKey((current) => {
				const currentHighlightedIndex =
					current != null ? query.data.indexOf(current) : -1;
				const newHighlightedIndex = clamp(
					0,
					query.data.length - 1,
				)(currentHighlightedIndex + indexDelta);
				return query.data[newHighlightedIndex];
			});
		}
	});

	useEffect(() => {
		if (highlightedKey == null || query.data == null) {
			return;
		}
		const highlightedKeyIndex = query.data.indexOf(highlightedKey);
		// In case we reach the bottom of the scrollbox, scroll down. Don't scroll down when the thing we're selecting is already visible.
		const { current: scrollbox } = scrollboxRef;

		/** How far away the highlighted key is from the visible area, negative if it is above it, positive if it is below it */
		const outOfBoundsDiff = biggestAbsolute([
			// Above the visible area
			highlightedKeyIndex < scrollbox.scrollTop
				? highlightedKeyIndex - scrollbox.scrollTop
				: 0,
			// Below the visible area
			highlightedKeyIndex >= scrollbox.scrollTop + scrollbox.height
				? highlightedKeyIndex - (scrollbox.scrollTop + scrollbox.height) + 1
				: 0,
		]);

		scrollbox.scrollTo(scrollbox.scrollTop + outOfBoundsDiff);
	}, [highlightedKey, query.data]);

	useInterval(() => {
		if (autoRefresh) {
			query.refetch();
		}
	}, 10000);
	const [autoRefresh, setAutoRefresh] = useState(false);
	useRegisterKeyBind("ctrl+r", "Refresh");
	useRegisterKeyBind("r", "Toggle auto-refresh");
	useKeyboard((key) => {
		if (key.name === "r") {
			key.preventDefault();
			if (key.ctrl) {
				query.refetch();
			} else {
				setAutoRefresh((current) => !current);
			}
		}
	});

	useRegisterKeyBind("c", "Copy key to clipboard");
	useKeyboard(async (key) => {
		if (key.name === "c" && !key.ctrl && !key.meta) {
			key.preventDefault();
			if (highlightedKey != null) {
				await clipboard.write(highlightedKey);
			}
		}
	});

	useRegisterKeyBind("g", "Toggle groups (not implemented)");

	return (
		<box
			borderColor="cyan"
			borderStyle="rounded"
			flexGrow={1}
			title={` ${[
				// The actual title
				props.path || "[root]",
				// Loading indicator
				autoRefresh && "🔄",
				showIsFetching && "⏳",
			]
				.filter(Boolean)
				.join(" ")} `}
			titleAlignment="center"
			flexDirection="row"
		>
			<scrollbox ref={scrollboxRef}>
				<box flexDirection="column" width="100%">
					{query.isLoading && <text>Loading...</text>}

					{query.data?.map((entry) => (
						// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
						<box
							style={{
								backgroundColor: entry === highlightedKey ? "red" : undefined,
							}}
							key={entry}
							paddingLeft={1}
							onMouseDown={() => setHighlightedKey(entry)}
						>
							<text>{entry}</text>
						</box>
					))}
				</box>
			</scrollbox>
		</box>
	);
}
