import dotenv from 'dotenv';
import { spawn } from 'node:child_process';

/**
 * @file index.script.ts
 * @summary Unified CLI entry for operational scripts.
 */

dotenv.config();

type ScriptCommandConfig = {
  npmScript: string;
  description: {
    ua: string;
    en: string;
    cz: string;
  };
  example: string;
};

// uk: Реєстр CLI команд / en: CLI command registry / cz: Registr CLI příkazů
const COMMANDS: Record<string, ScriptCommandConfig> = {
  'grant-admin': {
    npmScript: 'script:grant-admin',
    description: {
      ua: 'Видача ролі admin за Telegram ID',
      en: 'Grant admin role by Telegram ID',
      cz: 'Přidělení role admin podle Telegram ID',
    },
    example: 'npm run ops -- grant-admin --telegram-id=6712153038',
  },
  'revoke-admin': {
    npmScript: 'script:revoke-admin',
    description: {
      ua: 'Зняття ролі admin за Telegram ID',
      en: 'Revoke admin role by Telegram ID',
      cz: 'Odebrání role admin podle Telegram ID',
    },
    example: 'npm run ops -- revoke-admin --telegram-id=6712153038',
  },
  'grant-master': {
    npmScript: 'script:grant-master',
    description: {
      ua: 'Видача ролі master + створення/активація профілю майстра',
      en: 'Grant master role + create/activate master profile',
      cz: 'Přidělení role master + vytvoření/aktivace profilu mastera',
    },
    example: 'npm run ops -- grant-master --telegram-id=6712153038',
  },
  'repair-bookings': {
    npmScript: 'script:repair-bookings',
    description: {
      ua: 'Reconcile прострочених pending-бронювань',
      en: 'Reconcile expired pending bookings',
      cz: 'Reconcile prošlých pending rezervací',
    },
    example: 'npm run ops -- repair-bookings --limit=100 --notify=true',
  },
  'notification-dry-run': {
    npmScript: 'script:notification-dry-run',
    description: {
      ua: 'Dry-run перевірка каналів сповіщень (без реальної відправки)',
      en: 'Dry-run notification channels check (without real sending)',
      cz: 'Dry-run kontrola notifikačních kanálů (bez reálného odeslání)',
    },
    example:
      'npm run ops -- notification-dry-run --telegram-id=6712153038 --notification-type=status_change',
  },
  'seed-custom-data': {
    npmScript: 'script:seed-custom-data',
    description: {
      ua: 'Додавання кастомних seed-даних у таблиці',
      en: 'Insert custom seed data into tables',
      cz: 'Vložení custom seed dat do tabulek',
    },
    example: 'npm run ops -- seed-custom-data',
  },
  'health-check': {
    npmScript: 'script:health-check',
    description: {
      ua: 'Перевірка стану Postgres/Redis/SMTP/Twilio',
      en: 'Health check for Postgres/Redis/SMTP/Twilio',
      cz: 'Kontrola stavu Postgres/Redis/SMTP/Twilio',
    },
    example: 'npm run ops -- health-check',
  },
  migrate: {
    npmScript: 'migrate',
    description: {
      ua: 'Запуск усіх міграцій',
      en: 'Run all migrations',
      cz: 'Spustit všechny migrace',
    },
    example: 'npm run ops -- migrate',
  },
  rollback: {
    npmScript: 'rollback',
    description: {
      ua: 'Rollback останньої міграції',
      en: 'Rollback the last migration',
      cz: 'Rollback poslední migrace',
    },
    example: 'npm run ops -- rollback',
  },
  'migration:status': {
    npmScript: 'migration:status',
    description: {
      ua: 'Перевірка статусу міграцій',
      en: 'Check migration status',
      cz: 'Kontrola stavu migrací',
    },
    example: 'npm run ops -- migration:status',
  },
};

type HelpLanguage = 'ua' | 'en' | 'cz';

// uk: Локалізація help / en: Help localization / cz: Lokalizace help
const HELP_LABELS: Record<
  HelpLanguage,
  {
    title: string;
    usage: string;
    unknownCommand: (command: string) => string;
  }
> = {
  ua: {
    title: 'Доступні службові команди:',
    usage: 'Формат:\nnpm run ops -- <command> [args]',
    unknownCommand: (command) => `[ops] Невідома команда: "${command}"`,
  },
  en: {
    title: 'Available operational commands:',
    usage: 'Format:\nnpm run ops -- <command> [args]',
    unknownCommand: (command) => `[ops] Unknown command: "${command}"`,
  },
  cz: {
    title: 'Dostupné servisní příkazy:',
    usage: 'Formát:\nnpm run ops -- <command> [args]',
    unknownCommand: (command) => `[ops] Neznámý příkaz: "${command}"`,
  },
};

/**
 * uk: Публічна функція formatHelpMenu.
 * en: Public function formatHelpMenu.
 * cz: Veřejná funkce formatHelpMenu.
 */
function formatHelpMenu(language: HelpLanguage): string {
  const rows = Object.entries(COMMANDS).map(([command, config]) => {
    return `- ${command}\n  ${config.description[language]}\n  ${config.example}`;
  });

  return [HELP_LABELS[language].title, ...rows, '', HELP_LABELS[language].usage].join('\n');
}

/**
 * uk: Публічна функція hasHelpFlag.
 * en: Public function hasHelpFlag.
 * cz: Veřejná funkce hasHelpFlag.
 */
function hasHelpFlag(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

/**
 * uk: Публічна функція resolveHelpLanguage.
 * en: Public function resolveHelpLanguage.
 * cz: Veřejná funkce resolveHelpLanguage.
 */
function resolveHelpLanguage(command?: string): HelpLanguage {
  if (command === 'help-eng') return 'en';
  if (command === 'help-cz') return 'cz';
  return 'ua';
}

/**
 * uk: Публічна функція run.
 * en: Public function run.
 * cz: Veřejná funkce run.
 */
async function run(): Promise<void> {
  const [{ loggerScripts }] = await Promise.all([import('../utils/logger/loggers-list.js')]);

  const args = process.argv.slice(2);
  const command = args[0];
  const language = resolveHelpLanguage(command);

  if (!command || hasHelpFlag(args) || command === 'help-ua' || command === 'help-eng' || command === 'help-cz') {
    loggerScripts.info(formatHelpMenu(language));
    return;
  }

  const commandConfig = COMMANDS[command];
  if (!commandConfig) {
    loggerScripts.warn(HELP_LABELS[language].unknownCommand(command));
    loggerScripts.info(formatHelpMenu(language));
    process.exitCode = 1;
    return;
  }

  const forwardedArgs = args.slice(1);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', '-s', commandConfig.npmScript, '--', ...forwardedArgs],
      {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
      },
    );

    child.on('error', (error) => reject(error));
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`[ops] Команда завершилася з кодом ${code ?? -1}`));
    });
  });
}

await run();
