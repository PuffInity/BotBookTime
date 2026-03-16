import type { Telegraf } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { registerCommonCommands } from './common.commands.js';

/**
 * @file registerCommands.ts
 * @summary Центральна точка реєстрації блоків команд.
 */

export function registerCommands(bot: Telegraf<MyContext>): void {
  // Блок 1: базові/загальні команди
  registerCommonCommands(bot);

  // Нижче пізніше підключиш інші блоки:
  // registerProfileCommands(bot, deps)
  // registerBookingCommands(bot, deps)
  // registerAdminCommands(bot, deps)
}
