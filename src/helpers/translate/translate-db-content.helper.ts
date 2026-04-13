import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import type { ServicesCatalogDetails, ServicesCatalogItem } from '../../types/db-helpers/db-services.types.js';
import type { MasterCatalogDetails } from '../../types/db-helpers/db-masters.types.js';
import type { FaqCatalogItem } from '../../types/db-helpers/db-faq.types.js';
import type { ProfileBookingStatusData, ProfileBookingStatusItem } from '../../types/db-helpers/db-profile-booking.types.js';
import type { MasterServiceBookingMeta } from '../../types/db-helpers/db-booking.types.js';
import type {
  MasterBookingsFeedPage,
  MasterPendingBookingItem,
} from '../../types/db-helpers/db-master-bookings.types.js';
import type {
  MasterOwnProfileCertificateManageItem,
  MasterOwnProfileData,
  MasterOwnProfileServiceManageItem,
} from '../../types/db-helpers/db-master-profile.types.js';
import type { MasterClientBookingsHistoryItem } from '../../types/db-helpers/db-master-clients.types.js';
import type { MasterPanelStatsData } from '../../types/db-helpers/db-master-stats.types.js';
import type { MasterPanelFinanceData } from '../../types/db-helpers/db-master-finance.types.js';
import type { MasterPanelScheduleData } from '../../types/db-helpers/db-master-schedule.types.js';
import { translateTextWithCache } from './translate-provider.helper.js';

/**
 * @file translate-db-content.helper.ts
 * @summary Runtime-переклад контенту з БД (послуги/майстри/FAQ/бронювання) з memo в межах запиту.
 */

type TranslateMemo = Map<string, Promise<string>>;

type TranslateTextParams = {
  text: string;
  targetLanguage: LanguageCode;
  sourceLanguage?: LanguageCode;
  scope: string;
  memo: TranslateMemo;
};

/**
 * uk: Внутрішня helper функція buildMemoKey.
 * en: Internal helper function buildMemoKey.
 * cz: Interní helper funkce buildMemoKey.
 */
function buildMemoKey(input: {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}): string {
  return `${input.sourceLanguage}:${input.targetLanguage}:${input.text}`;
}

/**
 * uk: Внутрішня helper функція translateTextRuntime.
 * en: Internal helper function translateTextRuntime.
 * cz: Interní helper funkce translateTextRuntime.
 */
async function translateTextRuntime(params: TranslateTextParams): Promise<string> {
  const raw = params.text;
  const text = raw.trim();
  if (!text) return raw;

  const sourceLanguage = params.sourceLanguage ?? 'uk';
  const key = buildMemoKey({
    text,
    sourceLanguage,
    targetLanguage: params.targetLanguage,
  });

  const existing = params.memo.get(key);
  if (existing) {
    return existing;
  }

  const translationPromise = translateTextWithCache({
    text,
    sourceLanguage,
    targetLanguage: params.targetLanguage,
    scope: params.scope,
  }).then((result) => result.text);

  params.memo.set(key, translationPromise);
  return translationPromise;
}

/**
 * uk: Внутрішня helper функція translateOptionalText.
 * en: Internal helper function translateOptionalText.
 * cz: Interní helper funkce translateOptionalText.
 */
async function translateOptionalText(input: {
  value: string | null;
  sourceLanguage?: LanguageCode;
  targetLanguage: LanguageCode;
  scope: string;
  memo: TranslateMemo;
}): Promise<string | null> {
  if (input.value == null) return null;

  return translateTextRuntime({
    text: input.value,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    scope: input.scope,
    memo: input.memo,
  });
}

/**
 * uk: Публічна helper функція translateServicesCatalogItems.
 * en: Public helper function translateServicesCatalogItems.
 * cz: Veřejná helper funkce translateServicesCatalogItems.
 */
