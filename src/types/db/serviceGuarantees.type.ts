/**
 * @file serviceGuarantees.type.ts
 * @summary Database table type definitions.
 */
export type ServiceGuaranteesRow = {
    service_id: string,
    guarantee_no: number,
    guarantee_text: string,
    valid_days: number | null,
    created_at: Date,
    updated_at: Date,
}

export type ServiceGuaranteesEntity = {
    serviceId: string,
    guaranteeNo: number,
    guaranteeText: string,
    validDays: number | null,
    createdAt: Date,
    updatedAt: Date,
}

export type ServiceGuaranteesInsert = {
    serviceId: string,
    guaranteeNo: number,
    guaranteeText: string,
    validDays?: number | null,
}

export type ServiceGuaranteesUpdate = Partial<{
    serviceId: string,
    guaranteeNo: number,
    guaranteeText: string,
    validDays: number | null,
}>
