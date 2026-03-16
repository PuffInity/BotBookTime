/**
 * @file marketing.template.ts
 * @summary Шаблон маркетингового повідомлення.
 */
import type { MarketingTemplateData } from "../../types/nodemailer/nodemailer.types.js";

/**
 * @summary Будує контент маркетингового листа.
 * @param {MarketingTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const marketingTemplate = (data: MarketingTemplateData) => {
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const subject = data.title;

    const html = `
<h2>${data.title}</h2>
<p>${greeting}</p>
<p>${data.body}</p>
${data.ctaText && data.ctaUrl ? `<p><a href="${data.ctaUrl}">${data.ctaText}</a></p>` : ""}
${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}">Відписатися від розсилки</a></p>` : ""}
`;

    const text = [
        data.title,
        greeting,
        data.body,
        data.ctaText && data.ctaUrl ? `${data.ctaText}: ${data.ctaUrl}` : "",
        data.unsubscribeUrl ? `Відписка: ${data.unsubscribeUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
