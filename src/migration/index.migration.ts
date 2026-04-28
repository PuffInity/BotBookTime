import {MigrationRunner} from "./runner.migration.js";
import {migrationLogger} from "./base.migration.js";
import {handleError} from "../utils/error.utils.js";

/**
 * @file index.migration.ts
 * @summary CLI entry for migration operations (migrate/rollback/status/help).
 */

// uk: OPS/CLI константа COMMANDS / en: OPS/CLI constant COMMANDS / cz: OPS/CLI konstanta COMMANDS
const COMMANDS = {
    MIGRATE: 'migrate',
    ROLLBACK: 'rollback',
    STATUS: 'status',
    HELP: 'help'
}as const;

/**
 * uk: Показує migration CLI help.
 * en: Prints migration CLI help.
 * cz: Vypíše migration CLI help.
 */
function showHelp() {
    migrationLogger.info(`
    Команди по маграції:
        npm run migrate -  Запуск міграції
        npm run rollback - Скинути міграцію
        npm run status  - Показати статус міграцій
    `);
}



/**
 * uk: Виконує migration CLI команду.
 * en: Executes migration CLI command.
 * cz: Provede migration CLI příkaz.
 * @param command uk/en/cz: Команда/Command/Příkaz.
 */
async function runCommand(command:string) {
    switch (command) {
        case COMMANDS.MIGRATE:
            migrationLogger.info('start migrate')
            await MigrationRunner.runMigrations()
            break
        case COMMANDS.ROLLBACK:
            migrationLogger.info('start rollback')
            await MigrationRunner.rollbackMigrations()
            break
        case COMMANDS.STATUS:
            migrationLogger.info('start status')
            await MigrationRunner.getMigrationStatus()
            break
        case COMMANDS.HELP:
        default:
            showHelp()
            return;
    }
}




/**
 * uk: Точка входу migration CLI.
 * en: Migration CLI entrypoint.
 * cz: Vstupní bod migration CLI.
 */
async function main() {
    try{
        migrationLogger.info('Запуск системи міграцій');
        migrationLogger.info('=====================================');
        const command = process.argv[2]?.toLowerCase()
        if(!command) {
            showHelp()
            return;
        }

        await runCommand(command)

        migrationLogger.info('=====================================');
        migrationLogger.info('Міграція закінчила роботу успішно');

    }catch (error) {
        handleError({
            logger: migrationLogger,
            scope: "migration-cli",
            action: "Виникла помилка при запуску міграцій",
            error,
        })
        throw error
    }
}

main()
