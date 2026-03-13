export type StudioTemporaryHoursRow = {
    id: string,
    studio_id: string,
    date_from: Date,
    date_to: Date,
    weekday: number,
    is_open: boolean,
    open_time: string | null,
    close_time: string | null,
    note: string | null,
    created_by: string | null,
    created_at: Date,
    updated_at: Date,
}

export type StudioTemporaryHoursEntity = {
    id: string,
    studioId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isOpen: boolean,
    openTime: string | null,
    closeTime: string | null,
    note: string | null,
    createdBy: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type StudioTemporaryHoursInsert = {
    studioId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isOpen?: boolean,
    openTime?: string | null,
    closeTime?: string | null,
    note?: string | null,
    createdBy?: string | null,
}

export type StudioTemporaryHoursUpdate = Partial<{
    studioId: string,
    dateFrom: Date,
    dateTo: Date,
    weekday: number,
    isOpen: boolean,
    openTime: string | null,
    closeTime: string | null,
    note: string | null,
    createdBy: string | null,
}>
