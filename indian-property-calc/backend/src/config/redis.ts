import { Redis } from 'ioredis';
import { config } from './index.js';
// import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

const initRedis = () => {
  if (!config.redis) {
    // logger.info('Redis is not configured, skipping initialization');
    return null;
  }

  try {
    redisClient = new Redis(config.redis.url);
    // logger.info('Redis client initialized successfully');
    return redisClient;
  } catch (error) {
    // logger.error('Failed to initialize Redis client:', error);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export default {
  initialize: initRedis
}; 