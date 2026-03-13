export type MasterCertificatesRow = {
    id: string,
    master_id: string,
    title: string,
    issuer: string | null,
    issued_on: Date | null,
    expires_on: Date | null,
    document_url: string | null,
    created_at: Date,
    updated_at: Date,
}

export type MasterCertificatesEntity = {
    id: string,
    masterId: string,
    title: string,
    issuer: string | null,
    issuedOn: Date | null,
    expiresOn: Date | null,
    documentUrl: string | null,
    createdAt: Date,
    updatedAt: Date,
}

export type MasterCertificatesInsert = {
    masterId: string,
    title: string,
    issuer?: string | null,
    issuedOn?: Date | null,
    expiresOn?: Date | null,
    documentUrl?: string | null,
}

export type MasterCertificatesUpdate = Partial<{
    masterId: string,
    title: string,
    issuer: string | null,
    issuedOn: Date | null,
    expiresOn: Date | null,
    documentUrl: string | null,
}>
