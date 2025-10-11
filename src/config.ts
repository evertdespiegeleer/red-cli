import { z } from "zod";
import process from "node:process"

export const zConfig = z.object({
    redis: z.object({
        connectionString: z.string().regex(/^rediss?:\/\/.+/)
    })
})

export let env: z.infer<typeof zConfig> | undefined = undefined;

export const plainConfig = {
    redis: {
        connectionString: process.env.REDIS_CONNECTION_STRING
    }
}

export const loadConfig = () => {
    env = zConfig.parse(plainConfig);
}

export const getConfig = () => {
    if (!env) {
        throw new Error('Config not loaded')
    }
    return env;
}