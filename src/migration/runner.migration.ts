import * as fs from 'fs'
import * as path from 'node:path'
import {fileURLToPath} from "node:url";
import {pool} from "../config/database.config.js";
import {MigrationTracker} from "./table.migration.js";
import {Migration, migrationLogger} from "./base.migration.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @file runner.migration.ts
 * @summary Migration runner for apply/rollback/status operations.
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * uk: Конструктор класу міграції.
 * en: Migration class constructor type.
 * cz: Typ konstruktoru migrační třídy.
 */
type MigrationConstructor = new () => Migration

/**
 * uk: Тип модуля міграції.
 * en: Migration module export type.
 * cz: Typ exportu migračního modulu.
 */
interface MigrationModule {
    default?: MigrationConstructor

    [key: string]: unknown
}

/**
 * uk: Runner міграцій.
 * en: Migration runner.
 * cz: Migration runner.
 */
export class MigrationRunner {
    // uk: Директорія міграцій / en: Migrations dir / cz: Adresář migrací
    private static readonly MIGRATION_DIR = path.join(__dirname, './migrate-files')

    /**
     * uk: Повертає список файлів міграцій.
     * en: Returns migration file list.
     * cz: Vrací seznam migračních souborů.
     */
    private static async getMigrationFiles(): Promise<string[]> {
        try {
            // uk: Фільтр ts/js без d.ts / en: ts/js filter without d.ts / cz: filtr ts/js bez d.ts
            const files = fs.readdirSync(this.MIGRATION_DIR)
                .filter((file: string) => (file.endsWith('ts') || file.endsWith('js')) && !file.endsWith('.d.ts'))
                .sort()

            migrationLogger.info(`Було знайдено ${files.length} файл/файлів`)
            return files;
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-runner",
                action: "Помилка пошуку файлів міграцій",
                error,
                meta: { migrationDir: this.MIGRATION_DIR },
            })
            throw error
        }
    }

    /**
     * uk: Завантажує один migration клас.
     * en: Loads one migration class.
     * cz: Načte jednu migration třídu.
     * @param file uk/en/cz: Імʼя файла/File name/Název souboru.
     */
    private static async loadMigration(file: string): Promise<Migration> {
        try {
            // uk: Шлях файлу / en: File path / cz: Cesta souboru
            const migrationPath = path.join(this.MIGRATION_DIR, file);
            // uk: Динамічний імпорт / en: Dynamic import / cz: Dynamický import
            const migrationObj = await import(migrationPath) as MigrationModule
            // uk: Конструктор міграції / en: Migration ctor / cz: Konstruktor migrace
            let migrationClass: MigrationConstructor

            // uk: default export або named / en: default or named export / cz: default nebo named export
            if (migrationObj.default) {
                migrationClass = migrationObj.default
            } else {
                // uk: Пошук класу з up/down / en: Find class with up/down / cz: Najít třídu s up/down
                const exportedValues = Object.values(migrationObj).filter(
                    (value): value is MigrationConstructor => typeof value === 'function' &&
                        value.prototype &&
                        typeof value.prototype.up === 'function' &&
                        typeof value.prototype.down === 'function'
                )
                // uk: Перший валідний export / en: First valid export / cz: První validní export
                const migrationClassNotDefault = exportedValues[0]

                // uk: Перевірка знайденого класу / en: Validate found class / cz: Ověření nalezené třídy
                if (!migrationClassNotDefault) {
                    migrationLogger.error('Помилка, migrationClassNotDefault є пустим', {
                        file: migrationClassNotDefault,
                        path: migrationPath,
                    })
                    throw new Error('Помилка з відфільтрованим варіантом маграцій')
                }
                migrationClass = migrationClassNotDefault
            }

            if (typeof migrationClass !== "function") {
                migrationLogger.error('Помилка, змінна міграцій зʼясувалось була не функцією', {migrationFile: typeof migrationClass,})
                throw new Error('Помилка файла міграцій ')
            }

            return new migrationClass()
        } catch (error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-runner",
                action: `Помилка завантаження міграції "${file}"`,
                error,
                meta: { migrationDir: this.MIGRATION_DIR },
            })
            throw error
        }
    }

    /**
     * uk: Запускає pending міграції.
     * en: Runs pending migrations.
     * cz: Spustí pending migrace.
     */
    static async runMigrations(): Promise<void> {
        migrationLogger.info('Запуск міграції')
        try {
            // uk: Таблиця трекінгу / en: Tracking table / cz: Tracking tabulka
            await MigrationTracker.createMigrationTable()
            // uk: Всі файли / en: All files / cz: Všechny soubory
            const migrationFiles = await MigrationRunner.getMigrationFiles()
            // uk: Виконані файли / en: Executed files / cz: Provedené soubory
            const executedMigrations = await MigrationTracker.getExecutedMigrations()
            // uk: Pending список / en: Pending list / cz: Pending seznam
            const pendingMigrations = migrationFiles.filter(file => !executedMigrations.includes(file))

            if(pendingMigrations.length === 0) {
                migrationLogger.info('Программа не знайшла міграції для виконання', {migration: pendingMigrations.length})
                return
            }

            migrationLogger.info(`Загружаємо міграції`, {migration: pendingMigrations.length})
            for(const file of pendingMigrations) {
                const client = await pool.connect()
                migrationLogger.info(`Обробка міграції: ${file}`)
                try {
                    const migration = await MigrationRunner.loadMigration(file)
                    await migration.up(client)
                    await MigrationTracker.recordMigration(file)
                    migrationLogger.info(`Міграція ${file} оброблена`)
                } finally {
                    client.release()
                }
            }
        } catch(error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-runner",
                action: "Помилка запуску міграцій",
                error,
            })
            throw error
        }
    }

    /**
     * uk: Відкочує останню міграцію.
     * en: Rolls back last migration.
     * cz: Vrátí poslední migraci.
     */
    static async rollbackMigrations(): Promise<void> {
        migrationLogger.info('Запуск rollback')
        try {
            // uk: Виконані міграції / en: Executed migrations / cz: Provedené migrace
            const executedMigrations = await MigrationTracker.getExecutedMigrations()
            if(executedMigrations.length === 0) {
                migrationLogger.info('Немає міграцій для Rollback', {migration: executedMigrations.length})
                return;
            }

            // uk: Остання міграція / en: Last migration / cz: Poslední migrace
            const lastMigration = executedMigrations[executedMigrations.length - 1]
            migrationLogger.info(`Остання міграція: ${lastMigration}`)

            const migration = await this.loadMigration(lastMigration)
            const client = await pool.connect()
            try {
                await migration.down(client)
                await MigrationTracker.removeMigration(lastMigration)
                migrationLogger.info(`Міграція ${lastMigration} відкочено назад`)
            } finally {
                client.release()
            }
        } catch(error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-runner",
                action: "Помилка rollback міграцій",
                error,
            })
            throw error;
        }
    }

    /**
     * uk: Показує статус міграцій.
     * en: Prints migration status.
     * cz: Vypíše stav migrací.
     */
    static async getMigrationStatus(): Promise<void> {
        migrationLogger.info('Статус міграцій')
        try {
            // uk: Всі файли / en: All files / cz: Všechny soubory
            const migrationFiles = await MigrationRunner.getMigrationFiles()
            // uk: Виконані файли / en: Executed files / cz: Provedené soubory
            const executedMigrations = await MigrationTracker.getExecutedMigrations()
            if(migrationFiles.length === 0) {
                migrationLogger.info('Немає міграцій для показу статусу')
                return
            }

            migrationLogger.info(`Знайдено міграційних файлів - ${migrationFiles.length}`)
            migrationFiles.forEach(file => {
                const isExecuted = executedMigrations.includes(file)
                const status = isExecuted ? 'Виконано' : 'Очікується'
                migrationLogger.info(`${file} : ${status}`)
            })

            const pendingCount = migrationFiles.length - executedMigrations.length
            migrationLogger.info(`Загалом:${migrationFiles.length}, Виконано:${executedMigrations.length} Очікується:${pendingCount}`)
        } catch(error) {
            handleError({
                logger: migrationLogger,
                scope: "migration-runner",
                action: "Помилка отримання статусу міграцій",
                error,
            })
            throw error
        }
    }
}
