/**
 * @file dbEnums.type.ts
 * @summary Database table type definitions.
 */
export type LanguageCode = 'uk' | 'en' | 'cs'

export type UserRole = 'client' | 'master' | 'admin'

export type AppointmentStatus = 'pending' | 'confirmed' | 'canceled' | 'completed' | 'transferred'

export type AppointmentSource = 'telegram_bot' | 'admin_panel' | 'master_panel'

export type VerificationChannel = 'sms' | 'email'

export type VerificationPurpose = 'phone_verify' | 'email_verify' | 'phone_change_old' | 'phone_change_new' | 'appointment_cancel' | 'sensitive_action'

export type NotificationType = 'booking_confirmation' | 'status_change' | 'visit_reminder' | 'promo_news'

export type NotificationChannel = 'telegram' | 'sms' | 'email'

export type QueueStatus = 'pending' | 'sent' | 'failed' | 'canceled'

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded'

export type RateLimitSubject = 'user' | 'telegram_user' | 'ip' | 'phone' | 'email'

export type ContentBlockKey = 'about' | 'booking_rules' | 'cancellation_policy' | 'preparation' | 'comfort' | 'guarantee_service' | 'contacts'
