export type MasterServicesRow = {
    studio_id: string,
    master_id: string,
    service_id: string,
    custom_price: string | null,
    custom_duration_minutes: number | null,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}

export type MasterServicesEntity = {
    studioId: string,
    masterId: string,
    serviceId: string,
    customPrice: string | null,
    customDurationMinutes: number | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type MasterServicesInsert = {
    studioId: string,
    masterId: string,
    serviceId: string,
    customPrice?: string | null,
    customDurationMinutes?: number | null,
    isActive?: boolean,
}

export type MasterServicesUpdate = Partial<{
    studioId: string,
    masterId: string,
    serviceId: string,
    customPrice: string | null,
    customDurationMinutes: number | null,
    isActive: boolean,
}>
