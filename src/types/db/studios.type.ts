/**
 * @file studios.type.ts
 * @summary Database table type definitions.
 */
export type StudiosRow = {
    id: string,
    name: string,
    city: string | null,
    address_line: string | null,
    phone_e164: string | null,
    email: string | null,
    timezone: string,
    currency_code: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}

export type StudiosEntity = {
    id: string,
    name: string,
    city: string | null,
    addressLine: string | null,
    phoneE164: string | null,
    email: string | null,
    timezone: string,
    currencyCode: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type StudiosInsert = {
    name: string,
    city?: string | null,
    addressLine?: string | null,
    phoneE164?: string | null,
    email?: string | null,
    timezone?: string,
    currencyCode?: string,
    isActive?: boolean,
}

export type StudiosUpdate = Partial<{
    name: string,
    city: string | null,
    addressLine: string | null,
    phoneE164: string | null,
    email: string | null,
    timezone: string,
    currencyCode: string,
    isActive: boolean,
}>
