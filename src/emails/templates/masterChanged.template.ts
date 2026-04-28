/**
 * @file masterChanged.template.ts
 * @summary Шаблон листа для зміни майстра у записі.
 */
import type { MasterChangedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { formatDateTimeByLanguage, resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subject: "The master in your booking has been changed",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "The master in your booking has been changed",
            subtitle: "Please check the updated appointment details",
            intro: "The master has been changed for booking {id}.",
            statusLabel: "Status: Updated",
            detailsTitle: "Booking details",
            labelBookingId: "Booking ID",
            labelStudio: "Studio",
            labelService: "Service",
            labelOldMaster: "Previous master",
            labelNewMaster: "New master",
            labelVisitTime: "Visit time",
            ctaText: "View booking",
            textLabelBooking: "Booking",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelOldMaster: "Previous master",
            textLabelNewMaster: "New master",
            textLabelTime: "Time",
            textLabelDetails: "Details",
        };
    }

    if (language === "cs") {
        return {
            subject: "Váš mistr v rezervaci byl změněn",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Váš mistr v rezervaci byl změněn",
            subtitle: "Zkontrolujte prosím aktualizované detaily návštěvy",
            intro: "U rezervace {id} byl změněn mistr.",
            statusLabel: "Stav: Aktualizováno",
            detailsTitle: "Detaily rezervace",
            labelBookingId: "ID rezervace",
            labelStudio: "Studio",
            labelService: "Služba",
            labelOldMaster: "Původní mistr",
            labelNewMaster: "Nový mistr",
            labelVisitTime: "Čas návštěvy",
            ctaText: "Zobrazit rezervaci",
            textLabelBooking: "Rezervace",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelOldMaster: "Původní mistr",
            textLabelNewMaster: "Nový mistr",
            textLabelTime: "Čas",
            textLabelDetails: "Detail",
        };
    }

    return {
        subject: "У вашому записі змінено майстра",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "У вашому записі змінено майстра",
        subtitle: "Будь ласка, перевірте оновлені деталі візиту",
        intro: "Для запису {id} змінено майстра.",
        statusLabel: "Статус: Оновлено",
        detailsTitle: "Деталі запису",
        labelBookingId: "ID запису",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelOldMaster: "Було",
        labelNewMaster: "Стало",
        labelVisitTime: "Час візиту",
        ctaText: "Переглянути запис",
        textLabelBooking: "Запис",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelOldMaster: "Було",
        textLabelNewMaster: "Стало",
        textLabelTime: "Час",
        textLabelDetails: "Деталі",
    };
}

/**
 * @summary Будує контент email для зміни майстра.
 * @param {MasterChangedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const masterChangedTemplate = (
    data: MasterChangedTemplateData,
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
        subtitle: dict.subtitle,
        greeting,
        intro: dict.intro.replace("{id}", data.bookingId),
        statusLabel: dict.statusLabel,
        statusTone: "info",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelOldMaster, value: data.oldMasterName },
            { label: dict.labelNewMaster, value: data.newMasterName },
            { label: dict.labelVisitTime, value: startAt },
        ],
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
    });

    const text = [
        subject,
        greeting,
        `${dict.textLabelBooking}: ${data.bookingId}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelOldMaster}: ${data.oldMasterName}`,
        `${dict.textLabelNewMaster}: ${data.newMasterName}`,
        `${dict.textLabelTime}: ${startAt}`,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
