/**
 * @file services.type.ts
 * @summary Database table type definitions.
 */
export type ServicesRow = {
    id: string,
    studio_id: string,
    name: string,
    description: string | null,
    duration_minutes: number,
    base_price: string,
    currency_code: string,
    result_description: string | null,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}

export type ServicesEntity = {
    id: string,
    studioId: string,
    name: string,
    description: string | null,
    durationMinutes: number,
    basePrice: string,
    currencyCode: string,
    resultDescription: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type ServicesInsert = {
    studioId: string,
    name: string,
    description?: string | null,
    durationMinutes: number,
    basePrice: string,
    currencyCode?: string,
    resultDescription?: string | null,
    isActive?: boolean,
}

export type ServicesUpdate = Partial<{
    studioId: string,
    name: string,
    description: string | null,
    durationMinutes: number,
    basePrice: string,
    currencyCode: string,
    resultDescription: string | null,
    isActive: boolean,
}>
