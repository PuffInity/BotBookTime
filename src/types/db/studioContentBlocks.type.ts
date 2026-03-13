import type { ContentBlockKey, LanguageCode } from './dbEnums.type.js';

export type StudioContentBlocksRow = {
    studio_id: string,
    block_key: ContentBlockKey,
    language: LanguageCode,
    content: string,
    updated_by: string | null,
    updated_at: Date,
}

export type StudioContentBlocksEntity = {
    studioId: string,
    blockKey: ContentBlockKey,
    language: LanguageCode,
    content: string,
    updatedBy: string | null,
    updatedAt: Date,
}

export type StudioContentBlocksInsert = {
    studioId: string,
    blockKey: ContentBlockKey,
    language: LanguageCode,
    content: string,
    updatedBy?: string | null,
}

export type StudioContentBlocksUpdate = Partial<{
    studioId: string,
    blockKey: ContentBlockKey,
    language: LanguageCode,
    content: string,
    updatedBy: string | null,
}>
