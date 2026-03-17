/**
 * @file text.utils.ts
 * @summary Reusable text builders for bot screens.
 */

export function otpEmailCodeSentText(email: string): string {
  return (
    '✉️ Код підтвердження відправлено.\n' +
    `Email: ${email}\n\n` +
    'Введіть 6-значний код із листа.\n' +
    'Код дійсний 5 хвилин.'
  );
}

export function otpEmailAlreadyVerifiedText(): string {
  return '✅ Email вже підтверджено.';
}

export function otpEmailMissingText(): string {
  return '⚠️ Email не вказано. Спочатку додайте email у профілі.';
}

export function otpEmailInvalidCodeText(): string {
  return '⚠️ Невірний OTP код. Перевірте код і спробуйте ще раз.';
}

export function otpEmailExpiredText(): string {
  return '⌛ Термін дії коду завершився. Надішліть код повторно.';
}

export function otpEmailBlockedText(): string {
  return '⛔ Забагато невірних спроб. Спробуйте знову через 5 хвилин.';
}

export function otpEmailResendCooldownText(retryAfterSec: number): string {
  return `⏱ Повторна відправка буде доступна через ${retryAfterSec} сек.`;
}

export function otpEmailVerifiedText(email: string): string {
  return `✅ Email підтверджено успішно.\nПідтверджений email: ${email}`;
}

export function otpEmailCancelledText(): string {
  return '❌ Підтвердження email скасовано.';
}

