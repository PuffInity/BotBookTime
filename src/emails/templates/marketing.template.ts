/**
 * @file marketing.template.ts
 * @summary Шаблон маркетингового повідомлення.
 */
import type { MarketingTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            subtitle: "Updates and offers from the studio",
            statusLabel: "Information message",
            unsubscribeText: "Unsubscribe from mailing list",
            textUnsubscribe: "Unsubscribe",
        };
    }

    if (language === "cs") {
        return {
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            subtitle: "Novinky a nabídky ze studia",
            statusLabel: "Informační zpráva",
            unsubscribeText: "Odhlásit odběr",
            textUnsubscribe: "Odhlášení",
        };
    }

    return {
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        subtitle: "Оновлення та пропозиції від студії",
        statusLabel: "Інформаційне повідомлення",
        unsubscribeText: "Відписатися від розсилки",
        textUnsubscribe: "Відписка",
    };
}

/**
 * @summary Будує контент маркетингового листа.
 * @param {MarketingTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const marketingTemplate = (
    data: MarketingTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveDictionary(language);
    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;
    const subject = data.title;

    const html = renderEmailLayout({
        language,
        title: data.title,
        subtitle: dict.subtitle,
        greeting,
        intro: data.body,
        statusLabel: dict.statusLabel,
        statusTone: "info",
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        secondaryCtaText: data.unsubscribeUrl ? dict.unsubscribeText : undefined,
        secondaryCtaUrl: data.unsubscribeUrl,
    });

    const text = [
        data.title,
        greeting,
        data.body,
        data.ctaText && data.ctaUrl ? `${data.ctaText}: ${data.ctaUrl}` : "",
        data.unsubscribeUrl ? `${dict.textUnsubscribe}: ${data.unsubscribeUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
