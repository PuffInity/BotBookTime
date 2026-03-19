/**
 * @file bookingConfirmed.template.ts
 * @summary Шаблон листа для підтвердження запису майстром.
 */
import type { BookingConfirmedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
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
 * @summary Будує контент email для підтвердження запису.
 * @param {BookingConfirmedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingConfirmedTemplate = (data: BookingConfirmedTemplateData) => {
    const subject = "Ваш запис підтверджено";
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const startAt = formatDateTime(data.startAt);

    const html = renderEmailLayout({
        title: "Ваш запис підтверджено",
        subtitle: "Майстер підтвердив ваш візит",
        greeting,
        intro:
            `Ваш запис ${data.bookingId} підтверджено.\nВізит зафіксовано у розкладі студії.`,
        statusLabel: "Статус: Підтверджено",
        statusTone: "success",
        detailsTitle: "Деталі запису",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Майстер", value: data.masterName },
            { label: "Час візиту", value: startAt },
        ],
        notice: "Якщо вам потрібно перенести або скасувати запис, зробіть це завчасно.",
        ctaText: data.actionUrl ? "Переглянути запис" : undefined,
        ctaUrl: data.actionUrl,
        closing: `Чекаємо на вас у ${data.studioName} 💅`,
    });

    const text = [
        subject,
        greeting,
        `Запис: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${data.masterName}`,
        `Час: ${startAt}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
