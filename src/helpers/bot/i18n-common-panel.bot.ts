/**
 * @file i18n-common-panel.bot.ts
 * @summary Спільні (перевикористовувані) тексти для всіх панелей.
 */

export const COMMON_PANEL_DICTIONARY = {
  uk: {
    HOME: '🏠 Головне меню',
    COMMON_BACK: '⬅️ Назад',
    BOT_RESTRICTED_ERROR_MESSAGE: '⚠️ Тимчасово недоступна або виникла помилка.',
    LANGUAGE_UK: '🇺🇦 Українська',
    LANGUAGE_EN: '🇬🇧 English',
    LANGUAGE_CS: '🇨🇿 Čeština',
    PROFILE_NOT_SET: 'Не вказано',
    PROFILE_VERIFIED: '✅ підтверджено',
    PROFILE_NOT_VERIFIED: '⚪ не підтверджено',
  },
  en: {
    HOME: '🏠 Home menu',
    COMMON_BACK: '⬅️ Back',
    BOT_RESTRICTED_ERROR_MESSAGE: '⚠️ Temporarily unavailable or an error occurred.',
    LANGUAGE_UK: '🇺🇦 Ukrainian',
    LANGUAGE_EN: '🇬🇧 English',
    LANGUAGE_CS: '🇨🇿 Czech',
    PROFILE_NOT_SET: 'Not set',
    PROFILE_VERIFIED: '✅ verified',
    PROFILE_NOT_VERIFIED: '⚪ not verified',
  },
  cs: {
    HOME: '🏠 Hlavní menu',
    COMMON_BACK: '⬅️ Zpět',
    BOT_RESTRICTED_ERROR_MESSAGE: '⚠️ Dočasně nedostupné nebo došlo k chybě.',
    LANGUAGE_UK: '🇺🇦 Ukrajinština',
    LANGUAGE_EN: '🇬🇧 Angličtina',
    LANGUAGE_CS: '🇨🇿 Čeština',
    PROFILE_NOT_SET: 'Neuvedeno',
    PROFILE_VERIFIED: '✅ ověřeno',
    PROFILE_NOT_VERIFIED: '⚪ neověřeno',
  },
} as const;
