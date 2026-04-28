/**
 * @file bookingCancelled.template.ts
 * @summary Шаблон листа для скасування запису.
 */
import type { BookingCancelledTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { formatDateTimeByLanguage, resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subject: "Your booking has been canceled",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "Your booking has been canceled",
            subtitle: "This visit is no longer active in the schedule",
            intro: "Booking {id} has been canceled.",
            statusLabel: "Status: Canceled",
            detailsTitle: "Canceled booking details",
            labelBookingId: "Booking ID",
            labelStudio: "Studio",
            labelService: "Service",
            labelMaster: "Master",
            labelTime: "Planned time",
            labelReason: "Reason",
            reasonFallback: "Reason not specified",
            notice: "If this was a mistake, please contact the studio.",
            ctaText: "Check schedule",
            textLabelBooking: "Booking",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelMaster: "Master",
            textLabelTime: "Planned time",
            textLabelReason: "Reason",
            textLabelDetails: "Details",
            masterFallback: "—",
        };
    }

    if (language === "cs") {
        return {
            subject: "Vaše rezervace byla zrušena",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Vaše rezervace byla zrušena",
            subtitle: "Návštěva už není aktivní v rozvrhu",
            intro: "Rezervace {id} byla zrušena.",
            statusLabel: "Stav: Zrušeno",
            detailsTitle: "Detaily zrušené rezervace",
            labelBookingId: "ID rezervace",
            labelStudio: "Studio",
            labelService: "Služba",
            labelMaster: "Mistr",
            labelTime: "Plánovaný čas",
            labelReason: "Důvod",
            reasonFallback: "Důvod nebyl uveden",
            notice: "Pokud jde o chybu, kontaktujte studio.",
            ctaText: "Zkontrolovat rozvrh",
            textLabelBooking: "Rezervace",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelMaster: "Mistr",
            textLabelTime: "Plánovaný čas",
            textLabelReason: "Důvod",
            textLabelDetails: "Detail",
            masterFallback: "—",
        };
    }

    return {
        subject: "Ваш запис скасовано",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "Ваш запис скасовано",
        subtitle: "Візит більше не активний у розкладі",
        intro: "Запис {id} було скасовано.",
        statusLabel: "Статус: Скасовано",
        detailsTitle: "Деталі скасованого запису",
        labelBookingId: "ID запису",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelMaster: "Майстер",
        labelTime: "Планований час",
        labelReason: "Причина",
        reasonFallback: "Причина не вказана",
        notice: "Якщо це помилка, зверніться до студії для уточнення.",
        ctaText: "Перевірити розклад",
        textLabelBooking: "Запис",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelMaster: "Майстер",
        textLabelTime: "Планований час",
        textLabelReason: "Причина",
        textLabelDetails: "Деталі",
        masterFallback: "—",
    };
}

/**
 * @summary Будує контент email для скасованого запису.
 * @param {BookingCancelledTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingCancelledTemplate = (
    data: BookingCancelledTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveDictionary(language);
    const subject = dict.subject;
    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;
    const startAt = formatDateTimeByLanguage(data.startAt, language);
    const reason = data.cancelReason ?? dict.reasonFallback;

    const html = renderEmailLayout({
        language,
        title: dict.title,
        subtitle: dict.subtitle,
        greeting,
        intro: dict.intro.replace("{id}", data.bookingId),
        statusLabel: dict.statusLabel,
        statusTone: "danger",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelMaster, value: data.masterName ?? dict.masterFallback },
            { label: dict.labelTime, value: startAt },
            { label: dict.labelReason, value: reason },
        ],
        notice: dict.notice,
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `${dict.textLabelBooking}: ${data.bookingId}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelMaster}: ${data.masterName ?? dict.masterFallback}`,
        `${dict.textLabelTime}: ${startAt}`,
        `${dict.textLabelReason}: ${reason}`,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
