/**
 * @file reminder.template.ts
 * @summary Шаблон листа-нагадування перед візитом.
 */
import type { ReminderTemplateData } from "../../types/nodemailer/nodemailer.types.js";
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
 * @summary Будує контент email-нагадування.
 * @param {ReminderTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const reminderTemplate = (data: ReminderTemplateData) => {
    const subject = "Нагадування про ваш візит";
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const startAt = formatDateTime(data.startAt);

    const html = renderEmailLayout({
        title: "Нагадування про ваш візит",
        subtitle: `До запису залишилось приблизно ${data.hoursBefore} год.`,
        greeting,
        intro: "Нагадуємо про запланований візит. Перевірте час та деталі запису.",
        statusLabel: "Статус: Нагадування",
        statusTone: "info",
        detailsTitle: "Деталі візиту",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Майстер", value: data.masterName ?? "—" },
            { label: "Час", value: startAt },
        ],
        ctaText: data.actionUrl ? "Переглянути деталі" : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `Нагадування за ${data.hoursBefore} год.`,
        `ID запису: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${data.masterName ?? "—"}`,
        `Час: ${startAt}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
