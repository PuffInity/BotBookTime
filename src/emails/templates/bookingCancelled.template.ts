/**
 * @file bookingCancelled.template.ts
 * @summary Шаблон листа для скасування запису.
 */
import type { BookingCancelledTemplateData } from "../../types/nodemailer/nodemailer.types.js";
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
 * @summary Будує контент email для скасованого запису.
 * @param {BookingCancelledTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingCancelledTemplate = (data: BookingCancelledTemplateData) => {
    const subject = "Ваш запис скасовано";
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const startAt = formatDateTime(data.startAt);
    const reason = data.cancelReason ?? "Причина не вказана";

    const html = renderEmailLayout({
        title: "Ваш запис скасовано",
        subtitle: "Візит більше не активний у розкладі",
        greeting,
        intro: `Запис ${data.bookingId} було скасовано.`,
        statusLabel: "Статус: Скасовано",
        statusTone: "danger",
        detailsTitle: "Деталі скасованого запису",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Майстер", value: data.masterName ?? "—" },
            { label: "Планований час", value: startAt },
            { label: "Причина", value: reason },
        ],
        notice: "Якщо це помилка, зверніться до студії для уточнення.",
        ctaText: data.actionUrl ? "Перевірити розклад" : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `Запис: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${data.masterName ?? "—"}`,
        `Планований час: ${startAt}`,
        `Причина: ${reason}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
