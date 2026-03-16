/**
 * @file bookingRescheduled.template.ts
 * @summary Шаблон листа для перенесення запису.
 */
import type { BookingRescheduledTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Запис <strong>${data.bookingId}</strong> було перенесено.</p>
<p><strong>Попередній час:</strong> ${oldAt}</p>
<p><strong>Новий час:</strong> ${newAt}</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Майстер:</strong> ${data.masterName ?? "Без змін"}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Переглянути деталі</a></p>` : ""}
`;

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
