import Redis from 'ioredis'
import { getConfig } from './config';

let redis: InstanceType<typeof Redis>;

export const initRedis = () => {
    if (redis != null) {
        throw new Error('Redis already initialized')
    }
    redis = new Redis(getConfig().redis.connectionString);
}

export const getRedis = () => {
    if (!redis) {
        throw new Error('Redis not initialized')
    }
    return redis;
}