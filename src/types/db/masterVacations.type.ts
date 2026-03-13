export type MasterVacationsRow = {
    id: string,
    master_id: string,
    date_from: Date,
    date_to: Date,
    reason: string | null,
    created_by: string | null,
    created_at: Date,
    updated_at: Date,
}

export type MasterVacationsEntity = {
    id: string,
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    reason: string | null,
    createdBy: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type MasterVacationsInsert = {
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    reason?: string | null,
    createdBy?: string | null,
}

export type MasterVacationsUpdate = Partial<{
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    reason: string | null,
    createdBy: string | null,
}>
