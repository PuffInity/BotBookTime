import { Scenes, Telegraf, session } from 'telegraf';
import { createBotStage } from './scenes/registerScenes.js';
import { registerCommands } from './commands/registerCommands.js';
import type { BotDeps, MyContext } from '../types/bot.types.js';
import { createTelegrafErrorHandler } from '../utils/error.utils.js';
import { loggerTelegramBot } from '../utils/logger/loggers-list.js';

/**
 * @file createBot.ts
 * @summary Створює та налаштовує Telegraf-бота (middleware + сцени + команди).
 */

const botLogger = loggerTelegramBot;

/**
 * createBot = "точка збірки" бота.
 * Тут ми:
 * 1) створюємо Telegraf
 * 2) підключаємо middleware
 * 3) реєструємо сцени
 * 4) реєструємо команди
 * 5) підключаємо глобальний error handler
 */
export function createBot(deps: BotDeps): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(deps.token);
  const stage = createBotStage();

  /**
   * Middleware #1: логування всіх update.
   * Це допомагає швидко зрозуміти, що бот реально отримує події.
   */
  bot.use(async (ctx, next) => {
    botLogger.debug('[bot] Отримано update', {
      updateType: ctx.updateType,
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
    });

    await next();
  });

  /**
   * Middleware #2: session.
   * Дуже важливо для сцен. Саме тут Telegraf зберігає стан між повідомленнями.
   * Ми використовуємо Redis store, щоб сесії не губились після перезапуску процесу.
   */
  bot.use(
    session({
      store: deps.sessionStore,
    }),
  );

  /**
   * Middleware #3: Stage middleware.
   * Додає в ctx можливості `ctx.scene` і `ctx.wizard`.
   * Важливо підключати ПІСЛЯ session().
   */
  bot.use(stage.middleware() as ReturnType<Scenes.Stage<MyContext>['middleware']>);

  // Реєструємо всі команди (поки що тільки common block)
  registerCommands(bot);

  /**
   * Глобальний обробник помилок Telegraf.
   * Аналог "центрального error handler", але в стилі Telegraf.
   */
  bot.catch(
    createTelegrafErrorHandler({
      logger: botLogger,
    }),
  );

  return bot;
}
