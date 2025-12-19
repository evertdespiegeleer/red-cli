import type { StyledText } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import clipboard from "clipboardy";
import { useState } from "react";
import { useRefreshConfig } from "../../contexts/refresh-config";
import { useRegisterKeyBind } from "../../contexts/registered-keybinds";
import { useRoute } from "../../routing/provider";
import { bigNumberGroup } from "../../util/big-number-group";
import { useExtendsTrueishDuration } from "../../util/extend-fetching-duration";
import {
	getRedisKeyDetails,
	UnsupportedRedisKeyTypeError,
} from "../../util/get-redis-key-details";
import { gitRepoPath } from "../../util/git-repo";
import { syntaxHighlightJSON } from "../../util/json-syntax-highlight";
import { useInterval } from "../../util/use-interval";
import { BoxTitle } from "../pure/box-title";
import { RedisKeyType } from "../pure/redis-key-type";

interface Props {
	pathKey: string;
	focussed?: boolean;
}

export function EntryDetails(props: Props) {
	const router = useRoute();
	const [isPrettified, setIsPrettified] = useState(true);

	const query = useQuery({
		queryKey: ["redis", "key", props.pathKey],
		queryFn: async () => {
			return await getRedisKeyDetails(props.pathKey);
		},
	});

	const deleteMutation = useMutation({
		mutationKey: ["redis", "delete-key", props.pathKey],
		mutationFn: async () => {
			// Delete the key
			const redis = (await import("../../redis")).getRedis();
			await redis.del(props.pathKey);
		},
		onSuccess: () => {
			// Go back to previous route
			router.previousRoute != null && router.setRoute(router.previousRoute);
		},
	});

	useKeyboard((key) => {
		if (!props.focussed) {
			return;
		}

		if (key.name === "escape") {
			key.preventDefault();
			router.previousRoute != null && router.setRoute(router.previousRoute);
		}
	});

	useRegisterKeyBind("esc", "Go back");

	const { autoRefresh, setAutoRefresh, refreshInterval } = useRefreshConfig();

	useInterval(() => {
		if (autoRefresh) {
			query.refetch();
		}
	}, refreshInterval);
	useRegisterKeyBind("shift+r", "Refresh");
	useRegisterKeyBind("r", `${autoRefresh ? "Disable" : "Enable"} auto-refresh`);
	useKeyboard((key) => {
		if (!props.focussed) {
			return;
		}
		if (key.name === "r") {
			key.preventDefault();
			if (key.shift) {
				query.refetch();
			} else {
				setAutoRefresh((current) => !current);
			}
		}
	});

	useRegisterKeyBind("shift+c", "Copy value to clipboard");
	useKeyboard(async (key) => {
		if (!props.focussed) {
			return;
		}
		if (key.name === "c" && key.shift) {
			key.preventDefault();
			if (query.data != null) {
				await clipboard.write(JSON.stringify(query.data.value, null, 2));
			}
		}
	});

	useRegisterKeyBind("shift+d", "Delete key");
	useKeyboard((key) => {
		if (!props.focussed) {
			return;
		}
		if (key.name === "d" && key.shift) {
			key.preventDefault();
			deleteMutation.mutate();
		}
	});

	// Helper function to check if value is valid JSON
	const isValidJSON = (value: unknown): boolean => {
		if (typeof value === "string") {
			try {
				JSON.parse(value);
				return true;
			} catch {
				return false;
			}
		}
		// Non-string values (objects, arrays) are already structured and can be prettified
		return typeof value === "object" && value !== null;
	};

	// Helper function to format the value
	const formatValue = (value: unknown): string | StyledText => {
		if (typeof value === "string") {
			// For string types, check if it's valid JSON
			if (isValidJSON(value)) {
				if (isPrettified) {
					const formatted = JSON.stringify(JSON.parse(value), null, 4);
					return syntaxHighlightJSON(formatted);
				}
				// Return raw string without highlighting
				return value;
			}
			// Not valid JSON, just return the string
			return value;
		}
		// For objects/arrays (hash, list, set types)
		if (isPrettified) {
			const formatted = JSON.stringify(value, null, 2);
			return syntaxHighlightJSON(formatted);
		}
		// Return compact JSON without highlighting
		return JSON.stringify(value);
	};

	// Only show prettify keybind if value is valid JSON
	const canPrettify = query.data != null && isValidJSON(query.data.value);

	useRegisterKeyBind("shift+j", "Toggle JSON prettify", canPrettify);

	useKeyboard((key) => {
		if (!props.focussed || !canPrettify) {
			return;
		}
		if (key.name === "j" && key.shift) {
			key.preventDefault();
			setIsPrettified((current) => !current);
		}
	});

	return (
		<box
			borderColor="cyan"
			borderStyle="rounded"
			flexGrow={1}
			titleAlignment="center"
			flexDirection="column"
		>
			<BoxTitle gap={1}>
				<text fg="cyan">Key Details</text>

				{query.data != null && <RedisKeyType type={query.data.type} />}
				{query.error != null && (
					<RedisKeyType
						type={
							query.error instanceof UnsupportedRedisKeyTypeError
								? query.error.type
								: "Unknown Type"
						}
					/>
				)}

				<text fg="yellow">{`[${props.pathKey}]`}</text>
				{autoRefresh && <text fg="green">🔄</text>}
				{useExtendsTrueishDuration(query.isFetching) && (
					<text fg="green">⏳</text>
				)}
			</BoxTitle>

			{query.data != null && (
				<box flexDirection="column" gap={1} flexGrow={1}>
					{/* Table with info */}
					<box flexDirection="row" gap={1}>
						<box flexDirection="column">
							<text fg="cyan">Type:</text>
							<text fg="cyan">TTL:</text>
						</box>
						<box flexDirection="column">
							<text>{query.data.type}</text>
							{query.data.ttl == null ? (
								<text style={{ fg: "grey" }}>Infinite</text>
							) : (
								<text>{`${bigNumberGroup(query.data.ttl)} seconds`}</text>
							)}
						</box>
					</box>

					{/* Value in scrollable box */}
					<scrollbox flexGrow={1}>
						<text selectable={true} content={formatValue(query.data.value)} />
					</scrollbox>
				</box>
			)}

			{query.error != null &&
				query.error instanceof UnsupportedRedisKeyTypeError && (
					<box flexDirection="column">
						<text fg="red">{`Unsupported Redis key type: ${query.error.type}`}</text>
						<text>
							In this version of Red, rendering for the "{query.error.type}" key
							type is not yet supported. If you believe it should be, please
							submit a Github issue.
						</text>
						{/* Link */}
						<text fg="cyan">
							<u>{gitRepoPath}/issues</u>
						</text>
					</box>
				)}
		</box>
	);
}
