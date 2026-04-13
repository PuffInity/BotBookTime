/**
 * @file masterDaysOff.type.ts
 * @summary Database table type definitions.
 */
export type MasterDaysOffRow = {
    id: string,
    master_id: string,
    off_date: Date,
    reason: string | null,
    created_by: string | null,
    created_at: Date,
}

export type MasterDaysOffEntity = {
    id: string,
    masterId: string,
    offDate: Date,
    reason: string | null,
    createdBy: string | null,
    createdAt: Date,
}

export type MasterDaysOffInsert = {
    masterId: string,
    offDate: Date,
    reason?: string | null,
    createdBy?: string | null,
}

export type MasterDaysOffUpdate = Partial<{
    masterId: string,
    offDate: Date,
    reason: string | null,
    createdBy: string | null,
}>
