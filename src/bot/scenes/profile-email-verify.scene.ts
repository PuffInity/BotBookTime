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
  otpEmailMissingText,
  otpEmailResendCooldownText,
  otpEmailVerifiedText,
} from '../../utils/text.utils.js';

/**
 * @file profile-email-verify.scene.ts
 * @summary Scene for email verification with OTP in profile settings.
 */

export const PROFILE_EMAIL_VERIFY_SCENE_ID = 'profile-email-verify-scene';

function getMessageText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

async function sendFreshProfileCard(ctx: MyContext): Promise<void> {
  const user = await getOrCreateUser(ctx);
  await sendProfileCard(ctx, user);
}

async function handleResendByTelegramId(ctx: MyContext, telegramId: number): Promise<void> {
  const resend = await resendOTP(telegramId);

  if (resend.status === 'EMAIL_MISSING') {
    await ctx.reply(otpEmailMissingText(), createProfileStubKeyboard());
    return;
  }

  if (resend.status === 'ALREADY_VERIFIED') {
    await ctx.reply(otpEmailAlreadyVerifiedText(), createProfileStubKeyboard());
    return;
  }

  if (resend.status === 'RESEND_LIMIT') {
    await ctx.reply(
      otpEmailResendCooldownText(resend.retryAfterSec ?? 60),
      createProfileEmailOtpKeyboard(),
    );
    return;
  }

  await ctx.reply(otpEmailCodeSentText(resend.email ?? 'ваш email'), createProfileEmailOtpKeyboard());
}

export function createProfileEmailVerifyScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    PROFILE_EMAIL_VERIFY_SCENE_ID,
    async (ctx) => {
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply(otpEmailMissingText(), createProfileStubKeyboard());
        await ctx.scene.leave();
        return;
      }

      await handleResendByTelegramId(ctx, telegramId);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply(otpEmailMissingText(), createProfileStubKeyboard());
        await ctx.scene.leave();
        return;
      }

      const text = getMessageText(ctx);
      if (!text || !/^\d{6}$/.test(text)) {
        await ctx.reply(otpEmailInvalidCodeText(), createProfileEmailOtpKeyboard());
        return;
      }

      const result = await verifyOTP({ telegramId, code: text });

      if (result.status === 'VERIFIED') {
        const email = result.user?.email ?? 'ваш email';
        await ctx.reply(otpEmailVerifiedText(email), createProfileStubKeyboard());
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      if (result.status === 'INVALID') {
        await ctx.reply(otpEmailInvalidCodeText(), createProfileEmailOtpKeyboard());
        return;
      }

      if (result.status === 'EXPIRED' || result.status === 'NO_ACTIVE_OTP') {
        await ctx.reply(otpEmailExpiredText(), createProfileEmailOtpKeyboard());
        return;
      }

      if (result.status === 'BLOCKED') {
        await ctx.reply(otpEmailBlockedText(), createProfileStubKeyboard());
        await ctx.scene.leave();
        return;
      }

      if (result.status === 'ALREADY_VERIFIED') {
        await ctx.reply(otpEmailAlreadyVerifiedText(), createProfileStubKeyboard());
        await ctx.scene.leave();
        await sendFreshProfileCard(ctx);
        return;
      }

      await ctx.reply(otpEmailMissingText(), createProfileStubKeyboard());
      await ctx.scene.leave();
    },
  );

  scene.action(PROFILE_ACTION.EMAIL_OTP_RESEND, async (ctx) => {
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply(otpEmailMissingText(), createProfileStubKeyboard());
      await ctx.scene.leave();
      return;
    }
    await handleResendByTelegramId(ctx, telegramId);
  });

  scene.action(PROFILE_ACTION.EMAIL_OTP_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await ctx.reply(otpEmailCancelledText(), createProfileStubKeyboard());
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

