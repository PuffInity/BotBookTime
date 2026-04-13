/**
 * @file appointmentStatusHistory.type.ts
 * @summary Database table type definitions.
 */
import type { AppointmentStatus } from './dbEnums.type.js';

export type AppointmentStatusHistoryRow = {
    id: string,
    appointment_id: string,
    old_status: AppointmentStatus | null,
    new_status: AppointmentStatus,
    changed_by: string | null,
    comment: string | null,
    created_at: Date,
}

export type AppointmentStatusHistoryEntity = {
    id: string,
    appointmentId: string,
    oldStatus: AppointmentStatus | null,
    newStatus: AppointmentStatus,
    changedBy: string | null,
    comment: string | null,
    createdAt: Date,
}

export type AppointmentStatusHistoryInsert = {
    appointmentId: string,
    oldStatus?: AppointmentStatus | null,
    newStatus: AppointmentStatus,
    changedBy?: string | null,
    comment?: string | null,
}

export type AppointmentStatusHistoryUpdate = Partial<{
    appointmentId: string,
    oldStatus: AppointmentStatus | null,
    newStatus: AppointmentStatus,
    changedBy: string | null,
    comment: string | null,
}>
