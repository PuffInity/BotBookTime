/**
 * @file reminder.template.ts
 * @summary Шаблон листа-нагадування перед візитом.
 */
import type { ReminderTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Нагадуємо: через <strong>${data.hoursBefore}</strong> год. у вас запланований візит.</p>
<p><strong>ID запису:</strong> ${data.bookingId}</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Майстер:</strong> ${data.masterName ?? "—"}</p>
<p><strong>Час:</strong> ${startAt}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Переглянути деталі</a></p>` : ""}
`;

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
