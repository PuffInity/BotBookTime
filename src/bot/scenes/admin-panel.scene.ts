import { Scenes } from 'telegraf';
import type { MyContext } from '../../types/bot.types.js';
import type { AdminPanelAccess } from '../../types/db-helpers/db-admin-panel.types.js';
import type {
  AdminBookingItem,
  AdminBookingsCategory,
  AdminBookingsFeedPage,
  RescheduleAdminBookingResult,
} from '../../types/db-helpers/db-admin-bookings.types.js';
import type {
  MasterBookingOption,
  MasterCatalogDetails,
  MasterCatalogItem,
} from '../../types/db-helpers/db-masters.types.js';
import type { MasterOwnProfileServiceManageItem } from '../../types/db-helpers/db-master-profile.types.js';
import type { AdminMasterCreateScheduleDayInput } from '../../types/db-helpers/db-admin-masters.types.js';
import type {
  ServicesCatalogDetails,
  ServicesCatalogItem,
} from '../../types/db-helpers/db-services.types.js';
import type { AdminPanelStatsOverview } from '../../types/db-helpers/db-admin-stats.types.js';
import type {
  AdminPanelStatsClientDetails,
  AdminPanelStatsClientsFeedPage,
  AdminPanelStatsMasterDetails,
  AdminPanelStatsMastersFeedPage,
  AdminPanelStatsMonthlyFeedPage,
  AdminPanelStatsMonthlyReportDetails,
  AdminPanelStatsServiceDetails,
  AdminPanelStatsServicesFeedPage,
} from '../../types/db-helpers/db-admin-stats.types.js';
import type {
  AdminStudioAdminMember,
  AdminStudioUserLookup,
} from '../../types/db-helpers/db-admin-settings.types.js';
import type { AdminStudioProfileSettings } from '../../types/db-helpers/db-admin-studio-settings.types.js';
import type { ContentBlockKey, LanguageCode, NotificationType } from '../../types/db/dbEnums.type.js';
import type {
  NotificationSettingsState,
  UserDeliveryProfile,
} from '../../types/db-helpers/db-notification-settings.types.js';
import type { AdminStudioScheduleData } from '../../types/db-helpers/db-admin-schedule.types.js';
import type { AdminStudioTemporaryScheduleDayInput } from '../../types/db-helpers/db-admin-schedule.types.js';
import { sendClientMainMenu } from '../../helpers/bot/main-menu.bot.js';
import { resolveBotUiLanguage, tBot, tBotTemplate } from '../../helpers/bot/i18n.bot.js';
import type { BotUiLanguage } from '../../helpers/bot/i18n.bot.js';
import {
  createAdminRecordsMenuKeyboard,
  createAdminPanelRootKeyboard,
  formatAdminRecordsMenuText,
  formatAdminPanelRootText,
} from '../../helpers/bot/admin-panel-view.bot.js';
import {
  createAdminSettingsAdminsKeyboard,
  createAdminSettingsGrantConfirmKeyboard,
  createAdminSettingsGrantInputKeyboard,
  createAdminSettingsLanguageConfirmKeyboard,
  createAdminSettingsLanguageKeyboard,
  createAdminSettingsMenuKeyboard,
  createAdminSettingsRevokeConfirmKeyboard,
  createAdminSettingsRevokeInputKeyboard,
  createAdminSettingsNotificationsKeyboard,
  createAdminSettingsStudioEditConfirmKeyboard,
  createAdminSettingsStudioEditInputKeyboard,
  createAdminSettingsStudioProfileKeyboard,
  formatAdminSettingsAdminsText,
  formatAdminSettingsGrantConfirmText,
  formatAdminSettingsGrantInputText,
  formatAdminSettingsLanguageConfirmText,
  formatAdminSettingsLanguageText,
  formatAdminSettingsMenuText,
  formatAdminSettingsNotificationsText,
  formatAdminSettingsRevokeConfirmText,
  formatAdminSettingsRevokeInputText,
  formatAdminSettingsStudioEditConfirmText,
  formatAdminSettingsStudioEditPromptText,
  formatAdminSettingsStudioProfileText,
  getAdminStudioBlockTitle,
} from '../../helpers/bot/admin-settings-view.bot.js';
import {
  createAdminScheduleConfigureDayInputKeyboard,
  createAdminScheduleConfigureDayKeyboard,
  createAdminScheduleDaysOffKeyboard,
  createAdminScheduleDeleteConfirmKeyboard,
  createAdminScheduleDayOffConfirmKeyboard,
  createAdminScheduleDayOffInputKeyboard,
  createAdminScheduleHolidaysKeyboard,
  createAdminScheduleHolidayConfirmKeyboard,
  createAdminScheduleHolidayInputKeyboard,
  createAdminScheduleMenuKeyboard,
  createAdminScheduleTemporaryDayInputKeyboard,
  createAdminScheduleTemporaryDaysConfigKeyboard,
  createAdminScheduleTemporaryKeyboard,
  createAdminScheduleTemporaryPeriodInputKeyboard,
  createAdminScheduleSectionKeyboard,
  formatAdminScheduleDayOffConfirmText,
  formatAdminScheduleDayOffInputText,
  formatAdminScheduleConfigureDayFromInputText,
  formatAdminScheduleConfigureDaySuccessText,
  formatAdminScheduleConfigureDayText,
  formatAdminScheduleConfigureDayToInputText,
  formatAdminScheduleDeleteDayOffConfirmText,
  formatAdminScheduleDeleteHolidayConfirmText,
  formatAdminScheduleDeleteTemporaryConfirmText,
  formatAdminScheduleDaysOffText,
  formatAdminScheduleHolidayConfirmText,
  formatAdminScheduleHolidayDateInputText,
  formatAdminScheduleHolidayNameInputText,
  formatAdminScheduleHolidaysText,
  formatAdminScheduleMenuText,
  formatAdminScheduleTemporaryConfirmText,
  formatAdminScheduleTemporaryDayFromInputText,
  formatAdminScheduleTemporaryDayToInputText,
  formatAdminScheduleTemporaryDaysConfigText,
  formatAdminScheduleTemporarySetPeriodText,
  formatAdminScheduleOverviewText,
  formatAdminScheduleTemporaryText,
} from '../../helpers/bot/admin-schedule-view.bot.js';
import {
  createAdminBookingClientProfileKeyboard,
  createAdminClearCanceledBookingsConfirmKeyboard,
  createAdminBookingContactClientKeyboard,
  createAdminCancelBookingConfirmKeyboard,
  createAdminChangeMasterConfirmKeyboard,
  createAdminChangeMasterSelectKeyboard,
  createAdminBookingDetailsCardKeyboard,
  createAdminHardDeleteBookingConfirmKeyboard,
  createAdminBookingMasterProfileKeyboard,
  createAdminBookingsFeedKeyboard,
  createAdminRescheduleConfirmKeyboard,
  createAdminRescheduleDateKeyboard,
  createAdminRescheduleTimeKeyboard,
  formatAdminBookingClientProfileText,
  formatAdminClearCanceledBookingsConfirmText,
  formatAdminBookingContactClientText,
  formatAdminCancelBookingConfirmText,
  formatAdminChangeMasterConfirmText,
  formatAdminChangeMasterStepText,
  formatAdminBookingDetailsCardText,
  formatAdminHardDeleteBookingConfirmText,
  formatAdminBookingsFeedText,
  formatAdminRescheduleConfirmText,
  formatAdminRescheduleDateStepText,
  formatAdminRescheduleTimeStepText,
} from '../../helpers/bot/admin-bookings-view.bot.js';
import {
  type AdminMasterEditableField,
  type AdminMasterCreateConfirmViewData,
  type AdminMasterCreateScheduleDayView,
  createAdminMasterCreateConfirmKeyboard,
  createAdminMasterCreateInputKeyboard,
  createAdminMasterDeleteConfirmKeyboard,
  createAdminMasterDeleteInputKeyboard,
  createAdminMasterCreateScheduleInputKeyboard,
  createAdminMasterCreateSchedulePickKeyboard,
  createAdminMasterCreateServicesKeyboard,
  createAdminMasterCreateStartKeyboard,
  createAdminMasterEditConfirmKeyboard,
  createAdminMasterEditInputKeyboard,
  createAdminMasterEditMenuKeyboard,
  createAdminMasterEditServicesAddCandidatesKeyboard,
  createAdminMasterEditServicesMenuKeyboard,
  createAdminMasterEditServicesRemoveCandidatesKeyboard,
  createAdminMasterBookingCardKeyboard,
  createAdminMasterBookingsFeedKeyboard,
  createAdminMasterDetailsKeyboard,
  createAdminMastersCatalogKeyboard,
  formatAdminMasterCreateBioInputText,
  formatAdminMasterCreateConfirmText,
  formatAdminMasterCreateDisplayNameInputText,
  formatAdminMasterDeleteConfirmText,
  formatAdminMasterDeleteInputText,
  formatAdminMasterCreateEmailInputText,
  formatAdminMasterCreateExperienceYearsInputText,
  formatAdminMasterCreateMaterialsInputText,
  formatAdminMasterCreatePhoneInputText,
  formatAdminMasterCreateProceduresInputText,
  formatAdminMasterCreateScheduleFromInputText,
  formatAdminMasterCreateSchedulePickText,
  formatAdminMasterCreateScheduleToInputText,
  formatAdminMasterCreateServicesText,
  formatAdminMasterCreateStartText,
  formatAdminMasterCreateTelegramInputText,
  formatAdminMasterEditConfirmText,
  formatAdminMasterEditInputText,
  formatAdminMasterEditMenuText,
  formatAdminMasterEditServicesAddCandidatesText,
  formatAdminMasterEditServicesMenuText,
  formatAdminMasterEditServicesRemoveCandidatesText,
  formatAdminMasterEditSuccessText,
  formatAdminMasterBookingCardText,
  formatAdminMasterBookingsFeedText,
  formatAdminMasterDetailsText,
  formatAdminMastersCatalogText,
} from '../../helpers/bot/admin-masters-view.bot.js';
import {
  createAdminServiceCreateGuaranteeActionsKeyboard,
  createAdminServiceCreateInputKeyboard,
  createAdminServiceCreatePreviewKeyboard,
  createAdminServiceCreateStepActionsKeyboard,
  createAdminServiceEditConfirmKeyboard,
  createAdminServiceEditGuaranteeSelectKeyboard,
  createAdminServiceEditStepSelectKeyboard,
  createAdminServiceDeleteConfirmKeyboard,
  createAdminServiceEditInputKeyboard,
  createAdminServiceEditMenuKeyboard,
  createAdminServiceDetailsKeyboard,
  createAdminServicesCatalogKeyboard,
  formatAdminServiceCreateDescriptionInputText,
  formatAdminServiceCreateDurationInputText,
  formatAdminServiceCreateGuaranteeAddedText,
  formatAdminServiceCreateGuaranteeInputText,
  formatAdminServiceCreateNameInputText,
  formatAdminServiceCreatePreviewText,
  formatAdminServiceCreatePriceInputText,
  formatAdminServiceCreateResultInputText,
  formatAdminServiceCreateStartText,
  formatAdminServiceCreateStepAddedText,
  formatAdminServiceCreateStepDescriptionInputText,
  formatAdminServiceCreateStepDurationInputText,
  formatAdminServiceCreateStepTitleInputText,
  formatAdminServiceCreateSuccessText,
  formatAdminServiceEditDescriptionConfirmText,
  formatAdminServiceEditDescriptionInputText,
  formatAdminServiceEditGuaranteeConfirmText,
  formatAdminServiceEditGuaranteeInputText,
  formatAdminServiceEditGuaranteeSelectText,
  formatAdminServiceEditStepConfirmText,
  formatAdminServiceEditStepDescriptionConfirmText,
  formatAdminServiceEditStepDescriptionInputText,
  formatAdminServiceEditStepDurationConfirmText,
  formatAdminServiceEditStepDurationInputText,
  formatAdminServiceEditStepInputText,
  formatAdminServiceEditStepSelectText,
  formatAdminServiceDeleteConfirmText,
  formatAdminServiceEditDurationConfirmText,
  formatAdminServiceEditDurationInputText,
  formatAdminServiceEditNameConfirmText,
  formatAdminServiceEditNameInputText,
  formatAdminServiceEditMenuText,
  formatAdminServiceEditPriceConfirmText,
  formatAdminServiceEditPriceInputText,
  formatAdminServiceEditResultConfirmText,
  formatAdminServiceEditResultInputText,
  formatAdminServiceDetailsText,
  formatAdminServicesCatalogText,
} from '../../helpers/bot/admin-services-view.bot.js';
import {
  createAdminStatsClientDetailsKeyboard,
  createAdminStatsClientsListKeyboard,
  createAdminStatsMonthlyListKeyboard,
  createAdminStatsMonthlyReportDetailsKeyboard,
  createAdminStatsServiceDetailsKeyboard,
  createAdminStatsServicesListKeyboard,
  createAdminStatsMasterDetailsKeyboard,
  createAdminStatsMastersListKeyboard,
  createAdminStatsOverviewKeyboard,
  formatAdminStatsClientDetailsText,
  formatAdminStatsClientsListText,
  formatAdminStatsMonthlyListText,
  formatAdminStatsMonthlyReportDetailsText,
  formatAdminStatsServiceDetailsText,
  formatAdminStatsServicesListText,
  formatAdminStatsMasterDetailsText,
  formatAdminStatsMastersListText,
  formatAdminStatsOverviewText,
} from '../../helpers/bot/admin-stats-view.bot.js';
import {
  ADMIN_PANEL_ACTION,
  ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_DAY_OFF_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_PICK_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_CREATE_SERVICE_TOGGLE_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_EDIT_FIELD_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_EDIT_SERVICES_ADD_PICK_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_EDIT_SERVICES_REMOVE_PICK_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_EDIT_OPEN_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX,
  ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX,
  ADMIN_PANEL_SETTINGS_NOTIFICATIONS_TOGGLE_ACTION_REGEX,
  ADMIN_PANEL_SETTINGS_LANGUAGE_SELECT_ACTION_REGEX,
  ADMIN_PANEL_SETTINGS_STUDIO_EDIT_BLOCK_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX,
  ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_EDIT_OPEN_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_EDIT_STEP_PICK_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_PICK_ACTION_REGEX,
  ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CONTACT_CLIENT_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_HARD_DELETE_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_NEXT_PENDING_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_VIEW_CLIENT_PROFILE_ACTION_REGEX,
  ADMIN_PANEL_RECORDS_VIEW_MASTER_PROFILE_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX,
  ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX,
  makeAdminPanelScheduleDayOffDeleteConfirmAction,
  makeAdminPanelScheduleHolidayDeleteConfirmAction,
  makeAdminPanelScheduleTemporaryDeleteConfirmAction,
} from '../../types/bot-admin-panel.types.js';
import { getAdminPanelAccessByTelegramId } from '../../helpers/db/db-admin-panel.helper.js';
import { getOrCreateUser } from '../../helpers/db/db-profile.helper.js';
import {
  cancelAdminBooking,
  clearCanceledAdminBookings,
  confirmAdminPendingBooking,
  getAdminBookingCardById,
  hardDeleteAdminBooking,
  listAdminBookingsFeed,
  reassignAdminBookingMaster,
  rescheduleAdminBooking,
} from '../../helpers/db/db-admin-bookings.helper.js';
import {
  createAdminStudioDayOff,
  createAdminStudioHoliday,
  createAdminStudioTemporarySchedule,
  deleteAdminStudioDayOff,
  deleteAdminStudioHoliday,
  deleteAdminStudioTemporarySchedulePeriod,
  getAdminStudioSchedule,
  upsertAdminStudioWeeklyDay,
} from '../../helpers/db/db-admin-schedule.helper.js';
import {
  createAdminMaster,
  deleteAdminMaster,
  findAdminMasterCandidateByTelegramId,
} from '../../helpers/db/db-admin-masters.helper.js';
import {
  addMasterOwnService,
  getMasterOwnProfile,
  listMasterOwnServicesAddCandidates,
  listMasterOwnServicesManage,
  listMasterOwnServicesRemoveCandidates,
  removeMasterOwnService,
  updateMasterOwnProfileBio,
  updateMasterOwnProfileDisplayName,
  updateMasterOwnProfileEmail,
  updateMasterOwnProfileMaterials,
  updateMasterOwnProfilePhone,
  updateMasterOwnProfileProceduresDoneTotal,
  updateMasterOwnProfileStartedOn,
} from '../../helpers/db/db-master-profile.helper.js';
import {
  getMasterCatalogDetailsById,
  listActiveMastersByService,
  listActiveMastersCatalog,
} from '../../helpers/db/db-masters.helper.js';
import {
  createAdminService,
  deactivateAdminService,
  getAdminEditableServiceById,
  updateAdminServiceBasePrice,
  updateAdminServiceGuaranteeText,
  updateAdminServiceStepDescription,
  updateAdminServiceStepDuration,
  updateAdminServiceStepTitle,
  updateAdminServiceName,
  updateAdminServiceDuration,
  updateAdminServiceDescription,
  updateAdminServiceResultDescription,
} from '../../helpers/db/db-admin-services.helper.js';
import {
  getServiceCatalogDetailsById,
  listActiveServicesCatalog,
} from '../../helpers/db/db-services.helper.js';
import { getAdminPanelStatsOverview } from '../../helpers/db/db-admin-stats.helper.js';
import {
  getAdminPanelStatsClientDetails,
  getAdminPanelStatsMonthlyReportDetails,
  getAdminPanelStatsMasterDetails,
  getAdminPanelStatsServiceDetails,
  listAdminPanelStatsClientsFeed,
  listAdminPanelStatsMonthlyFeed,
  listAdminPanelStatsMastersFeed,
  listAdminPanelStatsServicesFeed,
} from '../../helpers/db/db-admin-stats.helper.js';
import {
  findAdminStudioUserByTelegramId,
  getAdminPanelLanguage,
  grantStudioAdminRole,
  listAdminStudioAdmins,
  revokeStudioAdminRole,
  setAdminPanelLanguage,
} from '../../helpers/db/db-admin-settings.helper.js';
import {
  getAdminStudioProfileSettings,
  upsertAdminStudioContentBlock,
} from '../../helpers/db/db-admin-studio-settings.helper.js';
import {
  getUserDeliveryProfileById,
  getUserNotificationSettingsState,
  setAllUserNotificationSettings,
  upsertUserNotificationSetting,
} from '../../helpers/db/db-notification-settings.helper.js';
import { buildBookingDateOptions, buildBookingTimeOptions } from '../../helpers/bot/booking-view.bot.js';
import { bookingDateCodeSchema, bookingTimeCodeSchema } from '../../validator/booking-input.schema.js';
import { dispatchNotification } from '../../helpers/notification/notification-dispatch.helper.js';
import { ValidationError, handleError } from '../../utils/error.utils.js';
import { loggerAdminPanel, loggerNotification } from '../../utils/logger/loggers-list.js';
import {
  normalizeMasterBio,
  normalizeMasterContactEmail,
  normalizeMasterContactPhone,
  normalizeMasterDisplayName,
  normalizeMasterMaterialsInfo,
  normalizeMasterProceduresDoneTotal,
  normalizeMasterStartedOn,
} from '../../utils/db/db-master-profile.js';

/**
 * @file admin-panel.scene.ts
 * @summary Сцена адмін-панелі:
 * - перевірка доступу
 * - кореневе меню розділів
 * - обробка підрозділів адмін-функціоналу
 */

export const ADMIN_PANEL_SCENE_ID = 'admin-panel-scene';

type AdminRescheduleDraft = {
  appointmentId: string;
  dateCode: string | null;
  timeCode: string | null;
};

type AdminChangeMasterDraft = {
  appointmentId: string;
  selectedMasterId: string | null;
  selectedMasterName: string | null;
  candidates: MasterBookingOption[];
};

type AdminScheduleSection = 'overview' | 'configure-day' | 'days-off' | 'holidays' | 'temporary';

type AdminScheduleDayOffDraft = {
  mode: 'awaiting_date' | 'awaiting_confirm';
  offDate: string | null;
  offDateLabel: string | null;
};

type AdminScheduleHolidayDraft = {
  mode: 'awaiting_date' | 'awaiting_name' | 'awaiting_confirm';
  holidayDate: string | null;
  holidayDateLabel: string | null;
  holidayName: string | null;
};

type AdminScheduleTemporaryDraft = {
  mode:
    | 'awaiting_period'
    | 'configuring_days'
    | 'awaiting_day_from'
    | 'awaiting_day_to'
    | 'awaiting_confirm';
  dateFrom: string | null;
  dateTo: string | null;
  dateFromLabel: string | null;
  dateToLabel: string | null;
  days: AdminStudioTemporaryScheduleDayInput[];
  selectedWeekday: number | null;
  pendingFromTime: string | null;
};

type AdminScheduleDeleteDraft = {
  type: 'day_off' | 'holiday' | 'temporary_period';
  id: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};

type AdminScheduleConfigureDayDraft = {
  mode: 'awaiting_from' | 'awaiting_to';
  weekday: number | null;
  fromTime: string | null;
};

type AdminMasterSubSection =
  | 'catalog'
  | 'details'
  | 'bookings'
  | 'stats'
  | 'edit'
  | 'edit-services'
  | 'delete'
  | 'create';
type AdminMasterEditDraft = {
  masterId: string;
  field: AdminMasterEditableField;
  mode: 'awaiting_value' | 'awaiting_confirm';
  currentValue: string;
  value: string | null;
};
type AdminMasterCreateDraft = {
  mode:
    | 'intro'
    | 'awaiting_display_name'
    | 'awaiting_telegram_id'
    | 'selecting_services'
    | 'awaiting_experience_years'
    | 'awaiting_procedures_done_total'
    | 'awaiting_bio'
    | 'awaiting_materials'
    | 'awaiting_phone'
    | 'awaiting_email'
    | 'awaiting_schedule_pick'
    | 'awaiting_schedule_from'
    | 'awaiting_schedule_to'
    | 'awaiting_confirm';
  displayName: string | null;
  telegramUserId: string | null;
  targetUserId: string | null;
  selectedServiceIds: string[];
  availableServices: ServicesCatalogItem[];
  experienceYears: number | null;
  proceduresDoneTotal: number | null;
  bio: string | null;
  materialsInfo: string | null;
  contactPhoneE164: string | null;
  contactEmail: string | null;
  scheduleDays: AdminMasterCreateScheduleDayInput[];
  scheduleSelectedWeekday: number | null;
  schedulePendingFromTime: string | null;
};
type AdminMasterServicesDraft = {
  masterId: string;
  masterName: string;
  mode: 'menu' | 'add_candidates' | 'remove_candidates';
  items: MasterOwnProfileServiceManageItem[];
};

type AdminMasterDeleteDraft = {
  mode: 'awaiting_telegram_id' | 'awaiting_confirm';
  telegramUserId: string | null;
  targetUserId: string | null;
  targetDisplayName: string | null;
};
type AdminServiceSubSection = 'catalog' | 'details' | 'stats' | 'edit' | 'create';

type AdminServiceGuaranteeDraftOption = {
  guaranteeNo: number;
  guaranteeText: string;
};

type AdminServiceStepDraftOption = {
  stepNo: number;
  durationMinutes: number;
  title: string;
  description: string;
};

type AdminServiceEditDraft = {
  serviceId: string;
  serviceName: string;
  field:
    | 'name'
    | 'duration_minutes'
    | 'base_price'
    | 'description'
    | 'result_description'
    | 'step_title'
    | 'step_description'
    | 'step_duration_minutes'
    | 'guarantee_text'
    | 'deactivate';
  mode: 'awaiting_text' | 'awaiting_confirm' | 'selecting_guarantee' | 'selecting_step';
  currentDurationMinutes: number;
  currentBasePrice: string;
  currentCurrencyCode: string;
  currentDescription: string | null;
  currentResultDescription: string | null;
  currentStepNo: number | null;
  currentStepTitle: string | null;
  currentStepDescription: string | null;
  currentStepDurationMinutes: number | null;
  stepOptions: AdminServiceStepDraftOption[];
  currentGuaranteeNo: number | null;
  currentGuaranteeText: string | null;
  guaranteeOptions: AdminServiceGuaranteeDraftOption[];
  currentValue: string | number | null;
  value: string | number | null;
};

type AdminServiceCreateStepDraft = {
  title: string;
  durationMinutes: number;
  description: string;
};

type AdminServiceCreateGuaranteeDraft = {
  guaranteeText: string;
  validDays: number | null;
};

type AdminServiceCreateDraft = {
  mode:
    | 'awaiting_name'
    | 'awaiting_duration'
    | 'awaiting_price'
    | 'awaiting_description'
    | 'awaiting_step_title'
    | 'awaiting_step_duration'
    | 'awaiting_step_description'
    | 'awaiting_step_menu'
    | 'awaiting_guarantee_text'
    | 'awaiting_guarantee_menu'
    | 'awaiting_result'
    | 'awaiting_confirm';
  name: string | null;
  durationMinutes: number | null;
  basePrice: string | null;
  currencyCode: string;
  description: string | null;
  resultDescription: string | null;
  pendingStepTitle: string | null;
  pendingStepDurationMinutes: number | null;
  steps: AdminServiceCreateStepDraft[];
  guarantees: AdminServiceCreateGuaranteeDraft[];
};
type AdminStatsSection = 'overview' | 'masters' | 'services' | 'monthly' | 'clients';
type AdminSettingsSection = 'menu' | 'language' | 'admins' | 'studio' | 'notifications';
type AdminSettingsAdminsAction = 'grant' | 'revoke';

