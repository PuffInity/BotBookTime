/**
 * @file appointmentFinancials.type.ts
 * @summary Database table type definitions.
 */
import type { PaymentStatus } from './dbEnums.type.js';

export type AppointmentFinancialsRow = {
    appointment_id: string,
    payment_status: PaymentStatus,
    amount_total: string,
    amount_paid: string,
    salon_share_amount: string,
    master_share_amount: string,
    paid_at: Date | null,
    payment_method: string | null,
    created_at: Date,
    updated_at: Date,
}

export type AppointmentFinancialsEntity = {
    appointmentId: string,
    paymentStatus: PaymentStatus,
    amountTotal: string,
    amountPaid: string,
    salonShareAmount: string,
    masterShareAmount: string,
    paidAt: Date | null,
    paymentMethod: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type AppointmentFinancialsInsert = {
    appointmentId: string,
    paymentStatus?: PaymentStatus,
    amountTotal: string,
    amountPaid?: string,
    salonShareAmount?: string,
    masterShareAmount?: string,
    paidAt?: Date | null,
    paymentMethod?: string | null,
}

export type AppointmentFinancialsUpdate = Partial<{
    appointmentId: string,
    paymentStatus: PaymentStatus,
    amountTotal: string,
    amountPaid: string,
    salonShareAmount: string,
    masterShareAmount: string,
    paidAt: Date | null,
    paymentMethod: string | null,
}>
