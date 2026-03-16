import { Scenes } from 'telegraf';
import { createBookingScene } from './booking.scene.js';
import type { MyContext } from '../../types/bot.types.js';

/**
 * @file registerScenes.ts
 * @summary Реєстрація всіх сцен в один Stage.
 */

export function createBotStage(): Scenes.Stage<MyContext> {
  const bookingScene = createBookingScene();

  // Тут пізніше додаються інші сцени:
  // const adminApproveScene = createAdminApproveScene()
  // const profileEditScene = createProfileEditScene()
  return new Scenes.Stage<MyContext>([bookingScene]);
}
