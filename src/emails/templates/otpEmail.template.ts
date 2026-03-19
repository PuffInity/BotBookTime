/**
 * @file otpEmail.template.ts
 * @summary Шаблон OTP-листа для підтвердження email.
 */
import type { OtpEmailTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";

const resolveSubject = (purpose: OtpEmailTemplateData["purpose"]): string => {
    if (purpose === "email_change") return "Код підтвердження зміни email";
    return "Код підтвердження email";
};

/**
 * @summary Будує OTP-лист для email-верифікації.
 * @param {OtpEmailTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const otpEmailTemplate = (data: OtpEmailTemplateData) => {
    const subject = resolveSubject(data.purpose);
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";

    const codeBlockHtml = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px dashed #9ca3af; border-radius: 12px; margin-bottom: 24px; background-color: #f9fafb;">
  <tr>
    <td style="padding: 16px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Ваш одноразовий код</p>
      <p style="margin: 0; font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #111827;">${data.code}</p>
    </td>
  </tr>
</table>
`;

    const html = renderEmailLayout({
        title: subject,
        subtitle: "Підтвердження безпеки акаунта",
        greeting,
        intro: `Використайте код нижче для підтвердження дії.\nКод дійсний ${data.expiresInMinutes} хв.`,
        statusLabel: "OTP код активний",
        statusTone: "info",
        highlightHtml: codeBlockHtml,
        notice: "Якщо це були не ви, просто проігноруйте цей лист.",
    });

    const text = [
        subject,
        greeting,
        `Ваш OTP код: ${data.code}`,
        `Код дійсний ${data.expiresInMinutes} хв.`,
        "Якщо це були не ви, проігноруйте лист.",
    ].join("\n");

    return { subject, html, text };
};
