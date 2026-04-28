/**
 * @file otpEmail.template.ts
 * @summary Шаблон OTP-листа для підтвердження email.
 */
import type { OtpEmailTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subjectEmailVerify: "Email verification code",
            subjectEmailChange: "Email change verification code",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            subtitle: "Account security confirmation",
            intro: (minutes: number) =>
                `Use the code below to confirm this action.\nThe code is valid for ${minutes} min.`,
            statusLabel: "OTP code is active",
            otpCodeLabel: "Your one-time code",
            notice: "If this wasn't you, simply ignore this email.",
            textCodeLabel: "Your OTP code",
            textExpiresLabel: "Code is valid for",
            textMinutesShort: "min.",
            textIgnore: "If this wasn't you, ignore this email.",
        };
    }

    if (language === "cs") {
        return {
            subjectEmailVerify: "Kód pro ověření emailu",
            subjectEmailChange: "Kód pro potvrzení změny emailu",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            subtitle: "Potvrzení bezpečnosti účtu",
            intro: (minutes: number) =>
                `Použijte níže uvedený kód pro potvrzení akce.\nKód je platný ${minutes} min.`,
            statusLabel: "OTP kód je aktivní",
            otpCodeLabel: "Váš jednorázový kód",
            notice: "Pokud jste to nebyli vy, tento email ignorujte.",
            textCodeLabel: "Váš OTP kód",
            textExpiresLabel: "Kód je platný",
            textMinutesShort: "min.",
            textIgnore: "Pokud jste to nebyli vy, email ignorujte.",
        };
    }

    return {
        subjectEmailVerify: "Код підтвердження email",
        subjectEmailChange: "Код підтвердження зміни email",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        subtitle: "Підтвердження безпеки акаунта",
        intro: (minutes: number) =>
            `Використайте код нижче для підтвердження дії.\nКод дійсний ${minutes} хв.`,
        statusLabel: "OTP код активний",
        otpCodeLabel: "Ваш одноразовий код",
        notice: "Якщо це були не ви, просто проігноруйте цей лист.",
        textCodeLabel: "Ваш OTP код",
        textExpiresLabel: "Код дійсний",
        textMinutesShort: "хв.",
        textIgnore: "Якщо це були не ви, проігноруйте лист.",
    };
}

/**
 * @summary Будує OTP-лист для email-верифікації.
 * @param {OtpEmailTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const otpEmailTemplate = (
    data: OtpEmailTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveDictionary(language);
    const subject = data.purpose === "email_change" ? dict.subjectEmailChange : dict.subjectEmailVerify;
    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;

    const codeBlockHtml = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px dashed #9ca3af; border-radius: 12px; margin-bottom: 24px; background-color: #f9fafb;">
  <tr>
    <td style="padding: 16px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">${dict.otpCodeLabel}</p>
      <p style="margin: 0; font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #111827;">${data.code}</p>
    </td>
  </tr>
</table>
`;

    const html = renderEmailLayout({
        language,
        title: subject,
        subtitle: dict.subtitle,
        greeting,
        intro: dict.intro(data.expiresInMinutes),
        statusLabel: dict.statusLabel,
        statusTone: "info",
        highlightHtml: codeBlockHtml,
        notice: dict.notice,
    });

    const text = [
        subject,
        greeting,
        `${dict.textCodeLabel}: ${data.code}`,
        `${dict.textExpiresLabel} ${data.expiresInMinutes} ${dict.textMinutesShort}`,
        dict.textIgnore,
    ].join("\n");

    return { subject, html, text };
};
