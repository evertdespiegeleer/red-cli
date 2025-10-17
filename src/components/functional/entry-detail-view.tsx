import { BoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useRegisterKeyBind } from "../../contexts/registered-keybinds";
import { getRedis } from "../../redis";
import { useRoute } from "../../routing/provider";
import { useExtendsTrueishDuration } from "../../util/extend-fetching-duration";
import { useInterval } from "../../util/use-interval";
import { BoxTitle } from "../pure/box-title";

interface Props {
	pathKey: string;
	focussed?: boolean;
}

export function EntryDetails(props: Props) {
	const router = useRoute();

	const query = useQuery({
		queryKey: ["redis", "key", props.pathKey],
		queryFn: async () => {
			const redis = getRedis();
			const value = await redis.get(props.pathKey);
			return value;
		},
	});

	const showIsFetching = useExtendsTrueishDuration(query.isFetching);

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

	useInterval(() => {
		if (autoRefresh) {
			query.refetch();
		}
	}, 5000);
	const [autoRefresh, setAutoRefresh] = useState(false);
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
				<text fg="yellow">{`[${props.pathKey}]`}</text>
				{autoRefresh && <text fg="green">🔄</text>}
				{showIsFetching && <text fg="green">⏳</text>}
			</BoxTitle>

			<text selectable={false}>{query.data}</text>
		</box>
	);
}
