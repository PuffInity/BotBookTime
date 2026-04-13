import dotenv from 'dotenv';
import { spawn } from 'node:child_process';

/**
 * @file index.script.ts
 * @summary Єдина точка запуску службових скриптів.
 * Якщо команда невідома — виводить повне help-меню з доступними командами.
 */

dotenv.config();

type ScriptCommandConfig = {
  npmScript: string;
  description: string;
  example: string;
};

const COMMANDS: Record<string, ScriptCommandConfig> = {
  'grant-admin': {
    npmScript: 'script:grant-admin',
    description: 'Видача ролі admin за Telegram ID',
    example: 'npm run ops -- grant-admin --telegram-id=6712153038',
  },
  'revoke-admin': {
    npmScript: 'script:revoke-admin',
    description: 'Зняття ролі admin за Telegram ID',
    example: 'npm run ops -- revoke-admin --telegram-id=6712153038',
  },
  'grant-master': {
    npmScript: 'script:grant-master',
    description: 'Видача ролі master + створення/активація профілю майстра',
    example: 'npm run ops -- grant-master --telegram-id=6712153038',
  },
  'repair-bookings': {
    npmScript: 'script:repair-bookings',
    description: 'Reconcile прострочених pending-бронювань',
    example: 'npm run ops -- repair-bookings --limit=100 --notify=true',
  },
  'notification-dry-run': {
    npmScript: 'script:notification-dry-run',
    description: 'Dry-run перевірка каналів сповіщень (без реальної відправки)',
    example:
      'npm run ops -- notification-dry-run --telegram-id=6712153038 --notification-type=status_change',
  },
  'seed-custom-data': {
    npmScript: 'script:seed-custom-data',
    description: 'Додавання кастомних seed-даних у таблиці',
    example: 'npm run ops -- seed-custom-data',
  },
  migrate: {
    npmScript: 'migrate',
    description: 'Запуск усіх міграцій',
    example: 'npm run ops -- migrate',
  },
  rollback: {
    npmScript: 'rollback',
    description: 'Rollback останньої міграції',
    example: 'npm run ops -- rollback',
  },
  'migration:status': {
    npmScript: 'migration:status',
    description: 'Перевірка статусу міграцій',
    example: 'npm run ops -- migration:status',
  },
};

function formatHelpMenu(): string {
  const rows = Object.entries(COMMANDS).map(([command, config]) => {
    return `- ${command}\n  ${config.description}\n  ${config.example}`;
  });

  return [
    'Доступні службові команди:',
    ...rows,
    '',
    'Формат:',
    'npm run ops -- <command> [args]',
  ].join('\n');
}

function hasHelpFlag(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

async function run(): Promise<void> {
  const [{ loggerScripts }] = await Promise.all([import('../utils/logger/loggers-list.js')]);

  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || hasHelpFlag(args)) {
    loggerScripts.info(formatHelpMenu());
    return;
  }

  const commandConfig = COMMANDS[command];
  if (!commandConfig) {
    loggerScripts.warn(`[ops] Невідома команда: "${command}"`);
    loggerScripts.info(formatHelpMenu());
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
