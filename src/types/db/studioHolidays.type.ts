export type StudioHolidaysRow = {
    id: string,
    studio_id: string,
    holiday_date: Date,
    holiday_name: string,
    created_by: string | null,
    created_at: Date,
}

export type StudioHolidaysEntity = {
    id: string,
    studioId: string,
    holidayDate: Date,
    holidayName: string,
    createdBy: string | null,
    createdAt: Date,
}

export type StudioHolidaysInsert = {
    studioId: string,
    holidayDate: Date,
    holidayName: string,
    createdBy?: string | null,
}

export type StudioHolidaysUpdate = Partial<{
    studioId: string,
    holidayDate: Date,
    holidayName: string,
    createdBy: string | null,
}>
