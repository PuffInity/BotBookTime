export type MasterTemporaryHoursRow = {
    id: string,
    master_id: string,
    date_from: Date,
    date_to: Date,
    weekday: number,
    is_working: boolean,
    open_time: string | null,
    close_time: string | null,
    note: string | null,
    created_by: string | null,
    created_at: Date,
    updated_at: Date,
}

export type MasterTemporaryHoursEntity = {
    id: string,
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isWorking: boolean,
    openTime: string | null,
    closeTime: string | null,
    note: string | null,
    createdBy: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type MasterTemporaryHoursInsert = {
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isWorking?: boolean,
    openTime?: string | null,
    closeTime?: string | null,
    note?: string | null,
    createdBy?: string | null,
}

export type MasterTemporaryHoursUpdate = Partial<{
    masterId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isWorking: boolean,
    openTime: string | null,
    closeTime: string | null,
    note: string | null,
    createdBy: string | null,
}>