export async function translateServicesCatalogItems(
  items: ServicesCatalogItem[],
  targetLanguage: LanguageCode,
): Promise<ServicesCatalogItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      name: await translateTextRuntime({
        text: item.name,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'services-catalog:item-name',
        memo,
      }),
      description: await translateOptionalText({
        value: item.description,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'services-catalog:item-description',
        memo,
      }),
      resultDescription: await translateOptionalText({
        value: item.resultDescription,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'services-catalog:item-result-description',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateServicesCatalogDetails.
 * en: Public helper function translateServicesCatalogDetails.
 * cz: Veřejná helper funkce translateServicesCatalogDetails.
 */
export async function translateServicesCatalogDetails(
  details: ServicesCatalogDetails,
  targetLanguage: LanguageCode,
): Promise<ServicesCatalogDetails> {
  const memo: TranslateMemo = new Map();

  const [serviceName, serviceDescription, serviceResultDescription] = await Promise.all([
    translateTextRuntime({
      text: details.service.name,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'service-details:name',
      memo,
    }),
    translateOptionalText({
      value: details.service.description,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'service-details:description',
      memo,
    }),
    translateOptionalText({
      value: details.service.resultDescription,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'service-details:result-description',
      memo,
    }),
  ]);

  const steps = await Promise.all(
    details.steps.map(async (step) => ({
      ...step,
      title: await translateTextRuntime({
        text: step.title,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'service-details:step-title',
        memo,
      }),
      description: await translateTextRuntime({
        text: step.description,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'service-details:step-description',
        memo,
      }),
    })),
  );

  const guarantees = await Promise.all(
    details.guarantees.map(async (guarantee) => ({
      ...guarantee,
      guaranteeText: await translateTextRuntime({
        text: guarantee.guaranteeText,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'service-details:guarantee-text',
        memo,
      }),
    })),
  );

  return {
    ...details,
    service: {
      ...details.service,
      name: serviceName,
      description: serviceDescription,
      resultDescription: serviceResultDescription,
    },
    steps,
    guarantees,
  };
}

/**
 * uk: Публічна helper функція translateMasterCatalogDetails.
 * en: Public helper function translateMasterCatalogDetails.
 * cz: Veřejná helper funkce translateMasterCatalogDetails.
 */
export async function translateMasterCatalogDetails(
  details: MasterCatalogDetails,
  targetLanguage: LanguageCode,
): Promise<MasterCatalogDetails> {
  const memo: TranslateMemo = new Map();

  const [bio, materialsInfo] = await Promise.all([
    translateOptionalText({
      value: details.master.bio,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'master-details:bio',
      memo,
    }),
    translateOptionalText({
      value: details.materialsInfo,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'master-details:materials',
      memo,
    }),
  ]);

  const specializations = await Promise.all(
    details.specializations.map(async (item) => ({
      ...item,
      serviceName: await translateTextRuntime({
        text: item.serviceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-details:specialization-service-name',
        memo,
      }),
    })),
  );

  const certificates = await Promise.all(
    details.certificates.map(async (item) => ({
      ...item,
      title: await translateTextRuntime({
        text: item.title,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-details:certificate-title',
        memo,
      }),
      issuer: await translateOptionalText({
        value: item.issuer,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-details:certificate-issuer',
        memo,
      }),
    })),
  );

  const upcomingScheduleExceptions = await Promise.all(
    details.upcomingScheduleExceptions.map(async (item) => {
      if (item.type === 'day_off') {
        return {
          ...item,
          reason: await translateOptionalText({
            value: item.reason,
            targetLanguage,
            sourceLanguage: 'uk',
            scope: 'master-details:day-off-reason',
            memo,
          }),
        };
      }

      if (item.type === 'vacation') {
        return {
          ...item,
          reason: await translateOptionalText({
            value: item.reason,
            targetLanguage,
            sourceLanguage: 'uk',
            scope: 'master-details:vacation-reason',
            memo,
          }),
        };
      }

      return {
        ...item,
        note: await translateOptionalText({
          value: item.note,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-details:temporary-note',
          memo,
        }),
      };
    }),
  );

  return {
    ...details,
    master: {
      ...details.master,
      bio,
    },
    materialsInfo: materialsInfo ?? null,
    specializations,
    certificates,
    upcomingScheduleExceptions,
  };
}

/**
 * uk: Публічна helper функція translateFaqCatalogItems.
 * en: Public helper function translateFaqCatalogItems.
 * cz: Veřejná helper funkce translateFaqCatalogItems.
 */
export async function translateFaqCatalogItems(
  items: FaqCatalogItem[],
  targetLanguage: LanguageCode,
): Promise<FaqCatalogItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      question: await translateTextRuntime({
        text: item.question,
        sourceLanguage: item.language,
        targetLanguage,
        scope: 'faq:item-question',
        memo,
      }),
      answer: await translateTextRuntime({
        text: item.answer,
        sourceLanguage: item.language,
        targetLanguage,
        scope: 'faq:item-answer',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateFaqCatalogItem.
 * en: Public helper function translateFaqCatalogItem.
 * cz: Veřejná helper funkce translateFaqCatalogItem.
 */
export async function translateFaqCatalogItem(
  item: FaqCatalogItem,
  targetLanguage: LanguageCode,
): Promise<FaqCatalogItem> {
  const translated = await translateFaqCatalogItems([item], targetLanguage);
  return translated[0];
}

/**
 * uk: Публічна helper функція translateBookingMetaForUser.
 * en: Public helper function translateBookingMetaForUser.
 * cz: Veřejná helper funkce translateBookingMetaForUser.
 */
export async function translateBookingMetaForUser(
  meta: MasterServiceBookingMeta,
  targetLanguage: LanguageCode,
): Promise<MasterServiceBookingMeta> {
  const memo: TranslateMemo = new Map();

  return {
    ...meta,
    studioName: await translateTextRuntime({
      text: meta.studioName,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'booking:studio-name',
      memo,
    }),
    serviceName: await translateTextRuntime({
      text: meta.serviceName,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'booking:service-name',
      memo,
    }),
  };
}

/**
 * uk: Внутрішня helper функція translateProfileBookingStatusItem.
 * en: Internal helper function translateProfileBookingStatusItem.
 * cz: Interní helper funkce translateProfileBookingStatusItem.
 */
async function translateProfileBookingStatusItem(
  item: ProfileBookingStatusItem,
  targetLanguage: LanguageCode,
  memo: TranslateMemo,
): Promise<ProfileBookingStatusItem> {
  return {
    ...item,
    studioName: await translateTextRuntime({
      text: item.studioName,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'profile-booking:studio-name',
      memo,
    }),
    serviceName: await translateTextRuntime({
      text: item.serviceName,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'profile-booking:service-name',
      memo,
    }),
  };
}

/**
 * uk: Публічна helper функція translateProfileBookingStatusData.
 * en: Public helper function translateProfileBookingStatusData.
 * cz: Veřejná helper funkce translateProfileBookingStatusData.
 */
export async function translateProfileBookingStatusData(
  data: ProfileBookingStatusData,
  targetLanguage: LanguageCode,
): Promise<ProfileBookingStatusData> {
  const memo: TranslateMemo = new Map();

  const [upcoming, recent] = await Promise.all([
    data.upcoming ? translateProfileBookingStatusItem(data.upcoming, targetLanguage, memo) : null,
    Promise.all(
      data.recent.map((item) => translateProfileBookingStatusItem(item, targetLanguage, memo)),
    ),
  ]);

  return {
    upcoming,
    recent,
  };
}

/**
 * uk: Публічна helper функція translateMasterPendingBookings.
 * en: Public helper function translateMasterPendingBookings.
 * cz: Veřejná helper funkce translateMasterPendingBookings.
 */
export async function translateMasterPendingBookings(
  items: MasterPendingBookingItem[],
  targetLanguage: LanguageCode,
): Promise<MasterPendingBookingItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      serviceName: await translateTextRuntime({
        text: item.serviceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:booking-service-name',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateMasterBookingsFeedPage.
 * en: Public helper function translateMasterBookingsFeedPage.
 * cz: Veřejná helper funkce translateMasterBookingsFeedPage.
 */
export async function translateMasterBookingsFeedPage(
  page: MasterBookingsFeedPage,
  targetLanguage: LanguageCode,
): Promise<MasterBookingsFeedPage> {
  const items = await translateMasterPendingBookings(page.items, targetLanguage);
  return {
    ...page,
    items,
  };
}

/**
 * uk: Публічна helper функція translateMasterClientBookingsHistory.
 * en: Public helper function translateMasterClientBookingsHistory.
 * cz: Veřejná helper funkce translateMasterClientBookingsHistory.
 */
export async function translateMasterClientBookingsHistory(
  items: MasterClientBookingsHistoryItem[],
  targetLanguage: LanguageCode,
): Promise<MasterClientBookingsHistoryItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      serviceName: await translateTextRuntime({
        text: item.serviceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:client-history-service-name',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateMasterOwnProfileData.
 * en: Public helper function translateMasterOwnProfileData.
 * cz: Veřejná helper funkce translateMasterOwnProfileData.
 */
export async function translateMasterOwnProfileData(
  profile: MasterOwnProfileData,
  targetLanguage: LanguageCode,
): Promise<MasterOwnProfileData> {
  const memo: TranslateMemo = new Map();

  const [bio, materialsInfo, services, certificates] = await Promise.all([
    translateOptionalText({
      value: profile.bio,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'master-panel:own-profile-bio',
      memo,
    }),
    translateOptionalText({
      value: profile.materialsInfo,
      targetLanguage,
      sourceLanguage: 'uk',
      scope: 'master-panel:own-profile-materials',
      memo,
    }),
    Promise.all(
      profile.services.map(async (service) => ({
        ...service,
        serviceName: await translateTextRuntime({
          text: service.serviceName,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:own-profile-service-name',
          memo,
        }),
      })),
    ),
    Promise.all(
      profile.certificates.map(async (certificate) => ({
        ...certificate,
        title: await translateTextRuntime({
          text: certificate.title,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:own-profile-certificate-title',
          memo,
        }),
        issuer: await translateOptionalText({
          value: certificate.issuer,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:own-profile-certificate-issuer',
          memo,
        }),
      })),
    ),
  ]);

  return {
    ...profile,
    bio: bio ?? null,
    materialsInfo: materialsInfo ?? null,
    services,
    certificates,
  };
}

/**
 * uk: Публічна helper функція translateMasterOwnProfileServiceManage.
 * en: Public helper function translateMasterOwnProfileServiceManage.
 * cz: Veřejná helper funkce translateMasterOwnProfileServiceManage.
 */
export async function translateMasterOwnProfileServiceManage(
  items: MasterOwnProfileServiceManageItem[],
  targetLanguage: LanguageCode,
): Promise<MasterOwnProfileServiceManageItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (service) => ({
      ...service,
      serviceName: await translateTextRuntime({
        text: service.serviceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:service-manage-name',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateMasterOwnProfileCertificatesManage.
 * en: Public helper function translateMasterOwnProfileCertificatesManage.
 * cz: Veřejná helper funkce translateMasterOwnProfileCertificatesManage.
 */
export async function translateMasterOwnProfileCertificatesManage(
  items: MasterOwnProfileCertificateManageItem[],
  targetLanguage: LanguageCode,
): Promise<MasterOwnProfileCertificateManageItem[]> {
  const memo: TranslateMemo = new Map();

  return Promise.all(
    items.map(async (certificate) => ({
      ...certificate,
      title: await translateTextRuntime({
        text: certificate.title,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:certificate-manage-title',
        memo,
      }),
      issuer: await translateOptionalText({
        value: certificate.issuer,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:certificate-manage-issuer',
        memo,
      }),
    })),
  );
}

/**
 * uk: Публічна helper функція translateMasterPanelStatsData.
 * en: Public helper function translateMasterPanelStatsData.
 * cz: Veřejná helper funkce translateMasterPanelStatsData.
 */
export async function translateMasterPanelStatsData(
  stats: MasterPanelStatsData,
  targetLanguage: LanguageCode,
): Promise<MasterPanelStatsData> {
  const memo: TranslateMemo = new Map();

  const topServices = await Promise.all(
    stats.topServices.map(async (item) => ({
      ...item,
      serviceName: await translateTextRuntime({
        text: item.serviceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:stats-top-service',
        memo,
      }),
    })),
  );

  return {
    ...stats,
    topServices,
  };
}

/**
 * uk: Публічна helper функція translateMasterPanelFinanceData.
 * en: Public helper function translateMasterPanelFinanceData.
 * cz: Veřejná helper funkce translateMasterPanelFinanceData.
 */
export async function translateMasterPanelFinanceData(
  finance: MasterPanelFinanceData,
  targetLanguage: LanguageCode,
): Promise<MasterPanelFinanceData> {
  const memo: TranslateMemo = new Map();

  return {
    ...finance,
    bestServiceName:
      (await translateOptionalText({
        value: finance.bestServiceName,
        targetLanguage,
        sourceLanguage: 'uk',
        scope: 'master-panel:finance-best-service',
        memo,
      })) ?? null,
  };
}

/**
 * uk: Публічна helper функція translateMasterPanelScheduleData.
 * en: Public helper function translateMasterPanelScheduleData.
 * cz: Veřejná helper funkce translateMasterPanelScheduleData.
 */
export async function translateMasterPanelScheduleData(
  schedule: MasterPanelScheduleData,
  targetLanguage: LanguageCode,
): Promise<MasterPanelScheduleData> {
  const memo: TranslateMemo = new Map();

  const [upcomingDaysOff, upcomingVacations, upcomingTemporaryHours] = await Promise.all([
    Promise.all(
      schedule.upcomingDaysOff.map(async (item) => ({
        ...item,
        reason: await translateOptionalText({
          value: item.reason,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:schedule-day-off-reason',
          memo,
        }),
      })),
    ),
    Promise.all(
      schedule.upcomingVacations.map(async (item) => ({
        ...item,
        reason: await translateOptionalText({
          value: item.reason,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:schedule-vacation-reason',
          memo,
        }),
      })),
    ),
    Promise.all(
      schedule.upcomingTemporaryHours.map(async (item) => ({
        ...item,
        note: await translateOptionalText({
          value: item.note,
          targetLanguage,
          sourceLanguage: 'uk',
          scope: 'master-panel:schedule-temporary-note',
          memo,
        }),
      })),
    ),
  ]);

  return {
    ...schedule,
    upcomingDaysOff,
    upcomingVacations,
    upcomingTemporaryHours,
  };
}
