/**
 * @file otpEmail.template.ts
 * @summary Шаблон OTP-листа для підтвердження email.
 */
import type { OtpEmailTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Ваш одноразовий код:</p>
<p style="font-size:24px;letter-spacing:4px;"><strong>${data.code}</strong></p>
<p>Код дійсний ${data.expiresInMinutes} хв.</p>
<p>Якщо це були не ви, просто проігноруйте лист.</p>
`;

    const text = [
        subject,
        greeting,
        `Ваш OTP код: ${data.code}`,
        `Код дійсний ${data.expiresInMinutes} хв.`,
        "Якщо це були не ви, проігноруйте лист.",
    ].join("\n");

    return { subject, html, text };
};