type AdminSettingsAdminsDraft = {
  action: AdminSettingsAdminsAction;
  mode: 'awaiting_telegram_id' | 'awaiting_confirm';
  target: AdminStudioUserLookup | null;
};

type AdminSettingsLanguageDraft = {
  currentLanguage: LanguageCode;
  nextLanguage: LanguageCode;
};

type AdminSettingsStudioDraft = {
  mode: 'awaiting_text' | 'awaiting_confirm';
  blockKey: ContentBlockKey;
  blockTitle: string;
  currentContent: string;
  draftContent: string | null;
};

type AdminPanelSceneState = {
  language: BotUiLanguage;
  access: AdminPanelAccess | null;
  recordsFeed: AdminBookingsFeedPage | null;
  recordsLastCategory: AdminBookingsCategory | null;
  recordsOpenedAppointmentId: string | null;
  recordsRescheduleDraft: AdminRescheduleDraft | null;
  recordsChangeMasterDraft: AdminChangeMasterDraft | null;
  scheduleData: AdminStudioScheduleData | null;
  scheduleCurrentSection: AdminScheduleSection | null;
  scheduleDayOffDraft: AdminScheduleDayOffDraft | null;
  scheduleHolidayDraft: AdminScheduleHolidayDraft | null;
  scheduleTemporaryDraft: AdminScheduleTemporaryDraft | null;
  scheduleConfigureDayDraft: AdminScheduleConfigureDayDraft | null;
  scheduleDeleteDraft: AdminScheduleDeleteDraft | null;
  mastersCatalog: MasterCatalogItem[] | null;
  mastersSelectedMasterId: string | null;
  mastersBookingsFeed: AdminBookingsFeedPage | null;
  mastersBookingsOpenedAppointmentId: string | null;
  mastersCurrentSection: AdminMasterSubSection | null;
  mastersEditDraft: AdminMasterEditDraft | null;
  mastersCreateDraft: AdminMasterCreateDraft | null;
  mastersServicesDraft: AdminMasterServicesDraft | null;
  mastersDeleteDraft: AdminMasterDeleteDraft | null;
  servicesCatalog: ServicesCatalogItem[] | null;
  servicesSelectedServiceId: string | null;
  servicesCurrentSection: AdminServiceSubSection | null;
  servicesEditDraft: AdminServiceEditDraft | null;
  servicesCreateDraft: AdminServiceCreateDraft | null;
  statsOverview: AdminPanelStatsOverview | null;
  statsMastersFeed: AdminPanelStatsMastersFeedPage | null;
  statsSelectedMasterId: string | null;
  statsMasterDetails: AdminPanelStatsMasterDetails | null;
  statsServicesFeed: AdminPanelStatsServicesFeedPage | null;
  statsSelectedServiceId: string | null;
  statsServiceDetails: AdminPanelStatsServiceDetails | null;
  statsMonthlyFeed: AdminPanelStatsMonthlyFeedPage | null;
  statsSelectedMonthCode: string | null;
  statsMonthlyReportDetails: AdminPanelStatsMonthlyReportDetails | null;
  statsClientsFeed: AdminPanelStatsClientsFeedPage | null;
  statsSelectedClientId: string | null;
  statsClientDetails: AdminPanelStatsClientDetails | null;
  statsCurrentSection: AdminStatsSection | null;
  settingsAdmins: AdminStudioAdminMember[] | null;
  settingsAdminsDraft: AdminSettingsAdminsDraft | null;
  settingsLanguageDraft: AdminSettingsLanguageDraft | null;
  settingsNotificationsState: NotificationSettingsState | null;
  settingsNotificationsDeliveryProfile: UserDeliveryProfile | null;
  settingsStudioData: AdminStudioProfileSettings | null;
  settingsStudioDraft: AdminSettingsStudioDraft | null;
  settingsCurrentSection: AdminSettingsSection | null;
};

function getSceneState(ctx: MyContext): AdminPanelSceneState {
  return ctx.wizard.state as AdminPanelSceneState;
}

function resetRecordsActionDrafts(state: AdminPanelSceneState): void {
  state.recordsRescheduleDraft = null;
  state.recordsChangeMasterDraft = null;
}

function resetScheduleDrafts(state: AdminPanelSceneState): void {
  state.scheduleDayOffDraft = null;
  state.scheduleHolidayDraft = null;
  state.scheduleTemporaryDraft = null;
  state.scheduleConfigureDayDraft = null;
  state.scheduleDeleteDraft = null;
}

function resetMastersState(state: AdminPanelSceneState): void {
  state.mastersCatalog = null;
  state.mastersSelectedMasterId = null;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersCurrentSection = null;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;
}

function resetServicesState(state: AdminPanelSceneState): void {
  state.servicesCatalog = null;
  state.servicesSelectedServiceId = null;
  state.servicesCurrentSection = null;
  state.servicesEditDraft = null;
  state.servicesCreateDraft = null;
}

function resetStatsState(state: AdminPanelSceneState): void {
  state.statsOverview = null;
  state.statsMastersFeed = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsServicesFeed = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsCurrentSection = null;
}

function resetSettingsState(state: AdminPanelSceneState): void {
  state.settingsAdmins = null;
  state.settingsAdminsDraft = null;
  state.settingsLanguageDraft = null;
  state.settingsNotificationsState = null;
  state.settingsNotificationsDeliveryProfile = null;
  state.settingsStudioData = null;
  state.settingsStudioDraft = null;
  state.settingsCurrentSection = null;
}

function getUserText(ctx: MyContext): string | null {
  if (!ctx.message) return null;
  if (!('text' in ctx.message)) return null;
  return ctx.message.text.trim();
}

function formatDateLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateSql(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function parseFutureDateInput(input: string, language: BotUiLanguage = 'uk'): Date {
  const normalized = input.trim();
  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_FORMAT_DDMMYYYY'));
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_INVALID'));
  }

  const parsedDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsedDay.getTime() < today.getTime()) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_IN_PAST'));
  }

  return parsedDay;
}

function normalizeHolidayName(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_HOLIDAY_NAME_TOO_SHORT'));
  }
  if (normalized.length > 120) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_HOLIDAY_NAME_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceNameInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_NAME_TOO_SHORT'));
  }
  if (normalized.length > 120) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_NAME_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceGuaranteeTextInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 3) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_GUARANTEE_TOO_SHORT'));
  }
  if (normalized.length > 500) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_GUARANTEE_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceStepTitleInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_STEP_TITLE_TOO_SHORT'));
  }
  if (normalized.length > 120) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_STEP_TITLE_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceStepDescriptionInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError(
      tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_STEP_DESCRIPTION_TOO_SHORT'),
    );
  }
  if (normalized.length > 500) {
    throw new ValidationError(
      tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_STEP_DESCRIPTION_TOO_LONG'),
    );
  }
  return normalized;
}

function normalizeServiceResultDescriptionInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_RESULT_TOO_SHORT'));
  }
  if (normalized.length > 1200) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_RESULT_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceDescriptionInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 10) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_DESCRIPTION_TOO_SHORT'));
  }
  if (normalized.length > 1600) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_DESCRIPTION_TOO_LONG'));
  }
  return normalized;
}

function normalizeServiceBasePriceInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_PRICE_FORMAT'));
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_PRICE_NEGATIVE'));
  }
  if (amount > 99_999_999.99) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_PRICE_TOO_HIGH'));
  }

  return amount.toFixed(2);
}

function normalizeServiceDurationInput(value: string, language: BotUiLanguage = 'uk'): number {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_DURATION_INTEGER'));
  }

  const minutes = Number(normalized);
  if (!Number.isFinite(minutes)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_DURATION_NUMBER'));
  }

  const duration = Math.trunc(minutes);
  if (duration < 5 || duration > 720) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_SERVICE_DURATION_RANGE'));
  }

  return duration;
}

function normalizeServiceStepDurationInput(value: string, language: BotUiLanguage = 'uk'): number {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_STEP_DURATION_INTEGER'));
  }

  const minutes = Number(normalized);
  if (!Number.isFinite(minutes)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_STEP_DURATION_NUMBER'));
  }

  const duration = Math.trunc(minutes);
  if (duration < 1 || duration > 720) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_STEP_DURATION_RANGE'));
  }

  return duration;
}

const MIN_TEMPORARY_SCHEDULE_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateRangeInput(
  input: string,
  language: BotUiLanguage = 'uk',
): { dateFrom: Date; dateTo: Date } {
  const normalized = input.trim();
  const match = normalized.match(
    /^(\d{2}\.\d{2}\.\d{4})\s*[-–—]\s*(\d{2}\.\d{2}\.\d{4})$/,
  );

  if (!match) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_RANGE_FORMAT'));
  }

  const dateFrom = parseFutureDateInput(match[1], language);
  const dateTo = parseFutureDateInput(match[2], language);
  if (dateTo.getTime() < dateFrom.getTime()) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_RANGE_INVALID'));
  }

  return { dateFrom, dateTo };
}

function countInclusiveDays(dateFrom: Date, dateTo: Date): number {
  return Math.floor((dateTo.getTime() - dateFrom.getTime()) / DAY_IN_MS) + 1;
}

function parseTimeInput(value: string, language: BotUiLanguage = 'uk'): string {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_TIME_FORMAT'));
  }

  const hour = Number(match[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_TIME_HOUR_RANGE'));
  }

  return `${hour}:${match[2]}`;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function upsertTemporaryDay(
  days: AdminStudioTemporaryScheduleDayInput[],
  day: AdminStudioTemporaryScheduleDayInput,
): AdminStudioTemporaryScheduleDayInput[] {
  const filtered = days.filter((current) => current.weekday !== day.weekday);
  return [...filtered, day].sort((a, b) => a.weekday - b.weekday);
}

function parseDateFromCode(code: string, language: BotUiLanguage = 'uk'): Date {
  const normalized = code.trim();
  const match = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_CODE_INVALID'));
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_DATE_VALUE_INVALID'));
  }

  return parsed;
}

