import { getConfig } from "../config";
import type { getRedis } from "../redis";

export type KeyReturnType = {
	baseName: string;
	relativePath: string;
	fullPath: string;
	isGroup: boolean;
};

export class RedisUtils {
	private delimiter: string = ":";

	constructor(
		private redis: ReturnType<typeof getRedis>,
		private path: string,
	) {
		const { delimiter } = getConfig();
		this.delimiter = delimiter;
		if (path.endsWith(delimiter)) {
			throw new Error(`Path should not end with delimiter ${this.delimiter}`);
		}
	}

	getChildKeys = (params: { depth: number }) => {
		const keys = new Set<KeyReturnType>();
		const scanStream = this.redis.scanStream({
			match: [this.path, "*"].filter(Boolean).join(this.delimiter),
		});

		return new Promise<KeyReturnType[]>((resolve, reject) => {
			scanStream.on("end", () => resolve(Array.from(keys)));
			scanStream.on("error", (error) => reject(error));
			scanStream.on("data", (bunchOfKeys: string[]) => {
				for (const fullKey of bunchOfKeys) {
					const pathPrefix =
						this.path.length > 0 ? `${this.path}${this.delimiter}` : "";
					const relativeKey = fullKey.slice(pathPrefix.length);

					const relativeKeySections = relativeKey.split(this.delimiter);

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
		// We essentally have to scan over all keys in order to find groups. Not just one extra level down, because a key existing 2 extra levels down does mean that the intermediate level is a group.
		const groups = new Map<string, KeyReturnType>();
		const scanStream = this.redis.scanStream({
			match: [this.path, "*"].filter(Boolean).join(this.delimiter),
		});
		return new Promise<KeyReturnType[]>((resolve, reject) => {
			scanStream.on("end", () => resolve([...groups.values()]));
			scanStream.on("error", (error) => reject(error));
			scanStream.on("data", (bunchOfKeys: string[]) => {
				for (const fullKey of bunchOfKeys) {
					const pathPrefix =
						this.path.length > 0 ? `${this.path}${this.delimiter}` : "";

					const relativeKey = fullKey.slice(pathPrefix.length);
					let relativeKeySections = relativeKey.split(this.delimiter);
					relativeKeySections.pop(); // Remove last section, as that is the key itself, not a group

					relativeKeySections = relativeKeySections.slice(0, params.depth); // Limit to depth

					if (relativeKeySections.length === 0) {
						continue;
					}

					for (let i = 0; i < relativeKeySections.length; i++) {
						const baseName = relativeKeySections[i];
						const groupRelativePath = relativeKeySections.slice(0, i + 1);
						const relativePath = groupRelativePath.join(this.delimiter);
						const fullPath = [pathPrefix, relativePath].join("");
						groups.set(fullPath, {
							baseName,
							relativePath,
							fullPath,
							isGroup: true,
						});
					}
				}
			});
		});
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
