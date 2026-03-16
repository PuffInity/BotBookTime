/**
 * @file bookingConfirmed.template.ts
 * @summary Шаблон листа для підтвердження запису майстром.
 */
import type { BookingConfirmedTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Ваш запис <strong>${data.bookingId}</strong> підтверджено.</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Майстер:</strong> ${data.masterName}</p>
<p><strong>Час візиту:</strong> ${startAt}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Переглянути запис</a></p>` : ""}
`;

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
