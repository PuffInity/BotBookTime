/**
 * @file marketing.template.ts
 * @summary Шаблон маркетингового повідомлення.
 */
import type { MarketingTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";

/**
 * @summary Будує контент маркетингового листа.
 * @param {MarketingTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const marketingTemplate = (data: MarketingTemplateData) => {
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const subject = data.title;

    const html = renderEmailLayout({
        title: data.title,
        subtitle: "Оновлення та пропозиції від студії",
        greeting,
        intro: data.body,
        statusLabel: "Інформаційне повідомлення",
        statusTone: "info",
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        secondaryCtaText: data.unsubscribeUrl ? "Відписатися від розсилки" : undefined,
        secondaryCtaUrl: data.unsubscribeUrl,
    });

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
