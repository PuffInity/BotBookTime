/**
 * @file bookingRescheduled.template.ts
 * @summary Шаблон листа для перенесення запису.
 */
import type { BookingRescheduledTemplateData } from "../../types/nodemailer/nodemailer.types.js";
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
 * @summary Будує контент email для перенесеного запису.
 * @param {BookingRescheduledTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingRescheduledTemplate = (data: BookingRescheduledTemplateData) => {
    const subject = "Ваш запис перенесено";
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const oldAt = formatDateTime(data.oldStartAt);
    const newAt = formatDateTime(data.newStartAt);

    const html = renderEmailLayout({
        title: "Ваш запис перенесено",
        subtitle: "Дата або час візиту були оновлені",
        greeting,
        intro: `Запис ${data.bookingId} було успішно перенесено.`,
        statusLabel: "Статус: Перенесено",
        statusTone: "info",
        detailsTitle: "Оновлені деталі запису",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Попередній час", value: oldAt },
            { label: "Новий час", value: newAt },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Майстер", value: data.masterName ?? "Без змін" },
        ],
        notice: "Будь ласка, перевірте нову дату та час візиту.",
        ctaText: data.actionUrl ? "Переглянути деталі" : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `Запис: ${data.bookingId}`,
        `Попередній час: ${oldAt}`,
        `Новий час: ${newAt}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${data.masterName ?? "Без змін"}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
