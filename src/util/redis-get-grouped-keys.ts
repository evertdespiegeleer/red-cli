import type { getRedis } from "../redis";

export type KeyReturnType = {
	baseName: string;
	relativePath: string;
	fullPath: string;
	isGroup: boolean;
};

export class RedisUtils {
	constructor(
		private redis: ReturnType<typeof getRedis>,
		private path: string,
	) {
		if (path.endsWith(":")) {
			throw new Error("Path should not end with a colon");
		}
	}

	getChildKeys = (params: { depth: number }) => {
		const keys = new Set<KeyReturnType>();
		const scanStream = this.redis.scanStream({
			match: [this.path, "*"].filter(Boolean).join(":"),
		});

		return new Promise<KeyReturnType[]>((resolve, reject) => {
			scanStream.on("end", () => resolve(Array.from(keys)));
			scanStream.on("error", (error) => reject(error));
			scanStream.on("data", (bunchOfKeys: string[]) => {
				for (const fullKey of bunchOfKeys) {
					const pathPrefix = this.path.length > 0 ? `${this.path}:` : "";
					const relativeKey = fullKey.slice(pathPrefix.length);

					const relativeKeySections = relativeKey.split(":");

					if (relativeKeySections.length <= params.depth) {
						keys.add({
							baseName: relativeKeySections.slice(-1)[0],
							relativePath: relativeKey,
							fullPath: fullKey,
							isGroup: false,
						});
					}
				}
			});
		});
	};

	getChildGroups = async (params: {
		depth: number;
	}): Promise<KeyReturnType[]> => {
		const groups = new Map<string, KeyReturnType>();
		// If we're looking for N levels deep groups, that means that the keys are N+1 levels deep
		const relevantKeys = await this.getChildKeys({ depth: params.depth + 1 });
		for (const key of relevantKeys) {
			// Remove the last section to get the group name
			const fullPath = key.fullPath.split(":").slice(0, -1).join(":");
			const pathPrefix = this.path.length > 0 ? `${this.path}:` : "";
			const relativePath = fullPath.slice(pathPrefix.length);
			if (relativePath === "") {
				continue;
			}
			groups.set(fullPath, {
				fullPath,
				relativePath,
				baseName: relativePath.split(":").slice(-1)[0],
				isGroup: true,
			});
		}
		return [...groups.values()];
	};

	getDirectChildKeys = (): Promise<KeyReturnType[]> => {
		return this.getChildKeys({ depth: 1 });
	};

	getRecursiveChildKeys = (): Promise<KeyReturnType[]> => {
		return this.getChildKeys({ depth: Infinity });
	};

	getDirectChildGroups = (): Promise<KeyReturnType[]> => {
		return this.getChildGroups({ depth: 1 });
	};

	getRecursiveChildGroups = (): Promise<KeyReturnType[]> => {
		return this.getChildGroups({ depth: Infinity });
	};
}
