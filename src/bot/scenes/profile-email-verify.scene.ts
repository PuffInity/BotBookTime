import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createProfileEmailOtpKeyboard,
  createProfileStubKeyboard,
  sendProfileCard,
} from '../../helpers/bot/profile-view.bot.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import { resendOTP, verifyOTP } from '../../helpers/otp/otp.helper.js';
import {
  otpEmailAlreadyVerifiedText,
  otpEmailBlockedText,
  otpEmailCancelledText,
  otpEmailCodeSentText,
  otpEmailExpiredText,
  otpEmailInvalidCodeText,
  otpEmailMailerNotConfiguredText,
  otpEmailMissingText,
  otpEmailResendCooldownText,
  otpEmailSendFailedText,
  otpEmailVerifiedText,
} from '../../utils/text.utils.js';
import { resolveBotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import { tBot } from '../../helpers/bot/i18n.bot.js';

/**
 * @file profile-email-verify.scene.ts
 * @summary Scene for email verification with OTP in profile settings.
 */

// uk: Flow/UI константа PROFILE_EMAIL_VERIFY_SCENE_ID / en: Flow/UI constant PROFILE_EMAIL_VERIFY_SCENE_ID / cz: Flow/UI konstanta PROFILE_EMAIL_VERIFY_SCENE_ID
export const PROFILE_EMAIL_VERIFY_SCENE_ID = 'profile-email-verify-scene';

type ProfileEmailVerifySceneState = {
  language: BotUiLanguage;
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): ProfileEmailVerifySceneState {
  return ctx.wizard.state as ProfileEmailVerifySceneState;
}

/**
 * uk: Внутрішня flow-функція getMessageText.
 * en: Internal flow function getMessageText.
 * cz: Interní flow funkce getMessageText.
 */
function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

/**
 * uk: Внутрішня flow-функція sendFreshProfileCard.
 * en: Internal flow function sendFreshProfileCard.
 * cz: Interní flow funkce sendFreshProfileCard.
 */
async function sendFreshProfileCard(ctx: MyContext): Promise<void> {
  const user = await getOrCreateUser(ctx);
  await sendProfileCard(ctx, user);
}

/**
 * uk: Внутрішня flow-функція handleResendByTelegramId.
 * en: Internal flow function handleResendByTelegramId.
 * cz: Interní flow funkce handleResendByTelegramId.
 */
async function handleResendByTelegramId(
  ctx: MyContext,
  telegramId: number,
  language: BotUiLanguage,
): Promise<void> {
  const resend = await resendOTP(telegramId);

  if (resend.status === 'EMAIL_MISSING') {
    await ctx.reply(otpEmailMissingText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'ALREADY_VERIFIED') {
    await ctx.reply(otpEmailAlreadyVerifiedText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'RESEND_LIMIT') {
    await ctx.reply(
      otpEmailResendCooldownText(resend.retryAfterSec ?? 60, language),
      createProfileEmailOtpKeyboard(language),
    );
    return;
  }

  if (resend.status === 'MAILER_NOT_CONFIGURED') {
    await ctx.reply(otpEmailMailerNotConfiguredText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'SEND_FAILED') {
    await ctx.reply(otpEmailSendFailedText(language), createProfileStubKeyboard(language));
    return;
  }

  await ctx.reply(
    otpEmailCodeSentText(resend.email ?? tBot(language, 'PROFILE_NOT_SET'), language),
    createProfileEmailOtpKeyboard(language),
  );
}

/**
 * uk: Публічна flow-функція createProfileEmailVerifyScene.
 * en: Public flow function createProfileEmailVerifyScene.
 * cz: Veřejná flow funkce createProfileEmailVerifyScene.
 */
export function createProfileEmailVerifyScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_EMAIL_VERIFY_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply(otpEmailMissingText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        return;
      }

      await handleResendByTelegramId(ctx, telegramId, state.language);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply(otpEmailMissingText(state.language ?? 'uk'), createProfileStubKeyboard(state.language ?? 'uk'));
        await ctx.scene.leave();
        return;
      }

      const text = getMessageText(ctx);
      if (!text || !/^\d{6}$/.test(text)) {
        await ctx.reply(otpEmailInvalidCodeText(state.language), createProfileEmailOtpKeyboard(state.language));
        return;
      }

      const result = await verifyOTP({ telegramId, code: text });

      if (result.status === 'VERIFIED') {
        const email = result.user?.email ?? tBot(state.language, 'PROFILE_NOT_SET');
        await ctx.reply(otpEmailVerifiedText(email, state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      if (result.status === 'INVALID') {
        await ctx.reply(otpEmailInvalidCodeText(state.language), createProfileEmailOtpKeyboard(state.language));
        return;
      }

      if (result.status === 'EXPIRED' || result.status === 'NO_ACTIVE_OTP') {
        await ctx.reply(otpEmailExpiredText(state.language), createProfileEmailOtpKeyboard(state.language));
        return;
      }

      if (result.status === 'BLOCKED') {
        await ctx.reply(otpEmailBlockedText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        return;
      }

      if (result.status === 'ALREADY_VERIFIED') {
        await ctx.reply(otpEmailAlreadyVerifiedText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      await ctx.reply(otpEmailMissingText(state.language), createProfileStubKeyboard(state.language));
      await ctx.scene.leave();
    },
  );

  scene.action(PROFILE_ACTION.EMAIL_OTP_RESEND, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply(otpEmailMissingText(state.language ?? 'uk'), createProfileStubKeyboard(state.language ?? 'uk'));
      await ctx.scene.leave();
      return;
    }
    await handleResendByTelegramId(ctx, telegramId, state.language);
  });

  scene.action(PROFILE_ACTION.EMAIL_OTP_CANCEL, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await ctx.reply(otpEmailCancelledText(state.language), createProfileStubKeyboard(state.language));
    await sendFreshProfileCard(ctx);
  });

  scene.action(PROFILE_ACTION.OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendFreshProfileCard(ctx);
  });

  scene.action(COMMON_NAV_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
