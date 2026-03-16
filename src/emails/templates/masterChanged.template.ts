/**
 * @file masterChanged.template.ts
 * @summary Шаблон листа для зміни майстра у записі.
 */
import type { MasterChangedTemplateData } from "../../types/nodemailer/nodemailer.types.js";

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

    const html = `
<h2>${subject}</h2>
<p>${greeting}</p>
<p>Для запису <strong>${data.bookingId}</strong> змінено майстра.</p>
<p><strong>Студія:</strong> ${data.studioName}</p>
<p><strong>Послуга:</strong> ${data.serviceName}</p>
<p><strong>Було:</strong> ${data.oldMasterName}</p>
<p><strong>Стало:</strong> ${data.newMasterName}</p>
<p><strong>Час візиту:</strong> ${startAt}</p>
${data.actionUrl ? `<p><a href="${data.actionUrl}">Переглянути запис</a></p>` : ""}
`;

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
