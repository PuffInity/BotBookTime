/**
 * @file masterWeeklyHours.type.ts
 * @summary Database table type definitions.
 */
export type MasterWeeklyHoursRow = {
    master_id: string,
    weekday: number,
    is_working: boolean,
    open_time: string | null,
    close_time: string | null,
    created_at: Date,
    updated_at: Date,
}

export type MasterWeeklyHoursEntity = {
    masterId: string,
    weekday: number,
    isWorking: boolean,
    openTime: string | null,
    closeTime: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type MasterWeeklyHoursInsert = {
    masterId: string,
    weekday: number,
    isWorking?: boolean,
    openTime?: string | null,
    closeTime?: string | null,
}

export type MasterWeeklyHoursUpdate = Partial<{
    masterId: string,
    weekday: number,
    isWorking: boolean,
    openTime: string | null,
    closeTime: string | null,
}>
