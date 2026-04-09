import { twilioConfig } from '../validator/twilio.schema.js';

/**
 * @file twilio.config.ts
 * @summary Централізований конфіг для Twilio SMS.
 */

export const twilioEnabled = twilioConfig.enabled;
export const twilioAccountSid = twilioConfig.accountSid;
export const twilioAuthToken = twilioConfig.authToken;
export const twilioPhoneNumber = twilioConfig.phoneNumber;
export const twilioMissingFields = twilioConfig.missingFields;

export function isTwilioConfigured(): boolean {
  return twilioEnabled;
}
