import { Scenes, type SessionStore } from 'telegraf';

/**
 * @file bot.types.ts
 * @summary Загальні типи для Telegraf-бота.
 */

/**
 * Контекст бота для WizardScene.
 * Тут уже є `ctx.scene`, `ctx.wizard`, `ctx.session`.
 */
export type MyContext = Scenes.WizardContext;

/** Тип сесії, який Telegraf зберігає в Redis */
export type MySession = MyContext['session'];

/**
 * Залежності (deps), які ми передаємо у createBot().
 * Це "пакет інструментів" для бота.
 */
export type BotDeps = {
  token: string;
  sessionStore: SessionStore<MySession>;
};

/**
 * Об'єкт застосунку, який повертаємо після ініціалізації.
 * Дає зрозумілі методи start/stop для керування життєвим циклом.
 */
export type AppInstance = {
  start: () => Promise<void>;
  stop: (signal: string) => Promise<void>;
};
