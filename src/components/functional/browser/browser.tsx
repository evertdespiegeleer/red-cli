import type { InputRenderable, ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
import clipboard from "clipboardy";
import { useEffect, useRef, useState } from "react";
import { getConfig } from "../../../config";
import { useRefreshConfig } from "../../../contexts/refresh-config";
import { useRegisterKeyBind } from "../../../contexts/registered-keybinds";
import { getRedis } from "../../../redis";
import { useRoute } from "../../../routing/provider";
import { RouteTypes } from "../../../routing/route-types";
import { BrowserRoute } from "../../../routing/route-types/browser";
import { biggestAbsolute } from "../../../util/biggest-absolute";
import { clamp } from "../../../util/clamp";
import { useExtendsTrueishDuration } from "../../../util/extend-fetching-duration";
import { RedisUtils } from "../../../util/redis-get-grouped-keys";
import { useInterval } from "../../../util/use-interval";
import { usePropagate } from "../../../util/use-propagate";
import { BoxTitle } from "../../pure/box-title";

const focusItems = ["search", "key-list"] as const;

interface SearchBarProps {
	focussed?: boolean;
	onBlur?: () => unknown;
	onSearch?: (searchValue: string) => unknown;
	onInput?: (searchValue: string) => unknown;
	value: string;
}
export function SearchBar(props: SearchBarProps) {
	const inputRef = useRef<InputRenderable>(null!);

	useKeyboard(async (key) => {
		if (!props.focussed) {
			return;
		}
		// Pressing enter
		if (key.name === "return") {
			key.preventDefault();
			props.onSearch?.(props.value);
			props.onBlur?.();
			return;
		}

		// Pressing escape
		if (key.name === "escape") {
			key.preventDefault();
			if (props.value !== "") {
				props.onInput?.("");
				return;
			}
			props.onBlur?.();
			return;
		}

		// Pasting text
		if (key.name === "v" && (key.ctrl || key.meta)) {
			key.preventDefault();
			const clipboardContent = await clipboard.read();
			props.onInput?.(props.value + clipboardContent);
			return;
		}
	});

	useEffect(() => {
		// When the value changes, move the cursor to the end, this doesn't happen automatically when updating the value prop programmatically
		inputRef.current.cursorPosition = props.value.length;
	}, [props.value]);

	return (
		<box
			borderColor="cyan"
			minHeight={3}
			visible={props.focussed}
			flexDirection="row"
		>
			<text>/</text>
			<input
				ref={inputRef}
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

interface Props {
	focussed?: boolean;
	path: string;
}

export function Browser(props: Props) {
	const search = usePropagate("");
	const { setRoute } = useRoute();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Whenever the path changes, we want to clear the search
	useEffect(() => {
		search.clear();
	}, [props.path]);

	const [focus, setFocus] = useState<(typeof focusItems)[number]>("key-list");

	// const [showRecursive, setShowRecursive] = useState(false);
	// useRegisterKeyBind("n", `${showRecursive ? "Hide" : "Show"} nested keys`);
	// useKeyboard(async (key) => {
	// 	if (focus !== "key-list") {
	// 		return;
	// 	}
	// 	if (key.name === "n" && !key.ctrl && !key.meta) {
	// 		key.preventDefault();
	// 		setShowRecursive((current) => !current);
	// 	}
	// });

	const [showGroups, setShowGroups] = useState(true);
	useRegisterKeyBind("g", `${showGroups ? "Hide" : "Show"} groups`);
	useKeyboard(async (key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "g" && !key.ctrl && !key.meta) {
			key.preventDefault();
			setShowGroups((current) => !current);
		}
	});

	const query = useQuery({
		queryKey: [
			"redis",
			"keys",
			props.path,
			{ search: search.propagatedValue, showGroups },
		],
		queryFn: async () => {
			// new RedisUtils(getRedis(), props.path).getRecursiveChildKeys(),
			const redisUtils = new RedisUtils(getRedis(), props.path);
			const promises = [redisUtils.getDirectChildKeys()];
			if (showGroups) {
				promises.push(redisUtils.getDirectChildGroups());
			}
			const allEntries = await Promise.all(promises).then((e) => e.flat());
			return allEntries
				.filter((entry) => entry.baseName.includes(search.propagatedValue))
				.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
		},
	});

	const [highlightedKeyFullPath, setHighlightedKeyFullPath] = useState<
		string | undefined
	>();

	useEffect(() => {
		console.log(highlightedKeyFullPath);
	}, [highlightedKeyFullPath]);

	const scrollboxRef = useRef<ScrollBoxRenderable>(null!);
	useKeyboard((key) => {
		if (focus !== "key-list") {
			return;
		}
		const indexDelta = key.name === "down" ? 1 : key.name === "up" ? -1 : 0;
		if (query.data != null && indexDelta !== 0) {
			setHighlightedKeyFullPath((current) => {
				const currentHighlightedIndex =
					current != null
						? query.data.map((e) => e.fullPath).indexOf(current)
						: -1;
				const newHighlightedIndex = clamp(
					0,
					query.data.length - 1,
				)(currentHighlightedIndex + indexDelta);
				return query.data[newHighlightedIndex].fullPath;
			});
		}
	});

	useEffect(() => {
		if (highlightedKeyFullPath == null || query.data == null) {
			return;
		}
		const highlightedKeyIndex = query.data
			.map((entry) => entry.fullPath)
			.indexOf(highlightedKeyFullPath);
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
	}, [highlightedKeyFullPath, query.data]);

	const { autoRefresh, setAutoRefresh } = useRefreshConfig();

	useInterval(() => {
		if (autoRefresh) {
			query.refetch();
		}
	}, getConfig().refreshInterval);
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
			if (highlightedKeyFullPath != null) {
				await clipboard.write(highlightedKeyFullPath);
			}
		}
	});

	useKeyboard(async (key) => {
		if (focus !== "key-list") {
			return;
		}
		if (key.name === "escape") {
			key.preventDefault();
			// Go up one level
			const { delimiter } = getConfig();
			const newRoute = props.path.split(delimiter).slice(0, -1).join(delimiter);
			setRoute(new BrowserRoute(newRoute));
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
		if (key.name === "return" && highlightedKeyFullPath != null) {
			key.preventDefault();
			const highlightedEntry = query.data?.find(
				(entry) => entry.fullPath === highlightedKeyFullPath,
			);
			if (highlightedEntry == null) {
				throw new Error("Highlighted entry not found");
			}
			if (highlightedEntry.isGroup) {
				setRoute(new RouteTypes.Browser(highlightedEntry.fullPath));
				return;
			}
			setRoute(new RouteTypes.EntryDetails(highlightedKeyFullPath));
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
					setHighlightedKeyFullPath(undefined);
				}}
				onBlur={() => setFocus("key-list")}
			/>
			<box
				borderColor="cyan"
				borderStyle="rounded"
				flexGrow={1}
				titleAlignment="center"
				flexDirection="column"
			>
				<BoxTitle
					gap={1}
					style={{
						// I am not entirely sure why this is needed, but without it, the scrollbox overlaps the title
						height: 3,
					}}
				>
					<text fg="cyan">Browser</text>
					<text fg="yellow">{`[${props.path || "root"}]`}</text>

					{search.propagatedValue !== "" && (
						<text fg="red">{`/${search.propagatedValue}`}</text>
					)}

					{autoRefresh && <text fg="green">🔄</text>}

					{useExtendsTrueishDuration(query.isFetching) && (
						<text fg="green">⏳</text>
					)}
				</BoxTitle>
				<scrollbox ref={scrollboxRef} width="100%">
					{query.isLoading && <text>Loading...</text>}

					{query.data?.map((entry) => (
						// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
						<box
							style={{
								backgroundColor:
									entry.fullPath === highlightedKeyFullPath ? "red" : undefined,
								flexDirection: "row",
								gap: 1,
							}}
							key={entry.relativePath}
							paddingLeft={1}
							onMouseDown={() => setHighlightedKeyFullPath(entry.fullPath)}
						>
							<text>{entry.isGroup ? "📁" : "📄"}</text>
							<text fg={entry.isGroup ? "yellow" : undefined}>
								{entry.relativePath}
							</text>
						</box>
					))}
				</scrollbox>
			</box>
		</box>
	);
}
