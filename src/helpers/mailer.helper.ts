import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import twilio from "twilio";
import { ExternalServiceError, handleError } from "../utils/error.utils.js";
import { loggerMailer } from "../utils/logger/loggers-list.js";
import { defaultMailFrom, nodemailerConfig } from "../config/nodemailer.config.js";
import {
    isTwilioConfigured,
    twilioAccountSid,
    twilioAuthToken,
    twilioMissingFields,
    twilioPhoneNumber,
} from "../config/twilio.config.js";
import {
    bookingCreatedTemplate,
} from "../emails/templates/bookingCreated.template.js";
import {
    bookingConfirmedTemplate,
} from "../emails/templates/bookingConfirmed.template.js";
import {
    bookingRescheduledTemplate,
} from "../emails/templates/bookingRescheduled.template.js";
import {
    bookingCancelledTemplate,
} from "../emails/templates/bookingCancelled.template.js";
import {
    masterChangedTemplate,
} from "../emails/templates/masterChanged.template.js";
import {
    reminderTemplate,
} from "../emails/templates/reminder.template.js";
import {
    marketingTemplate,
} from "../emails/templates/marketing.template.js";
import {
    otpEmailTemplate,
} from "../emails/templates/otpEmail.template.js";
import type {
    MailTemplateResult,
    MailTemplatePayloadMap,
    MailTemplateKey,
    SendEmailInput,
    SendEmailResult,
    OtpChannel,
    OtpEmailPurpose,
    OtpSmsPurpose,
    OtpGuardDecision,
    OtpGuardStore,
    OtpPolicy,
    SendOtpEmailInput,
    SendOtpSmsInput,
    MailTemplateLanguage,
} from "../types/nodemailer/nodemailer.types.js";

export type {
    MailTemplateResult,
    MailTemplatePayloadMap,
    MailTemplateKey,
    SendEmailInput,
    SendEmailResult,
    OtpChannel,
    OtpEmailPurpose,
    OtpSmsPurpose,
    OtpGuardDecision,
    OtpGuardStore,
    OtpPolicy,
    SendOtpEmailInput,
    SendOtpSmsInput,
    MailTemplateLanguage,
} from "../types/nodemailer/nodemailer.types.js";

/**
 * @file mailer.helper.ts
 * @summary Універсальний production-ready helper для email-сповіщень і OTP-потоку.
 */

type TemplateRegistry = {
    [K in MailTemplateKey]: (
        data: MailTemplatePayloadMap[K],
        language?: MailTemplateLanguage,
    ) => MailTemplateResult;
};

const templateRegistry: TemplateRegistry = {
    bookingCreated: bookingCreatedTemplate,
    bookingConfirmed: bookingConfirmedTemplate,
    bookingRescheduled: bookingRescheduledTemplate,
    bookingCancelled: bookingCancelledTemplate,
    masterChanged: masterChangedTemplate,
    reminder: reminderTemplate,
    marketing: marketingTemplate,
    otpEmail: otpEmailTemplate,
};

let transporter: Transporter | null = null;
let transporterVerified = false;

/**
 * @summary Повертає singleton transporter Nodemailer.
 * @returns {Transporter}
 */
export const getMailerTransporter = (): Transporter => {
    if (transporter) return transporter;
    transporter = nodemailer.createTransport(nodemailerConfig);

    return transporter;
};

/**
 * @summary Перевіряє з'єднання SMTP. Можна викликати на bootstrap.
 * @returns {Promise<void>}
 */
export const warmupMailer = async (): Promise<void> => {
    if (transporterVerified) return;

    try {
        await getMailerTransporter().verify();
        transporterVerified = true;
        loggerMailer.info("[mailer] SMTP transporter verified");
    } catch (error) {
        handleError({
            logger: loggerMailer,
            scope: "mailer",
            action: "SMTP verify failed",
            error,
        });
        throw error;
    }
};

/**
 * @summary Універсальна відправка email по template key.
 * @param {SendEmailInput<K>} input - Налаштування листа.
 * @returns {Promise<SendEmailResult>}
 */
