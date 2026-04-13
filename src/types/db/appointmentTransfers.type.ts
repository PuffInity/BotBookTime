/**
 * @file appointmentTransfers.type.ts
 * @summary Database table type definitions.
 */
export type AppointmentTransfersRow = {
    id: string,
    from_appointment_id: string,
    to_appointment_id: string,
    transferred_by: string | null,
    reason: string | null,
    created_at: Date,
}

export type AppointmentTransfersEntity = {
    id: string,
    fromAppointmentId: string,
    toAppointmentId: string,
    transferredBy: string | null,
    reason: string | null,
    createdAt: Date,
}

export type AppointmentTransfersInsert = {
    fromAppointmentId: string,
    toAppointmentId: string,
    transferredBy?: string | null,
    reason?: string | null,
}

export type AppointmentTransfersUpdate = Partial<{
    fromAppointmentId: string,
    toAppointmentId: string,
    transferredBy: string | null,
    reason: string | null,
}>
