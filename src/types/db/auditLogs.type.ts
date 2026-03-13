export type AuditLogsRow = {
    id: string,
    actor_user_id: string | null,
    entity_type: string,
    entity_id: string,
    action: string,
    payload: Record<string, unknown>,
    created_at: Date,
}

export type AuditLogsEntity = {
    id: string,
    actorUserId: string | null,
    entityType: string,
    entityId: string,
    action: string,
    payload: Record<string, unknown>,
    createdAt: Date,
}

export type AuditLogsInsert = {
    actorUserId?: string | null,
    entityType: string,
    entityId: string,
    action: string,
    payload?: Record<string, unknown>,
}

export type AuditLogsUpdate = Partial<{
    actorUserId: string | null,
    entityType: string,
    entityId: string,
    action: string,
    payload: Record<string, unknown>,
}>
