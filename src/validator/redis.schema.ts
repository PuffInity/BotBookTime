import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file redis.schema.ts
 * @summary Validates Redis ENV for Telegraf sessions.
 */

/**
 * uk: Zod схема ENV для Redis.
 * en: Zod ENV schema for Redis.
 * cz: Zod ENV schéma pro Redis.
 */
export const redisEnvSchema = z.object({
    // uk: Redis хост / en: Redis host / cz: Redis host
    REDIS_HOST: z.string().min(1),
    // uk: Redis пароль / en: Redis password / cz: Redis heslo
    REDIS_PASSWORD: z.string().optional(),
    // uk: Redis порт / en: Redis port / cz: Redis port
    REDIS_PORT: z.coerce.number().min(1024).max(65535).int().positive(),
    // uk: Redis DB індекс / en: Redis DB index / cz: Redis DB index
    REDIS_DB: z.coerce.number().int().min(0).max(15),
    // uk: TTL сесії / en: Session TTL / cz: TTL session
    REDIS_TTL: z.coerce.number().int().min(28000).max(259200).positive(),
    // uk: Touch інтервал / en: Touch interval / cz: Touch interval
    REDIS_TOUCH: z.coerce.number().int().min(900).max(3600).positive(),
});

/**
 * uk: Провалідований Redis конфіг.
 * en: Parsed Redis config.
 * cz: Validovaný Redis config.
 */
export const redisSchemaConfig = redisEnvSchema.parse(process.env);
