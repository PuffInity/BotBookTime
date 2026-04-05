import type { SendMailOptions } from "nodemailer";
import type { LanguageCode } from "../db/dbEnums.type.js";

/**
 * @file nodemailer.types.ts
 * @summary Типи для mailer helper, шаблонів email та OTP-потоку.
 */

export type MailTemplateResult = {
    subject: string;
    html: string;
    text: string;
};

export type MailTemplateLanguage = LanguageCode;

export type BookingCreatedTemplateData = {
    recipientName?: string;
    recipientRole?: "client" | "master" | "admin";
    bookingId: string;
    studioName: string;
    serviceName: string;
    masterName?: string;
    startAt: Date | string;
    actionUrl?: string;
};

export type BookingConfirmedTemplateData = {
    recipientName?: string;
    bookingId: string;
    serviceName: string;
    masterName: string;
    startAt: Date | string;
    studioName: string;
    actionUrl?: string;
};

export type BookingRescheduledTemplateData = {
    recipientName?: string;
    bookingId: string;
    oldStartAt: Date | string;
    newStartAt: Date | string;
    serviceName: string;
    masterName?: string;
    studioName: string;
    actionUrl?: string;
};

export type BookingCancelledTemplateData = {
    recipientName?: string;
    bookingId: string;
    serviceName: string;
    masterName?: string;
    startAt: Date | string;
    cancelReason?: string;
    studioName: string;
    actionUrl?: string;
};

export type MasterChangedTemplateData = {
    recipientName?: string;
    bookingId: string;
    serviceName: string;
    oldMasterName: string;
    newMasterName: string;
    startAt: Date | string;
    studioName: string;
    actionUrl?: string;
};

export type ReminderTemplateData = {
    recipientName?: string;
    bookingId: string;
    studioName: string;
    serviceName: string;
    masterName?: string;
    startAt: Date | string;
    hoursBefore: number;
    actionUrl?: string;
};

export type MarketingTemplateData = {
    recipientName?: string;
    title: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
    unsubscribeUrl?: string;
};

export type OtpEmailPurpose = "email_verify" | "email_change";

export type OtpEmailTemplateData = {
    recipientName?: string;
    code: string;
    purpose: OtpEmailPurpose;
    expiresInMinutes: number;
};

export type MailTemplatePayloadMap = {
    bookingCreated: BookingCreatedTemplateData;
    bookingConfirmed: BookingConfirmedTemplateData;
    bookingRescheduled: BookingRescheduledTemplateData;
    bookingCancelled: BookingCancelledTemplateData;
    masterChanged: MasterChangedTemplateData;
    reminder: ReminderTemplateData;
    marketing: MarketingTemplateData;
    otpEmail: OtpEmailTemplateData;
};

export type MailTemplateKey = keyof MailTemplatePayloadMap;

export type SendEmailInput<K extends MailTemplateKey = MailTemplateKey> = {
    to: string | string[];
    template: K;
    data: MailTemplatePayloadMap[K];
    language?: MailTemplateLanguage;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: SendMailOptions["attachments"];
    headers?: Record<string, string>;
};

export type SendEmailResult = {
    messageId: string;
    accepted: string[];
    rejected: string[];
};

export type OtpChannel = "email" | "sms";

export type OtpSmsPurpose =
    | "appointment_cancel_confirm"
    | "phone_verify"
    | "phone_change_new";

export type OtpGuardDecision = {
    allowed: boolean;
    retryAfterSec?: number;
    blockedUntil?: Date;
    reason?: "RESEND_LIMIT" | "BLOCKED";
};

export interface OtpGuardStore {
    checkResendLimit(subjectKey: string, cooldownSec: number): Promise<OtpGuardDecision>;
    registerAttempt(subjectKey: string, maxAttempts: number, blockMinutes: number): Promise<OtpGuardDecision>;
    resetAttempts(subjectKey: string): Promise<void>;
    markOtpSent(subjectKey: string): Promise<void>;
}

export type OtpPolicy = {
    resendCooldownSec: number;
    maxAttempts: number;
    blockMinutes: number;
};

export type SendOtpEmailInput = {
    to: string;
    code: string;
    purpose: OtpEmailPurpose;
    language?: MailTemplateLanguage;
    recipientName?: string;
    expiresInMinutes: number;
    policy?: Partial<OtpPolicy>;
};

export type SendOtpSmsInput = {
    to: string;
    code: string;
    purpose: OtpSmsPurpose;
    policy?: Partial<OtpPolicy>;
};
