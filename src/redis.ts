"use server";
import Redis, { RedisOptions } from 'ioredis';
export const redis_client = new Redis();