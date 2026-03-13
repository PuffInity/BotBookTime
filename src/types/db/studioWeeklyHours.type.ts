export type StudioWeeklyHoursRow = {
    studio_id: string,
    weekday: number,
    is_open: boolean,
    open_time: string | null,
    close_time: string | null,
    created_at: Date,
    updated_at: Date,
}

export type StudioWeeklyHoursEntity = {
    studioId: string,
    weekday: number,
    isOpen: boolean,
    openTime: string | null,
    closeTime: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type StudioWeeklyHoursInsert = {
    studioId: string,
    weekday: number,
    isOpen?: boolean,
    openTime?: string | null,
    closeTime?: string | null,
}

export type StudioWeeklyHoursUpdate = Partial<{
    studioId: string,
    weekday: number,
    isOpen: boolean,
    openTime: string | null,
    closeTime: string | null,
}>
