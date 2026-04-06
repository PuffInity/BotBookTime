import type { MailTemplateLanguage } from "../../types/nodemailer/nodemailer.types.js";

/**
 * @file email-locale.template.ts
 * @summary Локалізаційні helper-и для email-шаблонів.
 */

const LOCALE_BY_LANGUAGE: Record<MailTemplateLanguage, string> = {
  uk: "uk-UA",
  en: "en-US",
  cs: "cs-CZ",
};

export function resolveMailLanguage(language?: MailTemplateLanguage): MailTemplateLanguage {
  if (language === "en" || language === "cs") return language;
  return "uk";
}

export function getLocaleByMailLanguage(language?: MailTemplateLanguage): string {
  return LOCALE_BY_LANGUAGE[resolveMailLanguage(language)];
}

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDateByLanguage(value: Date | string, language?: MailTemplateLanguage): string {
  return asDate(value).toLocaleDateString(getLocaleByMailLanguage(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTimeByLanguage(value: Date | string, language?: MailTemplateLanguage): string {
  return asDate(value).toLocaleTimeString(getLocaleByMailLanguage(language), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeByLanguage(value: Date | string, language?: MailTemplateLanguage): string {
  return asDate(value).toLocaleString(getLocaleByMailLanguage(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

