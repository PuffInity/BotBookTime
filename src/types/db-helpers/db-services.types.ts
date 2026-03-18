import type {
  ServiceGuaranteesEntity,
  ServiceStepsEntity,
  ServicesEntity,
} from '../db/index.js';

/**
 * @file db-services.types.ts
 * @summary Типи для DB helper модуля каталогу послуг.
 */

export type ServicesCatalogItem = Pick<
  ServicesEntity,
  | 'id'
  | 'studioId'
  | 'name'
  | 'description'
  | 'durationMinutes'
  | 'basePrice'
  | 'currencyCode'
  | 'resultDescription'
  | 'isActive'
>;

export type ServicesCatalogDetails = {
  service: ServicesCatalogItem;
  steps: ServiceStepsEntity[];
  guarantees: ServiceGuaranteesEntity[];
};

export type ListServicesCatalogInput = {
  studioId?: string | null;
  limit?: number;
};

export type GetServiceCatalogDetailsInput = {
  serviceId: string | number;
  studioId?: string | null;
};

