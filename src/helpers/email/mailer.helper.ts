/**
 * @file mailer.helper.ts
 * @summary uk: Реекспорт mailer helper API.
 * en: Re-export of mailer helper API.
 * cz: Re-export mailer helper API.
 */
export { sendEmail, sendOtpEmail, sendOtpSms, warmupMailer } from '../mailer.helper.js';
export type {
  SendOtpEmailInput,
  SendEmailInput,
  SendEmailResult,
} from '../../types/nodemailer/nodemailer.types.js';
