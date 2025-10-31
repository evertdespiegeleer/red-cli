import { getRedis } from "../redis";

type StringReturn = {
	type: "string";
	value?: string;
	ttl?: number;
};

type HashReturn = {
	type: "hash";
	value: Record<string, string>;
	ttl?: number;
};

type ListReturn = {
	type: "list";
	value: string[];
	ttl?: number;
};

type SetReturn = {
	type: "set";
	value: string[];
	ttl?: number;
};

type ReturnType = StringReturn | HashReturn | ListReturn | SetReturn;

export class UnsupportedRedisKeyTypeError extends Error {
	constructor(public type: string) {
		super(`Unsupported Redis key type: ${type}`);
		this.name = "UnsupportedRedisKeyTypeError";
	}
}

export async function getRedisKeyDetails(key: string): Promise<ReturnType> {
	const redis = getRedis();

	const [type, _ttl] = await Promise.all([redis.type(key), redis.ttl(key)]);

	let ttl: number | undefined = _ttl;
	if (_ttl === -1) {
		ttl = undefined;
	}

	switch (type) {
		case "string":
			return {
				type: "string",
				value: (await redis.get(key)) ?? undefined,
				ttl,
			};
		case "hash":
			return {
				type: "hash",
				value: await redis.hgetall(key),
				ttl,
			};
		case "list":
			return {
				type: "list",
				value: await redis.lrange(key, 0, -1),
				ttl,
			};
		case "set":
			return {
				type: "set",
				value: await redis.smembers(key),
				ttl,
			};
		default:
			throw new UnsupportedRedisKeyTypeError(type);
	}
}