export async function sendEmail<K extends MailTemplateKey>(
    input: SendEmailInput<K>,
): Promise<SendEmailResult> {
    const { to, template, data, cc, bcc, replyTo, attachments, headers, language } = input;

    try {
        const renderer = templateRegistry[template];
        const rendered = renderer(data as MailTemplatePayloadMap[K], language);

        const mail: SendMailOptions = {
            from: input.from ?? defaultMailFrom,
            to,
            cc,
            bcc,
            replyTo,
            attachments,
            headers,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
        };

        const info = await getMailerTransporter().sendMail(mail);
        loggerMailer.info("[mailer] Email sent", {
            template,
            language: language ?? 'uk',
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        });

        return {
            messageId: info.messageId,
            accepted: info.accepted.map(String),
            rejected: info.rejected.map(String),
        };
    } catch (error) {
        handleError({
            logger: loggerMailer,
            scope: "mailer",
            action: "sendEmail failed",
            error,
            meta: { template, to, language: language ?? 'uk' },
        });
        throw error;
    }
}

type InMemoryOtpState = {
    lastSentAt?: number;
    attempts: number;
    blockedUntil?: number;
};

/**
 * @summary Тимчасова in-memory реалізація OTP-захисту.
 * @remarks Для масштабування між інстансами потрібно замінити на Redis.
 */
export class InMemoryOtpGuardStore implements OtpGuardStore {
    private readonly state = new Map<string, InMemoryOtpState>();

    private getState(key: string): InMemoryOtpState {
        const found = this.state.get(key);
        if (found) return found;
        const initial: InMemoryOtpState = { attempts: 0 };
        this.state.set(key, initial);
        return initial;
    }

    async checkResendLimit(subjectKey: string, cooldownSec: number): Promise<OtpGuardDecision> {
        const now = Date.now();
        const state = this.getState(subjectKey);

        if (state.blockedUntil && state.blockedUntil > now) {
            return {
                allowed: false,
                reason: "BLOCKED",
                blockedUntil: new Date(state.blockedUntil),
                retryAfterSec: Math.ceil((state.blockedUntil - now) / 1000),
            };
        }

        if (state.lastSentAt) {
            const diffMs = now - state.lastSentAt;
            const cooldownMs = cooldownSec * 1000;
            if (diffMs < cooldownMs) {
                return {
                    allowed: false,
                    reason: "RESEND_LIMIT",
                    retryAfterSec: Math.ceil((cooldownMs - diffMs) / 1000),
                };
            }
        }

        return { allowed: true };
    }

    async registerAttempt(
        subjectKey: string,
        maxAttempts: number,
        blockMinutes: number,
    ): Promise<OtpGuardDecision> {
        const now = Date.now();
        const state = this.getState(subjectKey);

        if (state.blockedUntil && state.blockedUntil > now) {
            return {
                allowed: false,
                reason: "BLOCKED",
                blockedUntil: new Date(state.blockedUntil),
                retryAfterSec: Math.ceil((state.blockedUntil - now) / 1000),
            };
        }

        state.attempts += 1;

        if (state.attempts > maxAttempts) {
            state.attempts = 0;
            state.blockedUntil = now + blockMinutes * 60 * 1000;
            return {
                allowed: false,
                reason: "BLOCKED",
                blockedUntil: new Date(state.blockedUntil),
                retryAfterSec: Math.ceil((state.blockedUntil - now) / 1000),
            };
        }

        return { allowed: true };
    }

    async resetAttempts(subjectKey: string): Promise<void> {
        const state = this.getState(subjectKey);
        state.attempts = 0;
        state.blockedUntil = undefined;
    }

    async markOtpSent(subjectKey: string): Promise<void> {
        const state = this.getState(subjectKey);
        state.lastSentAt = Date.now();
    }
}

const otpGuardStore: OtpGuardStore = new InMemoryOtpGuardStore();

/**
 * @summary Дозволяє підмінити OTP guard storage (наприклад на Redis).
 * @param {OtpGuardStore} store - Реалізація storage.
 */
export const setOtpGuardStore = (store: OtpGuardStore): void => {
    otpGuardStoreRef.current = store;
};

const otpGuardStoreRef: { current: OtpGuardStore } = { current: otpGuardStore };

const defaultOtpPolicy: OtpPolicy = {
    resendCooldownSec: 60,
    maxAttempts: 5,
    blockMinutes: 5,
};

/**
 * @summary Відправляє OTP на email з перевіркою resend-limit.
 * @param {SendOtpEmailInput} input - Дані OTP.
 * @returns {Promise<SendEmailResult>}
 */
