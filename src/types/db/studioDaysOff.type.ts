export type StudioDaysOffRow = {
    id: string,
    studio_id: string,
    off_date: Date,
    reason: string | null,
    created_by: string | null,
    created_at: Date,
}

export type StudioDaysOffEntity = {
    id: string,
    studioId: string,
    offDate: Date,
    reason: string | null,
    createdBy: string | null,
    createdAt: Date,
}

export type StudioDaysOffInsert = {
    studioId: string,
    offDate: Date,
    reason?: string | null,
    createdBy?: string | null,
}

export type StudioDaysOffUpdate = Partial<{
    studioId: string,
    offDate: Date,
    reason: string | null,
    createdBy: string | null,
}>
