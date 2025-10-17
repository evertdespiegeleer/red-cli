import type { ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
import clipboard from "clipboardy";
import { useEffect, useRef, useState } from "react";
import { useRegisterKeyBind } from "../../../contexts/registered-keybinds";
import { getRedis } from "../../../redis";
import { useRoute } from "../../../routing/provider";
import { BrowserRoute } from "../../../routing/route-types/browser";
import { biggestAbsolute } from "../../../util/biggest-absolute";
import { clamp } from "../../../util/clamp";
import { useExtendsTrueishDuration } from "../../../util/extend-fetching-duration";
import { useDebounce } from "../../../util/use-debounce";
import { useInterval } from "../../../util/use-interval";
import { usePropagate } from "../../../util/use-propagate";

const focusItems = ["search", "key-list"] as const;

interface SearchBarProps {
	focussed?: boolean;
	onBlur?: () => unknown;
	onSearch?: (searchValue: string) => unknown;
	onInput?: (searchValue: string) => unknown;
	value: string;
}
export function SearchBar(props: SearchBarProps) {
	useKeyboard((key) => {
		if (!props.focussed) {
			return;
		}

		if (key.name === "return") {
			key.preventDefault();
			props.onSearch?.(props.value);
			props.onBlur?.();
			return;
		}

		if (key.name === "escape") {
			key.preventDefault();
			if (props.value !== "") {
				props.onInput?.("");
				return;
			}
			props.onBlur?.();
			return;
		}
	});

	return (
		<box
			borderColor="cyan"
			minHeight={3}
			visible={props.focussed}
			flexDirection="row"
		>
			<text>/</text>
			<input
				flexGrow={1}
				minHeight={1}
				placeholder="Search keys..."
				onInput={props.onInput}
				value={props.value}
				focused={props.focussed}
			/>
		</box>
	);
}

export function Browser(props: { path: string }) {
	const search = usePropagate("");
	const { setRoute } = useRoute();

	const [focus, setFocus] = useState<(typeof focusItems)[number]>("key-list");

	const query = useQuery({
		queryKey: ["redis", "keys", props.path, { search: search.propagatedValue }],
		queryFn: async () => {
			const redis = getRedis();
			const keys = await redis.keys(
				[props.path, "*"].filter(Boolean).join(":"),
			);
			return keys.filter((key) => key.includes(search.propagatedValue));
		},
	});

	const showIsFetching = useExtendsTrueishDuration(query.isFetching, 500);

	const [highlightedKey, setHighlightedKey] = useState<string | undefined>();
	const scrollboxRef = useRef<ScrollBoxRenderable>(null!);
	useKeyboard((key) => {
		if (focus !== "key-list") {
			return;
		}
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
	useRegisterKeyBind("r", `${autoRefresh ? "Disable" : "Enable"} auto-refresh`);
	useKeyboard((key) => {
		if (focus !== "key-list") {
			return;
		}
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
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "c" && !key.ctrl && !key.meta) {
			key.preventDefault();
			if (highlightedKey != null) {
				await clipboard.write(highlightedKey);
			}
		}
	});

	const [showSubKeys, setShowSubKeys] = useState(false);
	useRegisterKeyBind("g", `${showSubKeys ? "Hide" : "Show"} nested keys`);
	useKeyboard(async (key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "g" && !key.ctrl && !key.meta) {
			key.preventDefault();
			setShowSubKeys((current) => !current);
		}
	});

	useRegisterKeyBind("esc", "Go up one level");
	useKeyboard(async (key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "escape") {
			key.preventDefault();
			setRoute(new BrowserRoute(props.path.split(":").slice(0, -1).join(":")));
		}
	});

	useRegisterKeyBind("/", "Search");
	useKeyboard((key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "/") {
			key.preventDefault();
			setFocus("search");
		}
	});

	useKeyboard((key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "/") {
			key.preventDefault();
			setFocus("search");
		}
	});

	useKeyboard((key) => {
		if (focus !== "search") {
			return;
		}
		if (key.name === "/") {
			key.preventDefault();
			setFocus("search");
		}
	});

	return (
		<box flexDirection="column">
			<SearchBar
				value={search.value}
				onInput={search.setValue}
				focussed={focus === "search"}
				onSearch={() => {
					search.propagate();
					setFocus("key-list");
					setHighlightedKey(undefined);
				}}
				onBlur={() => setFocus("key-list")}
			/>
			<box
				borderColor="cyan"
				borderStyle="rounded"
				flexGrow={1}
				title={` ${[
					// The actual title
					props.path || "[root]",

					// Search indicator
					search.propagatedValue && `🔍 "${search.propagatedValue}"`,

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
		</box>
	);
}
