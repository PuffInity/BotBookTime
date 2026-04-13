import {dbLogger, pool} from "../config/database.config.js";
import {PoolClient, QueryResultRow} from "pg";
import {handleError, DatabaseError} from "../utils/error.utils.js";

/**
 * @file db.helper.ts
 * @summary Core generic helpers for SQL queries and transactions.
 */
/**
 * uk: Мапер DB рядка в Entity.
 * en: Mapper from DB row to Entity.
 * cz: Mapper z DB řádku na Entity.
 */
export type RowMapper<TRow extends QueryResultRow, TEntity> = (row: TRow) => TEntity

/**
 * uk: Виконує SELECT і повертає перший рядок або null.
 * en: Executes SELECT and returns first row or null.
 * cz: Provede SELECT a vrátí první řádek nebo null.
 * @template TRow uk/en/cz: Тип DB рядка/DB row type/Typ DB řádku.
 * @template TEntity uk/en/cz: Тип entity/Entity type/Typ entity.
 * @param sql uk/en/cz: SQL текст/SQL text/SQL text.
 * @param params uk/en/cz: Параметри/Params/Parametry.
 * @param mapRow uk/en/cz: Мапер рядка/Row mapper/Mapper řádku.
 * @param client uk/en/cz: Клієнт пулу/Pool client/Pool klient.
 * @returns uk/en/cz: Entity або null/Entity or null/Entity nebo null.
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

/**
 * uk: Виконує SELECT і повертає масив entity.
 * en: Executes SELECT and returns entity array.
 * cz: Provede SELECT a vrátí pole entity.
 * @template TRow uk/en/cz: Тип DB рядка/DB row type/Typ DB řádku.
 * @template TEntity uk/en/cz: Тип entity/Entity type/Typ entity.
 * @param sql uk/en/cz: SQL текст/SQL text/SQL text.
 * @param params uk/en/cz: Параметри/Params/Parametry.
 * @param mapRow uk/en/cz: Мапер рядка/Row mapper/Mapper řádku.
 * @param client uk/en/cz: Клієнт пулу/Pool client/Pool klient.
 * @returns uk/en/cz: Масив entity/Entity array/Pole entity.
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

/**
 * uk: Виконує INSERT/UPDATE/DELETE з RETURNING 1 row.
 * en: Executes INSERT/UPDATE/DELETE expecting RETURNING row.
 * cz: Provede INSERT/UPDATE/DELETE s očekáváním RETURNING řádku.
 * @template TRow uk/en/cz: Тип DB рядка/DB row type/Typ DB řádku.
 * @template TEntity uk/en/cz: Тип entity/Entity type/Typ entity.
 * @param sql uk/en/cz: SQL текст/SQL text/SQL text.
 * @param params uk/en/cz: Параметри/Params/Parametry.
 * @param mapRow uk/en/cz: Мапер рядка/Row mapper/Mapper řádku.
 * @param client uk/en/cz: Клієнт пулу/Pool client/Pool klient.
 * @returns uk/en/cz: Одна entity/Single entity/Jedna entity.
 * @throws DatabaseError uk/en/cz: Якщо рядок не повернувся/If no row returned/Pokud se řádek nevrátil.
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

/**
 * uk: Виконує SQL без очікування повернення рядка.
 * en: Executes SQL without returned row expectation.
 * cz: Provede SQL bez očekávání vráceného řádku.
 * @param sql uk/en/cz: SQL текст/SQL text/SQL text.
 * @param params uk/en/cz: Параметри/Params/Parametry.
 * @param client uk/en/cz: Клієнт пулу/Pool client/Pool klient.
 */
export async function executeVoid(
    sql: string,
    params: readonly unknown[],
    client: PoolClient
): Promise<void> {
    await client.query<QueryResultRow>(sql, [...params]);
}

/**
 * uk: Виконує callback у транзакції BEGIN/COMMIT/ROLLBACK.
 * en: Runs callback inside BEGIN/COMMIT/ROLLBACK transaction.
 * cz: Spustí callback v transakci BEGIN/COMMIT/ROLLBACK.
 * @template T uk/en/cz: Тип результату/Result type/Typ výsledku.
 * @param fn uk/en/cz: Callback транзакції/Transaction callback/Transakční callback.
 * @param id uk/en/cz: Додатковий id/Optional id/Volitelné id.
 * @returns uk/en/cz: Результат callback/Callback result/Výsledek callbacku.
 * @throws unknown uk/en/cz: Перевикидає помилку callback/Re-throws callback error/Znovu vyhodí chybu callbacku.
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
