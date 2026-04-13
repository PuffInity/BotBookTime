import dotenv from 'dotenv';

/**
 * @file dry-run-notification-dispatch.script.ts
 * @summary Діагностичний dry-run скрипт для каналів сповіщень:
 * - без реальної відправки в Telegram/Email/SMS,
 * - показує policy-рішення для каналів,
 * - показує preview Telegram-тексту.
 *
 * Приклади:
 * - npm run script:notification-dry-run -- --telegram-id=6712153038 --notification-type=status_change
 * - npm run script:notification-dry-run -- --telegram-id=6712153038 --notification-type=visit_reminder --with-email=true --with-sms=true
 */

dotenv.config();

type ScriptArgs = {
  telegramId: string;
  notificationType: 'booking_confirmation' | 'status_change' | 'visit_reminder' | 'promo_news';
  withEmail: boolean;
  withSms: boolean;
};

// uk: OPS/CLI константа HELP_TEXT / en: OPS/CLI constant HELP_TEXT / cz: OPS/CLI konstanta HELP_TEXT
const HELP_TEXT = [
  'Usage:',
  '  npm run script:notification-dry-run -- --telegram-id=<TELEGRAM_ID> --notification-type=<TYPE> [--with-email=true|false] [--with-sms=true|false]',
  '',
  'Types:',
  '  booking_confirmation | status_change | visit_reminder | promo_news',
].join('\n');

/**
 * uk: Публічна функція getArgValue.
 * en: Public function getArgValue.
 * cz: Veřejná funkce getArgValue.
 */
function getArgValue(flag: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) return direct.slice(flag.length + 1).trim();

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0) return process.argv[index + 1]?.trim();

  return undefined;
}

/**
 * uk: Публічна функція hasHelpFlag.
 * en: Public function hasHelpFlag.
 * cz: Veřejná funkce hasHelpFlag.
 */
function hasHelpFlag(): boolean {
  return process.argv.includes('--help') || process.argv.includes('-h');
}

/**
 * uk: Публічна функція parseBoolean.
 * en: Public function parseBoolean.
 * cz: Veřejná funkce parseBoolean.
 */
function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * uk: Публічна функція parseNotificationType.
 * en: Public function parseNotificationType.
 * cz: Veřejná funkce parseNotificationType.
 */
function parseNotificationType(
  value: string | undefined,
): 'booking_confirmation' | 'status_change' | 'visit_reminder' | 'promo_news' {
  if (
    value === 'booking_confirmation' ||
    value === 'status_change' ||
    value === 'visit_reminder' ||
    value === 'promo_news'
  ) {
    return value;
  }

  throw new Error(
    'Параметр --notification-type обовʼязковий. Дозволено: booking_confirmation|status_change|visit_reminder|promo_news',
  );
}

/**
 * uk: Публічна функція parseArgs.
 * en: Public function parseArgs.
 * cz: Veřejná funkce parseArgs.
 */
function parseArgs(): ScriptArgs {
  const telegramId = getArgValue('--telegram-id');
  if (!telegramId) {
    throw new Error('Потрібно передати --telegram-id=<TELEGRAM_ID>');
  }

  return {
    telegramId,
    notificationType: parseNotificationType(getArgValue('--notification-type')),
    withEmail: parseBoolean(getArgValue('--with-email'), true),
    withSms: parseBoolean(getArgValue('--with-sms'), true),
  };
}

/**
 * uk: Публічна функція isEmailConfiguredByEnv.
 * en: Public function isEmailConfiguredByEnv.
 * cz: Veřejná funkce isEmailConfiguredByEnv.
 */
function isEmailConfiguredByEnv(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.MAIL_FROM,
  );
}

/**
 * uk: Публічна функція main.
 * en: Public function main.
 * cz: Veřejná funkce main.
 */
async function main(): Promise<void> {
  const [
    { loggerScripts },
    { normalizeTelegramId },
    { getUserByTelegramId },
    { getUserNotificationSettingsState, getUserDeliveryProfileById },
    { buildNotificationDispatchPolicy },
    { buildNotificationTelegramText },
    { resolveBotUiLanguage },
    { isTwilioConfigured, twilioMissingFields },
  ] = await Promise.all([
    import('../utils/logger/loggers-list.js'),
    import('../utils/db/db-profile.js'),
    import('../helpers/db/db-profile.helper.js'),
    import('../helpers/db/db-notification-settings.helper.js'),
    import('../helpers/notification/notification-policy.helper.js'),
    import('../helpers/notification/notification-text.helper.js'),
    import('../helpers/bot/i18n.bot.js'),
    import('../config/twilio.config.js'),
  ]);

  const logger = loggerScripts;
  if (hasHelpFlag()) {
    logger.info(HELP_TEXT);
    return;
  }
  let args: ScriptArgs;
  try {
    args = parseArgs();
  } catch (error) {
    logger.error('[notification-dry-run-script] Невірні аргументи запуску', { error });
    process.exitCode = 1;
    return;
  }

  try {
    const telegramUserId = normalizeTelegramId(args.telegramId);
    const user = await getUserByTelegramId(telegramUserId);

    if (!user) {
      throw new Error(`Користувача з telegram_id=${telegramUserId} не знайдено`);
    }

    const [settings, profile] = await Promise.all([
      getUserNotificationSettingsState(user.id),
      getUserDeliveryProfileById(user.id),
    ]);

    if (!profile) {
      throw new Error(`Профіль доставки сповіщень не знайдено для user_id=${user.id}`);
    }

    const twilioConfigured = isTwilioConfigured();
    const emailConfigured = isEmailConfiguredByEnv();

    const policy = buildNotificationDispatchPolicy({
      notificationType: args.notificationType,
      settings,
      profile,
      wantsEmail: args.withEmail && emailConfigured,
      wantsSms: args.withSms && twilioConfigured,
      smsChannelAvailable: twilioConfigured,
    });

    const language = resolveBotUiLanguage(profile.preferredLanguage);
    const previewTelegramText = buildNotificationTelegramText(
      args.notificationType,
      {
        studioName: 'Studio Dry-Run',
        serviceName: 'Service Dry-Run',
        startAt: new Date(),
        statusLabel: args.notificationType === 'status_change' ? 'Dry-run status' : undefined,
        message: 'This is a dry-run preview message.',
      },
      language,
    );

    logger.info('[notification-dry-run-script] Dry-run result', {
      userId: user.id,
      telegramUserId,
      notificationType: args.notificationType,
      preferredLanguage: language,
      channelConfig: {
        emailConfigured,
        twilioConfigured,
        twilioMissingFields: twilioConfigured ? [] : twilioMissingFields,
      },
      requestedPayload: {
        withEmail: args.withEmail,
        withSms: args.withSms,
      },
      policy,
      previewTelegramText,
    });
  } catch (error) {
    logger.error('[notification-dry-run-script] Помилка dry-run перевірки каналів', { error });
    process.exitCode = 1;
  }
}

await main();