export const sendOtpEmail = async (input: SendOtpEmailInput): Promise<SendEmailResult> => {
    const policy: OtpPolicy = { ...defaultOtpPolicy, ...input.policy };
    const subjectKey = `otp:email:${input.to}:${input.purpose}`;

    const resendCheck = await otpGuardStoreRef.current.checkResendLimit(
        subjectKey,
        policy.resendCooldownSec,
    );
    if (!resendCheck.allowed) {
        throw new Error(
            `OTP resend is limited. Retry after ${resendCheck.retryAfterSec ?? 0} seconds.`,
        );
    }

    await otpGuardStoreRef.current.markOtpSent(subjectKey);
    return sendEmail({
        to: input.to,
        template: "otpEmail",
        language: input.language,
        data: {
            code: input.code,
            purpose: input.purpose,
            recipientName: input.recipientName,
            expiresInMinutes: input.expiresInMinutes,
        },
    });
};

/**
 * @summary Інтерфейс SMS відправника для майбутньої інтеграції.
 */
export interface SmsSender {
    sendSms(input: { to: string; text: string }): Promise<void>;
}

export class TwilioSmsSender implements SmsSender {
    private client: ReturnType<typeof twilio> | null = null;

    private getClient(): ReturnType<typeof twilio> {
        if (!isTwilioConfigured() || !twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            throw new ExternalServiceError(
                "Phone verification is temporarily unavailable",
                {
                    provider: "twilio",
                    reason: "not_configured",
                    missingFields: twilioMissingFields,
                },
            );
        }

        if (!this.client) {
            this.client = twilio(twilioAccountSid, twilioAuthToken);
        }

        return this.client;
    }

    async sendSms(input: { to: string; text: string }): Promise<void> {
        try {
            const client = this.getClient();
            await client.messages.create({
                body: input.text,
                from: twilioPhoneNumber ?? undefined,
                to: input.to,
            });
            loggerMailer.info("[sms] SMS sent", { to: input.to });
        } catch (error) {
            handleError({
                logger: loggerMailer,
                scope: "sms",
                action: "sendSms failed",
                error,
                meta: { to: input.to },
            });
            throw error;
        }
    }
}

let smsSender: SmsSender = new TwilioSmsSender();

/**
 * @summary Дозволяє підмінити SMS sender на реальну реалізацію.
 * @param {SmsSender} sender - Реальний SMS-відправник.
 */
export const setSmsSender = (sender: SmsSender): void => {
    smsSender = sender;
};

/**
 * @summary Відправляє OTP через SMS з перевіркою resend-limit.
 * @param {SendOtpSmsInput} input - Дані OTP.
 * @returns {Promise<void>}
 */
export const sendOtpSms = async (input: SendOtpSmsInput): Promise<void> => {
    const policy: OtpPolicy = { ...defaultOtpPolicy, ...input.policy };
    const subjectKey = `otp:sms:${input.to}:${input.purpose}`;

    const resendCheck = await otpGuardStoreRef.current.checkResendLimit(
        subjectKey,
        policy.resendCooldownSec,
    );
    if (!resendCheck.allowed) {
        throw new Error(
            `OTP resend is limited. Retry after ${resendCheck.retryAfterSec ?? 0} seconds.`,
        );
    }

    await otpGuardStoreRef.current.markOtpSent(subjectKey);
    await smsSender.sendSms({
        to: input.to,
        text: `Your OTP code: ${input.code}`,
    });
};

/**
 * @summary Реєструє спробу перевірки OTP (ліміт спроб + блок на 5 хв).
 * @param input Вхідні дані для контролю спроб.
 * @returns {Promise<OtpGuardDecision>}
 */
export const registerOtpVerificationAttempt = async (input: {
    channel: OtpChannel;
    subject: string;
    purpose: OtpEmailPurpose | OtpSmsPurpose;
    policy?: Partial<OtpPolicy>;
}): Promise<OtpGuardDecision> => {
    const policy: OtpPolicy = { ...defaultOtpPolicy, ...input.policy };
    const subjectKey = `otp:verify:${input.channel}:${input.subject}:${input.purpose}`;

    return otpGuardStoreRef.current.registerAttempt(
        subjectKey,
        policy.maxAttempts,
        policy.blockMinutes,
    );
};

/**
 * @summary Скидає лічильник спроб OTP після успішної верифікації.
 * @param input Вхідні дані ідентифікації OTP-контексту.
 * @returns {Promise<void>}
 */
export const resetOtpVerificationAttempts = async (input: {
    channel: OtpChannel;
    subject: string;
    purpose: OtpEmailPurpose | OtpSmsPurpose;
}): Promise<void> => {
    const subjectKey = `otp:verify:${input.channel}:${input.subject}:${input.purpose}`;
    await otpGuardStoreRef.current.resetAttempts(subjectKey);
};
