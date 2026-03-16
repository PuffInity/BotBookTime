/**
 * @file bookingCancelled.template.ts
 * @summary Шаблон листа для скасування запису.
 */
import type { BookingCancelledTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Запис <strong>${data.bookingId}</strong> скасовано.</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Майстер:</strong> ${data.masterName ?? "—"}</p>
<p><strong>Планований час:</strong> ${startAt}</p>
<p><strong>Причина:</strong> ${reason}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Перевірити розклад</a></p>` : ""}
`;

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
