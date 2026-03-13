import type { NotificationType, NotificationChannel, QueueStatus } from './dbEnums.type.js';

export type NotificationQueueRow = {
    id: string,
    user_id: string,
    appointment_id: string | null,
    notification_type: NotificationType,
    channel: NotificationChannel,
    status: QueueStatus,
    payload: Record<string, unknown>,
    scheduled_for: Date,
    sent_at: Date | null,
    attempts: number,
    last_error: string | null,
    created_at: Date,
    updated_at: Date,
}

export type NotificationQueueEntity = {
    id: string,
    userId: string,
    appointmentId: string | null,
    notificationType: NotificationType,
    channel: NotificationChannel,
    status: QueueStatus,
    payload: Record<string, unknown>,
    scheduledFor: Date,
    sentAt: Date | null,
    attempts: number,
    lastError: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type NotificationQueueInsert = {
    userId: string,
    appointmentId?: string | null,
    notificationType: NotificationType,
    channel?: NotificationChannel,
    status?: QueueStatus,
    payload?: Record<string, unknown>,
    scheduledFor: Date,
    sentAt?: Date | null,
    attempts?: number,
    lastError?: string | null,
}

export type NotificationQueueUpdate = Partial<{
    userId: string,
    appointmentId: string | null,
    notificationType: NotificationType,
    channel: NotificationChannel,
    status: QueueStatus,
    payload: Record<string, unknown>,
    scheduledFor: Date,
    sentAt: Date | null,
    attempts: number,
    lastError: string | null,
}>
