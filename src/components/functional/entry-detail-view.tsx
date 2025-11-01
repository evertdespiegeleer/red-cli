import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
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
import { useInterval } from "../../util/use-interval";
import { BoxTitle } from "../pure/box-title";
import { RedisKeyType } from "../pure/redis-key-type";

interface Props {
	pathKey: string;
	focussed?: boolean;
}

export function EntryDetails(props: Props) {
	const router = useRoute();

	const query = useQuery({
		queryKey: ["redis", "key", props.pathKey],
		queryFn: async () => {
			return await getRedisKeyDetails(props.pathKey);
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
	useRegisterKeyBind("ctrl+r", "Refresh");
	useRegisterKeyBind("r", `${autoRefresh ? "Disable" : "Enable"} auto-refresh`);
	useKeyboard((key) => {
		if (!props.focussed) {
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
				<box flexDirection="column" gap={1}>
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

					{/* Value */}
					<box flexDirection="column">
						<text fg="cyan">Value:</text>
						<text selectable={true}>
							{JSON.stringify(query.data.value, null, 2)}
						</text>
					</box>
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
