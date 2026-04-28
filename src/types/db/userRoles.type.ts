/**
 * @file userRoles.type.ts
 * @summary Database table type definitions.
 */
import type { UserRole } from './dbEnums.type.js';

export type UserRolesRow = {
    user_id: string,
    role: UserRole,
    granted_by: string | null,
    granted_at: Date,
}

export type UserRolesEntity = {
    userId: string,
    role: UserRole,
    grantedBy: string | null,
    grantedAt: Date,
}

export type UserRolesInsert = {
    userId: string,
    role: UserRole,
    grantedBy?: string | null,
    grantedAt?: Date,
}

export type UserRolesUpdate = Partial<{
    userId: string,
    role: UserRole,
    grantedBy: string | null,
    grantedAt: Date,
}>
