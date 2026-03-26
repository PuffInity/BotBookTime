/**
 * @file db-admin-services.types.ts
 * @summary Типи для DB helper модуля "Послуги" в адмін-панелі.
 */

export type AdminEditableServiceRow = {
  id: string;
  studio_id: string;
  name: string;
  result_description: string | null;
};

export type AdminEditableService = {
  id: string;
  studioId: string;
  name: string;
  resultDescription: string | null;
};

export type GetAdminEditableServiceInput = {
  studioId: string | number;
  serviceId: string | number;
};

export type UpdateAdminServiceResultDescriptionInput = {
  studioId: string | number;
  serviceId: string | number;
  resultDescription: string | null;
};
