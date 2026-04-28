import { Scenes } from 'telegraf';
import { createBookingScene } from './booking.scene.js';
import { createProfileNameScene } from './profile-name.scene.js';
import { createProfileLanguageScene } from './profile-language.scene.js';
import { createProfileEmailVerifyScene } from './profile-email-verify.scene.js';
import { createProfileEmailAddScene } from './profile-email-add.scene.js';
import { createProfilePhoneAddScene } from './profile-phone-add.scene.js';
import { createProfilePhoneVerifyScene } from './profile-phone-verify.scene.js';
import { createProfileNotificationSettingsScene } from './profile-notification-settings.scene.js';
import { createMastersScene } from './masters.scene.js';
import { createServicesScene } from './services.scene.js';
import { createFaqScene } from './faq.scene.js';
import { createMasterPanelScene } from './master-panel.scene.js';
import { createAdminPanelScene } from './admin-panel.scene.js';
import type { MyContext } from '../../types/bot.types.js';

/**
 * @file registerScenes.ts
 * @summary Реєстрація всіх сцен в один Stage.
 */

/**
 * uk: Публічна flow-функція createBotStage.
 * en: Public flow function createBotStage.
 * cz: Veřejná flow funkce createBotStage.
 */
export function createBotStage(): Scenes.Stage<MyContext> {
  const bookingScene = createBookingScene();
  const profileNameScene = createProfileNameScene();
  const profileLanguageScene = createProfileLanguageScene();
  const profileEmailVerifyScene = createProfileEmailVerifyScene();
  const profileEmailAddScene = createProfileEmailAddScene();
  const profilePhoneAddScene = createProfilePhoneAddScene();
  const profilePhoneVerifyScene = createProfilePhoneVerifyScene();
  const profileNotificationSettingsScene = createProfileNotificationSettingsScene();
  const mastersScene = createMastersScene();
  const servicesScene = createServicesScene();
  const faqScene = createFaqScene();
  const masterPanelScene = createMasterPanelScene();
  const adminPanelScene = createAdminPanelScene();

  // Тут пізніше додаються інші сцени:
  // const adminApproveScene = createAdminApproveScene()
  // const profileEditScene = createProfileEditScene()
  return new Scenes.Stage<MyContext>([
    bookingScene,
    profileNameScene,
    profileLanguageScene,
    profileEmailVerifyScene,
    profileEmailAddScene,
    profilePhoneAddScene,
    profilePhoneVerifyScene,
    profileNotificationSettingsScene,
    mastersScene,
    servicesScene,
    faqScene,
    masterPanelScene,
    adminPanelScene,
  ]);
}
