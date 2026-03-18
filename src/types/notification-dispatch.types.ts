import type { NotificationType } from './db/dbEnums.type.js';
import type { MailTemplateKey, MailTemplatePayloadMap } from './nodemailer/nodemailer.types.js';
import type { NotificationSettingsState, UserDeliveryProfile } from './db-helpers/db-notification-settings.types.js';

/**
 * @file notification-dispatch.types.ts
 * @summary Типи для маршрутизації і відправки multi-channel сповіщень.
 */

export type NotificationTextPayload = {
  studioName?: string;
  serviceName?: string;
  startAt?: Date | string;
  statusLabel?: string;
  message?: string;
};

export type NotificationEmailPayload = {
  [K in MailTemplateKey]: {
    template: K;
    data: MailTemplatePayloadMap[K];
  };
}[MailTemplateKey];

export type DispatchNotificationInput = {
  userId: string;
  notificationType: NotificationType;
  textPayload?: NotificationTextPayload;
  telegramText?: string;
  email?: NotificationEmailPayload;
  smsText?: string;
  appointmentId?: string | null;
  metadata?: Record<string, unknown>;
};

export type DispatchNotificationPolicyInput = {
  notificationType: NotificationType;
  settings: NotificationSettingsState;
  profile: UserDeliveryProfile;
  wantsEmail: boolean;
  wantsSms: boolean;
};

export type DispatchPolicyChannel = {
  allowed: boolean;
  reason?: string;
};

export type DispatchNotificationPolicy = {
  enabled: boolean;
  telegram: DispatchPolicyChannel;
  email: DispatchPolicyChannel;
  sms: DispatchPolicyChannel;
};

export type ChannelDispatchStatus = 'sent' | 'skipped' | 'failed';

export type ChannelDispatchResult = {
  channel: 'telegram' | 'email' | 'sms';
  status: ChannelDispatchStatus;
  reason?: string;
  details?: Record<string, unknown>;
};

export type DispatchNotificationResult = {
  notificationType: NotificationType;
  enabled: boolean;
  channels: ChannelDispatchResult[];
};
