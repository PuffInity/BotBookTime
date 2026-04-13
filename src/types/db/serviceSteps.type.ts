/**
 * @file serviceSteps.type.ts
 * @summary Database table type definitions.
 */
export type ServiceStepsRow = {
    service_id: string,
    step_no: number,
    duration_minutes: number,
    title: string,
    description: string,
    created_at: Date,
    updated_at: Date,
}

export type ServiceStepsEntity = {
    serviceId: string,
    stepNo: number,
    durationMinutes: number,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
}

export type ServiceStepsInsert = {
    serviceId: string,
    stepNo: number,
    durationMinutes?: number,
    title: string,
    description: string,
}

export type ServiceStepsUpdate = Partial<{
    serviceId: string,
    stepNo: number,
    durationMinutes: number,
    title: string,
    description: string,
}>
