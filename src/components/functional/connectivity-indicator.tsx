import { useQuery } from "@tanstack/react-query";
import { getRedis } from "../../redis";
import { useInterval } from "../../util/use-interval";

async function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error("Operation timed out"));
		}, ms);
		promise
			.then((result) => {
				clearTimeout(timeoutId);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timeoutId);
				reject(error);
			});
	});
}

async function asyncStopwatch<T>(
	promise: Promise<T>,
): Promise<{ result: T; duration: number }> {
	const start = Date.now();
	const result = await promise;
	const duration = Date.now() - start;
	return { result, duration };
}

export function ConnectivityIndicator() {
	const query = useQuery({
		queryKey: ["redis", "ping"],
		queryFn: () => {
			const redis = getRedis();
			return timeoutPromise(asyncStopwatch(redis.ping()), 1000);
		},
		retry: false,
	});

	useInterval(() => {
		query.refetch();
	}, 1000);

	return (
		<box style={{ flexDirection: "column" }}>
			{query.isSuccess ? (
				<text bg="green" fg="white">
					CONNECTED
				</text>
			) : (
				<text bg="red" fg="white">
					DISCONNECTED
				</text>
			)}
			<text visible={query.data != null}>Ping: {query.data?.duration}ms</text>
		</box>
	);
}
