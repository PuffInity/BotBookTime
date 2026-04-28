/**
 * @file bookingCreated.template.ts
 * @summary Шаблон листа для повідомлення про створений запис.
 */
import type { BookingCreatedTemplateData } from "../../types/nodemailer/nodemailer.types.js";
import { renderEmailLayout } from "./email-layout.template.js";
import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";
import {
    formatDateByLanguage,
    formatDateTimeByLanguage,
    formatTimeByLanguage,
    resolveMailLanguage,
} from "./email-locale.template.js";

function resolveBookingCreatedDictionary(language: MailTemplateLanguage) {
    if (language === "en") {
        return {
            subjectClient: "Your booking has been created and is pending confirmation",
            subjectMaster: "New booking from client",
            subjectAdmin: "New bookings are awaiting confirmation",
            greetingWithName: (name: string) => `Hello, ${name}!`,
            greetingDefault: "Hello!",
            title: "Your booking has been created",
            subtitle: "The booking was successfully created and sent for confirmation",
            intro:
                "Your booking has been successfully created. It is currently awaiting confirmation from the master.\nBelow you can see the details of your appointment.",
            statusLabel: "Status: Pending confirmation",
            detailsTitle: "Booking details",
            labelBookingId: "Booking ID",
            labelStudio: "Studio",
            labelService: "Service",
            labelMaster: "Master",
            labelTime: "Time",
            masterFallback: "Will be assigned",
            notice: "We will notify you as soon as the master confirms the booking or if anything changes.",
            ctaText: "Open booking details",
            closing: (studioName: string) => `Thank you for choosing ${studioName} 💅`,
            textLabelBookingId: "Booking ID",
            textLabelStudio: "Studio",
            textLabelService: "Service",
            textLabelMaster: "Master",
            textLabelTime: "Time",
            textLabelStatus: "Status: Pending confirmation",
            textLabelDetails: "Details",
        };
    }

    if (language === "cs") {
        return {
            subjectClient: "Vaše rezervace byla vytvořena a čeká na potvrzení",
            subjectMaster: "Nová rezervace od klienta",
            subjectAdmin: "Nové rezervace čekají na potvrzení",
            greetingWithName: (name: string) => `Vítejte, ${name}!`,
            greetingDefault: "Vítejte!",
            title: "Vaše rezervace byla vytvořena",
            subtitle: "Rezervace byla úspěšně vytvořena a odeslána ke schválení",
            intro:
                "Vaše rezervace byla úspěšně vytvořena. Nyní čeká na potvrzení od mistra.\nNíže najdete detaily rezervace.",
            statusLabel: "Stav: Čeká na potvrzení",
            detailsTitle: "Detaily rezervace",
            labelBookingId: "ID rezervace",
            labelStudio: "Studio",
            labelService: "Služba",
            labelMaster: "Mistr",
            labelTime: "Čas",
            masterFallback: "Bude přiřazen",
            notice: "Jakmile mistr rezervaci potvrdí nebo se něco změní, dáme vám vědět.",
            ctaText: "Otevřít detail rezervace",
            closing: (studioName: string) => `Děkujeme, že jste si vybrali ${studioName} 💅`,
            textLabelBookingId: "ID rezervace",
            textLabelStudio: "Studio",
            textLabelService: "Služba",
            textLabelMaster: "Mistr",
            textLabelTime: "Čas",
            textLabelStatus: "Stav: Čeká na potvrzení",
            textLabelDetails: "Detail",
        };
    }

    return {
        subjectClient: "Ваш запис створено та очікує підтвердження",
        subjectMaster: "Новий запис від клієнта",
        subjectAdmin: "Нові записи очікують підтвердження",
        greetingWithName: (name: string) => `Вітаємо, ${name}!`,
        greetingDefault: "Вітаємо!",
        title: "Ваш запис створено",
        subtitle: "Запис успішно сформовано та передано на підтвердження",
        intro:
            "Ваш запис було успішно створено. Зараз він очікує підтвердження від майстра.\nНижче ви можете переглянути деталі вашого бронювання.",
        statusLabel: "Статус: Очікує підтвердження",
        detailsTitle: "Деталі запису",
        labelBookingId: "ID запису",
        labelStudio: "Студія",
        labelService: "Послуга",
        labelMaster: "Майстер",
        labelTime: "Час",
        masterFallback: "Буде призначено",
        notice: "Ми повідомимо вас, щойно майстер підтвердить запис або якщо в ньому відбудуться зміни.",
        ctaText: "Відкрити деталі запису",
        closing: (studioName: string) => `Дякуємо, що обрали ${studioName} 💅`,
        textLabelBookingId: "ID запису",
        textLabelStudio: "Студія",
        textLabelService: "Послуга",
        textLabelMaster: "Майстер",
        textLabelTime: "Час",
        textLabelStatus: "Статус: Очікує підтвердження",
        textLabelDetails: "Деталі",
    };
}

function resolveSubject(
    role: BookingCreatedTemplateData["recipientRole"],
    language: MailTemplateLanguage,
): string {
    const dict = resolveBookingCreatedDictionary(language);
    if (role === "master") return dict.subjectMaster;
    if (role === "admin") return dict.subjectAdmin;
    return dict.subjectClient;
}

/**
 * @summary Будує контент email для події створення запису.
 * @param {BookingCreatedTemplateData} data - Дані листа.
 * @returns {{ subject: string; html: string; text: string }}
 */
export const bookingCreatedTemplate = (
    data: BookingCreatedTemplateData,
    languageInput?: MailTemplateLanguage,
) => {
    const language = resolveMailLanguage(languageInput);
    const dict = resolveBookingCreatedDictionary(language);

    const greeting = data.recipientName ? dict.greetingWithName(data.recipientName) : dict.greetingDefault;
    const startAt = formatDateTimeByLanguage(data.startAt, language);
    const subject = resolveSubject(data.recipientRole, language);
    const bookingDate = formatDateByLanguage(data.startAt, language);
    const bookingTime = formatTimeByLanguage(data.startAt, language);
    const masterName = data.masterName ?? dict.masterFallback;

    const html = renderEmailLayout({
        language,
        title: dict.title,
        subtitle: dict.subtitle,
        greeting,
        intro: dict.intro,
        statusLabel: dict.statusLabel,
        statusTone: "warning",
        detailsTitle: dict.detailsTitle,
        detailsRows: [
            { label: dict.labelBookingId, value: data.bookingId },
            { label: dict.labelStudio, value: data.studioName },
            { label: dict.labelService, value: data.serviceName },
            { label: dict.labelMaster, value: masterName },
            { label: dict.labelTime, value: `${bookingDate}, ${bookingTime}` },
        ],
        notice: dict.notice,
        ctaText: data.actionUrl ? dict.ctaText : undefined,
        ctaUrl: data.actionUrl,
        closing: dict.closing(data.studioName),
    });

    const text = [
        subject,
        greeting,
        `${dict.textLabelBookingId}: ${data.bookingId}`,
        `${dict.textLabelStudio}: ${data.studioName}`,
        `${dict.textLabelService}: ${data.serviceName}`,
        `${dict.textLabelMaster}: ${masterName}`,
        `${dict.textLabelTime}: ${startAt}`,
        dict.textLabelStatus,
        data.actionUrl ? `${dict.textLabelDetails}: ${data.actionUrl}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return { subject, html, text };
};
