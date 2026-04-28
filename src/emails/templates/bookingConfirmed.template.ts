/**
 * @file bookingConfirmed.template.ts
 * @summary Шаблон листа для підтвердження запису майстром.
 */
import type { BookingConfirmedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import { formatDateTimeByLanguage, resolveMailLanguage } from "./email-locale.template.js";

function resolveDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subject: "Your booking has been confirmed",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "Your booking has been confirmed",
            subtitle: "The master confirmed your appointment",
            intro: "Your booking {id} has been confirmed.\nThe appointment is now fixed in the studio schedule.",
            statusLabel: "Status: Confirmed",
            detailsTitle: "Booking details",
            labelBookingId: "Booking ID",
            labelStudio: "Studio",
            labelService: "Service",
            labelMaster: "Master",
            labelTime: "Visit time",
            notice: "If you need to reschedule or cancel your booking, please do it in advance.",
            ctaText: "View booking",
            closing: (studio: string) => `We look forward to seeing you at ${studio} 💅`,
            textLabelBooking: "Booking",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelMaster: "Master",
            textLabelTime: "Time",
            textLabelDetails: "Details",
        };
    }

    if (language === "cs") {
        return {
            subject: "Vaše rezervace byla potvrzena",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Vaše rezervace byla potvrzena",
            subtitle: "Mistr potvrdil vaši návštěvu",
            intro: "Vaše rezervace {id} byla potvrzena.\nNávštěva je nyní zanesena do rozvrhu studia.",
            statusLabel: "Stav: Potvrzeno",
            detailsTitle: "Detaily rezervace",
            labelBookingId: "ID rezervace",
            labelStudio: "Studio",
            labelService: "Služba",
            labelMaster: "Mistr",
            labelTime: "Čas návštěvy",
            notice: "Pokud potřebujete rezervaci přesunout nebo zrušit, udělejte to včas.",
            ctaText: "Zobrazit rezervaci",
            closing: (studio: string) => `Těšíme se na vás ve studiu ${studio} 💅`,
            textLabelBooking: "Rezervace",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelMaster: "Mistr",
            textLabelTime: "Čas",
            textLabelDetails: "Detail",
        };
    }

    return {
        subject: "Ваш запис підтверджено",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "Ваш запис підтверджено",
        subtitle: "Майстер підтвердив ваш візит",
        intro: "Ваш запис {id} підтверджено.\nВізит зафіксовано у розкладі студії.",
        statusLabel: "Статус: Підтверджено",
        detailsTitle: "Деталі запису",
        labelBookingId: "ID запису",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelMaster: "Майстер",
        labelTime: "Час візиту",
        notice: "Якщо вам потрібно перенести або скасувати запис, зробіть це завчасно.",
        ctaText: "Переглянути запис",
        closing: (studio: string) => `Чекаємо на вас у ${studio} 💅`,
        textLabelBooking: "Запис",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelMaster: "Майстер",
        textLabelTime: "Час",
        textLabelDetails: "Деталі",
    };
}

/**
 * @summary Будує контент email для підтвердження запису.
 * @param {BookingConfirmedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingConfirmedTemplate = (
    data: BookingConfirmedTemplateData,
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
        statusTone: "success",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelMaster, value: data.masterName },
            { label: dict.labelTime, value: startAt },
        ],
        notice: dict.notice,
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
        closing: dict.closing(data.studioName),
    });

    const text = [
        subject,
        greeting,
        `${dict.textLabelBooking}: ${data.bookingId}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelMaster}: ${data.masterName}`,
        `${dict.textLabelTime}: ${startAt}`,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
