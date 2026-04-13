/**
 * @file appointmentReviews.type.ts
 * @summary Database table type definitions.
 */
export type AppointmentReviewsRow = {
    appointment_id: string,
    client_id: string,
    master_id: string,
    rating: number,
    review_text: string | null,
    created_at: Date,
}

export type AppointmentReviewsEntity = {
    appointmentId: string,
    clientId: string,
    masterId: string,
    rating: number,
    reviewText: string | null,
    createdAt: Date,
}

export type AppointmentReviewsInsert = {
    appointmentId: string,
    clientId: string,
    masterId: string,
    rating: number,
    reviewText?: string | null,
}

export type AppointmentReviewsUpdate = Partial<{
    appointmentId: string,
    clientId: string,
    masterId: string,
    rating: number,
    reviewText: string | null,
}>
