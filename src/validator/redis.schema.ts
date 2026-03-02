import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * @file redis.schema.ts
 * @summary Валідація ENV-змінних для Redis (сесії Telegraf).
 */

/** Zod-схема змінних середовища Redis. */
export const redisEnvSchema = z.object({
    /** REDIS_HOST - Повинно бути string та мати мінімально 1 елемент */
    REDIS_HOST: z.string().min(1),
    /** REDIS_PASSWORD - Повинно бути string та наявність опціонально */
    REDIS_PASSWORD: z.string().optional(),
    /** REDIS_PORT - Перетворюємо в число мінімально 1024 максимально 65535 число повинно бути тільки ціле та більше 0 */
    REDIS_PORT: z.coerce.number().min(1024).max(65535).int().positive(),
    /** REDIS_DB - Перетворюємо в число воно повинно бути тільки ціле мінімально 0 максимально 15 */
    REDIS_DB: z.coerce.number().int().min(0).max(15),
    /** REDIS_TTL - Перетворюємо в число воно повинно бути тільки ціле мінімально 28000 максимально 259200 повинно бути більше 0 */
    REDIS_TTL: z.coerce.number().int().min(28000).max(259200).positive(),
    /** REDIS_TOUCH - Перетворюємо в число воно повинно бути тільки ціле мінімально 900 максимально 3600 повинно бути більше 0 */
    REDIS_TOUCH: z.coerce.number().int().min(900).max(3600).positive(),
});

/** Провалідована конфігурація Redis, зібрана з process.env. */
export const redisSchemaConfig = redisEnvSchema.parse(process.env);
