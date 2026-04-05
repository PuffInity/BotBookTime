/**
 * @file reminder.template.ts
 * @summary Шаблон листа-нагадування перед візитом.
 */
import type { ReminderTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { formatDateTimeByLanguage, resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subject: "Reminder about your visit",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "Reminder about your visit",
            subtitle: (hoursBefore: number) => `About ${hoursBefore} hour(s) left until your booking.`,
            intro: "This is a reminder about your scheduled visit. Please check the time and details.",
            statusLabel: "Status: Reminder",
            detailsTitle: "Visit details",
            labelBookingId: "Booking ID",
            labelStudio: "Studio",
            labelService: "Service",
            labelMaster: "Master",
            labelTime: "Time",
            masterFallback: "—",
            ctaText: "View details",
            textReminderPrefix: (hoursBefore: number) => `Reminder in ${hoursBefore} hour(s).`,
            textLabelBookingId: "Booking ID",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelMaster: "Master",
            textLabelTime: "Time",
            textLabelDetails: "Details",
        };
    }

    if (language === "cs") {
        return {
            subject: "Připomínka vaší návštěvy",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Připomínka vaší návštěvy",
            subtitle: (hoursBefore: number) => `Do rezervace zbývá přibližně ${hoursBefore} hod.`,
            intro: "Připomínáme plánovanou návštěvu. Zkontrolujte čas a detaily rezervace.",
            statusLabel: "Stav: Připomínka",
            detailsTitle: "Detaily návštěvy",
            labelBookingId: "ID rezervace",
            labelStudio: "Studio",
            labelService: "Služba",
            labelMaster: "Mistr",
            labelTime: "Čas",
            masterFallback: "—",
            ctaText: "Zobrazit detail",
            textReminderPrefix: (hoursBefore: number) => `Připomínka ${hoursBefore} hod. předem.`,
            textLabelBookingId: "ID rezervace",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelMaster: "Mistr",
            textLabelTime: "Čas",
            textLabelDetails: "Detail",
        };
    }

    return {
        subject: "Нагадування про ваш візит",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "Нагадування про ваш візит",
        subtitle: (hoursBefore: number) => `До запису залишилось приблизно ${hoursBefore} год.`,
        intro: "Нагадуємо про запланований візит. Перевірте час та деталі запису.",
        statusLabel: "Статус: Нагадування",
        detailsTitle: "Деталі візиту",
        labelBookingId: "ID запису",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelMaster: "Майстер",
        labelTime: "Час",
        masterFallback: "—",
        ctaText: "Переглянути деталі",
        textReminderPrefix: (hoursBefore: number) => `Нагадування за ${hoursBefore} год.`,
        textLabelBookingId: "ID запису",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelMaster: "Майстер",
        textLabelTime: "Час",
        textLabelDetails: "Деталі",
    };
}

/**
 * @summary Будує контент email-нагадування.
 * @param {ReminderTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const reminderTemplate = (
    data: ReminderTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveDictionary(language);
    const subject = dict.subject;
    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;
    const startAt = formatDateTimeByLanguage(data.startAt, language);

    const html = renderEmailLayout({
        language,
        title: dict.title,
        subtitle: dict.subtitle(data.hoursBefore),
        greeting,
        intro: dict.intro,
        statusLabel: dict.statusLabel,
        statusTone: "info",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelMaster, value: data.masterName ?? dict.masterFallback },
            { label: dict.labelTime, value: startAt },
        ],
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        dict.textReminderPrefix(data.hoursBefore),
        `${dict.textLabelBookingId}: ${data.bookingId}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelMaster}: ${data.masterName ?? dict.masterFallback}`,
        `${dict.textLabelTime}: ${startAt}`,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
