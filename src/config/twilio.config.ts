import { twilioConfig } from '../validator/twilio.schema.js';

/**
 * @file twilio.config.ts
 * @summary Centralized Twilio SMS config.
 */

// uk: Ознака доступності / en: Feature flag / cz: Feature flag
export const twilioEnabled = twilioConfig.enabled;
// uk: SID акаунта / en: Account SID / cz: SID účtu
export const twilioAccountSid = twilioConfig.accountSid;
// uk: Auth token / en: Auth token / cz: Auth token
export const twilioAuthToken = twilioConfig.authToken;
// uk: Номер відправника / en: Sender number / cz: Odesílací číslo
export const twilioPhoneNumber = twilioConfig.phoneNumber;
// uk: Відсутні поля / en: Missing fields / cz: Chybějící pole
export const twilioMissingFields = twilioConfig.missingFields;

/**
 * uk: Перевірка готовності Twilio.
 * en: Checks Twilio readiness.
 * cz: Kontrola připravenosti Twilio.
 * @returns uk/en/cz: Готовий/Ready/Připraven.
 */
export function isTwilioConfigured(): boolean {
  return twilioEnabled;
}
