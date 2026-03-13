export type FaqEntriesRow = {
    id: string,
    studio_id: string,
    sort_order: number,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}

export type FaqEntriesEntity = {
    id: string,
    studioId: string,
    sortOrder: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type FaqEntriesInsert = {
    studioId: string,
    sortOrder: number,
    isActive?: boolean,
}

export type FaqEntriesUpdate = Partial<{
    studioId: string,
    sortOrder: number,
    isActive: boolean,
}>
