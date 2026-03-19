/**
 * @file masterChanged.template.ts
 * @summary Шаблон листа для зміни майстра у записі.
 */
import type { MasterChangedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";

const formatDateTime = (value: Date | string): string => {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * @summary Будує контент email для зміни майстра.
 * @param {MasterChangedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const masterChangedTemplate = (data: MasterChangedTemplateData) => {
    const subject = "У вашому записі змінено майстра";
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const startAt = formatDateTime(data.startAt);

    const html = renderEmailLayout({
        title: "У вашому записі змінено майстра",
        subtitle: "Будь ласка, перевірте оновлені деталі візиту",
        greeting,
        intro: `Для запису ${data.bookingId} змінено майстра.`,
        statusLabel: "Статус: Оновлено",
        statusTone: "info",
        detailsTitle: "Деталі запису",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Було", value: data.oldMasterName },
            { label: "Стало", value: data.newMasterName },
            { label: "Час візиту", value: startAt },
        ],
        ctaText: data.actionUrl ? "Переглянути запис" : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `Запис: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Було: ${data.oldMasterName}`,
        `Стало: ${data.newMasterName}`,
        `Час: ${startAt}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