function getTodayDateCode(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function toStartAt(dateCode: string, timeCode: string): Date {
  const year = Number(dateCode.slice(0, 4));
  const month = Number(dateCode.slice(4, 6));
  const day = Number(dateCode.slice(6, 8));
  const hour = Number(timeCode.slice(0, 2));
  const minute = Number(timeCode.slice(2, 4));
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function toSafeDateValue(value: Date | string): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getAvailableRescheduleTimeCodes(dateCode: string): string[] {
  const options = buildBookingTimeOptions().map((item) => item.replace(':', ''));
  if (dateCode !== getTodayDateCode()) {
    return options;
  }

  const now = Date.now();
  return options.filter((timeCode) => toStartAt(dateCode, timeCode).getTime() > now);
}

async function renderAdminRoot(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (!state.access) return;

  const text = formatAdminPanelRootText(state.access, state.language);
  const keyboard = createAdminPanelRootKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагувати не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderRecordsMenu(ctx: MyContext): Promise<void> {
  const state = getSceneState(ctx);
  const text = formatAdminRecordsMenuText(state.language);
  const keyboard = createAdminRecordsMenuKeyboard(state.language);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderScheduleMenu(ctx: MyContext): Promise<void> {
  const state = getSceneState(ctx);
  const text = formatAdminScheduleMenuText(state.language);
  const keyboard = createAdminScheduleMenuKeyboard(state.language);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function loadAdminSchedule(state: AdminPanelSceneState): Promise<AdminStudioScheduleData> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const data = await getAdminStudioSchedule(studioId, 12);
  state.scheduleData = data;
  return data;
}

function formatScheduleSectionText(
  section: AdminScheduleSection,
  data: AdminStudioScheduleData,
  language: BotUiLanguage,
): string {
  switch (section) {
    case 'overview':
      return formatAdminScheduleOverviewText(data, language);
    case 'configure-day':
      return formatAdminScheduleConfigureDayText(data, language);
    case 'days-off':
      return formatAdminScheduleDaysOffText(data, language);
    case 'holidays':
      return formatAdminScheduleHolidaysText(data, language);
    case 'temporary':
      return formatAdminScheduleTemporaryText(data, language);
    default:
      return formatAdminScheduleOverviewText(data, language);
  }
}

async function renderScheduleSection(
  ctx: MyContext,
  section: AdminScheduleSection,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const data = await loadAdminSchedule(state);
  state.scheduleCurrentSection = section;

  const text = formatScheduleSectionText(section, data, state.language);
  const keyboard =
    section === 'configure-day'
      ? createAdminScheduleConfigureDayKeyboard(state.language)
      : section === 'days-off'
      ? createAdminScheduleDaysOffKeyboard(data, state.language)
      : section === 'holidays'
        ? createAdminScheduleHolidaysKeyboard(data, state.language)
        : section === 'temporary'
          ? createAdminScheduleTemporaryKeyboard(data, state.language)
        : createAdminScheduleSectionKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsMenu(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  state.settingsCurrentSection = 'menu';

  const text = formatAdminSettingsMenuText(state.language);
  const keyboard = createAdminSettingsMenuKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsLanguage(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const userId = state.access?.userId;
  if (!userId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'));
  }

  const currentLanguage = await getAdminPanelLanguage({ userId });
  state.settingsCurrentSection = 'language';
  state.settingsLanguageDraft = null;

  const text = formatAdminSettingsLanguageText(currentLanguage, state.language);
  const keyboard = createAdminSettingsLanguageKeyboard(currentLanguage, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

function parseSettingsLanguageFromAction(ctx: MyContext, language: BotUiLanguage = 'uk'): LanguageCode {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(ADMIN_PANEL_SETTINGS_LANGUAGE_SELECT_ACTION_REGEX);
  const nextLanguage = match?.[1] as LanguageCode | undefined;
  if (!nextLanguage) {
    throw new ValidationError(
      tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_CALLBACK_LANGUAGE_SELECT'),
    );
  }
  return nextLanguage;
}

async function renderAdminSettingsLanguageConfirm(
  ctx: MyContext,
  draft: AdminSettingsLanguageDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  state.settingsCurrentSection = 'language';
  state.settingsLanguageDraft = draft;

  const text = formatAdminSettingsLanguageConfirmText(
    draft.currentLanguage,
    draft.nextLanguage,
    state.language,
  );
  const keyboard = createAdminSettingsLanguageConfirmKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsNotifications(
  ctx: MyContext,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const userId = state.access?.userId;
  if (!userId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'));
  }

  const [notificationState, deliveryProfile] = await Promise.all([
    getUserNotificationSettingsState(userId),
    getUserDeliveryProfileById(userId),
  ]);

  state.settingsCurrentSection = 'notifications';
  state.settingsNotificationsState = notificationState;
  state.settingsNotificationsDeliveryProfile = deliveryProfile;

  const text = formatAdminSettingsNotificationsText(notificationState, deliveryProfile, state.language);
  const keyboard = createAdminSettingsNotificationsKeyboard(notificationState, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

function parseSettingsNotificationTypeFromAction(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): NotificationType {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(ADMIN_PANEL_SETTINGS_NOTIFICATIONS_TOGGLE_ACTION_REGEX);
  const notificationType = match?.[1] as NotificationType | undefined;
  if (!notificationType) {
    throw new ValidationError(
      tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_CALLBACK_NOTIFICATION_TOGGLE'),
    );
  }
  return notificationType;
}

async function loadAdminSettingsAdmins(
  state: AdminPanelSceneState,
): Promise<AdminStudioAdminMember[]> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const admins = await listAdminStudioAdmins({ studioId });
  state.settingsAdmins = admins;
  return admins;
}

async function renderAdminSettingsAdmins(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const admins = await loadAdminSettingsAdmins(state);
  state.settingsCurrentSection = 'admins';
  state.settingsAdminsDraft = null;

  const text = formatAdminSettingsAdminsText(admins, state.language);
  const keyboard = createAdminSettingsAdminsKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsAdminsInput(
  ctx: MyContext,
  action: AdminSettingsAdminsAction,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  state.settingsCurrentSection = 'admins';
  state.settingsAdminsDraft = {
    action,
    mode: 'awaiting_telegram_id',
    target: null,
  };

  const text =
    action === 'grant'
      ? formatAdminSettingsGrantInputText(state.language)
      : formatAdminSettingsRevokeInputText(state.language);
  const keyboard =
    action === 'grant'
      ? createAdminSettingsGrantInputKeyboard(state.language)
      : createAdminSettingsRevokeInputKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsAdminsConfirm(
  ctx: MyContext,
  draft: AdminSettingsAdminsDraft,
  preferEdit: boolean,
): Promise<void> {
  const language = getSceneState(ctx).language;
  if (!draft.target) {
    await renderAdminSettingsAdmins(ctx, preferEdit);
    return;
  }

  const text =
    draft.action === 'grant'
      ? formatAdminSettingsGrantConfirmText(draft.target, language)
      : formatAdminSettingsRevokeConfirmText(draft.target, language);
  const keyboard =
    draft.action === 'grant'
      ? createAdminSettingsGrantConfirmKeyboard(language)
      : createAdminSettingsRevokeConfirmKeyboard(language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadAdminStudioSettings(
  state: AdminPanelSceneState,
): Promise<AdminStudioProfileSettings> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const data = await getAdminStudioProfileSettings({
    studioId,
    language: 'uk',
  });
  state.settingsStudioData = data;
  return data;
}

async function renderAdminSettingsStudioProfile(
  ctx: MyContext,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const data = await loadAdminStudioSettings(state);
  state.settingsCurrentSection = 'studio';
  state.settingsStudioDraft = null;

  const text = formatAdminSettingsStudioProfileText(data, state.language);
  const keyboard = createAdminSettingsStudioProfileKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

function parseStudioBlockKeyFromAction(
  ctx: MyContext,
  language: BotUiLanguage = 'uk',
): ContentBlockKey {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(ADMIN_PANEL_SETTINGS_STUDIO_EDIT_BLOCK_OPEN_ACTION_REGEX);
  const blockKey = match?.[1] as ContentBlockKey | undefined;
  if (!blockKey) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_CALLBACK_STUDIO_BLOCK_EDIT'));
  }
  return blockKey;
}

function normalizeStudioContentDraftInput(text: string, language: BotUiLanguage = 'uk'): string {
  const normalized = text.trim().replace(/\r/g, '');
  if (normalized.length < 10) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_STUDIO_TEXT_TOO_SHORT'));
  }
  if (normalized.length > 4000) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_STUDIO_TEXT_TOO_LONG'));
  }
  return normalized;
}

async function renderAdminSettingsStudioEditPrompt(
  ctx: MyContext,
  blockKey: ContentBlockKey,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const data = state.settingsStudioData ?? (await loadAdminStudioSettings(state));
  const blockTitle = getAdminStudioBlockTitle(blockKey, state.language);
  const currentContent = data.contentBlocks[blockKey] ?? '';

  state.settingsCurrentSection = 'studio';
  state.settingsStudioDraft = {
    mode: 'awaiting_text',
    blockKey,
    blockTitle,
    currentContent,
    draftContent: null,
  };

  const text = formatAdminSettingsStudioEditPromptText(blockTitle, currentContent, state.language);
  const keyboard = createAdminSettingsStudioEditInputKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminSettingsStudioEditConfirm(
  ctx: MyContext,
  draft: AdminSettingsStudioDraft,
  preferEdit: boolean,
): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminSettingsStudioEditConfirmText(
    draft.blockTitle,
    draft.draftContent ?? '',
    language,
  );
  const keyboard = createAdminSettingsStudioEditConfirmKeyboard(language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadAdminMastersCatalog(state: AdminPanelSceneState): Promise<MasterCatalogItem[]> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const masters = await listActiveMastersCatalog({ studioId, limit: 50 });
  state.mastersCatalog = masters;
  return masters;
}

async function renderAdminMastersCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const masters = await loadAdminMastersCatalog(state);
  state.mastersCurrentSection = 'catalog';
  state.mastersSelectedMasterId = null;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMastersCatalogText(masters, state.language);
  const keyboard = createAdminMastersCatalogKeyboard(masters, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterDetails(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getMasterCatalogDetailsById({ masterId, studioId });
  if (!details) {
    await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_DETAILS_NOT_FOUND'));
    await renderAdminMastersCatalog(ctx, false);
    return;
  }

  state.mastersCurrentSection = 'details';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMasterDetailsText(details, state.language);
  const keyboard = createAdminMasterDetailsKeyboard(masterId, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterDeleteInput(
  ctx: MyContext,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  state.mastersCurrentSection = 'delete';
  state.mastersSelectedMasterId = null;
  state.mastersBookingsFeed = null;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = {
    mode: 'awaiting_telegram_id',
    telegramUserId: null,
    targetUserId: null,
    targetDisplayName: null,
  };

  const text = formatAdminMasterDeleteInputText(state.language);
  const keyboard = createAdminMasterDeleteInputKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterDeleteConfirm(
  ctx: MyContext,
  draft: AdminMasterDeleteDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const text = formatAdminMasterDeleteConfirmText(
    draft.targetDisplayName ?? tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_PLACEHOLDER_DASH'),
    draft.telegramUserId ?? tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_PLACEHOLDER_DASH'),
    state.language,
  );
  const keyboard = createAdminMasterDeleteConfirmKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function ensureAdminMasterEditableAccess(
  state: AdminPanelSceneState,
  masterId: string,
): Promise<MasterCatalogDetails> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getMasterCatalogDetailsById({ masterId, studioId });
  if (!details) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_DETAILS_NOT_FOUND'));
  }

  return details;
}

function formatAdminMasterDateForText(value: Date | null, language: BotUiLanguage): string {
  return value ? formatDateLabel(value) : tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');
}

async function resolveAdminMasterEditableCurrentValue(
  masterId: string,
  field: AdminMasterEditableField,
  language: BotUiLanguage,
): Promise<string> {
  const profile = await getMasterOwnProfile(masterId);

  switch (field) {
    case 'display_name':
      return profile.displayName;
    case 'bio':
      return profile.bio?.trim() ? profile.bio.trim() : tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');
    case 'materials':
      return profile.materialsInfo?.trim()
        ? profile.materialsInfo.trim()
        : tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');
    case 'phone':
      return profile.contactPhoneE164 ?? tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');
    case 'email':
      return profile.contactEmail ?? tBot(language, 'ADMIN_PANEL_MASTERS_LABEL_NOT_SPECIFIED');
    case 'started_on':
      return formatAdminMasterDateForText(profile.startedOn, language);
    case 'procedures_done_total':
      return String(profile.proceduresDoneTotal);
    default:
      throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_INVALID_EDIT_FIELD'));
  }
}

function normalizeAdminMasterFieldValue(
  field: AdminMasterEditableField,
  value: string,
  language: BotUiLanguage,
): string {
  switch (field) {
    case 'display_name':
      return normalizeMasterDisplayName(value);
    case 'bio':
      return normalizeMasterBio(value);
    case 'materials':
      return normalizeMasterMaterialsInfo(value);
    case 'phone':
      return normalizeMasterContactPhone(value);
    case 'email':
      return normalizeMasterContactEmail(value);
    case 'procedures_done_total':
      return String(normalizeMasterProceduresDoneTotal(value));
    case 'started_on': {
      const normalized = normalizeMasterStartedOn(value);
      const [year, month, day] = normalized.split('-');
      return `${day}.${month}.${year}`;
    }
    default:
      throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_INVALID_EDIT_FIELD'));
  }
}

async function persistAdminMasterFieldValue(
  masterId: string,
  field: AdminMasterEditableField,
  value: string,
  language: BotUiLanguage,
): Promise<void> {
  switch (field) {
    case 'display_name':
      await updateMasterOwnProfileDisplayName({ masterId, displayName: value });
      return;
    case 'bio':
      await updateMasterOwnProfileBio({ masterId, bio: value });
      return;
    case 'materials':
      await updateMasterOwnProfileMaterials({ masterId, materialsInfo: value });
      return;
    case 'phone':
      await updateMasterOwnProfilePhone({ masterId, contactPhoneE164: value });
      return;
    case 'email':
      await updateMasterOwnProfileEmail({ masterId, contactEmail: value });
      return;
    case 'procedures_done_total':
      await updateMasterOwnProfileProceduresDoneTotal({
        masterId,
        proceduresDoneTotal: value,
      });
      return;
    case 'started_on':
      await updateMasterOwnProfileStartedOn({ masterId, startedOn: value });
      return;
    default:
      throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_INVALID_EDIT_FIELD'));
  }
}

function parseAdminMasterEditFieldAction(ctx: MyContext): {
  masterId: string;
  field: AdminMasterEditableField;
} {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(ADMIN_PANEL_MASTERS_EDIT_FIELD_ACTION_REGEX);

  const masterId = match?.[1] ?? '';
  const field = match?.[2] as AdminMasterEditableField | undefined;
  if (!masterId || !field) {
    const state = getSceneState(ctx);
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_INVALID_EDIT_CALLBACK'));
  }

  return { masterId, field };
}

const MASTER_CREATE_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

function getDefaultMasterCreateScheduleDays(): AdminMasterCreateScheduleDayInput[] {
  return MASTER_CREATE_WEEKDAYS.map((weekday) => ({
    weekday,
    isWorking: false,
    openTime: null,
    closeTime: null,
  }));
}

function normalizeAdminMasterCreateExperienceInput(value: string, language: BotUiLanguage): number {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_EXPERIENCE_INTEGER'));
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 50) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_EXPERIENCE_RANGE'));
  }

  return parsed;
}

function normalizeAdminMasterCreateTelegramIdInput(value: string, language: BotUiLanguage): string {
  const normalized = value.trim();
  if (!/^\d{5,15}$/.test(normalized)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_TELEGRAM_ID_FORMAT'));
  }
  return normalized;
}

function toMasterCreateScheduleViewDays(
  scheduleDays: AdminMasterCreateScheduleDayInput[],
): AdminMasterCreateScheduleDayView[] {
  return scheduleDays.map((item) => ({
    weekday: item.weekday,
    isWorking: item.isWorking,
    openTime: item.openTime,
    closeTime: item.closeTime,
  }));
}

function upsertMasterCreateScheduleDay(
  days: AdminMasterCreateScheduleDayInput[],
  day: AdminMasterCreateScheduleDayInput,
): AdminMasterCreateScheduleDayInput[] {
  const filtered = days.filter((current) => current.weekday !== day.weekday);
  return [...filtered, day].sort((a, b) => a.weekday - b.weekday);
}

function isMasterCreateScheduleReady(days: AdminMasterCreateScheduleDayInput[]): boolean {
  if (days.length !== 7) return false;
  const unique = new Set(days.map((day) => day.weekday));
  if (unique.size !== 7) return false;

  return days.some((day) => day.isWorking && !!day.openTime && !!day.closeTime);
}

function buildAdminMasterCreateConfirmData(
  draft: AdminMasterCreateDraft,
  language: BotUiLanguage,
): AdminMasterCreateConfirmViewData {
  if (
    !draft.displayName ||
    !draft.telegramUserId ||
    draft.selectedServiceIds.length === 0 ||
    draft.experienceYears == null ||
    draft.proceduresDoneTotal == null ||
    !draft.bio ||
    !draft.materialsInfo ||
    !draft.contactPhoneE164 ||
    !draft.contactEmail
  ) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_PROFILE_INCOMPLETE'));
  }
  if (!isMasterCreateScheduleReady(draft.scheduleDays)) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_MASTERS_MSG_SCHEDULE_REQUIRED'));
  }

  const selectedServiceNames = draft.availableServices
    .filter((service) => draft.selectedServiceIds.includes(service.id))
    .map((service) => service.name);

  return {
    displayName: draft.displayName,
    telegramUserId: draft.telegramUserId,
    selectedServiceNames,
    experienceYears: draft.experienceYears,
    proceduresDoneTotal: draft.proceduresDoneTotal,
    bio: draft.bio,
    materialsInfo: draft.materialsInfo,
    contactPhoneE164: draft.contactPhoneE164,
    contactEmail: draft.contactEmail,
    scheduleDays: toMasterCreateScheduleViewDays(draft.scheduleDays),
  };
}

async function renderAdminMasterCreateStart(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const availableServices = await listActiveServicesCatalog({ studioId, limit: 100 });

  state.mastersCurrentSection = 'create';
  state.mastersSelectedMasterId = null;
  state.mastersEditDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;
  state.mastersCreateDraft = {
    mode: 'intro',
    displayName: null,
    telegramUserId: null,
    targetUserId: null,
    selectedServiceIds: [],
    availableServices,
    experienceYears: null,
    proceduresDoneTotal: null,
    bio: null,
    materialsInfo: null,
    contactPhoneE164: null,
    contactEmail: null,
    scheduleDays: getDefaultMasterCreateScheduleDays(),
    scheduleSelectedWeekday: null,
    schedulePendingFromTime: null,
  };

  const text = formatAdminMasterCreateStartText(state.language);
  const keyboard = createAdminMasterCreateStartKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterCreateTextStep(
  ctx: MyContext,
  draft: AdminMasterCreateDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  let text = '';
  switch (draft.mode) {
    case 'awaiting_display_name':
      text = formatAdminMasterCreateDisplayNameInputText(state.language);
      break;
    case 'awaiting_telegram_id':
      text = formatAdminMasterCreateTelegramInputText(draft.displayName ?? '—', state.language);
      break;
    case 'awaiting_experience_years':
      text = formatAdminMasterCreateExperienceYearsInputText(state.language);
      break;
    case 'awaiting_procedures_done_total':
      text = formatAdminMasterCreateProceduresInputText(state.language);
      break;
    case 'awaiting_bio':
      text = formatAdminMasterCreateBioInputText(state.language);
      break;
    case 'awaiting_materials':
      text = formatAdminMasterCreateMaterialsInputText(state.language);
      break;
    case 'awaiting_phone':
      text = formatAdminMasterCreatePhoneInputText(state.language);
      break;
    case 'awaiting_email':
      text = formatAdminMasterCreateEmailInputText(state.language);
      break;
    case 'awaiting_schedule_from': {
      if (!draft.scheduleSelectedWeekday) {
        throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_PICK_WEEKDAY_FIRST'));
      }
      text = formatAdminMasterCreateScheduleFromInputText(
        draft.scheduleSelectedWeekday,
        state.language,
      );
      break;
    }
    case 'awaiting_schedule_to': {
      if (!draft.scheduleSelectedWeekday || !draft.schedulePendingFromTime) {
        throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_PICK_DAY_AND_FROM_FIRST'));
      }
      text = formatAdminMasterCreateScheduleToInputText(
        draft.scheduleSelectedWeekday,
        draft.schedulePendingFromTime,
        state.language,
      );
      break;
    }
    default:
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_INVALID_CREATE_STEP'));
  }

  const keyboard =
    draft.mode === 'awaiting_schedule_from' || draft.mode === 'awaiting_schedule_to'
      ? createAdminMasterCreateScheduleInputKeyboard(draft.scheduleSelectedWeekday ?? 1, state.language)
      : createAdminMasterCreateInputKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterCreateServicesStep(
  ctx: MyContext,
  draft: AdminMasterCreateDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const text = formatAdminMasterCreateServicesText(
    draft.displayName ?? '—',
    draft.availableServices,
    draft.selectedServiceIds,
    state.language,
  );
  const keyboard = createAdminMasterCreateServicesKeyboard(
    draft.availableServices,
    draft.selectedServiceIds,
    state.language,
  );

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterCreateSchedulePickStep(
  ctx: MyContext,
  draft: AdminMasterCreateDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const text = formatAdminMasterCreateSchedulePickText(
    draft.displayName ?? '—',
    toMasterCreateScheduleViewDays(draft.scheduleDays),
    state.language,
  );
  const keyboard = createAdminMasterCreateSchedulePickKeyboard(
    toMasterCreateScheduleViewDays(draft.scheduleDays),
    state.language,
  );

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterCreateConfirmStep(
  ctx: MyContext,
  draft: AdminMasterCreateDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const confirmData = buildAdminMasterCreateConfirmData(draft, state.language);
  const text = formatAdminMasterCreateConfirmText(confirmData, state.language);
  const keyboard = createAdminMasterCreateConfirmKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditMenu(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const details = await ensureAdminMasterEditableAccess(state, masterId);
  state.mastersCurrentSection = 'edit';
  state.mastersSelectedMasterId = masterId;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMasterEditMenuText(details.master.displayName, state.language);
  const keyboard = createAdminMasterEditMenuKeyboard(masterId, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditInput(
  ctx: MyContext,
  masterId: string,
  field: AdminMasterEditableField,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  await ensureAdminMasterEditableAccess(state, masterId);
  const currentValue = await resolveAdminMasterEditableCurrentValue(masterId, field, state.language);

  state.mastersCurrentSection = 'edit';
  state.mastersSelectedMasterId = masterId;
  state.mastersEditDraft = {
    masterId,
    field,
    mode: 'awaiting_value',
    currentValue,
    value: null,
  };
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMasterEditInputText(field, currentValue, state.language);
  const keyboard = createAdminMasterEditInputKeyboard(masterId, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditConfirm(
  ctx: MyContext,
  draft: AdminMasterEditDraft,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const nextValue = draft.value ?? draft.currentValue;
  const text = formatAdminMasterEditConfirmText(
    draft.field,
    draft.currentValue,
    nextValue,
    state.language,
  );
  const keyboard = createAdminMasterEditConfirmKeyboard(draft.masterId, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditServicesMenu(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const details = await ensureAdminMasterEditableAccess(state, masterId);
  const items = await listMasterOwnServicesManage(masterId);

  state.mastersCurrentSection = 'edit-services';
  state.mastersSelectedMasterId = masterId;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersDeleteDraft = null;
  state.mastersServicesDraft = {
    masterId,
    masterName: details.master.displayName,
    mode: 'menu',
    items,
  };

  const text = formatAdminMasterEditServicesMenuText(
    details.master.displayName,
    items,
    state.language,
  );
  const keyboard = createAdminMasterEditServicesMenuKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditServicesAddCandidates(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const details = await ensureAdminMasterEditableAccess(state, masterId);
  const candidates = await listMasterOwnServicesAddCandidates(masterId);

  state.mastersCurrentSection = 'edit-services';
  state.mastersSelectedMasterId = masterId;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersDeleteDraft = null;
  state.mastersServicesDraft = {
    masterId,
    masterName: details.master.displayName,
    mode: 'add_candidates',
    items: candidates,
  };

  const text = formatAdminMasterEditServicesAddCandidatesText(
    details.master.displayName,
    candidates,
    state.language,
  );
  const keyboard = createAdminMasterEditServicesAddCandidatesKeyboard(candidates, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterEditServicesRemoveCandidates(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const details = await ensureAdminMasterEditableAccess(state, masterId);
  const candidates = await listMasterOwnServicesRemoveCandidates(masterId);

  state.mastersCurrentSection = 'edit-services';
  state.mastersSelectedMasterId = masterId;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersDeleteDraft = null;
  state.mastersServicesDraft = {
    masterId,
    masterName: details.master.displayName,
    mode: 'remove_candidates',
    items: candidates,
  };

  const text = formatAdminMasterEditServicesRemoveCandidatesText(
    details.master.displayName,
    candidates,
    state.language,
  );
  const keyboard = createAdminMasterEditServicesRemoveCandidatesKeyboard(candidates, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterBookingsList(
  ctx: MyContext,
  masterId: string,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getMasterCatalogDetailsById({ masterId, studioId });
  if (!details) {
    await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_DETAILS_NOT_FOUND'));
    await renderAdminMastersCatalog(ctx, false);
    return;
  }

  const feed = await listAdminBookingsFeed({
    studioId,
    category: 'all',
    masterId,
    limit: 5,
    offset,
  });

  state.mastersCurrentSection = 'bookings';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsFeed = feed;
  state.mastersBookingsOpenedAppointmentId = null;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMasterBookingsFeedText(details.master.displayName, feed, state.language);
  const keyboard = createAdminMasterBookingsFeedKeyboard(feed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminMasterBookingCard(
  ctx: MyContext,
  masterId: string,
  appointmentId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const fromFeed =
    state.mastersBookingsFeed?.items.find((item) => item.appointmentId === appointmentId) ?? null;
  const booking = fromFeed ?? (await getAdminBookingCardById({ studioId, appointmentId }));
  if (!booking || booking.masterId !== masterId) {
    await replyAdminWarning(
      ctx,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_BOOKING_NOT_FOUND_IN_MASTER_CONTEXT'),
    );
    await renderAdminMasterBookingsList(ctx, masterId, state.mastersBookingsFeed?.offset ?? 0, false);
    return;
  }

  state.mastersCurrentSection = 'bookings';
  state.mastersSelectedMasterId = masterId;
  state.mastersBookingsOpenedAppointmentId = appointmentId;
  state.mastersEditDraft = null;
  state.mastersCreateDraft = null;
  state.mastersServicesDraft = null;
  state.mastersDeleteDraft = null;

  const text = formatAdminMasterBookingCardText(booking, state.language);
  const keyboard = createAdminMasterBookingCardKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function loadAdminServicesCatalog(state: AdminPanelSceneState): Promise<ServicesCatalogItem[]> {
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const services = await listActiveServicesCatalog({ studioId, limit: 50 });
  state.servicesCatalog = services;
  return services;
}

async function renderAdminServicesCatalog(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const services = await loadAdminServicesCatalog(state);
  state.servicesCurrentSection = 'catalog';
  state.servicesSelectedServiceId = null;
  state.servicesEditDraft = null;
  state.servicesCreateDraft = null;

  const text = formatAdminServicesCatalogText(services, state.language);
  const keyboard = createAdminServicesCatalogKeyboard(services, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminServiceDetails(
  ctx: MyContext,
  serviceId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getServiceCatalogDetailsById({ serviceId, studioId });
  if (!details) {
    await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_NOT_FOUND_OR_INACTIVE'));
    await renderAdminServicesCatalog(ctx, false);
    return;
  }

  state.servicesCurrentSection = 'details';
  state.servicesSelectedServiceId = serviceId;
  state.servicesEditDraft = null;
  state.servicesCreateDraft = null;

  const text = formatAdminServiceDetailsText(details, state.language);
  const keyboard = createAdminServiceDetailsKeyboard(serviceId, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminServiceEditMenu(
  ctx: MyContext,
  serviceId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const service = await getAdminEditableServiceById({ studioId, serviceId });
  if (!service) {
    await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_NOT_FOUND_FOR_EDIT'));
    await renderAdminServicesCatalog(ctx, false);
    return;
  }

  state.servicesCurrentSection = 'edit';
  state.servicesSelectedServiceId = service.id;
  state.servicesCreateDraft = null;

  if (!state.servicesEditDraft || state.servicesEditDraft.serviceId !== service.id) {
    state.servicesEditDraft = {
      serviceId: service.id,
      serviceName: service.name,
      field: 'name',
      mode: 'awaiting_text',
      currentDurationMinutes: service.durationMinutes,
      currentBasePrice: service.basePrice,
      currentCurrencyCode: service.currencyCode,
      currentDescription: service.description,
      currentResultDescription: service.resultDescription,
      currentStepNo: null,
      currentStepTitle: null,
      currentStepDescription: null,
      currentStepDurationMinutes: null,
      stepOptions: [],
      currentGuaranteeNo: null,
      currentGuaranteeText: null,
      guaranteeOptions: [],
      currentValue: service.name,
      value: null,
    };
  } else {
    state.servicesEditDraft.serviceName = service.name;
    state.servicesEditDraft.currentDurationMinutes = service.durationMinutes;
    state.servicesEditDraft.currentBasePrice = service.basePrice;
    state.servicesEditDraft.currentCurrencyCode = service.currencyCode;
    state.servicesEditDraft.currentDescription = service.description;
    state.servicesEditDraft.currentResultDescription = service.resultDescription;
    state.servicesEditDraft.currentStepNo = null;
    state.servicesEditDraft.currentStepTitle = null;
    state.servicesEditDraft.currentStepDescription = null;
    state.servicesEditDraft.currentStepDurationMinutes = null;
    state.servicesEditDraft.stepOptions = [];
    state.servicesEditDraft.currentGuaranteeNo = null;
    state.servicesEditDraft.currentGuaranteeText = null;
    state.servicesEditDraft.guaranteeOptions = [];
    state.servicesEditDraft.currentValue =
      state.servicesEditDraft.field === 'name'
        ? service.name
        : state.servicesEditDraft.field === 'deactivate'
        ? null
        : state.servicesEditDraft.field === 'step_title'
        ? state.servicesEditDraft.currentStepTitle
        : state.servicesEditDraft.field === 'step_description'
        ? state.servicesEditDraft.currentStepDescription
        : state.servicesEditDraft.field === 'step_duration_minutes'
        ? state.servicesEditDraft.currentStepDurationMinutes
        : state.servicesEditDraft.field === 'guarantee_text'
        ? state.servicesEditDraft.currentGuaranteeText
        : state.servicesEditDraft.field === 'duration_minutes'
        ? String(service.durationMinutes)
        : state.servicesEditDraft.field === 'base_price'
        ? service.basePrice
        : state.servicesEditDraft.field === 'description'
          ? service.description
          : service.resultDescription;
  }

  const text = formatAdminServiceEditMenuText(
    service.name,
    service.durationMinutes,
    service.basePrice,
    service.currencyCode,
    service.description,
    service.resultDescription, state.language);
  const keyboard = createAdminServiceEditMenuKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

function createEmptyAdminServiceCreateDraft(): AdminServiceCreateDraft {
  return {
    mode: 'awaiting_name',
    name: null,
    durationMinutes: null,
    basePrice: null,
    currencyCode: 'CZK',
    description: null,
    resultDescription: null,
    pendingStepTitle: null,
    pendingStepDurationMinutes: null,
    steps: [],
    guarantees: [],
  };
}

async function startAdminServiceCreate(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  state.servicesCurrentSection = 'create';
  state.servicesSelectedServiceId = null;
  state.servicesEditDraft = null;
  state.servicesCreateDraft = createEmptyAdminServiceCreateDraft();

  const text = `${formatAdminServiceCreateStartText(state.language)}\n\n${formatAdminServiceCreateNameInputText(state.language)}`;
  const keyboard = createAdminServiceCreateInputKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsOverview(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const overview = await getAdminPanelStatsOverview(studioId);
  state.statsOverview = overview;
  state.statsCurrentSection = 'overview';
  state.statsMastersFeed = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsServicesFeed = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;

  const text = formatAdminStatsOverviewText(overview, state.language);
  const keyboard = createAdminStatsOverviewKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMastersList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const feed = await listAdminPanelStatsMastersFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'masters';
  state.statsMastersFeed = feed;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMastersListText(feed, state.language);
  const keyboard = createAdminStatsMastersListKeyboard(feed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMasterDetails(
  ctx: MyContext,
  masterId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getAdminPanelStatsMasterDetails({ studioId, masterId });
  state.statsCurrentSection = 'masters';
  state.statsSelectedMasterId = masterId;
  state.statsMasterDetails = details;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMasterDetailsText(details, state.language);
  const keyboard = createAdminStatsMasterDetailsKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsServicesList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const feed = await listAdminPanelStatsServicesFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'services';
  state.statsServicesFeed = feed;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsServicesListText(feed, state.language);
  const keyboard = createAdminStatsServicesListKeyboard(feed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsServiceDetails(
  ctx: MyContext,
  serviceId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getAdminPanelStatsServiceDetails({ studioId, serviceId });
  state.statsCurrentSection = 'services';
  state.statsSelectedServiceId = serviceId;
  state.statsServiceDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsServiceDetailsText(details, state.language);
  const keyboard = createAdminStatsServiceDetailsKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMonthlyList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const feed = await listAdminPanelStatsMonthlyFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'monthly';
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = feed;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMonthlyListText(feed, state.language);
  const keyboard = createAdminStatsMonthlyListKeyboard(feed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsMonthlyReportDetails(
  ctx: MyContext,
  monthCode: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getAdminPanelStatsMonthlyReportDetails({ studioId, monthCode });
  state.statsCurrentSection = 'monthly';
  state.statsSelectedMonthCode = monthCode;
  state.statsMonthlyReportDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsClientsFeed = null;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;

  const text = formatAdminStatsMonthlyReportDetailsText(details, state.language);
  const keyboard = createAdminStatsMonthlyReportDetailsKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsClientsList(
  ctx: MyContext,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const feed = await listAdminPanelStatsClientsFeed({
    studioId,
    limit: 5,
    offset,
  });
  state.statsCurrentSection = 'clients';
  state.statsClientsFeed = feed;
  state.statsSelectedClientId = null;
  state.statsClientDetails = null;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;

  const text = formatAdminStatsClientsListText(feed, state.language);
  const keyboard = createAdminStatsClientsListKeyboard(feed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminStatsClientDetails(
  ctx: MyContext,
  clientId: string,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getAdminPanelStatsClientDetails({ studioId, clientId });
  state.statsCurrentSection = 'clients';
  state.statsSelectedClientId = clientId;
  state.statsClientDetails = details;
  state.statsSelectedMasterId = null;
  state.statsMasterDetails = null;
  state.statsSelectedServiceId = null;
  state.statsServiceDetails = null;
  state.statsMonthlyFeed = null;
  state.statsSelectedMonthCode = null;
  state.statsMonthlyReportDetails = null;

  const text = formatAdminStatsClientDetailsText(details, state.language);
  const keyboard = createAdminStatsClientDetailsKeyboard(state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderRecordsCategoryStub(
  ctx: MyContext,
  category: AdminBookingsCategory,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  state.recordsFeed = await listAdminBookingsFeed({
    studioId,
    category,
    limit: 5,
    offset,
  });
  state.recordsLastCategory = category;

  const text = formatAdminBookingsFeedText(state.recordsFeed, state.language);
  const keyboard = createAdminBookingsFeedKeyboard(state.recordsFeed, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // Якщо редагування не вдалося — надсилаємо нове повідомлення.
    }
  }

  await ctx.reply(text, keyboard);
}

async function replyAdminSuccess(
  ctx: MyContext,
  message: string,
  extra?: Parameters<MyContext['reply']>[1],
): Promise<void> {
  await ctx.reply(`✅ ${message}`, extra);
}

async function replyAdminWarning(
  ctx: MyContext,
  message: string,
  extra?: Parameters<MyContext['reply']>[1],
): Promise<void> {
  await ctx.reply(`⚠️ ${message}`, extra);
}

async function replyAdminInfo(
  ctx: MyContext,
  message: string,
  extra?: Parameters<MyContext['reply']>[1],
): Promise<void> {
  await ctx.reply(`ℹ️ ${message}`, extra);
}

function getAdminActorMeta(ctx: MyContext, access?: AdminPanelAccess | null): Record<string, unknown> {
  return {
    adminUserId: access?.userId ?? null,
    studioId: access?.studioId ?? null,
    telegramUserId: ctx.from?.id ?? null,
    telegramUsername: ctx.from?.username ?? null,
    chatId: ctx.chat?.id ?? null,
    updateType: ctx.updateType,
  };
}

function logAdminCriticalAction(
  ctx: MyContext,
  action: string,
  meta: Record<string, unknown> = {},
  access?: AdminPanelAccess | null,
): void {
  loggerAdminPanel.info(`[admin-panel] ${action}`, {
    ...getAdminActorMeta(ctx, access),
    ...meta,
  });
}

function parseAppointmentIdFromAction(
  ctx: MyContext,
  regex: RegExp,
  language: BotUiLanguage = 'uk',
): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);
  const appointmentId = matches?.[1];
  if (!appointmentId) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_BOOKING_CALLBACK'));
  }

  return appointmentId;
}

function parseNumericIdFromAction(
  ctx: MyContext,
  regex: RegExp,
  fieldLabel: string,
  language: BotUiLanguage = 'uk',
): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const id = match?.[1]?.trim() ?? '';
  if (!/^\d+$/.test(id) || id === '0') {
    throw new ValidationError(
      tBotTemplate(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_NUMERIC_FIELD', {
        field: fieldLabel,
      }),
    );
  }
  return id;
}

function parseWeekdayFromAction(
  ctx: MyContext,
  regex: RegExp,
  language: BotUiLanguage = 'uk',
): number {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const weekday = match?.[1] ? Number(match[1]) : Number.NaN;

  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_WEEKDAY'));
  }

  return weekday;
}

function parseMonthCodeFromAction(
  ctx: MyContext,
  regex: RegExp,
  language: BotUiLanguage = 'uk',
): string {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const match = callbackData.match(regex);
  const monthCode = match?.[1]?.trim() ?? '';
  const monthMatch = monthCode.match(/^(\d{4})(\d{2})$/);
  const month = monthMatch?.[2] ? Number(monthMatch[2]) : NaN;
  if (!monthMatch || !Number.isFinite(month) || month < 1 || month > 12) {
    throw new ValidationError(tBot(language, 'ADMIN_PANEL_COMMON_MSG_INVALID_MONTH_CODE'));
  }
  return monthCode;
}

async function resolveAdminRecordById(
  state: AdminPanelSceneState,
  appointmentId: string,
): Promise<AdminBookingItem | null> {
  const normalizedAppointmentId = String(appointmentId);
  const fromFeed =
    state.recordsFeed?.items.find((item) => String(item.appointmentId) === normalizedAppointmentId) ?? null;
  if (fromFeed) return fromFeed;

  const studioId = state.access?.studioId;
  if (!studioId) return null;
  return getAdminBookingCardById({
    studioId,
    appointmentId,
  });
}

function tryParseAppointmentIdFromAction(ctx: MyContext, regex: RegExp): string | null {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
  const matches = callbackData.match(regex);
  const appointmentId = matches?.[1]?.trim() ?? '';
  if (!/^\d+$/.test(appointmentId) || appointmentId === '0') {
    return null;
  }
  return appointmentId;
}

async function renderAdminBookingCard(ctx: MyContext, item: AdminBookingItem): Promise<void> {
  try {
    const state = getSceneState(ctx);
    state.recordsOpenedAppointmentId = item.appointmentId;
    const text = formatAdminBookingDetailsCardText(item, state.language);
    const keyboard = createAdminBookingDetailsCardKeyboard(item, state.language);

    try {
      await ctx.editMessageText(text, keyboard);
    } catch {
      await ctx.reply(text, keyboard);
    }
  } catch (error) {
    handleError({
      logger: loggerAdminPanel,
      level: 'error',
      scope: 'admin-panel.scene',
      action: 'Failed to render booking card',
      error,
      meta: {
        appointmentId: item.appointmentId,
      },
    });
    await replyAdminWarning(
      ctx,
      tBot(getSceneState(ctx).language, 'ADMIN_PANEL_RECORDS_MSG_OPEN_CARD_FAILED_RETRY'),
    );
  }
}

async function renderAdminBookingClientContact(
  ctx: MyContext,
  item: AdminBookingItem,
  preferEdit: boolean,
): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminBookingContactClientText(item, language);
  const keyboard = createAdminBookingContactClientKeyboard(item, language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminBookingClientProfile(
  ctx: MyContext,
  item: AdminBookingItem,
  preferEdit: boolean,
): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminBookingClientProfileText(item, language);
  const keyboard = createAdminBookingClientProfileKeyboard(item, language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderAdminBookingMasterProfile(
  ctx: MyContext,
  item: AdminBookingItem,
  preferEdit: boolean,
): Promise<void> {
  const state = getSceneState(ctx);
  const studioId = state.access?.studioId;
  if (!studioId) {
    throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
  }

  const details = await getMasterCatalogDetailsById({ masterId: item.masterId, studioId });
  if (!details) {
    await replyAdminWarning(
      ctx,
      tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_MASTER_PROFILE_UNAVAILABLE'),
    );
    await renderAdminBookingCard(ctx, item);
    return;
  }

  const text = formatAdminMasterDetailsText(details, state.language);
  const keyboard = createAdminBookingMasterProfileKeyboard(item, state.language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function resolveNextPendingBooking(
  state: AdminPanelSceneState,
  currentAppointmentId: string,
): Promise<AdminBookingItem | null> {
  const studioId = state.access?.studioId;
  if (!studioId) return null;

  const pending = await listAdminBookingsFeed({
    studioId,
    category: 'pending',
    limit: 10,
    offset: 0,
  });

  if (pending.items.length === 0) {
    return null;
  }

  return pending.items.find((item) => item.appointmentId !== currentAppointmentId) ?? null;
}

async function renderRecordsFallback(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  if (state.recordsFeed) {
    await renderRecordsCategoryStub(ctx, state.recordsFeed.category, state.recordsFeed.offset, preferEdit);
    return;
  }

  await renderRecordsMenu(ctx);
}

async function renderAdminCancelBookingConfirm(ctx: MyContext, item: AdminBookingItem): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminCancelBookingConfirmText(item, language);
  const keyboard = createAdminCancelBookingConfirmKeyboard(item, language);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderAdminHardDeleteBookingConfirm(
  ctx: MyContext,
  item: AdminBookingItem,
): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminHardDeleteBookingConfirmText(item, language);
  const keyboard = createAdminHardDeleteBookingConfirmKeyboard(item, language);

  try {
    await ctx.editMessageText(text, keyboard);
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderAdminClearCanceledConfirm(
  ctx: MyContext,
  total: number,
  preferEdit: boolean,
): Promise<void> {
  const language = getSceneState(ctx).language;
  const text = formatAdminClearCanceledBookingsConfirmText(total, language);
  const keyboard = createAdminClearCanceledBookingsConfirmKeyboard(language);

  if (preferEdit && ctx.updateType === 'callback_query') {
    try {
      await ctx.editMessageText(text, keyboard);
      return;
    } catch {
      // fallthrough
    }
  }

  await ctx.reply(text, keyboard);
}

async function renderRecordsCategoryWithOffsetFallback(
  ctx: MyContext,
  category: AdminBookingsCategory,
  offset: number,
  preferEdit: boolean,
): Promise<void> {
  await renderRecordsCategoryStub(ctx, category, offset, preferEdit);
  const feed = getSceneState(ctx).recordsFeed;
  if (!feed) return;

  if (feed.items.length === 0 && feed.offset > 0) {
    const prevOffset = Math.max(0, feed.offset - feed.limit);
    await renderRecordsCategoryStub(ctx, category, prevOffset, preferEdit);
  }
}

async function resolveRescheduleTargetItem(state: AdminPanelSceneState): Promise<AdminBookingItem | null> {
  const appointmentId = state.recordsRescheduleDraft?.appointmentId;
  if (!appointmentId) return null;

  return resolveAdminRecordById(state, appointmentId);
}

async function renderRescheduleDateStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const item = await resolveRescheduleTargetItem(state);
  if (!item) {
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminRescheduleDateStepText(item, state.language);
  const keyboard = createAdminRescheduleDateKeyboard(buildBookingDateOptions(7), state.language);

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRescheduleTimeStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsRescheduleDraft;
  const item = await resolveRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode) {
    await renderRescheduleDateStep(ctx, preferEdit);
    return;
  }

  const timeCodes = getAvailableRescheduleTimeCodes(draft.dateCode);
  const baseText = formatAdminRescheduleTimeStepText(item, draft.dateCode, state.language);
  const text =
    timeCodes.length > 0
      ? baseText
      : `${baseText}\n\n${tBot(state.language, 'ADMIN_PANEL_RECORDS_RESCHEDULE_NO_TIMES')}`;
  const keyboard = createAdminRescheduleTimeKeyboard(timeCodes, state.language);

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderRescheduleConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsRescheduleDraft;
  const item = await resolveRescheduleTargetItem(state);
  if (!draft || !item || !draft.dateCode || !draft.timeCode) {
    await renderRescheduleTimeStep(ctx, preferEdit);
    return;
  }

  const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
  const currentStartAt = toSafeDateValue(item.startAt as unknown as Date | string);
  const currentEndAt = toSafeDateValue(item.endAt as unknown as Date | string);
  if (!currentStartAt || !currentEndAt || currentEndAt.getTime() <= currentStartAt.getTime()) {
    resetRecordsActionDrafts(state);
    await replyAdminWarning(
      ctx,
      tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CURRENT_TIME_UNAVAILABLE'),
    );
    await renderRecordsFallback(ctx, false);
    return;
  }

  const durationMs = currentEndAt.getTime() - currentStartAt.getTime();
  const newEndAt = new Date(newStartAt.getTime() + durationMs);
  const text = formatAdminRescheduleConfirmText(item, newStartAt, newEndAt, state.language);
  const keyboard = createAdminRescheduleConfirmKeyboard(state.language);

  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function loadChangeMasterCandidates(item: AdminBookingItem): Promise<MasterBookingOption[]> {
  const candidates = await listActiveMastersByService({
    studioId: item.studioId,
    serviceId: item.serviceId,
    limit: 20,
  });

  return candidates.filter((candidate) => candidate.masterId !== item.masterId);
}

async function renderChangeMasterSelectStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsChangeMasterDraft;
  if (!draft) {
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const item = await resolveAdminRecordById(state, draft.appointmentId);
  if (!item) {
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminChangeMasterStepText(item, draft.candidates, state.language);
  const keyboard = createAdminChangeMasterSelectKeyboard(item, draft.candidates, state.language);
  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function renderChangeMasterConfirmStep(ctx: MyContext, preferEdit: boolean): Promise<void> {
  const state = getSceneState(ctx);
  const draft = state.recordsChangeMasterDraft;
  if (!draft || !draft.selectedMasterId || !draft.selectedMasterName) {
    await renderChangeMasterSelectStep(ctx, preferEdit);
    return;
  }

  const item = await resolveAdminRecordById(state, draft.appointmentId);
  if (!item) {
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, preferEdit);
    return;
  }

  const text = formatAdminChangeMasterConfirmText(item, draft.selectedMasterName, state.language);
  const keyboard = createAdminChangeMasterConfirmKeyboard(state.language);
  try {
    if (preferEdit) {
      await ctx.editMessageText(text, keyboard);
    } else {
      await ctx.reply(text, keyboard);
    }
  } catch {
    await ctx.reply(text, keyboard);
  }
}

async function notifyAdminConfirmedBooking(
  item: AdminBookingItem,
  _language: BotUiLanguage,
): Promise<void> {
  try {
    await dispatchNotification({
      userId: item.clientId,
      notificationType: 'booking_confirmation',
      appointmentId: item.appointmentId,
      textPayload: {
        studioName: item.studioName,
        serviceName: item.serviceName,
        startAt: item.startAt,
        statusLabel: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_STATUS_CONFIRMED'),
        message: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_MESSAGE_CONFIRMED'),
      },
      email: {
        template: 'bookingConfirmed',
        data: {
          recipientName: item.attendeeName ?? item.clientFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking confirm',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

async function notifyAdminCanceledBooking(
  item: AdminBookingItem,
  _language: BotUiLanguage,
): Promise<void> {
  try {
    await dispatchNotification({
      userId: item.clientId,
      notificationType: 'status_change',
      appointmentId: item.appointmentId,
      textPayload: {
        studioName: item.studioName,
        serviceName: item.serviceName,
        startAt: item.startAt,
        statusLabel: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_STATUS_CANCELED'),
        message: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_MESSAGE_CANCELED'),
      },
      email: {
        template: 'bookingCancelled',
        data: {
          recipientName: item.attendeeName ?? item.clientFirstName,
          bookingId: item.appointmentId,
          studioName: item.studioName,
          serviceName: item.serviceName,
          masterName: item.masterName,
          startAt: item.startAt,
          cancelReason: tBot('uk', 'ADMIN_PANEL_RECORDS_REASON_CANCELED_BY_ADMIN'),
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking cancel',
      error,
      meta: { appointmentId: item.appointmentId, clientId: item.clientId },
    });
  }
}

async function notifyAdminRescheduledBooking(
  result: RescheduleAdminBookingResult,
  _language: BotUiLanguage,
): Promise<void> {
  try {
    await dispatchNotification({
      userId: result.current.clientId,
      notificationType: 'status_change',
      appointmentId: result.current.appointmentId,
      textPayload: {
        studioName: result.current.studioName,
        serviceName: result.current.serviceName,
        startAt: result.current.startAt,
        statusLabel: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_STATUS_RESCHEDULED'),
        message: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_MESSAGE_RESCHEDULED'),
      },
      email: {
        template: 'bookingRescheduled',
        data: {
          recipientName: result.current.attendeeName ?? result.current.clientFirstName,
          bookingId: result.current.appointmentId,
          oldStartAt: result.previous.startAt,
          newStartAt: result.current.startAt,
          serviceName: result.current.serviceName,
          masterName: result.current.masterName,
          studioName: result.current.studioName,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin booking reschedule',
      error,
      meta: { appointmentId: result.current.appointmentId, clientId: result.current.clientId },
    });
  }
}

async function notifyAdminMasterChangedBooking(
  previous: AdminBookingItem,
  current: AdminBookingItem,
  _language: BotUiLanguage,
): Promise<void> {
  try {
    await dispatchNotification({
      userId: current.clientId,
      notificationType: 'status_change',
      appointmentId: current.appointmentId,
      textPayload: {
        studioName: current.studioName,
        serviceName: current.serviceName,
        startAt: current.startAt,
        statusLabel: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_STATUS_MASTER_CHANGED'),
        message: tBot('uk', 'ADMIN_PANEL_RECORDS_NOTIFY_MESSAGE_MASTER_CHANGED'),
      },
      email: {
        template: 'masterChanged',
        data: {
          recipientName: current.attendeeName ?? current.clientFirstName,
          bookingId: current.appointmentId,
          serviceName: current.serviceName,
          oldMasterName: previous.masterName,
          newMasterName: current.masterName,
          startAt: current.startAt,
          studioName: current.studioName,
        },
      },
      metadata: { source: 'admin-panel' },
    });
  } catch (error) {
    handleError({
      logger: loggerNotification,
      level: 'warn',
      scope: 'admin-panel.scene',
      action: 'Failed to notify client after admin master change',
      error,
      meta: { appointmentId: current.appointmentId, clientId: current.clientId },
    });
  }
}

export function createAdminPanelScene(): Scenes.WizardScene<MyContext> {
  const scene = new Scenes.WizardScene<MyContext>(
    ADMIN_PANEL_SCENE_ID,
    async (ctx) => {
      const telegramId = ctx.from?.id;
      const state = getSceneState(ctx);

      const appUser = telegramId ? await getOrCreateUser(ctx) : null;
      state.language = resolveBotUiLanguage(appUser?.preferredLanguage ?? 'uk');
      state.access = telegramId ? await getAdminPanelAccessByTelegramId(telegramId) : null;
      state.recordsFeed = null;
      state.recordsLastCategory = null;
      state.recordsOpenedAppointmentId = null;
      state.recordsRescheduleDraft = null;
      state.recordsChangeMasterDraft = null;
      state.scheduleData = null;
      state.scheduleCurrentSection = null;
      state.scheduleDayOffDraft = null;
      state.scheduleHolidayDraft = null;
      state.scheduleTemporaryDraft = null;
      state.scheduleConfigureDayDraft = null;
      state.scheduleDeleteDraft = null;
      state.mastersCatalog = null;
      state.mastersSelectedMasterId = null;
      state.mastersBookingsFeed = null;
      state.mastersBookingsOpenedAppointmentId = null;
      state.mastersCurrentSection = null;
      state.mastersEditDraft = null;
      state.mastersCreateDraft = null;
      state.mastersServicesDraft = null;
      state.mastersDeleteDraft = null;
      state.servicesCatalog = null;
      state.servicesSelectedServiceId = null;
      state.servicesCurrentSection = null;
      state.servicesEditDraft = null;
      state.servicesCreateDraft = null;
      state.statsOverview = null;
      state.statsMastersFeed = null;
      state.statsSelectedMasterId = null;
      state.statsMasterDetails = null;
      state.statsServicesFeed = null;
      state.statsSelectedServiceId = null;
      state.statsServiceDetails = null;
      state.statsMonthlyFeed = null;
      state.statsSelectedMonthCode = null;
      state.statsMonthlyReportDetails = null;
      state.statsClientsFeed = null;
      state.statsSelectedClientId = null;
      state.statsClientDetails = null;
      state.statsCurrentSection = null;
      state.settingsAdmins = null;
      state.settingsAdminsDraft = null;
      state.settingsLanguageDraft = null;
      state.settingsNotificationsState = null;
      state.settingsNotificationsDeliveryProfile = null;
      state.settingsStudioData = null;
      state.settingsStudioDraft = null;
      state.settingsCurrentSection = null;

	      if (!state.access) {
	        logAdminCriticalAction(ctx, 'Access denied for admin panel');
	        await ctx.reply(tBot(state.language, 'ADMIN_PANEL_ACCESS_DENIED'));
	        await ctx.scene.leave();
	        await sendClientMainMenu(ctx);
	        return;
	      }

	      logAdminCriticalAction(ctx, 'Admin panel opened', {}, state.access);
	      await renderAdminRoot(ctx, false);
	      return ctx.wizard.next();
    },
    async (ctx) => {
      const state = getSceneState(ctx);
      const text = getUserText(ctx);
      if (!text) return;

      const dayOffDraft = state.scheduleDayOffDraft;
      if (dayOffDraft?.mode === 'awaiting_date') {
        try {
          const date = parseFutureDateInput(text, state.language);
          state.scheduleDayOffDraft = {
            mode: 'awaiting_confirm',
            offDate: formatDateSql(date),
            offDateLabel: formatDateLabel(date),
          };

          await ctx.reply(
            formatAdminScheduleDayOffConfirmText(formatDateLabel(date), state.language),
            createAdminScheduleDayOffConfirmKeyboard(state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_DATE_FAILED'));

          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_DATE_FORMAT')}`,
            createAdminScheduleDayOffInputKeyboard(state.language),
          );
        }
        return;
      }

      if (dayOffDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_FINISH_USE_CONFIRM_BUTTONS'),
          createAdminScheduleDayOffConfirmKeyboard(state.language),
        );
        return;
      }

      const holidayDraft = state.scheduleHolidayDraft;
      if (holidayDraft?.mode === 'awaiting_date') {
        try {
          const date = parseFutureDateInput(text, state.language);
          state.scheduleHolidayDraft = {
            mode: 'awaiting_name',
            holidayDate: formatDateSql(date),
            holidayDateLabel: formatDateLabel(date),
            holidayName: null,
          };

          await ctx.reply(
            formatAdminScheduleHolidayNameInputText(formatDateLabel(date), state.language),
            createAdminScheduleHolidayInputKeyboard(state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_DATE_FAILED'));

          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_DATE_FORMAT')}`,
            createAdminScheduleHolidayInputKeyboard(state.language),
          );
        }
        return;
      }

      if (holidayDraft?.mode === 'awaiting_name') {
        try {
          const holidayName = normalizeHolidayName(text, state.language);
          if (!holidayDraft.holidayDate || !holidayDraft.holidayDateLabel) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_PICK_HOLIDAY_DATE_FIRST'));
          }

          state.scheduleHolidayDraft = {
            mode: 'awaiting_confirm',
            holidayDate: holidayDraft.holidayDate,
            holidayDateLabel: holidayDraft.holidayDateLabel,
            holidayName,
          };

          await ctx.reply(
            formatAdminScheduleHolidayConfirmText(holidayDraft.holidayDateLabel, holidayName, state.language),
            createAdminScheduleHolidayConfirmKeyboard(state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_HOLIDAY_NAME_FAILED'));

          await replyAdminWarning(
            ctx,
            err.message,
            createAdminScheduleHolidayInputKeyboard(state.language),
          );
        }
        return;
      }

      if (holidayDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_FINISH_USE_CONFIRM_BUTTONS'),
          createAdminScheduleHolidayConfirmKeyboard(state.language),
        );
        return;
      }

      const temporaryDraft = state.scheduleTemporaryDraft;
      if (temporaryDraft?.mode === 'awaiting_period') {
        try {
          const { dateFrom, dateTo } = parseDateRangeInput(text, state.language);
          const rangeDays = countInclusiveDays(dateFrom, dateTo);
          if (rangeDays < MIN_TEMPORARY_SCHEDULE_DAYS) {
            throw new ValidationError(
              tBotTemplate(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TEMPORARY_MIN_DAYS', {
                minDays: MIN_TEMPORARY_SCHEDULE_DAYS,
              }),
            );
          }

          state.scheduleTemporaryDraft = {
            mode: 'configuring_days',
            dateFrom: formatDateSql(dateFrom),
            dateTo: formatDateSql(dateTo),
            dateFromLabel: formatDateLabel(dateFrom),
            dateToLabel: formatDateLabel(dateTo),
            days: [],
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDaysConfigText(
              formatDateLabel(dateFrom),
              formatDateLabel(dateTo),
              [],
              state.language,
            ),
            createAdminScheduleTemporaryDaysConfigKeyboard([], state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_PERIOD_FAILED'));

          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_RANGE_FORMAT')}`,
            createAdminScheduleTemporaryPeriodInputKeyboard(state.language),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_day_from') {
        try {
          const weekday = temporaryDraft.selectedWeekday;
          if (!weekday) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_PICK_WEEKDAY_FIRST'));
          }

          const fromTime = parseTimeInput(text, state.language);
          state.scheduleTemporaryDraft = {
            ...temporaryDraft,
            mode: 'awaiting_day_to',
            pendingFromTime: fromTime,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDayToInputText(weekday, fromTime, state.language),
            createAdminScheduleTemporaryDayInputKeyboard(weekday, state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_FROM_TIME_FAILED'));
          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_TIME_FORMAT')}`,
            createAdminScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1, state.language),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_day_to') {
        try {
          const weekday = temporaryDraft.selectedWeekday;
          const fromTime = temporaryDraft.pendingFromTime;
          if (!weekday || !fromTime) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_PICK_DAY_AND_FROM_FIRST'));
          }

          const toTime = parseTimeInput(text, state.language);
          if (timeToMinutes(toTime) <= timeToMinutes(fromTime)) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TO_AFTER_FROM'));
          }

          const updatedDays = upsertTemporaryDay(temporaryDraft.days, {
            weekday,
            isOpen: true,
            openTime: fromTime,
            closeTime: toTime,
          });

          state.scheduleTemporaryDraft = {
            ...temporaryDraft,
            mode: 'configuring_days',
            days: updatedDays,
            selectedWeekday: null,
            pendingFromTime: null,
          };

          await ctx.reply(
            formatAdminScheduleTemporaryDaysConfigText(
              temporaryDraft.dateFromLabel ?? '',
              temporaryDraft.dateToLabel ?? '',
              updatedDays,
              state.language,
            ),
            createAdminScheduleTemporaryDaysConfigKeyboard(updatedDays, state.language),
          );
        } catch (error) {
          const err = error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_TO_TIME_FAILED'));
          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_TIME_FORMAT')}`,
            createAdminScheduleTemporaryDayInputKeyboard(temporaryDraft.selectedWeekday ?? 1, state.language),
          );
        }
        return;
      }

      if (temporaryDraft?.mode === 'awaiting_confirm' || temporaryDraft?.mode === 'configuring_days') {
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_FINISH_USE_INLINE_BUTTONS'),
        );
        return;
      }

      const configureDayDraft = state.scheduleConfigureDayDraft;
      if (configureDayDraft?.mode === 'awaiting_from') {
        try {
          const weekday = configureDayDraft.weekday;
          if (!weekday) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_PICK_WEEKDAY_FIRST'));
          }

          const fromTime = parseTimeInput(text, state.language);
          state.scheduleConfigureDayDraft = {
            ...configureDayDraft,
            mode: 'awaiting_to',
            weekday,
            fromTime,
          };

          await ctx.reply(
            formatAdminScheduleConfigureDayToInputText(weekday, fromTime, state.language),
            createAdminScheduleConfigureDayInputKeyboard(weekday, state.language),
          );
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_FROM_TIME_FAILED'));

          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_TIME_FORMAT')}`,
            createAdminScheduleConfigureDayInputKeyboard(configureDayDraft.weekday ?? 1, state.language),
          );
        }
        return;
      }

      if (configureDayDraft?.mode === 'awaiting_to') {
        const access = state.access;
        try {
          const weekday = configureDayDraft.weekday;
          const fromTime = configureDayDraft.fromTime;
          if (!weekday || !fromTime) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_PICK_DAY_AND_FROM_FIRST'));
          }
          if (!access?.studioId) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
          }

          const toTime = parseTimeInput(text, state.language);
          if (timeToMinutes(toTime) <= timeToMinutes(fromTime)) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TO_AFTER_FROM'));
          }

          const updated = await upsertAdminStudioWeeklyDay({
            studioId: access.studioId,
            weekday,
            isOpen: true,
            openTime: fromTime,
            closeTime: toTime,
          });

	    state.scheduleConfigureDayDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Updated studio weekly schedule day',
	      {
	        weekday: updated.weekday,
	        isOpen: updated.isOpen,
	        openTime: updated.openTime,
	        closeTime: updated.closeTime,
	      },
	      access,
	    );
	    await ctx.reply(
	      formatAdminScheduleConfigureDaySuccessText(
	        updated.weekday,
              updated.isOpen,
              updated.openTime,
              updated.closeTime,
              state.language,
            ),
          );
          await renderScheduleSection(ctx, 'configure-day', false);
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_VALIDATE_TO_TIME_FAILED'));

          await replyAdminWarning(
            ctx,
            `${err.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_TIME_FORMAT')}`,
            createAdminScheduleConfigureDayInputKeyboard(configureDayDraft.weekday ?? 1, state.language),
          );
        }
        return;
      }

      const mastersCreateDraft = state.mastersCreateDraft;
      if (state.mastersCurrentSection === 'create' && mastersCreateDraft) {
        const access = state.access;

        try {
          if (mastersCreateDraft.mode === 'awaiting_display_name') {
            mastersCreateDraft.displayName = normalizeMasterDisplayName(text);
            mastersCreateDraft.mode = 'awaiting_telegram_id';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_telegram_id') {
            if (!access?.studioId) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
            }
            const telegramId = normalizeAdminMasterCreateTelegramIdInput(text, state.language);
            const candidate = await findAdminMasterCandidateByTelegramId({
              studioId: access.studioId,
              telegramId,
            });

            if (!candidate) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USER_NOT_FOUND_IN_STUDIO'));
            }
            if (candidate.isMaster) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USER_ALREADY_MASTER'));
            }

            mastersCreateDraft.telegramUserId = telegramId;
            mastersCreateDraft.targetUserId = candidate.userId;
            mastersCreateDraft.mode = 'selecting_services';
            await renderAdminMasterCreateServicesStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_experience_years') {
            mastersCreateDraft.experienceYears = normalizeAdminMasterCreateExperienceInput(
              text,
              state.language,
            );
            mastersCreateDraft.mode = 'awaiting_procedures_done_total';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_procedures_done_total') {
            mastersCreateDraft.proceduresDoneTotal = normalizeMasterProceduresDoneTotal(text);
            mastersCreateDraft.mode = 'awaiting_bio';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_bio') {
            mastersCreateDraft.bio = normalizeMasterBio(text);
            mastersCreateDraft.mode = 'awaiting_materials';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_materials') {
            mastersCreateDraft.materialsInfo = normalizeMasterMaterialsInfo(text);
            mastersCreateDraft.mode = 'awaiting_phone';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_phone') {
            mastersCreateDraft.contactPhoneE164 = normalizeMasterContactPhone(text);
            mastersCreateDraft.mode = 'awaiting_email';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_email') {
            mastersCreateDraft.contactEmail = normalizeMasterContactEmail(text);
            mastersCreateDraft.mode = 'awaiting_schedule_pick';
            await renderAdminMasterCreateSchedulePickStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_schedule_from') {
            if (!mastersCreateDraft.scheduleSelectedWeekday) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_PICK_WEEKDAY_FIRST'));
            }
            mastersCreateDraft.schedulePendingFromTime = parseTimeInput(text, state.language);
            mastersCreateDraft.mode = 'awaiting_schedule_to';
            await renderAdminMasterCreateTextStep(ctx, mastersCreateDraft, false);
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_schedule_to') {
            const weekday = mastersCreateDraft.scheduleSelectedWeekday;
            const fromTime = mastersCreateDraft.schedulePendingFromTime;
            if (!weekday || !fromTime) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_PICK_DAY_AND_FROM_FIRST'));
            }

            const toTime = parseTimeInput(text, state.language);
            if (timeToMinutes(toTime) <= timeToMinutes(fromTime)) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_TO_AFTER_FROM'));
            }

            mastersCreateDraft.scheduleDays = upsertMasterCreateScheduleDay(
              mastersCreateDraft.scheduleDays,
              {
                weekday,
                isWorking: true,
                openTime: fromTime,
                closeTime: toTime,
              },
            );
	            mastersCreateDraft.scheduleSelectedWeekday = null;
	            mastersCreateDraft.schedulePendingFromTime = null;
	            mastersCreateDraft.mode = 'awaiting_schedule_pick';
	            logAdminCriticalAction(
	              ctx,
	              'Updated master creation weekly day schedule',
	              {
	                stage: 'masters-create',
	                weekday,
	                openTime: fromTime,
	                closeTime: toTime,
	              },
	              state.access,
	            );

	            await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_WORK_TIME_SAVED'));
	            await renderAdminMasterCreateSchedulePickStep(ctx, mastersCreateDraft, false);
	            return;
          }

          if (mastersCreateDraft.mode === 'selecting_services') {
            await ctx.reply(
              tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_SERVICES_BUTTONS'),
              createAdminMasterCreateServicesKeyboard(
                mastersCreateDraft.availableServices,
                mastersCreateDraft.selectedServiceIds,
                state.language,
              ),
            );
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_schedule_pick') {
            await ctx.reply(
              tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_SCHEDULE_BUTTONS'),
              createAdminMasterCreateSchedulePickKeyboard(
                toMasterCreateScheduleViewDays(mastersCreateDraft.scheduleDays),
                state.language,
              ),
            );
            return;
          }

          if (mastersCreateDraft.mode === 'awaiting_confirm') {
            await ctx.reply(
              tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_CONFIRM_BUTTONS'),
              createAdminMasterCreateConfirmKeyboard(state.language),
            );
            return;
          }

          await ctx.reply(
            tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_CREATE_BUTTONS'),
            createAdminMasterCreateStartKeyboard(state.language),
          );
          return;
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_CREATE_VALIDATION_FAILED'));

          if (mastersCreateDraft.mode === 'selecting_services') {
            await replyAdminWarning(
              ctx,
              err.message,
              createAdminMasterCreateServicesKeyboard(
                mastersCreateDraft.availableServices,
                mastersCreateDraft.selectedServiceIds,
                state.language,
              ),
            );
            return;
          }

          if (
            mastersCreateDraft.mode === 'awaiting_schedule_pick' ||
            mastersCreateDraft.mode === 'awaiting_schedule_from' ||
            mastersCreateDraft.mode === 'awaiting_schedule_to'
          ) {
            const keyboard =
              mastersCreateDraft.mode === 'awaiting_schedule_pick'
                ? createAdminMasterCreateSchedulePickKeyboard(
                    toMasterCreateScheduleViewDays(mastersCreateDraft.scheduleDays),
                    state.language,
                  )
                : createAdminMasterCreateScheduleInputKeyboard(
                    mastersCreateDraft.scheduleSelectedWeekday ?? 1,
                    state.language,
                  );
            await replyAdminWarning(ctx, err.message, keyboard);
            return;
          }

          await replyAdminWarning(ctx, err.message, createAdminMasterCreateInputKeyboard(state.language));
          return;
        }
      }

      const mastersDeleteDraft = state.mastersDeleteDraft;
      if (state.mastersCurrentSection === 'delete' && mastersDeleteDraft) {
        const access = state.access;
        try {
          if (!access?.studioId) {
            throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
          }

          if (mastersDeleteDraft.mode === 'awaiting_telegram_id') {
            const telegramId = normalizeAdminMasterCreateTelegramIdInput(text, state.language);
            const candidate = await findAdminMasterCandidateByTelegramId({
              studioId: access.studioId,
              telegramId,
            });

            if (!candidate) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USER_NOT_FOUND_IN_STUDIO'));
            }
            if (!candidate.isMaster) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USER_NOT_MASTER'));
            }

            const details = await getMasterCatalogDetailsById({
              masterId: candidate.userId,
              studioId: access.studioId,
            });
            if (!details) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_MASTER_NOT_FOUND_OR_INACTIVE'));
            }

            mastersDeleteDraft.mode = 'awaiting_confirm';
            mastersDeleteDraft.telegramUserId = candidate.telegramUserId;
            mastersDeleteDraft.targetUserId = candidate.userId;
            mastersDeleteDraft.targetDisplayName = details.master.displayName;
            await renderAdminMasterDeleteConfirm(ctx, mastersDeleteDraft, false);
            return;
          }

          if (mastersDeleteDraft.mode === 'awaiting_confirm') {
            await ctx.reply(
              tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_DELETE_CONFIRM_BUTTONS'),
              createAdminMasterDeleteConfirmKeyboard(state.language),
            );
            return;
          }
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_DELETE_VALIDATION_FAILED'));
          await replyAdminWarning(ctx, err.message, createAdminMasterDeleteInputKeyboard(state.language));
          return;
        }
      }

      const servicesCreateDraft = state.servicesCreateDraft;
      if (servicesCreateDraft) {
        try {
          if (servicesCreateDraft.mode === 'awaiting_name') {
            servicesCreateDraft.name = normalizeServiceNameInput(text, state.language);
            servicesCreateDraft.mode = 'awaiting_duration';
            await ctx.reply(
              formatAdminServiceCreateDurationInputText(servicesCreateDraft.name, state.language),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_duration') {
            servicesCreateDraft.durationMinutes = normalizeServiceDurationInput(text, state.language);
            servicesCreateDraft.mode = 'awaiting_price';
            await ctx.reply(
              formatAdminServiceCreatePriceInputText(
                servicesCreateDraft.name ?? tBot(state.language, 'ADMIN_PANEL_SERVICES_DEFAULT_NAME'),
                state.language,
              ),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_price') {
            servicesCreateDraft.basePrice = normalizeServiceBasePriceInput(text, state.language);
            servicesCreateDraft.mode = 'awaiting_description';
            await ctx.reply(
              formatAdminServiceCreateDescriptionInputText(
                servicesCreateDraft.name ?? tBot(state.language, 'ADMIN_PANEL_SERVICES_DEFAULT_NAME'),
                state.language,
              ),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_description') {
            servicesCreateDraft.description = normalizeServiceDescriptionInput(text, state.language);
            servicesCreateDraft.mode = 'awaiting_step_title';
            await ctx.reply(
              formatAdminServiceCreateStepTitleInputText(servicesCreateDraft.steps.length + 1, state.language),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_step_title') {
            servicesCreateDraft.pendingStepTitle = normalizeServiceStepTitleInput(text, state.language);
            servicesCreateDraft.mode = 'awaiting_step_duration';
            await ctx.reply(
              formatAdminServiceCreateStepDurationInputText(
                servicesCreateDraft.steps.length + 1,
                servicesCreateDraft.pendingStepTitle, state.language),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_step_duration') {
            servicesCreateDraft.pendingStepDurationMinutes = normalizeServiceStepDurationInput(
              text,
              state.language,
            );
            if (!servicesCreateDraft.pendingStepTitle) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SET_STEP_TITLE_FIRST'));
            }
            servicesCreateDraft.mode = 'awaiting_step_description';
            await ctx.reply(
              formatAdminServiceCreateStepDescriptionInputText(
                servicesCreateDraft.steps.length + 1,
                servicesCreateDraft.pendingStepTitle,
                servicesCreateDraft.pendingStepDurationMinutes, state.language),
              createAdminServiceCreateInputKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_step_description') {
            const stepDescription = normalizeServiceStepDescriptionInput(text, state.language);
            const stepTitle = servicesCreateDraft.pendingStepTitle;
            const stepDuration = servicesCreateDraft.pendingStepDurationMinutes;
            if (!stepTitle || stepDuration == null) {
              throw new ValidationError(
                tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SET_STEP_TITLE_AND_DURATION_FIRST'),
              );
            }

            servicesCreateDraft.steps.push({
              title: stepTitle,
              durationMinutes: stepDuration,
              description: stepDescription,
            });
            servicesCreateDraft.pendingStepTitle = null;
            servicesCreateDraft.pendingStepDurationMinutes = null;
            servicesCreateDraft.mode = 'awaiting_step_menu';

            await ctx.reply(
              formatAdminServiceCreateStepAddedText(
                servicesCreateDraft.steps.length,
                stepTitle,
                stepDuration,
                servicesCreateDraft.steps.length, state.language),
              createAdminServiceCreateStepActionsKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_guarantee_text') {
            const guaranteeText = normalizeServiceGuaranteeTextInput(text, state.language);
            servicesCreateDraft.guarantees.push({
              guaranteeText,
              validDays: null,
            });
            servicesCreateDraft.mode = 'awaiting_guarantee_menu';

            await ctx.reply(
              formatAdminServiceCreateGuaranteeAddedText(
                servicesCreateDraft.guarantees.length,
                guaranteeText,
                servicesCreateDraft.guarantees.length, state.language),
              createAdminServiceCreateGuaranteeActionsKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_result') {
            servicesCreateDraft.resultDescription = normalizeServiceResultDescriptionInput(
              text,
              state.language,
            );
            if (
              !servicesCreateDraft.name ||
              servicesCreateDraft.durationMinutes == null ||
              !servicesCreateDraft.basePrice ||
              !servicesCreateDraft.description ||
              servicesCreateDraft.steps.length === 0 ||
              servicesCreateDraft.guarantees.length === 0
            ) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_PREVIEW_BUILD_FAILED'));
            }

            servicesCreateDraft.mode = 'awaiting_confirm';
            await ctx.reply(
              formatAdminServiceCreatePreviewText({
                name: servicesCreateDraft.name,
                durationMinutes: servicesCreateDraft.durationMinutes,
                basePrice: servicesCreateDraft.basePrice,
                currencyCode: servicesCreateDraft.currencyCode,
                description: servicesCreateDraft.description,
                resultDescription: servicesCreateDraft.resultDescription,
                steps: servicesCreateDraft.steps,
                guarantees: servicesCreateDraft.guarantees,
              }, state.language),
              createAdminServiceCreatePreviewKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_step_menu') {
            await replyAdminInfo(
              ctx,
              tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_STEP_ACTIONS_BUTTONS'),
              createAdminServiceCreateStepActionsKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_guarantee_menu') {
            await replyAdminInfo(
              ctx,
              tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_GUARANTEE_ACTIONS_BUTTONS'),
              createAdminServiceCreateGuaranteeActionsKeyboard(state.language),
            );
            return;
          }

          if (servicesCreateDraft.mode === 'awaiting_confirm') {
            await replyAdminInfo(
              ctx,
              tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_CREATE_CONFIRM_BUTTONS'),
              createAdminServiceCreatePreviewKeyboard(state.language),
            );
            return;
          }
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_INPUT_VALIDATION_FAILED'));

          const keyboard =
            servicesCreateDraft.mode === 'awaiting_step_menu'
              ? createAdminServiceCreateStepActionsKeyboard(state.language)
              : servicesCreateDraft.mode === 'awaiting_guarantee_menu'
              ? createAdminServiceCreateGuaranteeActionsKeyboard(state.language)
              : servicesCreateDraft.mode === 'awaiting_confirm'
              ? createAdminServiceCreatePreviewKeyboard(state.language)
              : createAdminServiceCreateInputKeyboard(state.language);

          await replyAdminWarning(ctx, err.message, keyboard);
          return;
        }
      }

      const servicesEditDraft = state.servicesEditDraft;
      if (servicesEditDraft?.mode === 'awaiting_text') {
        try {
          if (servicesEditDraft.field === 'name') {
            const nextName = normalizeServiceNameInput(text, state.language);
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextName;
            await ctx.reply(
              formatAdminServiceEditNameConfirmText(
                servicesEditDraft.serviceName,
                nextName, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'duration_minutes') {
            const nextDuration = normalizeServiceDurationInput(text, state.language);
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextDuration;
            await ctx.reply(
              formatAdminServiceEditDurationConfirmText(
                servicesEditDraft.serviceName,
                nextDuration, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'base_price') {
            const nextPrice = normalizeServiceBasePriceInput(text, state.language);
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextPrice;
            await ctx.reply(
              formatAdminServiceEditPriceConfirmText(
                servicesEditDraft.serviceName,
                nextPrice,
                servicesEditDraft.currentCurrencyCode, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'description') {
            const nextDescription = normalizeServiceDescriptionInput(text, state.language);
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextDescription;
            await ctx.reply(
              formatAdminServiceEditDescriptionConfirmText(
                servicesEditDraft.serviceName,
                nextDescription, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'step_title') {
            const nextStepTitle = normalizeServiceStepTitleInput(text, state.language);
            if (!servicesEditDraft.currentStepNo) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SELECT_STEP_FIRST'));
            }
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextStepTitle;
            await ctx.reply(
              formatAdminServiceEditStepConfirmText(
                servicesEditDraft.serviceName,
                servicesEditDraft.currentStepNo,
                nextStepTitle, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'step_description') {
            const nextStepDescription = normalizeServiceStepDescriptionInput(text, state.language);
            if (!servicesEditDraft.currentStepNo) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SELECT_STEP_FIRST'));
            }
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextStepDescription;
            await ctx.reply(
              formatAdminServiceEditStepDescriptionConfirmText(
                servicesEditDraft.serviceName,
                servicesEditDraft.currentStepNo,
                nextStepDescription, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'step_duration_minutes') {
            const nextStepDuration = normalizeServiceStepDurationInput(text, state.language);
            if (!servicesEditDraft.currentStepNo) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SELECT_STEP_FIRST'));
            }
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextStepDuration;
            await ctx.reply(
              formatAdminServiceEditStepDurationConfirmText(
                servicesEditDraft.serviceName,
                servicesEditDraft.currentStepNo,
                nextStepDuration, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else if (servicesEditDraft.field === 'guarantee_text') {
            const nextGuaranteeText = normalizeServiceGuaranteeTextInput(text, state.language);
            if (!servicesEditDraft.currentGuaranteeNo) {
              throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_SELECT_GUARANTEE_FIRST'));
            }
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextGuaranteeText;
            await ctx.reply(
              formatAdminServiceEditGuaranteeConfirmText(
                servicesEditDraft.serviceName,
                servicesEditDraft.currentGuaranteeNo,
                nextGuaranteeText, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          } else {
            const nextResult = normalizeServiceResultDescriptionInput(text, state.language);
            servicesEditDraft.mode = 'awaiting_confirm';
            servicesEditDraft.value = nextResult;
            await ctx.reply(
              formatAdminServiceEditResultConfirmText(
                servicesEditDraft.serviceName,
                nextResult, state.language),
              createAdminServiceEditConfirmKeyboard(state.language),
            );
          }
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(
                  servicesEditDraft.field === 'name'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_NAME_FAILED')
                    : servicesEditDraft.field === 'duration_minutes'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_DURATION_FAILED')
                    : servicesEditDraft.field === 'base_price'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_PRICE_FAILED')
                    : servicesEditDraft.field === 'description'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_DESCRIPTION_FAILED')
                    : servicesEditDraft.field === 'step_title'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_STEP_TITLE_FAILED')
                    : servicesEditDraft.field === 'step_description'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_STEP_DESCRIPTION_FAILED')
                    : servicesEditDraft.field === 'step_duration_minutes'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_STEP_DURATION_FAILED')
                    : servicesEditDraft.field === 'guarantee_text'
                    ? tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_GUARANTEE_FAILED')
                    : tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_VALIDATE_RESULT_FAILED'),
                );

          await replyAdminWarning(ctx, err.message, createAdminServiceEditInputKeyboard(state.language));
        }
        return;
      }

      if (servicesEditDraft?.mode === 'selecting_step') {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_EDIT_STEP_BUTTONS'),
          createAdminServiceEditStepSelectKeyboard(servicesEditDraft.stepOptions, state.language),
        );
        return;
      }

      if (servicesEditDraft?.mode === 'selecting_guarantee') {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_EDIT_GUARANTEE_BUTTONS'),
          createAdminServiceEditGuaranteeSelectKeyboard(
            servicesEditDraft.guaranteeOptions,
            state.language,
          ),
        );
        return;
      }

      if (servicesEditDraft?.mode === 'awaiting_confirm') {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_EDIT_CONFIRM_BUTTONS'),
          servicesEditDraft.field === 'deactivate'
            ? createAdminServiceDeleteConfirmKeyboard(state.language)
            : createAdminServiceEditConfirmKeyboard(state.language),
        );
        return;
      }

      const mastersEditDraft = state.mastersEditDraft;
      if (mastersEditDraft?.mode === 'awaiting_value') {
        try {
          const normalizedValue = normalizeAdminMasterFieldValue(
            mastersEditDraft.field,
            text,
            state.language,
          );
          mastersEditDraft.mode = 'awaiting_confirm';
          mastersEditDraft.value = normalizedValue;

          await renderAdminMasterEditConfirm(ctx, mastersEditDraft, false);
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_EDIT_VALUE_VALIDATION_FAILED'));

          await replyAdminWarning(
            ctx,
            err.message,
            createAdminMasterEditInputKeyboard(mastersEditDraft.masterId, state.language),
          );
        }
        return;
      }

      if (mastersEditDraft?.mode === 'awaiting_confirm') {
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_EDIT_CONFIRM_BUTTONS'),
          createAdminMasterEditConfirmKeyboard(mastersEditDraft.masterId, state.language),
        );
        return;
      }

      if (state.mastersCurrentSection === 'edit' && state.mastersSelectedMasterId) {
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_EDIT_MENU_BUTTONS'),
          createAdminMasterEditMenuKeyboard(state.mastersSelectedMasterId, state.language),
        );
        return;
      }

      if (state.mastersCurrentSection === 'edit-services' && state.mastersSelectedMasterId) {
        const mode = state.mastersServicesDraft?.mode ?? 'menu';
        const items = state.mastersServicesDraft?.items ?? [];
        const keyboard =
          mode === 'add_candidates'
            ? createAdminMasterEditServicesAddCandidatesKeyboard(items, state.language)
            : mode === 'remove_candidates'
            ? createAdminMasterEditServicesRemoveCandidatesKeyboard(items, state.language)
            : createAdminMasterEditServicesMenuKeyboard(state.language);

        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_SERVICES_MANAGE_BUTTONS'),
          keyboard,
        );
        return;
      }

      if (state.mastersCurrentSection === 'delete' && state.mastersDeleteDraft) {
        const keyboard =
          state.mastersDeleteDraft.mode === 'awaiting_confirm'
            ? createAdminMasterDeleteConfirmKeyboard(state.language)
            : createAdminMasterDeleteInputKeyboard(state.language);
        await ctx.reply(
          tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_USE_DELETE_BUTTONS'),
          keyboard,
        );
        return;
      }

      if (state.servicesCurrentSection === 'edit' && state.servicesSelectedServiceId) {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_EDIT_MENU_BUTTONS'),
          createAdminServiceEditMenuKeyboard(state.language),
        );
        return;
      }

      if (state.servicesCurrentSection === 'create') {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_USE_CREATE_INPUT_OR_BUTTONS'),
          createAdminServiceCreateInputKeyboard(state.language),
        );
        return;
      }

      if (state.scheduleCurrentSection) {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_USE_SECTION_BUTTONS'),
        );
        return;
      }

      const settingsLanguageDraft = state.settingsLanguageDraft;
      if (state.settingsCurrentSection === 'language') {
        if (settingsLanguageDraft) {
          await replyAdminInfo(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_LANGUAGE_CONFIRM_BUTTONS'),
            createAdminSettingsLanguageConfirmKeyboard(),
          );
        } else {
          const userId = state.access?.userId;
          const currentLanguage = userId
            ? await getAdminPanelLanguage({ userId })
            : 'uk';
          await replyAdminInfo(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_LANGUAGE_PICK_BUTTONS'),
            createAdminSettingsLanguageKeyboard(currentLanguage),
          );
        }
        return;
      }

      const settingsDraft = state.settingsAdminsDraft;
      if (
        state.settingsCurrentSection === 'admins' &&
        settingsDraft &&
        settingsDraft.mode === 'awaiting_telegram_id'
      ) {
        const access = state.access;
        if (!access?.studioId) {
          throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
        }

        const candidateTelegramId = text.trim();
        if (!/^\d+$/.test(candidateTelegramId)) {
          await replyAdminWarning(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_TELEGRAM_ID_DIGITS_ONLY'),
            settingsDraft.action === 'grant'
              ? createAdminSettingsGrantInputKeyboard()
              : createAdminSettingsRevokeInputKeyboard(),
          );
          return;
        }

        let target: AdminStudioUserLookup | null;
        try {
          target = await findAdminStudioUserByTelegramId({
            studioId: access.studioId,
            telegramId: candidateTelegramId,
          });
        } catch (error) {
          if (error instanceof ValidationError) {
            await replyAdminWarning(
              ctx,
              error.message,
              settingsDraft.action === 'grant'
                ? createAdminSettingsGrantInputKeyboard()
                : createAdminSettingsRevokeInputKeyboard(),
            );
            return;
          }
          throw error;
        }

        if (!target) {
          await replyAdminWarning(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USER_NOT_FOUND_IN_STUDIO'),
            settingsDraft.action === 'grant'
              ? createAdminSettingsGrantInputKeyboard()
              : createAdminSettingsRevokeInputKeyboard(),
          );
          return;
        }

        if (settingsDraft.action === 'grant' && target.isAdmin) {
          await replyAdminWarning(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USER_ALREADY_ADMIN'),
            createAdminSettingsGrantInputKeyboard(),
          );
          return;
        }

        if (settingsDraft.action === 'revoke' && !target.isAdmin) {
          await replyAdminWarning(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USER_NOT_ADMIN'),
            createAdminSettingsRevokeInputKeyboard(),
          );
          return;
        }

        if (settingsDraft.action === 'revoke' && target.userId === access.userId) {
          await replyAdminWarning(
            ctx,
            tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_CANNOT_REVOKE_SELF'),
            createAdminSettingsRevokeInputKeyboard(),
          );
          return;
        }

        settingsDraft.mode = 'awaiting_confirm';
        settingsDraft.target = target;
        await renderAdminSettingsAdminsConfirm(ctx, settingsDraft, false);
        return;
      }

      if (
        state.settingsCurrentSection === 'admins' &&
        settingsDraft &&
        settingsDraft.mode === 'awaiting_confirm'
      ) {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_ACTION_CONFIRM_BUTTONS'),
          settingsDraft.action === 'grant'
            ? createAdminSettingsGrantConfirmKeyboard()
            : createAdminSettingsRevokeConfirmKeyboard(),
        );
        return;
      }

      const studioDraft = state.settingsStudioDraft;
      if (
        state.settingsCurrentSection === 'studio' &&
        studioDraft &&
        studioDraft.mode === 'awaiting_text'
      ) {
        try {
          const draftContent = normalizeStudioContentDraftInput(text, state.language);
          studioDraft.mode = 'awaiting_confirm';
          studioDraft.draftContent = draftContent;
          await renderAdminSettingsStudioEditConfirm(ctx, studioDraft, false);
        } catch (error) {
          const err =
            error instanceof ValidationError
              ? error
              : new ValidationError(tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_STUDIO_TEXT_VALIDATE_FAILED'));

          await replyAdminWarning(ctx, err.message, createAdminSettingsStudioEditInputKeyboard());
        }
        return;
      }

      if (
        state.settingsCurrentSection === 'studio' &&
        studioDraft &&
        studioDraft.mode === 'awaiting_confirm'
      ) {
        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_STUDIO_CONFIRM_BUTTONS'),
          createAdminSettingsStudioEditConfirmKeyboard(),
        );
        return;
      }

      if (state.settingsCurrentSection === 'notifications') {
        const currentState = state.settingsNotificationsState;
        if (!currentState) {
          await renderAdminSettingsNotifications(ctx, false);
          return;
        }

        await replyAdminInfo(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_NOTIFICATIONS_BUTTONS'),
          createAdminSettingsNotificationsKeyboard(currentState),
        );
        return;
      }

      if (state.settingsCurrentSection) {
        await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_USE_SECTION_BUTTONS'));
        return;
      }

      await renderAdminRoot(ctx, false);
    },
  );

  scene.action(ADMIN_PANEL_ACTION.OPEN_RECORDS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    state.scheduleCurrentSection = null;
    await renderRecordsMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SCHEDULE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    state.scheduleCurrentSection = null;
    state.scheduleData = null;
    resetScheduleDrafts(state);
    await renderScheduleMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_OVERVIEW, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'overview', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_CONFIGURE_DAY, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'configure-day', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_DAYS_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'days-off', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_HOLIDAYS, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'holidays', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_OPEN_TEMPORARY, async (ctx) => {
    await ctx.answerCbQuery();
    resetScheduleDrafts(getSceneState(ctx));
    await renderScheduleSection(ctx, 'temporary', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_REFRESH, async (ctx) => {
    await ctx.answerCbQuery();
    const section = getSceneState(ctx).scheduleCurrentSection ?? 'overview';
    await renderScheduleSection(ctx, section, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_BACK_TO_MENU, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = null;
    resetScheduleDrafts(state);
    await renderScheduleMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = null;
    state.scheduleData = null;
    resetScheduleDrafts(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
    }

    const weekday = parseWeekdayFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_WEEKDAY_ACTION_REGEX,
      state.language,
    );
    state.scheduleCurrentSection = 'configure-day';
    state.scheduleConfigureDayDraft = {
      mode: 'awaiting_from',
      weekday,
      fromTime: null,
    };
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;
    state.scheduleTemporaryDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleConfigureDayFromInputText(weekday, state.language),
        createAdminScheduleConfigureDayInputKeyboard(weekday, state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleConfigureDayFromInputText(weekday, state.language),
        createAdminScheduleConfigureDayInputKeyboard(weekday, state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
    }

    const weekday = parseWeekdayFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_CONFIGURE_DAY_OFF_ACTION_REGEX,
      state.language,
    );

	    const updated = await upsertAdminStudioWeeklyDay({
	      studioId: access.studioId,
	      weekday,
	      isOpen: false,
	      openTime: null,
	      closeTime: null,
	    });

	    state.scheduleConfigureDayDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Marked studio weekday as day off',
	      {
	        weekday: updated.weekday,
	      },
	      access,
	    );
	    await ctx.reply(
	      formatAdminScheduleConfigureDaySuccessText(
	        updated.weekday,
        updated.isOpen,
        updated.openTime,
        updated.closeTime,
        state.language,
      ),
    );
    await renderScheduleSection(ctx, 'configure-day', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'days-off';
    state.scheduleDayOffDraft = {
      mode: 'awaiting_date',
      offDate: null,
      offDateLabel: null,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleHolidayDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDayOffInputText(state.language),
        createAdminScheduleDayOffInputKeyboard(state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDayOffInputText(state.language),
        createAdminScheduleDayOffInputKeyboard(state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleDayOffDraft;
    if (!access?.studioId || !draft || draft.mode !== 'awaiting_confirm' || !draft.offDate || !draft.offDateLabel) {
      state.scheduleDayOffDraft = {
        mode: 'awaiting_date',
        offDate: null,
        offDateLabel: null,
      };

      await ctx.reply(
        formatAdminScheduleDayOffInputText(state.language),
        createAdminScheduleDayOffInputKeyboard(state.language),
      );
      return;
    }

    try {
      await createAdminStudioDayOff({
        studioId: access.studioId,
        offDate: draft.offDate,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        state.scheduleDayOffDraft = {
          mode: 'awaiting_date',
          offDate: null,
          offDateLabel: null,
        };
        await replyAdminWarning(
          ctx,
          `${error.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_RETRY_DATE_FORMAT')}`,
          createAdminScheduleDayOffInputKeyboard(state.language),
        );
        return;
      }
      throw error;
    }

	    state.scheduleDayOffDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Created studio day off',
	      {
	        offDate: draft.offDate,
	      },
	      access,
	    );
	    await replyAdminSuccess(
	      ctx,
	      tBotTemplate(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_DAY_OFF_ADDED', {
	        date: draft.offDateLabel,
	      }),
	    );
	    await renderScheduleSection(ctx, 'days-off', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DAY_OFF_ADD_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleDayOffDraft = null;
    await renderScheduleSection(ctx, 'days-off', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const dayOffId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_REQUEST_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_COMMON_LABEL_DAY_OFF_ID'),
      state.language,
    );

    const data = await loadAdminSchedule(state);
    const target = data.upcomingDaysOff.find((item) => item.id === dayOffId);
    if (!target) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'days-off', true);
      return;
    }

    state.scheduleCurrentSection = 'days-off';
    state.scheduleDeleteDraft = {
      type: 'day_off',
      id: dayOffId,
      dateFrom: null,
      dateTo: null,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteDayOffConfirmText(target.offDate, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleDayOffDeleteConfirmAction(dayOffId),
          state.language,
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteDayOffConfirmText(target.offDate, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleDayOffDeleteConfirmAction(dayOffId),
          state.language,
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const dayOffId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_DAY_OFF_DELETE_CONFIRM_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_COMMON_LABEL_DAY_OFF_ID'),
      state.language,
    );

    if (!access?.studioId || !state.scheduleDeleteDraft || state.scheduleDeleteDraft.type !== 'day_off' || state.scheduleDeleteDraft.id !== dayOffId) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'days-off', true);
      return;
    }

    await deleteAdminStudioDayOff({
      studioId: access.studioId,
      dayOffId,
    });

	    state.scheduleDeleteDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Deleted studio day off',
	      {
	        dayOffId,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_DAY_OFF_DELETED'));
	    await renderScheduleSection(ctx, 'days-off', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'holidays';
    state.scheduleHolidayDraft = {
      mode: 'awaiting_date',
      holidayDate: null,
      holidayDateLabel: null,
      holidayName: null,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleHolidayDateInputText(state.language),
        createAdminScheduleHolidayInputKeyboard(state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleHolidayDateInputText(state.language),
        createAdminScheduleHolidayInputKeyboard(state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleHolidayDraft;
    if (
      !access?.studioId ||
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.holidayDate ||
      !draft.holidayDateLabel ||
      !draft.holidayName
    ) {
      state.scheduleHolidayDraft = {
        mode: 'awaiting_date',
        holidayDate: null,
        holidayDateLabel: null,
        holidayName: null,
      };
      await ctx.reply(
        formatAdminScheduleHolidayDateInputText(state.language),
        createAdminScheduleHolidayInputKeyboard(state.language),
      );
      return;
    }

    try {
      await createAdminStudioHoliday({
        studioId: access.studioId,
        holidayDate: draft.holidayDate,
        holidayName: draft.holidayName,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        state.scheduleHolidayDraft = {
          mode: 'awaiting_date',
          holidayDate: null,
          holidayDateLabel: null,
          holidayName: null,
        };
        await replyAdminWarning(
          ctx,
          `${error.message}\n\n${tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TRY_AGAIN')}`,
          createAdminScheduleHolidayInputKeyboard(state.language),
        );
        return;
      }
      throw error;
    }

	    state.scheduleHolidayDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Created studio holiday',
	      {
	        holidayDate: draft.holidayDate,
	        holidayName: draft.holidayName,
	      },
	      access,
	    );
	    await replyAdminSuccess(
	      ctx,
	      tBotTemplate(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_HOLIDAY_ADDED', {
	        name: draft.holidayName,
	        date: draft.holidayDateLabel,
	      }),
	    );
	    await renderScheduleSection(ctx, 'holidays', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_HOLIDAY_ADD_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleHolidayDraft = null;
    await renderScheduleSection(ctx, 'holidays', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const holidayId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_REQUEST_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_COMMON_LABEL_HOLIDAY_ID'),
      state.language,
    );

    const data = await loadAdminSchedule(state);
    const target = data.upcomingHolidays.find((item) => item.id === holidayId);
    if (!target) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'holidays', true);
      return;
    }

    state.scheduleCurrentSection = 'holidays';
    state.scheduleDeleteDraft = {
      type: 'holiday',
      id: holidayId,
      dateFrom: null,
      dateTo: null,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteHolidayConfirmText(target.holidayDate, target.holidayName, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleHolidayDeleteConfirmAction(holidayId),
          state.language,
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteHolidayConfirmText(target.holidayDate, target.holidayName, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleHolidayDeleteConfirmAction(holidayId),
          state.language,
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const holidayId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SCHEDULE_HOLIDAY_DELETE_CONFIRM_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_COMMON_LABEL_HOLIDAY_ID'),
      state.language,
    );

    if (!access?.studioId || !state.scheduleDeleteDraft || state.scheduleDeleteDraft.type !== 'holiday' || state.scheduleDeleteDraft.id !== holidayId) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'holidays', true);
      return;
    }

    await deleteAdminStudioHoliday({
      studioId: access.studioId,
      holidayId,
    });

	    state.scheduleDeleteDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Deleted studio holiday',
	      {
	        holidayId,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_HOLIDAY_DELETED'));
	    await renderScheduleSection(ctx, 'holidays', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_DELETE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const section =
      state.scheduleCurrentSection === 'holidays'
        ? 'holidays'
        : state.scheduleCurrentSection === 'temporary'
          ? 'temporary'
          : 'days-off';
    state.scheduleDeleteDraft = null;
    await renderScheduleSection(ctx, section, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleCurrentSection = 'temporary';
    state.scheduleTemporaryDraft = {
      mode: 'awaiting_period',
      dateFrom: null,
      dateTo: null,
      dateFromLabel: null,
      dateToLabel: null,
      days: [],
      selectedWeekday: null,
      pendingFromTime: null,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;
    state.scheduleDeleteDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleTemporarySetPeriodText(state.language),
        createAdminScheduleTemporaryPeriodInputKeyboard(state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleTemporarySetPeriodText(state.language),
        createAdminScheduleTemporaryPeriodInputKeyboard(state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;
    if (!draft || draft.mode === 'awaiting_period' || !draft.dateFromLabel || !draft.dateToLabel) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const weekday = Number(
      (
        (ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '')
          .match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_ACTION_REGEX)?.[1] ?? ''
      ),
    );
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    state.scheduleTemporaryDraft = {
      ...draft,
      mode: 'awaiting_day_from',
      selectedWeekday: weekday,
      pendingFromTime: null,
    };

    try {
      await ctx.editMessageText(
        formatAdminScheduleTemporaryDayFromInputText(weekday, state.language),
        createAdminScheduleTemporaryDayInputKeyboard(weekday, state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleTemporaryDayFromInputText(weekday, state.language),
        createAdminScheduleTemporaryDayInputKeyboard(weekday, state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.scheduleTemporaryDraft;
    if (!draft || !draft.dateFromLabel || !draft.dateToLabel || !draft.dateFrom || !draft.dateTo) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const weekday = Number(
      (
        (ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '')
          .match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DAY_OFF_ACTION_REGEX)?.[1] ?? ''
      ),
    );
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const updatedDays = upsertTemporaryDay(draft.days, {
      weekday,
      isOpen: false,
      openTime: null,
      closeTime: null,
    });

    state.scheduleTemporaryDraft = {
      ...draft,
      mode: updatedDays.length === 7 ? 'awaiting_confirm' : 'configuring_days',
      days: updatedDays,
      selectedWeekday: null,
      pendingFromTime: null,
    };

    await ctx.reply(
      formatAdminScheduleTemporaryDaysConfigText(
        draft.dateFromLabel,
        draft.dateToLabel,
        updatedDays,
        state.language,
      ),
      createAdminScheduleTemporaryDaysConfigKeyboard(updatedDays, state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.scheduleTemporaryDraft;
    if (
      !access?.studioId ||
      !draft ||
      !draft.dateFrom ||
      !draft.dateTo ||
      !draft.dateFromLabel ||
      !draft.dateToLabel
    ) {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    if (draft.days.length < 7) {
      await ctx.reply(
        tBotTemplate(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TEMPORARY_NEED_ALL_DAYS', {
          configured: draft.days.length,
        }),
      );
      await ctx.reply(
        formatAdminScheduleTemporaryDaysConfigText(
          draft.dateFromLabel,
          draft.dateToLabel,
          draft.days,
          state.language,
        ),
        createAdminScheduleTemporaryDaysConfigKeyboard(draft.days, state.language),
      );
      return;
    }

    if (draft.mode !== 'awaiting_confirm') {
      state.scheduleTemporaryDraft = {
        ...draft,
        mode: 'awaiting_confirm',
      };
      await ctx.reply(
        formatAdminScheduleTemporaryConfirmText(
          draft.dateFromLabel,
          draft.dateToLabel,
          draft.days,
          state.language,
        ),
        createAdminScheduleTemporaryDaysConfigKeyboard(draft.days, state.language),
      );
      return;
    }

    try {
      await createAdminStudioTemporarySchedule({
        studioId: access.studioId,
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        days: draft.days,
        createdBy: access.userId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(
          ctx,
          error.message,
          createAdminScheduleTemporaryDaysConfigKeyboard(draft.days, state.language),
        );
        return;
      }
      throw error;
    }

	    state.scheduleTemporaryDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Created temporary studio schedule period',
	      {
	        dateFrom: draft.dateFrom,
	        dateTo: draft.dateTo,
	        configuredDays: draft.days.length,
	      },
	      access,
	    );
	    await ctx.reply(
	      tBotTemplate(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TEMPORARY_CREATED', {
	        from: draft.dateFromLabel,
	        to: draft.dateToLabel,
	      }),
	    );
    await renderScheduleSection(ctx, 'temporary', false);
  });

  scene.action(ADMIN_PANEL_ACTION.SCHEDULE_TEMPORARY_CREATE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.scheduleTemporaryDraft = null;
    await renderScheduleSection(ctx, 'temporary', true);
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_REQUEST_ACTION_REGEX);
    const dateFromCode = match?.[1] ?? '';
    const dateToCode = match?.[2] ?? '';

    let dateFrom: Date;
    let dateTo: Date;
    try {
      dateFrom = parseDateFromCode(dateFromCode, state.language);
      dateTo = parseDateFromCode(dateToCode, state.language);
    } catch {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const dateFromSql = formatDateSql(dateFrom);
    const dateToSql = formatDateSql(dateTo);
    state.scheduleCurrentSection = 'temporary';
    state.scheduleDeleteDraft = {
      type: 'temporary_period',
      id: null,
      dateFrom: dateFromSql,
      dateTo: dateToSql,
    };
    state.scheduleConfigureDayDraft = null;
    state.scheduleTemporaryDraft = null;
    state.scheduleDayOffDraft = null;
    state.scheduleHolidayDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminScheduleDeleteTemporaryConfirmText(dateFrom, dateTo, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleTemporaryDeleteConfirmAction(dateFromCode, dateToCode),
          state.language,
        ),
      );
    } catch {
      await ctx.reply(
        formatAdminScheduleDeleteTemporaryConfirmText(dateFrom, dateTo, state.language),
        createAdminScheduleDeleteConfirmKeyboard(
          makeAdminPanelScheduleTemporaryDeleteConfirmAction(dateFromCode, dateToCode),
          state.language,
        ),
      );
    }
  });

  scene.action(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(ADMIN_PANEL_SCHEDULE_TEMPORARY_DELETE_CONFIRM_ACTION_REGEX);
    const dateFromCode = match?.[1] ?? '';
    const dateToCode = match?.[2] ?? '';

    let dateFrom: Date;
    let dateTo: Date;
    try {
      dateFrom = parseDateFromCode(dateFromCode, state.language);
      dateTo = parseDateFromCode(dateToCode, state.language);
    } catch {
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    const dateFromSql = formatDateSql(dateFrom);
    const dateToSql = formatDateSql(dateTo);
    if (
      !access?.studioId ||
      !state.scheduleDeleteDraft ||
      state.scheduleDeleteDraft.type !== 'temporary_period' ||
      state.scheduleDeleteDraft.dateFrom !== dateFromSql ||
      state.scheduleDeleteDraft.dateTo !== dateToSql
    ) {
      state.scheduleDeleteDraft = null;
      await renderScheduleSection(ctx, 'temporary', true);
      return;
    }

    await deleteAdminStudioTemporarySchedulePeriod({
      studioId: access.studioId,
      dateFrom: dateFromSql,
      dateTo: dateToSql,
    });

	    state.scheduleDeleteDraft = null;
	    logAdminCriticalAction(
	      ctx,
	      'Deleted studio temporary schedule period',
	      {
	        dateFrom: dateFromSql,
	        dateTo: dateToSql,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_SCHEDULE_MSG_TEMPORARY_DELETED'));
	    await renderScheduleSection(ctx, 'temporary', false);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminMastersCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminMasterCreateStart(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_START, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || state.mastersCurrentSection !== 'create') {
      await renderAdminMasterCreateStart(ctx, true);
      return;
    }

    draft.mode = 'awaiting_display_name';
    await renderAdminMasterCreateTextStep(ctx, draft, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_CREATE_SERVICE_TOGGLE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || draft.mode !== 'selecting_services') {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_CREATE_SERVICE_TOGGLE_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );
    const exists = draft.availableServices.some((service) => service.id === serviceId);
    if (!exists) {
      await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_SERVICE_NOT_FOUND_IN_LIST'));
      await renderAdminMasterCreateServicesStep(ctx, draft, false);
      return;
    }

    if (draft.selectedServiceIds.includes(serviceId)) {
      draft.selectedServiceIds = draft.selectedServiceIds.filter((current) => current !== serviceId);
    } else {
      draft.selectedServiceIds = [...draft.selectedServiceIds, serviceId];
    }

    await renderAdminMasterCreateServicesStep(ctx, draft, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_SERVICES_DONE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || draft.mode !== 'selecting_services') {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    if (draft.selectedServiceIds.length === 0) {
      await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_SELECT_AT_LEAST_ONE_SERVICE'));
      await renderAdminMasterCreateServicesStep(ctx, draft, false);
      return;
    }

    draft.mode = 'awaiting_experience_years';
    await renderAdminMasterCreateTextStep(ctx, draft, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_PICK_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || draft.mode !== 'awaiting_schedule_pick') {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const weekday = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_PICK_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_WEEKDAY'),
    );
    draft.scheduleSelectedWeekday = Number(weekday);
    draft.schedulePendingFromTime = null;
    draft.mode = 'awaiting_schedule_from';
    await renderAdminMasterCreateTextStep(ctx, draft, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_DAY_OFF_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || state.mastersCurrentSection !== 'create') {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    if (draft.mode !== 'awaiting_schedule_from' && draft.mode !== 'awaiting_schedule_to') {
      await renderAdminMasterCreateSchedulePickStep(ctx, draft, true);
      return;
    }

    const weekday = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_CREATE_SCHEDULE_DAY_OFF_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_WEEKDAY'),
    );
    draft.scheduleDays = upsertMasterCreateScheduleDay(draft.scheduleDays, {
      weekday: Number(weekday),
      isWorking: false,
      openTime: null,
      closeTime: null,
    });
    draft.scheduleSelectedWeekday = null;
    draft.schedulePendingFromTime = null;
    draft.mode = 'awaiting_schedule_pick';

    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_DAY_MARKED_OFF'));
    await renderAdminMasterCreateSchedulePickStep(ctx, draft, false);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_CONTINUE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    if (!draft || state.mastersCurrentSection !== 'create') {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    if (
      draft.mode === 'awaiting_schedule_from' ||
      draft.mode === 'awaiting_schedule_to' ||
      draft.mode === 'awaiting_confirm'
    ) {
      draft.scheduleSelectedWeekday = null;
      draft.schedulePendingFromTime = null;
      draft.mode = 'awaiting_schedule_pick';
      await renderAdminMasterCreateSchedulePickStep(ctx, draft, true);
      return;
    }

    await renderAdminMasterCreateTextStep(ctx, draft, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.mastersCreateDraft = null;
    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_CREATION_CANCELLED'));
    await renderAdminMastersCatalog(ctx, false);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_CREATE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersCreateDraft;
    const access = state.access;
    if (!draft || !access?.studioId || !access.userId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    if (draft.mode === 'awaiting_schedule_pick') {
      try {
        buildAdminMasterCreateConfirmData(draft, state.language);
      } catch (error) {
        const err =
          error instanceof ValidationError
            ? error
            : new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_PROFILE_INCOMPLETE'));
        await replyAdminWarning(ctx, err.message);
        await renderAdminMasterCreateSchedulePickStep(ctx, draft, false);
        return;
      }

      draft.mode = 'awaiting_confirm';
      await renderAdminMasterCreateConfirmStep(ctx, draft, true);
      return;
    }

    if (draft.mode !== 'awaiting_confirm') {
      await renderAdminMasterCreateSchedulePickStep(ctx, draft, true);
      return;
    }

    const confirmData = buildAdminMasterCreateConfirmData(draft, state.language);
    if (!draft.targetUserId) {
      await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_TARGET_USER_NOT_SET'));
      draft.mode = 'awaiting_telegram_id';
      await renderAdminMasterCreateTextStep(ctx, draft, false);
      return;
    }

    try {
      const created = await createAdminMaster({
        studioId: access.studioId,
        targetUserId: draft.targetUserId,
        createdByUserId: access.userId,
        displayName: confirmData.displayName,
        bio: confirmData.bio,
        experienceYears: confirmData.experienceYears,
        proceduresDoneTotal: confirmData.proceduresDoneTotal,
        materialsInfo: confirmData.materialsInfo,
        contactPhoneE164: confirmData.contactPhoneE164,
        contactEmail: confirmData.contactEmail,
        serviceIds: draft.selectedServiceIds,
        weeklySchedule: draft.scheduleDays,
      });

	      state.mastersCreateDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Created master profile',
	        {
	          createdUserId: draft.targetUserId,
	          createdMasterId: created.masterId,
	          createdTelegramUserId: created.telegramUserId,
	          assignedServicesCount: created.assignedServicesCount,
	        },
	        access,
	      );
	      await ctx.reply(
	        tBotTemplate(state.language, 'ADMIN_PANEL_MASTERS_MSG_CREATED_SUCCESS', {
	          name: created.displayName,
	          telegramId: created.telegramUserId,
	          servicesCount: created.assignedServicesCount,
	        }),
	      );
      await renderAdminMastersCatalog(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminMasterCreateConfirmStep(ctx, draft, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_MASTER_ID'),
    );
    await renderAdminMasterDetails(ctx, masterId, true);
    state.mastersSelectedMasterId = masterId;
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_BOOKINGS_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_MASTER_ID'),
    );
    await renderAdminMasterBookingsList(ctx, masterId, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.mastersBookingsFeed;
    const masterId = state.mastersSelectedMasterId;
    if (!feed || !masterId || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminMasterBookingsList(ctx, masterId, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.mastersBookingsFeed;
    const masterId = state.mastersSelectedMasterId;
    if (!feed || !masterId || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminMasterBookingsList(ctx, masterId, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const appointmentId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_BOOKINGS_OPEN_CARD_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_BOOKING_ID'),
    );
    await renderAdminMasterBookingCard(ctx, masterId, appointmentId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const offset = state.mastersBookingsFeed?.offset ?? 0;
    await renderAdminMasterBookingsList(ctx, masterId, offset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BOOKINGS_BACK_TO_MASTER, async (ctx) => {
    await ctx.answerCbQuery();
    const masterId = getSceneState(ctx).mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterDetails(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const studioId = state.access?.studioId;
    if (!studioId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
    }

    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_OPEN_STATS_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_MASTER_ID'),
    );

    let stats: AdminPanelStatsMasterDetails;
    try {
      stats = await getAdminPanelStatsMasterDetails({ studioId, masterId });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminMastersCatalog(ctx, false);
        return;
      }
      throw error;
    }
    state.mastersCurrentSection = 'stats';
    state.mastersSelectedMasterId = masterId;
    state.mastersEditDraft = null;
    state.mastersServicesDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminStatsMasterDetailsText(stats, state.language),
        createAdminMasterDetailsKeyboard(masterId, state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminStatsMasterDetailsText(stats, state.language),
        createAdminMasterDetailsKeyboard(masterId, state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_MASTERS_EDIT_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_EDIT_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_MASTER_ID'),
    );
    await renderAdminMasterEditMenu(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_EDIT_FIELD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const { masterId, field } = parseAdminMasterEditFieldAction(ctx);
    await renderAdminMasterEditInput(ctx, masterId, field, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterEditServicesMenu(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_ADD_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterEditServicesAddCandidates(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_REMOVE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterEditServicesRemoveCandidates(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_MASTERS_EDIT_SERVICES_ADD_PICK_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_EDIT_SERVICES_ADD_PICK_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );

	    try {
	      const added = await addMasterOwnService({ masterId, serviceId });
	      logAdminCriticalAction(
	        ctx,
	        'Added service to master',
	        {
	          masterId,
	          serviceId,
	          serviceName: added.serviceName,
	        },
	        state.access,
	      );
	      await replyAdminSuccess(
	        ctx,
	        tBotTemplate(state.language, 'ADMIN_PANEL_MASTERS_MSG_SERVICE_ADDED', {
	          serviceName: added.serviceName,
	        }),
	      );
      await renderAdminMasterEditServicesAddCandidates(ctx, masterId, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminMasterEditServicesAddCandidates(ctx, masterId, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_MASTERS_EDIT_SERVICES_REMOVE_PICK_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_MASTERS_EDIT_SERVICES_REMOVE_PICK_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );

	    try {
	      const removed = await removeMasterOwnService({ masterId, serviceId });
	      logAdminCriticalAction(
	        ctx,
	        'Removed service from master',
	        {
	          masterId,
	          serviceId,
	          serviceName: removed.serviceName,
	        },
	        state.access,
	      );
	      await replyAdminSuccess(
	        ctx,
	        tBotTemplate(state.language, 'ADMIN_PANEL_MASTERS_MSG_SERVICE_REMOVED', {
	          serviceName: removed.serviceName,
	        }),
	      );
      await renderAdminMasterEditServicesRemoveCandidates(ctx, masterId, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminMasterEditServicesRemoveCandidates(ctx, masterId, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_SERVICES_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    state.mastersServicesDraft = null;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterEditMenu(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersEditDraft?.masterId ?? state.mastersSelectedMasterId;
    state.mastersEditDraft = null;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterEditMenu(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = state.mastersSelectedMasterId;
    state.mastersEditDraft = null;
    if (!masterId) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }
    await renderAdminMasterDetails(ctx, masterId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_EDIT_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.mastersEditDraft;

    if (!draft || draft.mode !== 'awaiting_confirm' || !draft.value) {
      const fallbackMasterId = draft?.masterId ?? state.mastersSelectedMasterId;
      if (!fallbackMasterId) {
        await renderAdminMastersCatalog(ctx, true);
        return;
      }
      await renderAdminMasterEditMenu(ctx, fallbackMasterId, true);
      return;
    }

    try {
      await ensureAdminMasterEditableAccess(state, draft.masterId);
      await persistAdminMasterFieldValue(draft.masterId, draft.field, draft.value, state.language);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminMasterEditInput(ctx, draft.masterId, draft.field, false);
        return;
      }
      throw error;
    }

    state.mastersEditDraft = null;
    await ctx.reply(formatAdminMasterEditSuccessText(draft.field, draft.value, state.language));
    await renderAdminMasterEditMenu(ctx, draft.masterId, false);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_DELETE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminMasterDeleteInput(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_DELETE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.mastersDeleteDraft = null;
    await renderAdminMastersCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_DELETE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.mastersDeleteDraft;

    if (
      !access?.studioId ||
      !access.userId ||
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.targetUserId ||
      !draft.telegramUserId
    ) {
      await renderAdminMastersCatalog(ctx, true);
      return;
    }

    try {
      const deleted = await deleteAdminMaster({
        studioId: access.studioId,
        masterId: draft.targetUserId,
      });

      logAdminCriticalAction(
        ctx,
        'Deleted master profile',
        {
          deletedMasterId: deleted.masterId,
          deletedMasterName: deleted.displayName,
          deletedMasterTelegramId: draft.telegramUserId,
        },
        access,
      );

      state.mastersDeleteDraft = null;
      await replyAdminSuccess(
        ctx,
        tBotTemplate(state.language, 'ADMIN_PANEL_MASTERS_MSG_DELETED_SUCCESS', {
          name: deleted.displayName,
        }),
      );
      await renderAdminMastersCatalog(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message, createAdminMasterDeleteConfirmKeyboard(state.language));
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.mastersEditDraft = null;
    state.mastersDeleteDraft = null;
    await renderAdminMastersCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.MASTERS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetMastersState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminServicesCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await startAdminServiceCreate(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.servicesCreateDraft = null;
    await renderAdminServicesCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_STEP_ADD_ANOTHER, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesCreateDraft;
    if (!draft) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }

    if (draft.mode !== 'awaiting_step_menu') {
      await replyAdminInfo(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_COMPLETE_CURRENT_STEP_FIRST'),
        createAdminServiceCreateInputKeyboard(state.language),
      );
      return;
    }

    if (draft.steps.length >= 20) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_MAX_STEPS_REACHED'),
        createAdminServiceCreateStepActionsKeyboard(state.language),
      );
      return;
    }

    draft.mode = 'awaiting_step_title';
    draft.pendingStepTitle = null;
    draft.pendingStepDurationMinutes = null;
    await ctx.reply(
      formatAdminServiceCreateStepTitleInputText(draft.steps.length + 1, state.language),
      createAdminServiceCreateInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_STEP_CONTINUE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesCreateDraft;
    if (!draft) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }

    if (draft.mode !== 'awaiting_step_menu') {
      await replyAdminInfo(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_COMPLETE_CURRENT_STEP_FIRST'),
        createAdminServiceCreateInputKeyboard(state.language),
      );
      return;
    }

    if (draft.steps.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_ADD_MIN_ONE_STEP'),
        createAdminServiceCreateStepActionsKeyboard(state.language),
      );
      return;
    }

    draft.mode = 'awaiting_guarantee_text';
    await ctx.reply(
      formatAdminServiceCreateGuaranteeInputText(draft.guarantees.length + 1, state.language),
      createAdminServiceCreateInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_GUARANTEE_ADD_ANOTHER, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesCreateDraft;
    if (!draft) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }

    if (draft.mode !== 'awaiting_guarantee_menu') {
      await replyAdminInfo(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_COMPLETE_CURRENT_STEP_FIRST'),
        createAdminServiceCreateInputKeyboard(state.language),
      );
      return;
    }

    if (draft.guarantees.length >= 10) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_MAX_GUARANTEES_REACHED'),
        createAdminServiceCreateGuaranteeActionsKeyboard(state.language),
      );
      return;
    }

    draft.mode = 'awaiting_guarantee_text';
    await ctx.reply(
      formatAdminServiceCreateGuaranteeInputText(draft.guarantees.length + 1, state.language),
      createAdminServiceCreateInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_GUARANTEE_CONTINUE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesCreateDraft;
    if (!draft) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }

    if (draft.mode !== 'awaiting_guarantee_menu') {
      await replyAdminInfo(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_COMPLETE_CURRENT_STEP_FIRST'),
        createAdminServiceCreateInputKeyboard(state.language),
      );
      return;
    }

    if (draft.guarantees.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_ADD_MIN_ONE_GUARANTEE'),
        createAdminServiceCreateGuaranteeActionsKeyboard(state.language),
      );
      return;
    }

    draft.mode = 'awaiting_result';
    await ctx.reply(
      formatAdminServiceCreateResultInputText(
        draft.name ?? tBot(state.language, 'ADMIN_PANEL_SERVICES_DEFAULT_NAME'),
        state.language,
      ),
      createAdminServiceCreateInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_CREATE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const studioId = state.access?.studioId;
    const draft = state.servicesCreateDraft;

    if (!studioId || !draft || draft.mode !== 'awaiting_confirm') {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }

    if (
      !draft.name ||
      draft.durationMinutes == null ||
      !draft.basePrice ||
      !draft.description ||
      !draft.resultDescription ||
      draft.steps.length === 0 ||
      draft.guarantees.length === 0
    ) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_INSUFFICIENT_CREATE_DATA'),
        createAdminServiceCreatePreviewKeyboard(state.language),
      );
      return;
    }

    try {
      const created = await createAdminService({
        studioId,
        name: draft.name,
        durationMinutes: draft.durationMinutes,
        basePrice: draft.basePrice,
        currencyCode: draft.currencyCode,
        description: draft.description,
        resultDescription: draft.resultDescription,
        steps: draft.steps,
        guarantees: draft.guarantees,
      });

	      state.servicesCreateDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Created service',
	        {
	          serviceId: created.serviceId,
	          serviceName: created.name,
	          durationMinutes: created.durationMinutes,
	          basePrice: created.basePrice,
	        },
	        state.access,
	      );
	      await ctx.reply(formatAdminServiceCreateSuccessText(created, state.language));
      await renderAdminServiceDetails(ctx, created.serviceId, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message, createAdminServiceCreatePreviewKeyboard(state.language));
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SERVICES_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );
    await renderAdminServiceDetails(ctx, serviceId, true);
    state.servicesSelectedServiceId = serviceId;
  });

  scene.action(ADMIN_PANEL_SERVICES_EDIT_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SERVICES_EDIT_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );

    await renderAdminServiceEditMenu(ctx, serviceId, true);
    state.servicesSelectedServiceId = serviceId;
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_RESULT_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'result_description';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = draft.currentResultDescription;
    draft.value = null;
    await ctx.reply(
      formatAdminServiceEditResultInputText(draft.serviceName, draft.currentResultDescription, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_NAME_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'name';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = draft.serviceName;
    draft.value = null;
    await ctx.reply(
      formatAdminServiceEditNameInputText(draft.serviceName, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_DURATION_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'duration_minutes';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = String(draft.currentDurationMinutes);
    draft.value = null;
    await ctx.reply(
      formatAdminServiceEditDurationInputText(
        draft.serviceName,
        draft.currentDurationMinutes, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_PRICE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'base_price';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = draft.currentBasePrice;
    draft.value = null;
    await ctx.reply(
      formatAdminServiceEditPriceInputText(
        draft.serviceName,
        draft.currentBasePrice,
        draft.currentCurrencyCode, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_DESCRIPTION_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'description';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = draft.currentDescription;
    draft.value = null;
    await ctx.reply(
      formatAdminServiceEditDescriptionInputText(draft.serviceName, draft.currentDescription, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    const studioId = state.access?.studioId;

    if (!draft || !studioId) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const details = await getServiceCatalogDetailsById({ serviceId: draft.serviceId, studioId });
    if (!details || details.steps.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEPS_NOT_FOUND'),
        createAdminServiceEditMenuKeyboard(state.language),
      );
      return;
    }

    draft.field = 'step_title';
    draft.mode = 'selecting_step';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = details.steps.map((item) => ({
      stepNo: item.stepNo,
      durationMinutes: item.durationMinutes,
      title: item.title,
      description: item.description,
    }));
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = null;
    draft.value = null;

    await ctx.reply(
      formatAdminServiceEditStepSelectText(draft.serviceName, draft.stepOptions, 'title', state.language),
      createAdminServiceEditStepSelectKeyboard(draft.stepOptions, state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_DESCRIPTION_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    const studioId = state.access?.studioId;

    if (!draft || !studioId) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const details = await getServiceCatalogDetailsById({ serviceId: draft.serviceId, studioId });
    if (!details || details.steps.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEPS_NOT_FOUND'),
        createAdminServiceEditMenuKeyboard(state.language),
      );
      return;
    }

    draft.field = 'step_description';
    draft.mode = 'selecting_step';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = details.steps.map((item) => ({
      stepNo: item.stepNo,
      durationMinutes: item.durationMinutes,
      title: item.title,
      description: item.description,
    }));
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = null;
    draft.value = null;

    await ctx.reply(
      formatAdminServiceEditStepSelectText(draft.serviceName, draft.stepOptions, 'description', state.language),
      createAdminServiceEditStepSelectKeyboard(draft.stepOptions, state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_STEP_DURATION_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    const studioId = state.access?.studioId;

    if (!draft || !studioId) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const details = await getServiceCatalogDetailsById({ serviceId: draft.serviceId, studioId });
    if (!details || details.steps.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEPS_NOT_FOUND'),
        createAdminServiceEditMenuKeyboard(state.language),
      );
      return;
    }

    draft.field = 'step_duration_minutes';
    draft.mode = 'selecting_step';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = details.steps.map((item) => ({
      stepNo: item.stepNo,
      durationMinutes: item.durationMinutes,
      title: item.title,
      description: item.description,
    }));
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = null;
    draft.value = null;

    await ctx.reply(
      formatAdminServiceEditStepSelectText(draft.serviceName, draft.stepOptions, 'duration', state.language),
      createAdminServiceEditStepSelectKeyboard(draft.stepOptions, state.language),
    );
  });

  scene.action(ADMIN_PANEL_SERVICES_EDIT_STEP_PICK_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const stepNo = Number(
      parseNumericIdFromAction(
        ctx,
        ADMIN_PANEL_SERVICES_EDIT_STEP_PICK_ACTION_REGEX,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_LABEL_STEP_NUMBER'),
      ),
    );
    const selectedStep = draft.stepOptions.find((item) => item.stepNo === stepNo);
    if (!selectedStep) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEP_NOT_FOUND'),
        createAdminServiceEditStepSelectKeyboard(draft.stepOptions, state.language),
      );
      return;
    }

    const editingStepDescription = draft.field === 'step_description';
    const editingStepDuration = draft.field === 'step_duration_minutes';
    draft.mode = 'awaiting_text';
    draft.currentStepNo = selectedStep.stepNo;
    draft.currentStepTitle = selectedStep.title;
    draft.currentStepDescription = selectedStep.description;
    draft.currentStepDurationMinutes = selectedStep.durationMinutes;
    draft.currentValue = editingStepDescription
      ? selectedStep.description
      : editingStepDuration
      ? selectedStep.durationMinutes
      : selectedStep.title;
    draft.value = null;

    if (editingStepDuration) {
      await ctx.reply(
        formatAdminServiceEditStepDurationInputText(
          draft.serviceName,
          selectedStep.stepNo,
          selectedStep.durationMinutes, state.language),
        createAdminServiceEditInputKeyboard(state.language),
      );
      return;
    }

    if (editingStepDescription) {
      await ctx.reply(
        formatAdminServiceEditStepDescriptionInputText(
          draft.serviceName,
          selectedStep.stepNo,
          selectedStep.description, state.language),
        createAdminServiceEditInputKeyboard(state.language),
      );
      return;
    }

    await ctx.reply(
      formatAdminServiceEditStepInputText(
        draft.serviceName,
        selectedStep.stepNo,
        selectedStep.title, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_GUARANTEE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    const studioId = state.access?.studioId;

    if (!draft || !studioId) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const details = await getServiceCatalogDetailsById({ serviceId: draft.serviceId, studioId });
    if (!details || details.guarantees.length === 0) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_GUARANTEES_NOT_FOUND'),
        createAdminServiceEditMenuKeyboard(state.language),
      );
      return;
    }

    draft.field = 'guarantee_text';
    draft.mode = 'selecting_guarantee';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = details.guarantees.map((item) => ({
      guaranteeNo: item.guaranteeNo,
      guaranteeText: item.guaranteeText,
    }));
    draft.currentValue = null;
    draft.value = null;

    await ctx.reply(
      formatAdminServiceEditGuaranteeSelectText(draft.serviceName, draft.guaranteeOptions, state.language),
      createAdminServiceEditGuaranteeSelectKeyboard(draft.guaranteeOptions, state.language),
    );
  });

  scene.action(ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_PICK_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    const guaranteeNo = Number(
      parseNumericIdFromAction(
        ctx,
        ADMIN_PANEL_SERVICES_EDIT_GUARANTEE_PICK_ACTION_REGEX,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_LABEL_GUARANTEE_NUMBER'),
      ),
    );
    const selectedGuarantee = draft.guaranteeOptions.find((item) => item.guaranteeNo === guaranteeNo);
    if (!selectedGuarantee) {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_SERVICES_MSG_GUARANTEE_NOT_FOUND'),
        createAdminServiceEditGuaranteeSelectKeyboard(draft.guaranteeOptions, state.language),
      );
      return;
    }

    draft.field = 'guarantee_text';
    draft.mode = 'awaiting_text';
    draft.currentGuaranteeNo = selectedGuarantee.guaranteeNo;
    draft.currentGuaranteeText = selectedGuarantee.guaranteeText;
    draft.currentValue = selectedGuarantee.guaranteeText;
    draft.value = null;

    await ctx.reply(
      formatAdminServiceEditGuaranteeInputText(
        draft.serviceName,
        selectedGuarantee.guaranteeNo,
        selectedGuarantee.guaranteeText, state.language),
      createAdminServiceEditInputKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_DELETE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    if (!draft) {
      const fallbackServiceId = state.servicesSelectedServiceId;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    draft.field = 'deactivate';
    draft.mode = 'awaiting_confirm';
    draft.currentStepNo = null;
    draft.currentStepTitle = null;
    draft.currentStepDescription = null;
    draft.currentStepDurationMinutes = null;
    draft.stepOptions = [];
    draft.currentGuaranteeNo = null;
    draft.currentGuaranteeText = null;
    draft.guaranteeOptions = [];
    draft.currentValue = null;
    draft.value = 'deactivate';
    await ctx.reply(
      formatAdminServiceDeleteConfirmText(draft.serviceName, state.language),
      createAdminServiceDeleteConfirmKeyboard(state.language),
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = state.servicesEditDraft?.serviceId ?? state.servicesSelectedServiceId;
    state.servicesEditDraft = null;

    if (!serviceId) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }
    await renderAdminServiceEditMenu(ctx, serviceId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = state.servicesEditDraft?.serviceId ?? state.servicesSelectedServiceId;
    state.servicesEditDraft = null;

    if (!serviceId) {
      await renderAdminServicesCatalog(ctx, true);
      return;
    }
    await renderAdminServiceDetails(ctx, serviceId, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_EDIT_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.servicesEditDraft;
    const studioId = state.access?.studioId;

    if (!studioId || !draft || draft.mode !== 'awaiting_confirm' || !draft.value) {
      const fallbackServiceId = draft?.serviceId ?? state.servicesSelectedServiceId;
      state.servicesEditDraft = null;
      if (!fallbackServiceId) {
        await renderAdminServicesCatalog(ctx, true);
        return;
      }
      await renderAdminServiceEditMenu(ctx, fallbackServiceId, true);
      return;
    }

    try {
      if (draft.field === 'deactivate') {
	        const deactivated = await deactivateAdminService({
	          studioId,
	          serviceId: draft.serviceId,
	        });
	        state.servicesEditDraft = null;
	        logAdminCriticalAction(
	          ctx,
	          'Deactivated service',
	          {
	            serviceId: draft.serviceId,
	            serviceName: deactivated.name,
	          },
	          state.access,
	        );
	        await replyAdminSuccess(
            ctx,
            tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_DEACTIVATED_SUCCESS', {
              serviceName: deactivated.name,
            }),
          );
        await renderAdminServicesCatalog(ctx, false);
        return;
      }

      if (draft.field === 'guarantee_text') {
        await updateAdminServiceGuaranteeText({
          studioId,
          serviceId: draft.serviceId,
          guaranteeNo: draft.currentGuaranteeNo ?? 0,
          guaranteeText: String(draft.value),
        });
        state.servicesEditDraft = null;
        await replyAdminSuccess(
          ctx,
          tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_GUARANTEE_UPDATED_SUCCESS', {
            guaranteeNo: draft.currentGuaranteeNo ?? '-',
            serviceName: draft.serviceName,
          }),
        );
        await renderAdminServiceDetails(ctx, draft.serviceId, false);
        return;
      }

      if (draft.field === 'step_title') {
        await updateAdminServiceStepTitle({
          studioId,
          serviceId: draft.serviceId,
          stepNo: draft.currentStepNo ?? 0,
          title: String(draft.value),
        });
        state.servicesEditDraft = null;
        await replyAdminSuccess(
          ctx,
          tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEP_TITLE_UPDATED_SUCCESS', {
            stepNo: draft.currentStepNo ?? '-',
            serviceName: draft.serviceName,
          }),
        );
        await renderAdminServiceDetails(ctx, draft.serviceId, false);
        return;
      }

      if (draft.field === 'step_description') {
        await updateAdminServiceStepDescription({
          studioId,
          serviceId: draft.serviceId,
          stepNo: draft.currentStepNo ?? 0,
          description: String(draft.value),
        });
        state.servicesEditDraft = null;
        await replyAdminSuccess(
          ctx,
          tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEP_DESCRIPTION_UPDATED_SUCCESS', {
            stepNo: draft.currentStepNo ?? '-',
            serviceName: draft.serviceName,
          }),
        );
        await renderAdminServiceDetails(ctx, draft.serviceId, false);
        return;
      }

      if (draft.field === 'step_duration_minutes') {
        await updateAdminServiceStepDuration({
          studioId,
          serviceId: draft.serviceId,
          stepNo: draft.currentStepNo ?? 0,
          durationMinutes:
            typeof draft.value === 'number'
              ? draft.value
              : normalizeServiceStepDurationInput(String(draft.value), state.language),
        });
        state.servicesEditDraft = null;
        await replyAdminSuccess(
          ctx,
          tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_STEP_DURATION_UPDATED_SUCCESS', {
            stepNo: draft.currentStepNo ?? '-',
            serviceName: draft.serviceName,
          }),
        );
        await renderAdminServiceDetails(ctx, draft.serviceId, false);
        return;
      }

      const updated =
        draft.field === 'name'
          ? await updateAdminServiceName({
              studioId,
              serviceId: draft.serviceId,
              name: String(draft.value),
            })
          : draft.field === 'duration_minutes'
          ? await updateAdminServiceDuration({
              studioId,
              serviceId: draft.serviceId,
              durationMinutes:
                typeof draft.value === 'number'
                  ? draft.value
                  : normalizeServiceDurationInput(String(draft.value), state.language),
            })
          : draft.field === 'base_price'
          ? await updateAdminServiceBasePrice({
              studioId,
              serviceId: draft.serviceId,
              basePrice: String(draft.value),
            })
          : draft.field === 'description'
          ? await updateAdminServiceDescription({
              studioId,
              serviceId: draft.serviceId,
              description: String(draft.value),
            })
          : await updateAdminServiceResultDescription({
              studioId,
              serviceId: draft.serviceId,
              resultDescription: String(draft.value),
            });
      state.servicesEditDraft = null;

      await replyAdminSuccess(
        ctx,
        draft.field === 'name'
          ? tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_NAME_UPDATED_SUCCESS', {
              serviceName: updated.name,
            })
          : draft.field === 'duration_minutes'
          ? tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_DURATION_UPDATED_SUCCESS', {
              serviceName: updated.name,
            })
          : draft.field === 'base_price'
          ? tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_PRICE_UPDATED_SUCCESS', {
              serviceName: updated.name,
            })
          : draft.field === 'description'
          ? tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_DESCRIPTION_UPDATED_SUCCESS', {
              serviceName: updated.name,
            })
          : tBotTemplate(state.language, 'ADMIN_PANEL_SERVICES_MSG_RESULT_UPDATED_SUCCESS', {
              serviceName: updated.name,
            }),
      );
      await renderAdminServiceDetails(ctx, draft.serviceId, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(
          ctx,
          error.message,
          draft.field === 'deactivate'
            ? createAdminServiceDeleteConfirmKeyboard(state.language)
            : createAdminServiceEditInputKeyboard(state.language),
        );
        state.servicesEditDraft = {
          ...draft,
          mode:
            draft.field === 'deactivate'
              ? 'awaiting_confirm'
              : draft.field === 'guarantee_text' && draft.currentGuaranteeNo
              ? 'awaiting_text'
              : (draft.field === 'step_title' || draft.field === 'step_description') &&
                draft.currentStepNo
              ? 'awaiting_text'
              : draft.field === 'guarantee_text'
              ? 'selecting_guarantee'
              : draft.field === 'step_title' ||
                draft.field === 'step_description' ||
                draft.field === 'step_duration_minutes'
              ? 'selecting_step'
              : 'awaiting_text',
          value: draft.field === 'deactivate' ? 'deactivate' : null,
        };
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const studioId = state.access?.studioId;
    if (!studioId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_MASTERS_MSG_STUDIO_NOT_RESOLVED'));
    }

    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_SERVICES_OPEN_STATS_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );

    let stats: AdminPanelStatsServiceDetails;
    try {
      stats = await getAdminPanelStatsServiceDetails({ studioId, serviceId });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminServicesCatalog(ctx, false);
        return;
      }
      throw error;
    }
    state.servicesCurrentSection = 'stats';
    state.servicesSelectedServiceId = serviceId;
    state.servicesEditDraft = null;
    state.servicesCreateDraft = null;

    try {
      await ctx.editMessageText(
        formatAdminStatsServiceDetailsText(stats, state.language),
        createAdminServiceDetailsKeyboard(serviceId, state.language),
      );
    } catch {
      await ctx.reply(
        formatAdminStatsServiceDetailsText(stats, state.language),
        createAdminServiceDetailsKeyboard(serviceId, state.language),
      );
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminServicesCatalog(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SERVICES_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetServicesState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_STATS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminStatsOverview(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_MASTERS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsMastersList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsMastersList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsMastersList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const masterId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_MASTERS_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_MASTER_ID'),
    );

    try {
      await renderAdminStatsMasterDetails(ctx, masterId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const fallbackOffset = state.statsMastersFeed?.offset ?? 0;
        await renderAdminStatsMastersList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MASTERS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMastersFeed;
    await renderAdminStatsMastersList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_SERVICES, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsServicesList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsServicesList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsServicesList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const serviceId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_SERVICES_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_MASTERS_LABEL_SERVICE_ID'),
    );

    try {
      await renderAdminStatsServiceDetails(ctx, serviceId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const fallbackOffset = state.statsServicesFeed?.offset ?? 0;
        await renderAdminStatsServicesList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_SERVICES_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsServicesFeed;
    await renderAdminStatsServicesList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_MONTHLY, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsMonthlyList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsMonthlyList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsMonthlyList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const monthCode = parseMonthCodeFromAction(
      ctx,
      ADMIN_PANEL_STATS_MONTHLY_OPEN_ACTION_REGEX,
      state.language,
    );

    try {
      await renderAdminStatsMonthlyReportDetails(ctx, monthCode, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const fallbackOffset = state.statsMonthlyFeed?.offset ?? 0;
        await renderAdminStatsMonthlyList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_MONTHLY_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsMonthlyFeed;
    await renderAdminStatsMonthlyList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_OPEN_CLIENTS, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsClientsList(ctx, 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderAdminStatsClientsList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderAdminStatsClientsList(ctx, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const clientId = parseNumericIdFromAction(
      ctx,
      ADMIN_PANEL_STATS_CLIENTS_OPEN_ACTION_REGEX,
      tBot(state.language, 'ADMIN_PANEL_COMMON_LABEL_CLIENT_ID'),
      state.language,
    );

    try {
      await renderAdminStatsClientDetails(ctx, clientId, true);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const fallbackOffset = state.statsClientsFeed?.offset ?? 0;
        await renderAdminStatsClientsList(ctx, fallbackOffset, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_CLIENTS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).statsClientsFeed;
    await renderAdminStatsClientsList(ctx, feed?.offset ?? 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_BACK_TO_OVERVIEW, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminStatsOverview(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.STATS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetStatsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.OPEN_SETTINGS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminSettingsMenu(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_LANGUAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsAdminsDraft = null;
    state.settingsStudioDraft = null;
    state.settingsLanguageDraft = null;
    await renderAdminSettingsLanguage(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_ADMINS, async (ctx) => {
    await ctx.answerCbQuery();
    getSceneState(ctx).settingsLanguageDraft = null;
    await renderAdminSettingsAdmins(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_STUDIO, async (ctx) => {
    await ctx.answerCbQuery();
    getSceneState(ctx).settingsLanguageDraft = null;
    await renderAdminSettingsStudioProfile(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_OPEN_NOTIFICATIONS, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsAdminsDraft = null;
    state.settingsStudioDraft = null;
    state.settingsLanguageDraft = null;
    await renderAdminSettingsNotifications(ctx, true);
  });

  scene.action(ADMIN_PANEL_SETTINGS_NOTIFICATIONS_TOGGLE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const userId = state.access?.userId;
    if (!userId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'));
    }

    const notificationType = parseSettingsNotificationTypeFromAction(ctx, state.language);
    const currentState = state.settingsNotificationsState ?? (await getUserNotificationSettingsState(userId));
    const nextEnabled = !(currentState[notificationType] ?? true);

	    await upsertUserNotificationSetting({
	      userId,
	      notificationType,
	      enabled: nextEnabled,
	    });
	    logAdminCriticalAction(
	      ctx,
	      'Changed admin notification toggle',
	      {
	        targetUserId: userId,
	        notificationType,
	        enabled: nextEnabled,
	      },
	      state.access,
	    );

	    await renderAdminSettingsNotifications(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_NOTIFICATIONS_ALL_ON, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = getSceneState(ctx).access?.userId;
    if (!userId) {
      throw new ValidationError(
        tBot(getSceneState(ctx).language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'),
      );
    }

	    await setAllUserNotificationSettings({
	      userId,
	      enabled: true,
	    });
	    logAdminCriticalAction(
	      ctx,
	      'Enabled all admin notifications',
	      {
	        targetUserId: userId,
	      },
	      getSceneState(ctx).access,
	    );
	    await renderAdminSettingsNotifications(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_NOTIFICATIONS_ALL_OFF, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = getSceneState(ctx).access?.userId;
    if (!userId) {
      throw new ValidationError(
        tBot(getSceneState(ctx).language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'),
      );
    }

	    await setAllUserNotificationSettings({
	      userId,
	      enabled: false,
	    });
	    logAdminCriticalAction(
	      ctx,
	      'Disabled all admin notifications',
	      {
	        targetUserId: userId,
	      },
	      getSceneState(ctx).access,
	    );
	    await renderAdminSettingsNotifications(ctx, true);
  });

  scene.action(ADMIN_PANEL_SETTINGS_LANGUAGE_SELECT_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const userId = state.access?.userId;
    if (!userId) {
      throw new ValidationError(tBot(state.language, 'ADMIN_PANEL_COMMON_MSG_ADMIN_USER_UNRESOLVED'));
    }

    const nextLanguage = parseSettingsLanguageFromAction(ctx, state.language);
    const currentLanguage = await getAdminPanelLanguage({ userId });
    if (nextLanguage === currentLanguage) {
      await renderAdminSettingsLanguage(ctx, true);
      return;
    }

    await renderAdminSettingsLanguageConfirm(
      ctx,
      { currentLanguage, nextLanguage },
      true,
    );
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_LANGUAGE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsLanguageDraft = null;
    await renderAdminSettingsLanguage(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_LANGUAGE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const userId = state.access?.userId;
    const draft = state.settingsLanguageDraft;
    if (!userId || !draft) {
      await renderAdminSettingsLanguage(ctx, true);
      return;
    }

    try {
	      await setAdminPanelLanguage({
	        userId,
	        language: draft.nextLanguage,
	      });
	      state.settingsLanguageDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Changed admin panel language',
	        {
	          targetUserId: userId,
	          language: draft.nextLanguage,
	        },
	        state.access,
	      );
	      await replyAdminSuccess(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_SETTINGS_MSG_LANGUAGE_UPDATED'),
        );
      await renderAdminSettingsLanguage(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminSettingsLanguage(ctx, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_BACK_TO_MENU, async (ctx) => {
    await ctx.answerCbQuery();
    resetSettingsState(getSceneState(ctx));
    await renderAdminSettingsMenu(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetSettingsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_SETTINGS_STUDIO_EDIT_BLOCK_OPEN_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const blockKey = parseStudioBlockKeyFromAction(ctx, getSceneState(ctx).language);
    await renderAdminSettingsStudioEditPrompt(ctx, blockKey, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsStudioDraft = null;
    await renderAdminSettingsStudioProfile(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_STUDIO_EDIT_BLOCK_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.settingsStudioDraft;

    if (
      !access?.studioId ||
      !draft ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.draftContent
    ) {
      await renderAdminSettingsStudioProfile(ctx, true);
      return;
    }

    try {
	      await upsertAdminStudioContentBlock({
        studioId: access.studioId,
        blockKey: draft.blockKey,
        content: draft.draftContent,
        updatedBy: access.userId,
        language: 'uk',
	      });
	      state.settingsStudioDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Updated studio content block',
	        {
	          blockKey: draft.blockKey,
	          blockTitle: draft.blockTitle,
	        },
	        access,
	      );
	      await replyAdminSuccess(
          ctx,
          tBotTemplate(state.language, 'ADMIN_PANEL_SETTINGS_MSG_STUDIO_BLOCK_UPDATED', {
            block: draft.blockTitle,
          }),
        );
      await renderAdminSettingsStudioProfile(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminSettingsStudioEditPrompt(ctx, draft.blockKey, false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsAdminsInput(ctx, 'grant', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_OPEN, async (ctx) => {
    await ctx.answerCbQuery();
    await renderAdminSettingsAdminsInput(ctx, 'revoke', true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsAdminsDraft = null;
    await renderAdminSettingsAdmins(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.settingsAdminsDraft = null;
    await renderAdminSettingsAdmins(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_GRANT_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.settingsAdminsDraft;

    if (
      !access?.studioId ||
      !draft ||
      draft.action !== 'grant' ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.target
    ) {
      await renderAdminSettingsAdmins(ctx, true);
      return;
    }

    try {
	      const granted = await grantStudioAdminRole({
        studioId: access.studioId,
        telegramId: draft.target.telegramUserId,
        grantedByUserId: access.userId,
      });

	      state.settingsAdminsDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Granted studio admin role',
	        {
	          targetTelegramUserId: granted.telegramUserId,
	          targetDisplayName: granted.displayName,
	        },
	        access,
	      );
	      await ctx.reply(
          tBotTemplate(state.language, 'ADMIN_PANEL_SETTINGS_MSG_ADMIN_GRANTED', {
            user: granted.displayName,
            telegramId: granted.telegramUserId,
          }),
        );
      await renderAdminSettingsAdmins(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminSettingsAdminsInput(ctx, 'grant', false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.SETTINGS_ADMINS_REVOKE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.settingsAdminsDraft;

    if (
      !access?.studioId ||
      !draft ||
      draft.action !== 'revoke' ||
      draft.mode !== 'awaiting_confirm' ||
      !draft.target
    ) {
      await renderAdminSettingsAdmins(ctx, true);
      return;
    }

    try {
	      const revoked = await revokeStudioAdminRole({
        studioId: access.studioId,
        telegramId: draft.target.telegramUserId,
        revokedByUserId: access.userId,
      });

	      state.settingsAdminsDraft = null;
	      logAdminCriticalAction(
	        ctx,
	        'Revoked studio admin role',
	        {
	          targetTelegramUserId: revoked.telegramUserId,
	          targetDisplayName: revoked.displayName,
	        },
	        access,
	      );
	      await ctx.reply(
          tBotTemplate(state.language, 'ADMIN_PANEL_SETTINGS_MSG_ADMIN_REVOKED', {
            user: revoked.displayName,
            telegramId: revoked.telegramUserId,
          }),
        );
      await renderAdminSettingsAdmins(ctx, false);
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderAdminSettingsAdminsInput(ctx, 'revoke', false);
        return;
      }
      throw error;
    }
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_PENDING, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'pending', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TODAY, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'today', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_TOMORROW, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'tomorrow', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_ALL, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'all', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_MENU_CANCELED, async (ctx) => {
    await ctx.answerCbQuery();
    resetRecordsActionDrafts(getSceneState(ctx));
    await renderRecordsCategoryStub(ctx, 'canceled', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_PREV_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasPrevPage) {
      return;
    }

    const nextOffset = Math.max(0, feed.offset - feed.limit);
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_LIST_NEXT_PAGE, async (ctx) => {
    await ctx.answerCbQuery();
    const feed = getSceneState(ctx).recordsFeed;
    if (!feed || !feed.hasNextPage) {
      return;
    }

    const nextOffset = feed.offset + feed.limit;
    await renderRecordsCategoryStub(ctx, feed.category, nextOffset, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    try {
      const appointmentId = tryParseAppointmentIdFromAction(ctx, ADMIN_PANEL_RECORDS_OPEN_CARD_ACTION_REGEX);
      if (!appointmentId) {
        logAdminCriticalAction(
          ctx,
          'Received invalid callback data for records open card',
          {
            callbackData:
              ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : null,
          },
          state.access,
        );
        await replyAdminWarning(
          ctx,
          tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_OPEN_CARD_FAILED_REFRESH'),
        );
        await renderRecordsFallback(ctx, false);
        return;
      }
      const item = await resolveAdminRecordById(state, appointmentId);
      if (!item) {
        if (state.recordsFeed) {
          await renderRecordsCategoryStub(ctx, state.recordsFeed.category, state.recordsFeed.offset, true);
          return;
        }

        await renderRecordsMenu(ctx);
        return;
      }

      await renderAdminBookingCard(ctx, item);
    } catch (error) {
      handleError({
        logger: loggerAdminPanel,
        level: 'error',
        scope: 'admin-panel.scene',
        action: 'Failed to open booking card from records feed',
        error,
        meta: {
          callbackData:
            ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : null,
          category: state.recordsFeed?.category ?? null,
          offset: state.recordsFeed?.offset ?? null,
        },
      });
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_OPEN_CARD_FAILED_BACK_TO_LIST'),
      );
      await renderRecordsFallback(ctx, false);
    }
  });

  scene.action(ADMIN_PANEL_RECORDS_CONTACT_CLIENT_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_CONTACT_CLIENT_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    await renderAdminBookingClientContact(ctx, item, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_VIEW_CLIENT_PROFILE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_VIEW_CLIENT_PROFILE_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    await renderAdminBookingClientProfile(ctx, item, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_VIEW_MASTER_PROFILE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_VIEW_MASTER_PROFILE_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    await renderAdminBookingMasterProfile(ctx, item, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_NEXT_PENDING_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const currentAppointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_NEXT_PENDING_ACTION_REGEX,
      state.language,
    );
    const nextPending = await resolveNextPendingBooking(state, currentAppointmentId);
    if (!nextPending) {
      await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_NO_MORE_PENDING'));
      const current = await resolveAdminRecordById(state, currentAppointmentId);
      if (current) {
        await renderAdminBookingCard(ctx, current);
        return;
      }
      await renderRecordsFallback(ctx, false);
      return;
    }

    await renderAdminBookingCard(ctx, nextPending);
  });

  scene.action(ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_CONFIRM_ACTION_REGEX,
      state.language,
    );
    let updated: AdminBookingItem;
    try {
      updated = await confirmAdminPendingBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const current = await resolveAdminRecordById(state, appointmentId);
        if (current) {
          await renderAdminBookingCard(ctx, current);
          return;
        }
        await renderRecordsFallback(ctx, false);
        return;
      }
      throw error;
    }

	    await notifyAdminConfirmedBooking(updated, state.language);
	    logAdminCriticalAction(
	      ctx,
	      'Confirmed booking',
	      {
	        appointmentId: updated.appointmentId,
	        clientId: updated.clientId,
	        masterId: updated.masterId,
	        serviceId: updated.serviceId,
	        status: updated.status,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CONFIRMED_AND_NOTIFIED'));
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_CANCEL_REQUEST_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    await renderAdminCancelBookingConfirm(ctx, item);
  });

  scene.action(ADMIN_PANEL_RECORDS_HARD_DELETE_REQUEST_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_HARD_DELETE_REQUEST_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (item.status !== 'canceled' && item.status !== 'completed' && item.status !== 'transferred') {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_HARD_DELETE_ONLY_INACTIVE'),
      );
      await renderAdminBookingCard(ctx, item);
      return;
    }

    await renderAdminHardDeleteBookingConfirm(ctx, item);
  });

  scene.action(ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_HARD_DELETE_CONFIRM_ACTION_REGEX,
      state.language,
    );
    const target = await resolveAdminRecordById(state, appointmentId);
    if (!target) {
      await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_ALREADY_ABSENT'));
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (target.status !== 'canceled' && target.status !== 'completed' && target.status !== 'transferred') {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_HARD_DELETE_ABORT_ACTIVE'),
      );
      await renderAdminBookingCard(ctx, target);
      return;
    }

    const deleted = await hardDeleteAdminBooking({
      studioId: access.studioId,
      appointmentId,
    });

    if (!deleted) {
      await replyAdminInfo(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_NOT_DELETED_ALREADY_CHANGED'),
      );
      await renderRecordsFallback(ctx, true);
      return;
    }

	    resetRecordsActionDrafts(state);
	    state.recordsOpenedAppointmentId = null;
	    logAdminCriticalAction(
	      ctx,
	      'Hard deleted booking',
	      {
	        appointmentId,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_HARD_DELETED'));

    if (state.recordsFeed) {
      await renderRecordsCategoryWithOffsetFallback(
        ctx,
        state.recordsFeed.category,
        state.recordsFeed.offset,
        true,
      );
      return;
    }

    await renderRecordsMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_HARD_DELETE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = state.recordsOpenedAppointmentId;
    if (!appointmentId) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_ACTION_CANCELLED'));
    await renderAdminBookingCard(ctx, item);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_REQUEST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.recordsFeed;
    if (!feed || feed.category !== 'canceled') {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (feed.total <= 0) {
      await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CANCELED_ALREADY_EMPTY'));
      await renderRecordsCategoryStub(ctx, 'canceled', 0, true);
      return;
    }

    await renderAdminClearCanceledConfirm(ctx, feed.total, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const deletedCount = await clearCanceledAdminBookings({
      studioId: access.studioId,
    });

	    resetRecordsActionDrafts(state);
	    state.recordsOpenedAppointmentId = null;
	    logAdminCriticalAction(
	      ctx,
	      'Cleared canceled bookings',
	      {
	        deletedCount,
	      },
	      access,
	    );
	    await replyAdminSuccess(
        ctx,
        tBotTemplate(state.language, 'ADMIN_PANEL_RECORDS_MSG_CANCELED_CLEARED', {
          count: deletedCount,
        }),
      );
    await renderRecordsCategoryWithOffsetFallback(ctx, 'canceled', 0, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CLEAR_CANCELED_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const feed = state.recordsFeed;
    await replyAdminInfo(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_ACTION_CANCELLED'));
    if (feed?.category === 'canceled') {
      await renderRecordsCategoryStub(ctx, 'canceled', feed.offset, true);
      return;
    }
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    if (!access?.studioId) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_CANCEL_CONFIRM_ACTION_REGEX,
      state.language,
    );
    let canceled: AdminBookingItem;
    try {
      canceled = await cancelAdminBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId,
        cancelReason: tBot(state.language, 'ADMIN_PANEL_RECORDS_REASON_CANCELED_BY_ADMIN'),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        const current = await resolveAdminRecordById(state, appointmentId);
        if (current) {
          await renderAdminBookingCard(ctx, current);
          return;
        }
        await renderRecordsFallback(ctx, false);
        return;
      }
      throw error;
    }

	    await notifyAdminCanceledBooking(canceled, state.language);
	    logAdminCriticalAction(
	      ctx,
	      'Canceled booking',
	      {
	        appointmentId: canceled.appointmentId,
	        clientId: canceled.clientId,
	        masterId: canceled.masterId,
	        status: canceled.status,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CANCELED_AND_NOTIFIED'));
    resetRecordsActionDrafts(state);
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_RESCHEDULE_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (item.status !== 'pending' && item.status !== 'confirmed') {
      await replyAdminWarning(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CANNOT_RESCHEDULE'));
      await renderAdminBookingCard(ctx, item);
      return;
    }

    state.recordsRescheduleDraft = {
      appointmentId,
      dateCode: null,
      timeCode: null,
    };
    state.recordsChangeMasterDraft = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_RESCHEDULE_DATE_ACTION_REGEX);
    const dateCode = matches?.[1] ?? '';
    const parsed = bookingDateCodeSchema.safeParse(dateCode);
    if (!parsed.success) {
      await renderRescheduleDateStep(ctx, true);
      return;
    }

    state.recordsRescheduleDraft.dateCode = parsed.data;
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.recordsRescheduleDraft;
    if (!draft?.dateCode) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_RESCHEDULE_TIME_ACTION_REGEX);
    const timeCode = matches?.[1] ?? '';
    const parsed = bookingTimeCodeSchema.safeParse(timeCode);
    if (!parsed.success) {
      await renderRescheduleTimeStep(ctx, true);
      return;
    }

    const allowed = new Set(getAvailableRescheduleTimeCodes(draft.dateCode));
    if (!allowed.has(parsed.data)) {
      await renderRescheduleTimeStep(ctx, true);
      return;
    }

    draft.timeCode = parsed.data;
    await renderRescheduleConfirmStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_DATE, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleDateStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_BACK_TO_TIME, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    if (!state.recordsRescheduleDraft?.dateCode) {
      await renderRecordsFallback(ctx, true);
      return;
    }
    state.recordsRescheduleDraft.timeCode = null;
    await renderRescheduleTimeStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.recordsRescheduleDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_RESCHEDULE_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.recordsRescheduleDraft;
    if (!access?.studioId || !draft?.dateCode || !draft.timeCode) {
      state.recordsRescheduleDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const target = await resolveAdminRecordById(state, draft.appointmentId);
    if (!target) {
      state.recordsRescheduleDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const newStartAt = toStartAt(draft.dateCode, draft.timeCode);
    let result: RescheduleAdminBookingResult;
    try {
      result = await rescheduleAdminBooking({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId: draft.appointmentId,
        newStartAt,
        reason: tBot(state.language, 'ADMIN_PANEL_RECORDS_REASON_RESCHEDULED_BY_ADMIN'),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderRescheduleTimeStep(ctx, false);
        return;
      }
      throw error;
    }

	    await notifyAdminRescheduledBooking(result, state.language);
	    logAdminCriticalAction(
	      ctx,
	      'Rescheduled booking',
	      {
	        appointmentId: result.current.appointmentId,
	        previousStartAt: result.previous.startAt,
	        currentStartAt: result.current.startAt,
	        clientId: result.current.clientId,
	        masterId: result.current.masterId,
	      },
	      access,
	    );
	    await replyAdminSuccess(ctx, tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_RESCHEDULED_AND_NOTIFIED'));
    state.recordsRescheduleDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const appointmentId = parseAppointmentIdFromAction(
      ctx,
      ADMIN_PANEL_RECORDS_CHANGE_MASTER_ACTION_REGEX,
      state.language,
    );
    const item = await resolveAdminRecordById(state, appointmentId);
    if (!item) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    if (item.status !== 'pending' && item.status !== 'confirmed') {
      await replyAdminWarning(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_CANNOT_CHANGE_MASTER'),
      );
      await renderAdminBookingCard(ctx, item);
      return;
    }

    const candidates = await loadChangeMasterCandidates(item);
    state.recordsChangeMasterDraft = {
      appointmentId,
      selectedMasterId: null,
      selectedMasterName: null,
      candidates,
    };
    state.recordsRescheduleDraft = null;
    await renderChangeMasterSelectStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const draft = state.recordsChangeMasterDraft;
    if (!draft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const matches = callbackData.match(ADMIN_PANEL_RECORDS_CHANGE_MASTER_SELECT_ACTION_REGEX);
    const appointmentId = matches?.[1] ?? '';
    const masterId = matches?.[2] ?? '';
    if (!appointmentId || !masterId || appointmentId !== draft.appointmentId) {
      await renderChangeMasterSelectStep(ctx, true);
      return;
    }

    const selected = draft.candidates.find((candidate) => candidate.masterId === masterId);
    if (!selected) {
      await renderChangeMasterSelectStep(ctx, true);
      return;
    }

    draft.selectedMasterId = selected.masterId;
    draft.selectedMasterName = selected.displayName;
    await renderChangeMasterConfirmStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const draft = getSceneState(ctx).recordsChangeMasterDraft;
    if (!draft) {
      await renderRecordsFallback(ctx, true);
      return;
    }

    draft.selectedMasterId = null;
    draft.selectedMasterName = null;
    await renderChangeMasterSelectStep(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CANCEL, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    state.recordsChangeMasterDraft = null;
    await renderRecordsFallback(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_CHANGE_MASTER_CONFIRM, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    const access = state.access;
    const draft = state.recordsChangeMasterDraft;
    if (!access?.studioId || !draft?.selectedMasterId) {
      state.recordsChangeMasterDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    const previous = await resolveAdminRecordById(state, draft.appointmentId);
    if (!previous) {
      state.recordsChangeMasterDraft = null;
      await renderRecordsFallback(ctx, true);
      return;
    }

    let updated: AdminBookingItem;
    try {
      updated = await reassignAdminBookingMaster({
        studioId: access.studioId,
        actorUserId: access.userId,
        appointmentId: draft.appointmentId,
        newMasterId: draft.selectedMasterId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        await replyAdminWarning(ctx, error.message);
        await renderChangeMasterSelectStep(ctx, false);
        return;
      }
      throw error;
    }

	    await notifyAdminMasterChangedBooking(previous, updated, state.language);
	    logAdminCriticalAction(
	      ctx,
	      'Changed booking master',
	      {
	        appointmentId: updated.appointmentId,
	        previousMasterId: previous.masterId,
	        currentMasterId: updated.masterId,
	        clientId: updated.clientId,
	      },
	      access,
	    );
	    await replyAdminSuccess(
        ctx,
        tBot(state.language, 'ADMIN_PANEL_RECORDS_MSG_MASTER_CHANGED_AND_NOTIFIED'),
      );
    state.recordsChangeMasterDraft = null;
    await renderAdminBookingCard(ctx, updated);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK_TO_LIST, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    state.recordsOpenedAppointmentId = null;
    const feed = state.recordsFeed;
    if (!feed) {
      await renderRecordsMenu(ctx);
      return;
    }
    await renderRecordsCategoryStub(ctx, feed.category, feed.offset, true);
  });

  scene.action(ADMIN_PANEL_ACTION.RECORDS_BACK, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    state.recordsOpenedAppointmentId = null;
    state.recordsFeed = null;
    state.recordsLastCategory = null;
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.BACK_TO_ROOT, async (ctx) => {
    await ctx.answerCbQuery();
    const state = getSceneState(ctx);
    resetRecordsActionDrafts(state);
    resetScheduleDrafts(state);
    resetMastersState(state);
    resetServicesState(state);
    resetStatsState(state);
    resetSettingsState(state);
    await renderAdminRoot(ctx, true);
  });

  scene.action(ADMIN_PANEL_ACTION.EXIT, async (ctx) => {
    await ctx.answerCbQuery();
    logAdminCriticalAction(ctx, 'Admin panel exited by user', {}, getSceneState(ctx).access);
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  scene.action(ADMIN_PANEL_ACTION.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    logAdminCriticalAction(ctx, 'Admin panel left to home', {}, getSceneState(ctx).access);
    await ctx.scene.leave();
    await sendClientMainMenu(ctx);
  });

  return scene;
}
