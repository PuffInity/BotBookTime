import dotenv from 'dotenv';
import { createClient } from 'redis';

/**
 * @file health-check.script.ts
 * @summary Операційний health-check інфраструктури:
 * - PostgreSQL (connect + SELECT 1)
 * - Redis (connect + PING)
 * - SMTP (конфіг + verify)
 * - Twilio (конфіг)
 */

dotenv.config();

type CheckStatus = 'ok' | 'warn' | 'fail';

type CheckResult = {
  name: 'postgres' | 'redis' | 'smtp' | 'twilio';
  status: CheckStatus;
  details: string;
};

const HELP_TEXT = [
  'Usage:',
  '  npm run script:health-check',
  '',
  'Description:',
  '  Перевіряє доступність Postgres/Redis/SMTP та конфіг Twilio.',
].join('\n');

function hasHelpFlag(): boolean {
  return process.argv.includes('--help') || process.argv.includes('-h');
}

async function checkPostgres(): Promise<CheckResult> {
  try {
    const [{ pool }] = await Promise.all([import('../config/database.config.js')]);
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { name: 'postgres', status: 'ok', details: 'Connection is healthy' };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: 'postgres', status: 'fail', details: `Connection failed: ${message}` };
  }
}

async function checkRedis(): Promise<CheckResult> {
  try {
    const [{ redisConfig }] = await Promise.all([import('../config/redis.config.js')]);
    const client = createClient(redisConfig.clientOptions);
    try {
      await client.connect();
      await client.ping();
      return { name: 'redis', status: 'ok', details: 'Connection + ping are healthy' };
    } finally {
      if (client.isOpen) {
        await client.quit();
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: 'redis', status: 'fail', details: `Connection failed: ${message}` };
  }
}

async function checkSmtp(): Promise<CheckResult> {
  try {
    const [{ warmupMailer }] = await Promise.all([import('../helpers/mailer.helper.js')]);
    await warmupMailer();
    return { name: 'smtp', status: 'ok', details: 'SMTP config and verify are healthy' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: 'smtp', status: 'fail', details: `SMTP verify failed: ${message}` };
  }
}

async function checkTwilio(): Promise<CheckResult> {
  try {
    const [{ isTwilioConfigured, twilioMissingFields }] = await Promise.all([
      import('../config/twilio.config.js'),
    ]);

    if (isTwilioConfigured()) {
      return { name: 'twilio', status: 'ok', details: 'Twilio is configured' };
    }

    return {
      name: 'twilio',
      status: 'warn',
      details: `Twilio is disabled (missing: ${twilioMissingFields.join(', ') || 'unknown'})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: 'twilio', status: 'fail', details: `Config check failed: ${message}` };
  }
}

async function main(): Promise<void> {
  const [{ loggerScripts }] = await Promise.all([import('../utils/logger/loggers-list.js')]);

  if (hasHelpFlag()) {
    loggerScripts.info(HELP_TEXT);
    return;
  }

  const results = await Promise.all([checkPostgres(), checkRedis(), checkSmtp(), checkTwilio()]);

  for (const result of results) {
    const prefix = `[health-check:${result.name}]`;
    if (result.status === 'ok') {
      loggerScripts.info(`${prefix} ${result.details}`);
      continue;
    }
    if (result.status === 'warn') {
      loggerScripts.warn(`${prefix} ${result.details}`);
      continue;
    }
    loggerScripts.error(`${prefix} ${result.details}`);
  }

  const hasFail = results.some((item) => item.status === 'fail');
  process.exitCode = hasFail ? 1 : 0;
}

await main();
