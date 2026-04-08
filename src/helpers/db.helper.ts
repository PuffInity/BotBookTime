import {dbLogger, pool} from "../config/database.config.js";
import {PoolClient, QueryResultRow} from "pg";
import {handleError, DatabaseError} from "../utils/error.utils.js";

/**
 * @file db.helper.ts
 * @summary Файл який виконує дію хелпера для SQL запитів
 */

//==========================================================================================

export type RowMapper<TRow extends QueryResultRow, TEntity> = (row: TRow) => TEntity

/**
 * @summary Функція яка виконує SQL код SELECT та повертає тільки 1 рядок або null
 * @param {string} sql - SQL запит
 * @param {readonly unknown[]} params - Це параметри які ми будемо передавати разом з SQL запитом
 * надаємо йому readonly щоб не було мутацій
 * @param {RowMapper<>} mapRow - Це наш мапер який ми будемо передавати щоб отримувати відразу готовий оброблений результат
 * @param {PoolClient} client - Передаємо зʼєднання яке буде робити запити в базу дазу даних
 * @example
 * import {pool} from "../config/database.config.js";
 * const client = await pool.connect()
 *
 * const example = await queryOne(
 * `example sql code`,[example params],ServiceToEntity,client
 * )
 *
 * @return TEntity - це оброблений результат з мапера якщо візьмемо з приклада тоді тут ми дістанемо тип ServicesEntity
 */
export async function queryOne<TRow extends QueryResultRow,TEntity>(
    sql: string,
    params: readonly unknown[],
    mapRow: RowMapper<TRow, TEntity>,
    client: PoolClient
): Promise<TEntity | null> {
    const result = await client.query<TRow>(sql, [...params])
    if(result.rowCount === 0) return null
    return mapRow(result.rows[0])
}

//==========================================================================================

/**
 * @summary Функція яка виконує тіж дії що і queryOne тільки ця повертає цілі масиви обʼєктів
 * @param {string} sql - SQL запит
 * @param {readonly unknown[]} params - Це параметри які ми будемо передавати разом з SQL запитом
 * надаємо йому readonly щоб не було мутацій
 * @param {RowMapper<>} mapRow - Це наш мапер який ми будемо передавати щоб отримувати відразу готовий оброблений результат
 * @param {PoolClient} client - Передаємо зʼєднання яке буде робити запити в базу дазу даних
 * @example
 * import {pool} from "../config/database.config.js";
 * const client = await pool.connect()
 *
 * const example = await queryMany(
 * `example sql code`,[example params],ServiceToEntity,client
 * )
 *
 * @return TEntity[] - Дістанемо масив типів ServicesEntity
 */
export async function queryMany<TRow extends QueryResultRow, TEntity> (
    sql: string,
    params: readonly unknown[],
    mapRow: RowMapper<TRow, TEntity>,
    client: PoolClient
): Promise<TEntity[]> {
    const result = await client.query<TRow>(sql,[...params])
    return result.rows.map(mapRow)
}

//==========================================================================================

/**
 * @summary Функція яка виконує більшість запитів INSERT,UPDATE,DELETE але обовʼязково повинно бути RETURNING та повертати те що було видалено обновлено та добавлено
 * @param {string} sql - SQL запит
 * @param {readonly unknown[]} params - Це параметри які ми будемо передавати разом з SQL запитом
 * надаємо йому readonly щоб не було мутацій
 * @param {RowMapper<>} mapRow - Це наш мапер який ми будемо передавати щоб отримувати відразу готовий оброблений результат
 * @param {PoolClient} client - Передаємо зʼєднання яке буде робити запити в базу дазу даних
 * @example
 * import {pool} from "../config/database.config.js";
 * const client = await pool.connect()
 *
 * const example = await executeOne(
 * `example sql code`,[example params],ServiceToEntity,client
 * )
 *
 */
export async function executeOne<TRow extends QueryResultRow, TEntity> (
    sql: string,
    params: readonly unknown[],
    mapRow: RowMapper<TRow, TEntity>,
    client: PoolClient
): Promise<TEntity> {
    const result = await client.query<TRow>(sql,[...params])
    if (result.rowCount === 0) {
        throw new DatabaseError('executeOne: Очікує мінімум 1 рядок', { sql, params })
    }
    return mapRow(result.rows[0])
}

//==========================================================================================

/**
 * @summary Функція яка виконує більшість запитів INSERT,UPDATE,DELETE але не повинна щось повертати.
 * @param {string} sql - SQL запит
 * @param {readonly unknown[]} params - Це параметри які ми будемо передавати разом з SQL запитом
 * надаємо йому readonly щоб не було мутацій
 * @param {PoolClient} client - Передаємо зʼєднання яке буде робити запити в базу дазу даних
 * @example
 * import {pool} from "../config/database.config.js";
 * const client = await pool.connect()
 *
 * const example = await executeVoid(
 * `example sql code`,[example params],client
 * )
 *
 */
export async function executeVoid(
    sql: string,
    params: readonly unknown[],
    client: PoolClient
): Promise<void> {
    await client.query<QueryResultRow>(sql, [...params]);
}

//==========================================================================================

/**
 * @summary Функція яка виконує роль транзакцій
 * @param{(client: PoolClient) => Promise<T>} fn - Це функція в якій буде транзакція
 * @param{number} id - Опційний параметер для айді сервіса щоб не дублювати 3 одинакові функції
 * @example
 *
 * const exampleTransaction = async (client: poolClient) => {
 *     const services = await client.query(`
 *      SELECT * FROM service
 *     `)
 *
 *     const contacts = await client.query(`
 *     SELECT * FROM service_contacts
 *     `)
 *
 *     return {
 *         services,
 *         contacts
 *     }
 * }
 *
 * withTransaction( exampleTransaction )
 *
 */
export async function withTransaction<T> (
    fn: (client: PoolClient, id?: number) => Promise<T>,
    id?: number
): Promise<T> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await fn(client,id);
        await client.query('COMMIT')
        return result;
    }catch(error) {
        try {
            await client.query('ROLLBACK')
        } catch (rollbackError) {
            handleError({
                logger: dbLogger,
                scope: "db-helper",
                action: "Помилка rollback транзакції",
                error: rollbackError,
                meta: { id },
            })
        }
        // Не логуємо основну помилку тут, щоб уникнути дублювання.
        // Її залогує фінальний обробник (asyncHandler) або caller.
        throw error;
    }finally {
        client.release()
    }
}
