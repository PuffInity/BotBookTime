import { Scenes } from 'telegraf';
import { createBookingScene } from './booking.scene.js';
import { createProfileNameScene } from './profile-name.scene.js';
import { createProfileEmailVerifyScene } from './profile-email-verify.scene.js';
import type { MyContext } from '../../types/bot.types.js';

/**
 * @file registerScenes.ts
 * @summary Реєстрація всіх сцен в один Stage.
 */

export function createBotStage(): Scenes.Stage<MyContext> {
  const bookingScene = createBookingScene();
  const profileNameScene = createProfileNameScene();
  const profileEmailVerifyScene = createProfileEmailVerifyScene();

  // Тут пізніше додаються інші сцени:
  // const adminApproveScene = createAdminApproveScene()
  // const profileEditScene = createProfileEditScene()
  return new Scenes.Stage<MyContext>([bookingScene, profileNameScene, profileEmailVerifyScene]);
}
