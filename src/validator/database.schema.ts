import {z} from 'zod'
import dotenv from "dotenv";
dotenv.config();

/**
 * @file database.schema.ts
 * @summary Validates PostgreSQL ENV config.
 */

/**
 * uk: Zod схема ENV для PostgreSQL.
 * en: Zod ENV schema for PostgreSQL.
 * cz: Zod ENV schéma pro PostgreSQL.
 */
export const pgEnvSchema = z.object({
    // uk: Хост БД / en: DB host / cz: DB host
    PG_HOST: z.string().min(1),
    // uk: Порт БД / en: DB port / cz: DB port
    PG_PORT: z.coerce.number().int().positive(),
    // uk: Назва БД / en: DB name / cz: Název DB
    PG_DATABASE: z.string().min(1),
    // uk: Користувач БД / en: DB user / cz: Uživatel DB
    PG_USER: z.string().min(1),
    // uk: Пароль БД / en: DB password / cz: Heslo DB
    PG_PASSWORD: z.string().optional(),
    // uk: SSL прапорець / en: SSL flag / cz: SSL příznak
    PG_SSL: z.coerce.boolean().default(false),
    // uk: Ліміт pool / en: Pool max / cz: Max poolu
    PG_POOL_MAX: z.coerce.number().int().positive().default(1),
    // uk: Мінімум pool / en: Pool min / cz: Min poolu
    PG_POOL_MIN: z.coerce.number().int().default(0),
    // uk: Connect timeout / en: Connect timeout / cz: Connect timeout
    PG_CONN_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
    // uk: Idle timeout / en: Idle timeout / cz: Idle timeout
    PG_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    // uk: Statement timeout / en: Statement timeout / cz: Statement timeout
    PG_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    // uk: Query timeout / en: Query timeout / cz: Query timeout
    PG_QUERY_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    // uk: Назва застосунку / en: App name / cz: Název aplikace
    APP_NAME: z.string().default('node-app')
})

/**
 * uk: Провалідований DB конфіг.
 * en: Parsed DB config.
 * cz: Validovaný DB config.
 */
export const dbConfig = pgEnvSchema.parse(process.env)
