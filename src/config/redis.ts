import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST as string,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  username: process.env.REDIS_USERNAME as string | undefined,
  password: process.env.REDIS_PASSWORD as string | undefined,
});

export default redisClient;
