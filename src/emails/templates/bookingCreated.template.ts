/**
 * @file bookingCreated.template.ts
 * @summary Шаблон листа для повідомлення про створений запис.
 */
import type { BookingCreatedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";

const parseDate = (value: Date | string): Date => {
    return value instanceof Date ? value : new Date(value);
};

const formatDate = (value: Date | string): string => {
    const date = parseDate(value);
    return date.toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

const formatTime = (value: Date | string): string => {
    const date = parseDate(value);
    return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

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
    const bookingDate = formatDate(data.startAt);
    const bookingTime = formatTime(data.startAt);
    const masterName = data.masterName ?? "Буде призначено";

    const html = renderEmailLayout({
        title: "Ваш запис створено",
        subtitle: "Запис успішно сформовано та передано на підтвердження",
        greeting,
        intro:
            "Ваш запис було успішно створено. Зараз він очікує підтвердження від майстра.\nНижче ви можете переглянути деталі вашого бронювання.",
        statusLabel: "Статус: Очікує підтвердження",
        statusTone: "warning",
        detailsTitle: "Деталі запису",
        detailsRows: [
            { label: "ID запису", value: data.bookingId },
            { label: "Студія", value: data.studioName },
            { label: "Послуга", value: data.serviceName },
            { label: "Майстер", value: masterName },
            { label: "Час", value: `${bookingDate}, ${bookingTime}` },
        ],
        notice:
            "Ми повідомимо вас, щойно майстер підтвердить запис або якщо в ньому відбудуться зміни.",
        ctaText: data.actionUrl ? "Відкрити деталі запису" : undefined,
        ctaUrl: data.actionUrl,
        closing: `Дякуємо, що обрали ${data.studioName} 💅`,
    });

    const text = [
        subject,
        greeting,
        `ID запису: ${data.bookingId}`,
        `Студія: ${data.studioName}`,
        `Послуга: ${data.serviceName}`,
        `Майстер: ${masterName}`,
        `Час: ${startAt}`,
        "Статус: Очікує підтвердження",
        data.actionUrl ? `Деталі: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
