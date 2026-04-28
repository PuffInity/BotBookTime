import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import { PROFILE_ACTION } from '../../types/bot-profile.types.js';
import { COMMON_NAV_ACTION } from '../../types/bot-menu.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import {
  createProfilePhoneOtpKeyboard,
  createProfileStubKeyboard,
  sendProfileCard,
} from '../../helpers/bot/profile-view.bot.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import { resendPhoneOTP, verifyPhoneOTP } from '../../helpers/otp/otp.helper.js';
import {
  otpPhoneAlreadyVerifiedText,
  otpPhoneBlockedText,
  otpPhoneCancelledText,
  otpPhoneCodeSentText,
  otpPhoneExpiredText,
  otpPhoneInvalidCodeText,
  otpPhoneMissingText,
  otpPhoneNotConfiguredText,
  otpPhoneResendCooldownText,
  otpPhoneSendFailedText,
  otpPhoneVerifiedText,
} from '../../utils/text.utils.js';
import { resolveBotUiLanguage, tBot } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';

/**
 * @file profile-phone-verify.scene.ts
 * @summary Scene for phone verification with OTP in profile settings.
 */

// uk: Flow/UI константа PROFILE_PHONE_VERIFY_SCENE_ID / en: Flow/UI constant PROFILE_PHONE_VERIFY_SCENE_ID / cz: Flow/UI konstanta PROFILE_PHONE_VERIFY_SCENE_ID
export const PROFILE_PHONE_VERIFY_SCENE_ID = 'profile-phone-verify-scene';

type ProfilePhoneVerifySceneState = {
  language: BotUiLanguage;
};

/**
 * uk: Внутрішня flow-функція getSceneState.
 * en: Internal flow function getSceneState.
 * cz: Interní flow funkce getSceneState.
 */
function getSceneState(ctx: MyContext): ProfilePhoneVerifySceneState {
  return ctx.wizard.state as ProfilePhoneVerifySceneState;
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
 * uk: Внутрішня flow-функція handlePhoneResendByTelegramId.
 * en: Internal flow function handlePhoneResendByTelegramId.
 * cz: Interní flow funkce handlePhoneResendByTelegramId.
 */
async function handlePhoneResendByTelegramId(
  ctx: MyContext,
  telegramId: number,
  language: BotUiLanguage,
): Promise<void> {
  const resend = await resendPhoneOTP(telegramId);

  if (resend.status === 'PHONE_MISSING') {
    await ctx.reply(otpPhoneMissingText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'ALREADY_VERIFIED') {
    await ctx.reply(otpPhoneAlreadyVerifiedText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'RESEND_LIMIT') {
    await ctx.reply(
      otpPhoneResendCooldownText(resend.retryAfterSec ?? 60, language),
      createProfilePhoneOtpKeyboard(language),
    );
    return;
  }

  if (resend.status === 'SMS_NOT_CONFIGURED') {
    await ctx.reply(otpPhoneNotConfiguredText(language), createProfileStubKeyboard(language));
    return;
  }

  if (resend.status === 'SEND_FAILED') {
    await ctx.reply(otpPhoneSendFailedText(language), createProfileStubKeyboard(language));
    return;
  }

  await ctx.reply(
    otpPhoneCodeSentText(resend.phone ?? tBot(language, 'PROFILE_NOT_SET'), language),
    createProfilePhoneOtpKeyboard(language),
  );
}

/**
 * uk: Публічна flow-функція createProfilePhoneVerifyScene.
 * en: Public flow function createProfilePhoneVerifyScene.
 * cz: Veřejná flow funkce createProfilePhoneVerifyScene.
 */
export function createProfilePhoneVerifyScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_PHONE_VERIFY_SCENE_ID,
    async (ctx) => {
      const user = await getOrCreateUser(ctx);
      const state = getSceneState(ctx);
      state.language = resolveBotUiLanguage(user.preferredLanguage);

      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply(otpPhoneMissingText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        return;
      }

      await handlePhoneResendByTelegramId(ctx, telegramId, state.language);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        const lang = state.language ?? 'uk';
        await ctx.reply(otpPhoneMissingText(lang), createProfileStubKeyboard(lang));
        await ctx.scene.leave();
        return;
      }

      const text = getMessageText(ctx);
      if (!text || !/^\d{6}$/.test(text)) {
        await ctx.reply(otpPhoneInvalidCodeText(state.language), createProfilePhoneOtpKeyboard(state.language));
        return;
      }

      const result = await verifyPhoneOTP({ telegramId, code: text });

      if (result.status === 'VERIFIED') {
        const phone = result.user?.phoneE164 ?? tBot(state.language, 'PROFILE_NOT_SET');
        await ctx.reply(otpPhoneVerifiedText(phone, state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      if (result.status === 'INVALID') {
        await ctx.reply(otpPhoneInvalidCodeText(state.language), createProfilePhoneOtpKeyboard(state.language));
        return;
      }

      if (result.status === 'EXPIRED' || result.status === 'NO_ACTIVE_OTP') {
        await ctx.reply(otpPhoneExpiredText(state.language), createProfilePhoneOtpKeyboard(state.language));
        return;
      }

      if (result.status === 'BLOCKED') {
        await ctx.reply(otpPhoneBlockedText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        return;
      }

      if (result.status === 'ALREADY_VERIFIED') {
        await ctx.reply(otpPhoneAlreadyVerifiedText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      if (result.status === 'SMS_NOT_CONFIGURED') {
        await ctx.reply(otpPhoneNotConfiguredText(state.language), createProfileStubKeyboard(state.language));
        await ctx.scene.leave();
        return;
      }

      await ctx.reply(otpPhoneMissingText(state.language), createProfileStubKeyboard(state.language));
      await ctx.scene.leave();
    },
  );

  scene.action(PROFILE_ACTION.PHONE_OTP_RESEND, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      const lang = state.language ?? 'uk';
      await ctx.reply(otpPhoneMissingText(lang), createProfileStubKeyboard(lang));
      await ctx.scene.leave();
      return;
    }
    await handlePhoneResendByTelegramId(ctx, telegramId, state.language);
  });

  scene.action(PROFILE_ACTION.PHONE_OTP_CANCEL, async (ctx) => {
    const state = getSceneState(ctx);
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await ctx.reply(otpPhoneCancelledText(state.language), createProfileStubKeyboard(state.language));
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
