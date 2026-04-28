/**
 * @file bookingRescheduled.template.ts
 * @summary Шаблон листа для перенесення запису.
 */
import type { BookingRescheduledTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { formatDateTimeByLanguage, resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subject: "Your booking has been rescheduled",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "Your booking has been rescheduled",
            subtitle: "The date or time of your visit was updated",
            intro: "Booking {id} has been successfully rescheduled.",
            statusLabel: "Status: Rescheduled",
            detailsTitle: "Updated booking details",
            labelBookingId: "Booking ID",
            labelOldTime: "Previous time",
            labelNewTime: "New time",
            labelStudio: "Studio",
            labelService: "Service",
            labelMaster: "Master",
            masterFallback: "No changes",
            notice: "Please review the new date and time of your appointment.",
            ctaText: "View details",
            textLabelBooking: "Booking",
            textLabelOldTime: "Previous time",
            textLabelNewTime: "New time",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelMaster: "Master",
            textLabelDetails: "Details",
        };
    }

    if (language === "cs") {
        return {
            subject: "Vaše rezervace byla přesunuta",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Vaše rezervace byla přesunuta",
            subtitle: "Datum nebo čas návštěvy byl aktualizován",
            intro: "Rezervace {id} byla úspěšně přesunuta.",
            statusLabel: "Stav: Přesunuto",
            detailsTitle: "Aktualizované detaily rezervace",
            labelBookingId: "ID rezervace",
            labelOldTime: "Původní čas",
            labelNewTime: "Nový čas",
            labelStudio: "Studio",
            labelService: "Služba",
            labelMaster: "Mistr",
            masterFallback: "Bez změny",
            notice: "Zkontrolujte prosím nové datum a čas návštěvy.",
            ctaText: "Zobrazit detail",
            textLabelBooking: "Rezervace",
            textLabelOldTime: "Původní čas",
            textLabelNewTime: "Nový čas",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelMaster: "Mistr",
            textLabelDetails: "Detail",
        };
    }

    return {
        subject: "Ваш запис перенесено",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "Ваш запис перенесено",
        subtitle: "Дата або час візиту були оновлені",
        intro: "Запис {id} було успішно перенесено.",
        statusLabel: "Статус: Перенесено",
        detailsTitle: "Оновлені деталі запису",
        labelBookingId: "ID запису",
        labelOldTime: "Попередній час",
        labelNewTime: "Новий час",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelMaster: "Майстер",
        masterFallback: "Без змін",
        notice: "Будь ласка, перевірте нову дату та час візиту.",
        ctaText: "Переглянути деталі",
        textLabelBooking: "Запис",
        textLabelOldTime: "Попередній час",
        textLabelNewTime: "Новий час",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelMaster: "Майстер",
        textLabelDetails: "Деталі",
    };
}

/**
 * @summary Будує контент email для перенесеного запису.
 * @param {BookingRescheduledTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingRescheduledTemplate = (
    data: BookingRescheduledTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveDictionary(language);
    const subject = dict.subject;
    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;
    const oldAt = formatDateTimeByLanguage(data.oldStartAt, language);
    const newAt = formatDateTimeByLanguage(data.newStartAt, language);

    const html = renderEmailLayout({
        language,
        title: dict.title,
        subtitle: dict.subtitle,
        greeting,
        intro: dict.intro.replace("{id}", data.bookingId),
        statusLabel: dict.statusLabel,
        statusTone: "info",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelOldTime, value: oldAt },
            { label: dict.labelNewTime, value: newAt },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelMaster, value: data.masterName ?? dict.masterFallback },
        ],
        notice: dict.notice,
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `${dict.textLabelBooking}: ${data.bookingId}`,
        `${dict.textLabelOldTime}: ${oldAt}`,
        `${dict.textLabelNewTime}: ${newAt}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelMaster}: ${data.masterName ?? dict.masterFallback}`,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
