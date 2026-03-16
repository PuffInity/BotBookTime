/**
 * @file bookingCreated.template.ts
 * @summary Шаблон листа для повідомлення про створений запис.
 */
import type { BookingCreatedTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

const resolveSubject = (role: BookingCreatedTemplateData["recipientRole"]): string => {
    if (role === "master") return "Новий запис від клієнта";
    if (role === "admin") return "Нові записи очікують підтвердження";
    return "Ваш запис створено та очікує підтвердження";
};

/**
 * @summary Будує контент email для події створення запису.
 * @param {BookingCreatedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingCreatedTemplate = (data: BookingCreatedTemplateData) => {
    const greeting = data.recipientName ? `Вітаємо, ${data.recipientName}!` : "Вітаємо!";
    const startAt = formatDateTime(data.startAt);
    const subject = resolveSubject(data.recipientRole);

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p><strong>ID запису:</strong> ${data.bookingId}</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Майстер:</strong> ${data.masterName ?? "Буде призначено"}</p>
<p><strong>Час:</strong> ${startAt}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Відкрити деталі запису</a></p>` : ""}
`;

    const text = [
        subject,
        greeting,
        `ID запису: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${data.masterName ?? "Буде призначено"}`,
        `Час: ${startAt}`,
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
