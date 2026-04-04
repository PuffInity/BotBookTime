/**
 * @file i18n-master-panel.bot.ts
 * @summary Тексти панелі майстра.
 */

export const MASTER_PANEL_DICTIONARY = {
  uk: {
    MENU_MASTER_PANEL: '🛠 Панель майстра',

    MASTER_PANEL_TITLE: '👩‍🎨 Панель майстра',
    MASTER_PANEL_GREETING: 'Вітаю, {name}!',
    MASTER_PANEL_STATUS_AVAILABLE: '🟢 Статус майстра: доступний для нових записів',
    MASTER_PANEL_STATUS_UNAVAILABLE: '🟠 Статус майстра: тимчасово недоступний для нових записів',
    MASTER_PANEL_ROOT_DESCRIPTION:
      'Тут ви можете керувати своїми записами, робочим графіком та профілем майстра.\n' +
      'Оберіть потрібний розділ нижче.',
    MASTER_PANEL_ACCESS_DENIED:
      '🔒 Панель майстра недоступна для цього профілю.\n\n' +
      'Якщо доступ має бути відкритий, зверніться до адміністратора салону.',

    MASTER_PANEL_BTN_PROFILE: '👤 Мій профіль',
    MASTER_PANEL_BTN_BOOKINGS: '📅 Мої записи',
    MASTER_PANEL_BTN_SCHEDULE: '🕒 Мій розклад',
    MASTER_PANEL_BTN_STATS: '📊 Моя статистика',
    MASTER_PANEL_BTN_FINANCE: '💰 Фінанси',
    MASTER_PANEL_BTN_BACK_TO_PANEL: '⬅️ До панелі майстра',
    MASTER_PANEL_BTN_BACK_TO_SCHEDULE: '⬅️ До розкладу',

    MASTER_PANEL_SECTION_STUB_BODY:
      'Цей розділ підключимо в наступних блоках реалізації.\n' +
      'Skeleton панелі вже готовий, рухаємось поетапно.',

    MASTER_PANEL_PROFILE_TITLE: '👤 Мій профіль',
    MASTER_PANEL_PROFILE_STATUS_AVAILABLE_SHORT: '🟢 Доступний для запису',
    MASTER_PANEL_PROFILE_STATUS_UNAVAILABLE_SHORT: '🟠 Тимчасово недоступний для запису',
    MASTER_PANEL_PROFILE_USAGE_HINT:
      'Ці дані використовуються для роботи панелі майстра та записів клієнтів.',

    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 Мої записи',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Керування записами.\nОберіть категорію для перегляду:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 Нові записи (очікують підтвердження)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Сьогодні',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Завтра',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 Усі записи',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Скасовані',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU: '📅 До меню записів',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST: '⬅️ До списку',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT: '⬅️ До меню записів',
    MASTER_PANEL_BOOKINGS_BTN_PREV: '⬅️ Попередня',
    MASTER_PANEL_BOOKINGS_BTN_NEXT: '➡️ Наступна',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_PENDING_QUEUE: '🆕 До черги pending',
    MASTER_PANEL_BOOKINGS_BTN_NEXT_PENDING: '🆕 Наступний непідтверджений запис',
    MASTER_PANEL_BOOKINGS_BTN_CONFIRM: '✅ Підтвердити',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL: '❌ Скасувати',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE: '🔄 Перенести',
    MASTER_PANEL_BOOKINGS_BTN_CLIENT_PROFILE: '👤 Профіль клієнта',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_CLIENT_HISTORY: '📅 Переглянути всі записи клієнта',
    MASTER_PANEL_BOOKINGS_BTN_TO_CLIENT_PROFILE: '👤 До профілю клієнта',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_CONFIRM: '✅ Так, скасувати',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_REJECT: '↩️ Ні, повернутись',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION: '❌ Скасувати дію',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_CONFIRM: '✅ Підтвердити перенесення',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_DATE: '⬅️ До вибору дати',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_TIME: '⬅️ До вибору часу',

    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 Нових записів, що очікують підтвердження, немає.\n\n' +
      'Усі запити оброблено. Нові записи з’являться тут автоматично.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 На сьогодні записів немає.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 На завтра записів немає.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 Записів не знайдено.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 Скасованих записів не знайдено.',

    MASTER_PANEL_BOOKINGS_STATUS_PENDING: '🟡 Очікує підтвердження',
    MASTER_PANEL_BOOKINGS_STATUS_CONFIRMED: '🟢 Підтверджено',
    MASTER_PANEL_BOOKINGS_STATUS_COMPLETED: '⚪ Завершено',
    MASTER_PANEL_BOOKINGS_STATUS_CANCELED: '🔴 Скасовано',
    MASTER_PANEL_BOOKINGS_STATUS_TRANSFERRED: '🟣 Перенесено',

    MASTER_PANEL_BOOKINGS_CLIENT_FALLBACK: 'Клієнт',
    MASTER_PANEL_BOOKINGS_NOT_SET: 'Не вказано',

    MASTER_PANEL_BOOKINGS_PENDING_CARD_TITLE: '🆕 Новий запис',
    MASTER_PANEL_BOOKINGS_PENDING_CARD_STATUS_WAITING: '📌 Статус: ⏳ Очікує підтвердження',
    MASTER_PANEL_BOOKINGS_CARD_TITLE: '📄 Картка запису',

    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_TITLE: '⚠️ Підтвердження скасування',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_BODY: 'Ви дійсно хочете скасувати цей запис?',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_WARNING_CONFIRMED:
      '⚠️ Ви скасовуєте вже підтверджений запис.\nПереконайтесь, що все узгоджено з клієнтом.',

    MASTER_PANEL_BOOKINGS_HINT_CANCELED:
      '⚠️ Цей запис уже скасований.\nДоступний лише перегляд інформації.',
    MASTER_PANEL_BOOKINGS_HINT_COMPLETED:
      '⚠️ Цей запис уже завершений.\nДоступний лише перегляд інформації.',
    MASTER_PANEL_BOOKINGS_HINT_TRANSFERRED:
      '⚠️ Цей запис позначено як перенесений.\nДоступний лише перегляд інформації.',
    MASTER_PANEL_BOOKINGS_HINT_PENDING:
      'ℹ️ Для обробки pending-запису використайте розділ:\n«🆕 Нові записи (очікують підтвердження)».',
    MASTER_PANEL_BOOKINGS_HINT_CONFIRMED:
      'ℹ️ Для підтвердженого запису доступні дії:\nперенесення або скасування.',

    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_1: '🔄 Перенесення запису — крок 1/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_2: '🔄 Перенесення запису — крок 2/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_3: '🔄 Перенесення запису — крок 3/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_DATE: 'Оберіть нову дату для перенесення.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_TIME: 'Оберіть новий час.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_CONFIRM: 'Підтвердіть перенесення запису.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_WARNING_CONFIRMED:
      '⚠️ Ви змінюєте вже підтверджений запис. Переконайтесь, що новий час узгоджений з клієнтом.',

    MASTER_PANEL_CLIENT_PROFILE_TITLE: '👤 Профіль клієнта',
    MASTER_PANEL_CLIENT_PROFILE_LANG_UK: 'Українська',
    MASTER_PANEL_CLIENT_PROFILE_LANG_EN: 'English',
    MASTER_PANEL_CLIENT_PROFILE_LANG_CS: 'Čeština',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_STATUS: 'Статус телефону',
    MASTER_PANEL_CLIENT_PROFILE_EMAIL_STATUS: 'Статус email',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_ON: 'Увімкнено',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_OFF: 'Вимкнено',
    MASTER_PANEL_CLIENT_PROFILE_ADDITIONAL_INFO: '📊 Додаткова інформація',
    MASTER_PANEL_CLIENT_PROFILE_LAST_VISIT_EMPTY: 'Ще не було',
    MASTER_PANEL_CLIENT_HISTORY_TITLE: '📅 Записи клієнта',
    MASTER_PANEL_CLIENT_HISTORY_EMPTY: '📭 Записів до цього майстра поки немає.',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_ADDED: '⚪ Не додано',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_VERIFIED: '🟢 Підтверджено',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_VERIFIED: '🟠 Не підтверджено',

    MASTER_PANEL_STATS_TITLE: '📊 ВАША СТАТИСТИКА',
    MASTER_PANEL_STATS_PERIOD_CURRENT_MONTH: '📅 Період статистики: поточний місяць',
    MASTER_PANEL_STATS_TOP_SERVICES_EMPTY: 'Поки що немає завершених процедур у поточному місяці.',

    MASTER_PANEL_FINANCE_TITLE: '👩‍🎨 Ваш фінансовий звіт',
    MASTER_PANEL_FINANCE_EMPTY_VALUE: '—',
    MASTER_PANEL_FINANCE_BTN_BACK: '⬅️ Назад',

    MASTER_PANEL_SCHEDULE_TITLE: '🕒 Мій розклад',
    MASTER_PANEL_SCHEDULE_SECTION_WEEKLY: '📅 Поточний тижневий графік:',
    MASTER_PANEL_SCHEDULE_SECTION_TEMPORARY: '📌 Тимчасові зміни графіку:',
    MASTER_PANEL_SCHEDULE_SECTION_DAYS_OFF: '🏝 Найближчі вихідні:',
    MASTER_PANEL_SCHEDULE_SECTION_VACATIONS: '🏖 Найближчі відпустки:',
    MASTER_PANEL_SCHEDULE_ACTION_PROMPT: 'Оберіть дію кнопками нижче.',

    MASTER_PANEL_SCHEDULE_WEEKLY_NOT_CONFIGURED: '⚠️ Базовий тижневий графік ще не налаштовано.',
    MASTER_PANEL_SCHEDULE_LIST_EMPTY: 'немає',
    MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED: 'не налаштовано',
    MASTER_PANEL_SCHEDULE_DAY_OFF: 'вихідний',

    MASTER_PANEL_SCHEDULE_BTN_CONFIGURE_DAY: '👩‍🎨 Налаштування робочого дня',
    MASTER_PANEL_SCHEDULE_BTN_SET_DAY_OFF: '📅 Встановити вихідний день',
    MASTER_PANEL_SCHEDULE_BTN_LIST_DAYS_OFF: '📋 Переглянути вихідні дні',
    MASTER_PANEL_SCHEDULE_BTN_VACATIONS: '🏖 Відпустка',
    MASTER_PANEL_SCHEDULE_BTN_TEMPORARY_HOURS: '🕒 Тимчасова зміна графіку',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH: '🔄 Оновити розклад',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_SHORT: '🔄 Оновити',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST: '🔄 Оновити список',
    MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD: '➕ Встановити період відпустки',
    MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD: '➕ Встановити тимчасовий графік',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_BY_INDEX: '🗑 Видалити {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_PERIOD_BY_INDEX: '🗑 Видалити період {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_DELETE: '✅ Підтвердити видалення',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM: '✅ Підтвердити',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_SCHEDULE: '✅ Підтвердити графік',
    MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION: '❌ Скасувати дію',
    MASTER_PANEL_SCHEDULE_BTN_MAKE_DAY_OFF: '🚫 Зробити вихідним',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_VACATIONS: '⬅️ До відпустки',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_TEMPORARY: '⬅️ До тимчасового графіку',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_DAYS_CONFIG: '⬅️ До налаштування днів',

    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_TITLE: '👩‍🎨 Налаштування робочого дня',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SELECT_WEEKDAY: 'Оберіть день тижня кнопкою нижче.',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TITLE: '🕒 Налаштування робочого дня',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_FROM:
      'Введіть час початку у форматі HH:MM\nПриклад: 8:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TO:
      'Введіть час завершення у форматі HH:MM\nПриклад: 17:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SUCCESS_TITLE: '✅ Робочий день оновлено',

    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_TITLE: '📅 Встановити вихідний день',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_GUIDE:
      'Оберіть дату, на яку потрібно встановити вихідний день.\n\n' +
      'У цей день нові записи для клієнтів будуть недоступні.\n\n' +
      'Якщо на дату вже є активні записи, система попросить спочатку перенести або скасувати їх.\n\n' +
      '⸻\n\n' +
      'Формат дати: ДД.ММ.РРРР\nПриклад: 12.03.2026',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_TITLE: '⚠️ Підтвердження',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_BODY:
      'Ви впевнені, що хочете встановити вихідний день на дату:\n\n{date}\n\n' +
      'У цей день нові записи для клієнтів будуть недоступні.',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_SUCCESS:
      '✅ Вихідний день встановлено\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Дата: {date}\n\n' +
      'У цей день клієнти не зможуть записатися на процедури.',

    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_TITLE: '📋 Ваші вихідні дні',
    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_EMPTY: '📭 Найближчих вихідних дат не знайдено.',

    MASTER_PANEL_SCHEDULE_VACATION_LIST_TITLE: '🏖 Ваші періоди відпустки',
    MASTER_PANEL_SCHEDULE_VACATION_LIST_EMPTY: '📭 Найближчих періодів відпустки не знайдено.',
    MASTER_PANEL_SCHEDULE_VACATION_SET_TITLE: '🏖 Встановити період відпустки',
    MASTER_PANEL_SCHEDULE_VACATION_SET_GUIDE:
      'Вкажіть період відпустки у форматі:\nДД.ММ.РРРР - ДД.ММ.РРРР\n\n' +
      'Приклад: 15.07.2026 - 25.07.2026\n\n' +
      'У цей період нові записи для клієнтів будуть недоступні.',
    MASTER_PANEL_SCHEDULE_VACATION_CONFIRM_BODY:
      '⚠️ Підтвердження\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Ви впевнені, що хочете встановити період відпустки:\n\n' +
      '📅 {dateFrom} - {dateTo}\n\n' +
      'У цей період нові записи для клієнтів будуть недоступні.',
    MASTER_PANEL_SCHEDULE_VACATION_SUCCESS_BODY:
      '✅ Відпустку успішно встановлено\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Період: {dateFrom} - {dateTo}\n\n' +
      'У цей період ви будете недоступні для нових записів.',

    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_TITLE: '🕒 Тимчасові зміни графіку',
    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_EMPTY: '📭 Тимчасових змін графіка не знайдено.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_TITLE: '🕒 Встановити тимчасовий графік',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_GUIDE:
      'Вкажіть період дії у форматі:\nДД.ММ.РРРР - ДД.ММ.РРРР\n\n' +
      'Приклад: 10.03.2026 - 16.03.2026\n\n' +
      'Мінімальна тривалість періоду: 7 календарних днів.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_TITLE: '🕒 Налаштування тимчасового графіку',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_HINT:
      'Оберіть день кнопкою нижче, потім введіть час "від" та "до".',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TITLE: '🕒 Налаштування дня',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_FROM:
      'Введіть час початку у форматі HH:MM\nПриклад: 10:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TO:
      'Введіть час завершення у форматі HH:MM\nПриклад: 18:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIRM_BODY:
      '⚠️ Підтвердження\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Період: {dateFrom} - {dateTo}\n\n' +
      '🕒 Новий тимчасовий графік:\n{schedule}\n\n' +
      'Після підтвердження цей графік буде діяти лише у вказаний період.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SUCCESS_BODY:
      '✅ Тимчасовий графік успішно встановлено\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Період дії: {dateFrom} - {dateTo}\n\n' +
      '🕒 Графік:\n{schedule}',

    MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE: '⚠️ Підтвердження видалення',
    MASTER_PANEL_SCHEDULE_DELETE_DAY_OFF_BODY:
      'Ви впевнені, що хочете видалити вихідний день?\n\n' +
      '📅 Дата: {date}\n\n' +
      'Після видалення майстер знову стане доступним для запису у цей день.',
    MASTER_PANEL_SCHEDULE_DELETE_VACATION_BODY:
      'Ви впевнені, що хочете видалити період відпустки?\n\n' +
      '📅 Період: {dateFrom} - {dateTo}\n\n' +
      'Після видалення ви знову станете доступним для запису у цей період.',
    MASTER_PANEL_SCHEDULE_DELETE_TEMPORARY_BODY:
      'Ви впевнені, що хочете видалити тимчасову зміну графіку?\n\n' +
      '📅 Період: {dateFrom} - {dateTo}\n\n' +
      'Після видалення для цього періоду знову діятиме базовий тижневий графік.',

    MASTER_PANEL_OWN_PROFILE_MAIN_TITLE: '👤 Ваш профіль майстра',
    MASTER_PANEL_OWN_PROFILE_MAIN_HINT: 'Оберіть підрозділ профілю кнопками нижче.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_TITLE: '💼 Керування послугами',
    MASTER_PANEL_OWN_PROFILE_SERVICES_EMPTY: 'Послуги поки не додані.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_TITLE: '➕ Додати послугу',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_EMPTY: 'Наразі немає доступних послуг для додавання.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_TITLE: '➖ Вимкнути послугу',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_EMPTY: 'Активних послуг для вимкнення немає.',
    MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_TITLE: '🎓 Професійна інформація',
    MASTER_PANEL_OWN_PROFILE_CERTIFICATES_EMPTY: 'Сертифікати поки не додані.',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_TITLE: 'ℹ️ Додаткова інформація',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_HINT: 'Дані відображаються клієнтам у вашому профілі.',

    MASTER_PANEL_OWN_PROFILE_BTN_SERVICES: '💼 Керування послугами',
    MASTER_PANEL_OWN_PROFILE_BTN_PROFESSIONAL: '🎓 Професійна інформація',
    MASTER_PANEL_OWN_PROFILE_BTN_ADDITIONAL: 'ℹ️ Додаткова інформація',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE: '👤 До профілю майстра',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_SERVICES: '⬅️ До керування послугами',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_DISPLAY_NAME: '👩‍🎨 Змінити імʼя',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_STARTED_ON: '📅 Змінити дату початку роботи',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PROCEDURES_DONE_TOTAL: '📈 Оновити кількість процедур',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_BIO: '📝 Змінити опис',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_MATERIALS: '🧴 Змінити матеріали',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PHONE: '📞 Змінити телефон',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_EMAIL: '✉️ Змінити email',

    MASTER_PANEL_OWN_PROFILE_CERTS_TITLE: '🎓 Керування дипломами та сертифікатами',
    MASTER_PANEL_OWN_PROFILE_CERTS_EMPTY: 'Документи поки не додані.',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_ADD: '➕ Додати документ',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_DELETE: '➖ Видалити документ',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK: '⬅️ До професійної інформації',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_TITLE: '➕ Додати диплом або сертифікат',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_HINT:
      'Введіть назву документа.\n\nПриклад: Манікюр та моделювання нігтів — Beauty Academy',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_TITLE: '⚠️ Підтвердження додавання',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_HINT: 'Підтвердіть, щоб додати документ до профілю.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_TITLE: '➖ Видалити диплом або сертифікат',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_EMPTY: 'Немає документів для видалення.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_TITLE: '⚠️ Підтвердження видалення',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_HINT:
      'Ви впевнені, що хочете видалити цей документ?',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_ADD: '✅ Додати документ',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_DELETE: '🗑 Видалити документ',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION: '❌ Скасувати дію',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK_TO_CERTS: '⬅️ До документів',

    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_BIO: 'опис профілю',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_MATERIALS: 'матеріали',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PHONE: 'контактний телефон',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_EMAIL: 'контактний email',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DISPLAY_NAME: 'імʼя майстра в профілі',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_STARTED_ON: 'дата початку роботи',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PROCEDURES_DONE_TOTAL: 'кількість виконаних процедур',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DEFAULT: 'поле профілю',
    MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET: 'Не вказано',

    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_TITLE: '📝 Редагування опису профілю',
    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_HINT: 'Введіть новий опис (мінімум 10 символів).',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_TITLE: '🧴 Редагування матеріалів',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_HINT: 'Введіть матеріали, з якими ви працюєте.',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_TITLE: '📞 Редагування контактного телефону',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_HINT: 'Введіть телефон у форматі +420123456789.',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_TITLE: '✉️ Редагування контактного email',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_HINT: 'Введіть новий email (приклад: name@example.com).',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_TITLE: '👩‍🎨 Редагування імені майстра',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_HINT:
      'Введіть нове імʼя для відображення у профілі.\nПриклад: Анна В.',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_TITLE: '📅 Редагування дати початку роботи',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_HINT:
      'Введіть нову дату у форматі ДД.ММ.РРРР.\nПриклад: 12.04.2019',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_TITLE: '📈 Редагування кількості процедур',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_HINT: 'Введіть число від 0 до 100000.',

    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_TITLE: '⚠️ Підтвердження оновлення',
    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_HINT: 'Підтвердіть, щоб зберегти зміни.',
    MASTER_PANEL_OWN_PROFILE_EDIT_SUCCESS: '✅ Поле "{field}" оновлено.',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_CANCEL: '❌ Скасувати',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_SAVE: '✅ Зберегти',
  },
  en: {
    MENU_MASTER_PANEL: '🛠 Master Panel',

    MASTER_PANEL_TITLE: '👩‍🎨 Master Panel',
    MASTER_PANEL_GREETING: 'Hello, {name}!',
    MASTER_PANEL_STATUS_AVAILABLE: '🟢 Master status: available for new bookings',
    MASTER_PANEL_STATUS_UNAVAILABLE: '🟠 Master status: temporarily unavailable for new bookings',
    MASTER_PANEL_ROOT_DESCRIPTION:
      'Here you can manage your bookings, working schedule, and master profile.\n' +
      'Choose a section below.',
    MASTER_PANEL_ACCESS_DENIED:
      '🔒 Master panel is not available for this profile.\n\n' +
      'If access should be granted, contact the salon administrator.',

    MASTER_PANEL_BTN_PROFILE: '👤 My profile',
    MASTER_PANEL_BTN_BOOKINGS: '📅 My bookings',
    MASTER_PANEL_BTN_SCHEDULE: '🕒 My schedule',
    MASTER_PANEL_BTN_STATS: '📊 My stats',
    MASTER_PANEL_BTN_FINANCE: '💰 Finance',
    MASTER_PANEL_BTN_BACK_TO_PANEL: '⬅️ Back to master panel',
    MASTER_PANEL_BTN_BACK_TO_SCHEDULE: '⬅️ Back to schedule',

    MASTER_PANEL_SECTION_STUB_BODY:
      'This section will be connected in the next implementation blocks.\n' +
      'The panel skeleton is ready, we move step by step.',

    MASTER_PANEL_PROFILE_TITLE: '👤 My profile',
    MASTER_PANEL_PROFILE_STATUS_AVAILABLE_SHORT: '🟢 Available for booking',
    MASTER_PANEL_PROFILE_STATUS_UNAVAILABLE_SHORT: '🟠 Temporarily unavailable for booking',
    MASTER_PANEL_PROFILE_USAGE_HINT:
      'These details are used by the master panel and customer bookings.',

    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 My bookings',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Booking management.\nChoose a category:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 New bookings (awaiting confirmation)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Today',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Tomorrow',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 All bookings',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Canceled',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU: '📅 To bookings menu',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST: '⬅️ Back to list',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT: '⬅️ Back to bookings menu',
    MASTER_PANEL_BOOKINGS_BTN_PREV: '⬅️ Previous',
    MASTER_PANEL_BOOKINGS_BTN_NEXT: '➡️ Next',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_PENDING_QUEUE: '🆕 To pending queue',
    MASTER_PANEL_BOOKINGS_BTN_NEXT_PENDING: '🆕 Next unconfirmed booking',
    MASTER_PANEL_BOOKINGS_BTN_CONFIRM: '✅ Confirm',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL: '❌ Cancel',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE: '🔄 Reschedule',
    MASTER_PANEL_BOOKINGS_BTN_CLIENT_PROFILE: '👤 Client profile',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_CLIENT_HISTORY: '📅 View all client bookings',
    MASTER_PANEL_BOOKINGS_BTN_TO_CLIENT_PROFILE: '👤 To client profile',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_CONFIRM: '✅ Yes, cancel',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_REJECT: '↩️ No, go back',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION: '❌ Cancel action',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_CONFIRM: '✅ Confirm reschedule',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_DATE: '⬅️ Back to date selection',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_TIME: '⬅️ Back to time selection',

    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 There are no new bookings awaiting confirmation.\n\n' +
      'All requests are processed. New bookings will appear here automatically.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 No bookings for today.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 No bookings for tomorrow.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 No bookings found.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 No canceled bookings found.',

    MASTER_PANEL_BOOKINGS_STATUS_PENDING: '🟡 Awaiting confirmation',
    MASTER_PANEL_BOOKINGS_STATUS_CONFIRMED: '🟢 Confirmed',
    MASTER_PANEL_BOOKINGS_STATUS_COMPLETED: '⚪ Completed',
    MASTER_PANEL_BOOKINGS_STATUS_CANCELED: '🔴 Canceled',
    MASTER_PANEL_BOOKINGS_STATUS_TRANSFERRED: '🟣 Rescheduled',

    MASTER_PANEL_BOOKINGS_CLIENT_FALLBACK: 'Client',
    MASTER_PANEL_BOOKINGS_NOT_SET: 'Not set',

    MASTER_PANEL_BOOKINGS_PENDING_CARD_TITLE: '🆕 New booking',
    MASTER_PANEL_BOOKINGS_PENDING_CARD_STATUS_WAITING: '📌 Status: ⏳ Awaiting confirmation',
    MASTER_PANEL_BOOKINGS_CARD_TITLE: '📄 Booking card',

    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_TITLE: '⚠️ Cancellation confirmation',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_BODY: 'Do you really want to cancel this booking?',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_WARNING_CONFIRMED:
      '⚠️ You are canceling an already confirmed booking.\nMake sure everything is agreed with the client.',

    MASTER_PANEL_BOOKINGS_HINT_CANCELED:
      '⚠️ This booking is already canceled.\nOnly viewing is available.',
    MASTER_PANEL_BOOKINGS_HINT_COMPLETED:
      '⚠️ This booking is already completed.\nOnly viewing is available.',
    MASTER_PANEL_BOOKINGS_HINT_TRANSFERRED:
      '⚠️ This booking is marked as rescheduled.\nOnly viewing is available.',
    MASTER_PANEL_BOOKINGS_HINT_PENDING:
      'ℹ️ To process a pending booking use section:\n“🆕 New bookings (awaiting confirmation)”.',
    MASTER_PANEL_BOOKINGS_HINT_CONFIRMED:
      'ℹ️ For confirmed booking available actions are:\nreschedule or cancel.',

    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_1: '🔄 Rescheduling booking — step 1/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_2: '🔄 Rescheduling booking — step 2/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_3: '🔄 Rescheduling booking — step 3/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_DATE: 'Select a new date for rescheduling.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_TIME: 'Select a new time.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_CONFIRM: 'Confirm booking reschedule.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_WARNING_CONFIRMED:
      '⚠️ You are changing an already confirmed booking. Ensure the new time is agreed with the client.',

    MASTER_PANEL_CLIENT_PROFILE_TITLE: '👤 Client profile',
    MASTER_PANEL_CLIENT_PROFILE_LANG_UK: 'Ukrainian',
    MASTER_PANEL_CLIENT_PROFILE_LANG_EN: 'English',
    MASTER_PANEL_CLIENT_PROFILE_LANG_CS: 'Czech',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_STATUS: 'Phone status',
    MASTER_PANEL_CLIENT_PROFILE_EMAIL_STATUS: 'Email status',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_ON: 'Enabled',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_OFF: 'Disabled',
    MASTER_PANEL_CLIENT_PROFILE_ADDITIONAL_INFO: '📊 Additional information',
    MASTER_PANEL_CLIENT_PROFILE_LAST_VISIT_EMPTY: 'No visits yet',
    MASTER_PANEL_CLIENT_HISTORY_TITLE: '📅 Client bookings',
    MASTER_PANEL_CLIENT_HISTORY_EMPTY: '📭 No bookings with this master yet.',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_ADDED: '⚪ Not added',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_VERIFIED: '🟢 Verified',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_VERIFIED: '🟠 Not verified',

    MASTER_PANEL_STATS_TITLE: '📊 YOUR STATS',
    MASTER_PANEL_STATS_PERIOD_CURRENT_MONTH: '📅 Stats period: current month',
    MASTER_PANEL_STATS_TOP_SERVICES_EMPTY: 'No completed procedures in the current month yet.',

    MASTER_PANEL_FINANCE_TITLE: '👩‍🎨 Your financial report',
    MASTER_PANEL_FINANCE_EMPTY_VALUE: '—',
    MASTER_PANEL_FINANCE_BTN_BACK: '⬅️ Back',

    MASTER_PANEL_SCHEDULE_TITLE: '🕒 My schedule',
    MASTER_PANEL_SCHEDULE_SECTION_WEEKLY: '📅 Current weekly schedule:',
    MASTER_PANEL_SCHEDULE_SECTION_TEMPORARY: '📌 Temporary schedule changes:',
    MASTER_PANEL_SCHEDULE_SECTION_DAYS_OFF: '🏝 Upcoming days off:',
    MASTER_PANEL_SCHEDULE_SECTION_VACATIONS: '🏖 Upcoming vacations:',
    MASTER_PANEL_SCHEDULE_ACTION_PROMPT: 'Choose an action with buttons below.',

    MASTER_PANEL_SCHEDULE_WEEKLY_NOT_CONFIGURED: '⚠️ Basic weekly schedule is not configured yet.',
    MASTER_PANEL_SCHEDULE_LIST_EMPTY: 'none',
    MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED: 'not configured',
    MASTER_PANEL_SCHEDULE_DAY_OFF: 'day off',

    MASTER_PANEL_SCHEDULE_BTN_CONFIGURE_DAY: '👩‍🎨 Configure workday',
    MASTER_PANEL_SCHEDULE_BTN_SET_DAY_OFF: '📅 Set day off',
    MASTER_PANEL_SCHEDULE_BTN_LIST_DAYS_OFF: '📋 View days off',
    MASTER_PANEL_SCHEDULE_BTN_VACATIONS: '🏖 Vacation',
    MASTER_PANEL_SCHEDULE_BTN_TEMPORARY_HOURS: '🕒 Temporary schedule',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH: '🔄 Refresh schedule',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_SHORT: '🔄 Refresh',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST: '🔄 Refresh list',
    MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD: '➕ Set vacation period',
    MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD: '➕ Set temporary schedule',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_BY_INDEX: '🗑 Delete {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_PERIOD_BY_INDEX: '🗑 Delete period {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_DELETE: '✅ Confirm deletion',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM: '✅ Confirm',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_SCHEDULE: '✅ Confirm schedule',
    MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION: '❌ Cancel action',
    MASTER_PANEL_SCHEDULE_BTN_MAKE_DAY_OFF: '🚫 Set day off',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_VACATIONS: '⬅️ Back to vacation',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_TEMPORARY: '⬅️ Back to temporary schedule',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_DAYS_CONFIG: '⬅️ Back to day setup',

    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_TITLE: '👩‍🎨 Workday setup',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SELECT_WEEKDAY: 'Choose day of week using buttons below.',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TITLE: '🕒 Workday setup',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_FROM:
      'Enter start time in HH:MM format\nExample: 8:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TO:
      'Enter end time in HH:MM format\nExample: 17:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SUCCESS_TITLE: '✅ Workday updated',

    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_TITLE: '📅 Set day off',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_GUIDE:
      'Choose date for day off.\n\n' +
      'New bookings will be unavailable on this date.\n\n' +
      'If there are active bookings, system asks you to reschedule or cancel them first.\n\n' +
      '⸻\n\n' +
      'Date format: DD.MM.YYYY\nExample: 12.03.2026',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_TITLE: '⚠️ Confirmation',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_BODY:
      'Are you sure you want to set day off for:\n\n{date}\n\n' +
      'New bookings will be unavailable on this date.',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_SUCCESS:
      '✅ Day off is set\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Date: {date}\n\n' +
      'Clients will not be able to book procedures on this date.',

    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_TITLE: '📋 Your days off',
    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_EMPTY: '📭 No upcoming days off found.',

    MASTER_PANEL_SCHEDULE_VACATION_LIST_TITLE: '🏖 Your vacation periods',
    MASTER_PANEL_SCHEDULE_VACATION_LIST_EMPTY: '📭 No upcoming vacation periods found.',
    MASTER_PANEL_SCHEDULE_VACATION_SET_TITLE: '🏖 Set vacation period',
    MASTER_PANEL_SCHEDULE_VACATION_SET_GUIDE:
      'Enter vacation period in format:\nDD.MM.YYYY - DD.MM.YYYY\n\n' +
      'Example: 15.07.2026 - 25.07.2026\n\n' +
      'New bookings will be unavailable during this period.',
    MASTER_PANEL_SCHEDULE_VACATION_CONFIRM_BODY:
      '⚠️ Confirmation\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Are you sure you want to set vacation period:\n\n' +
      '📅 {dateFrom} - {dateTo}\n\n' +
      'New bookings will be unavailable during this period.',
    MASTER_PANEL_SCHEDULE_VACATION_SUCCESS_BODY:
      '✅ Vacation period set successfully\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Period: {dateFrom} - {dateTo}\n\n' +
      'You will be unavailable for new bookings during this period.',

    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_TITLE: '🕒 Temporary schedule changes',
    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_EMPTY: '📭 No temporary schedule changes found.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_TITLE: '🕒 Set temporary schedule',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_GUIDE:
      'Enter active period in format:\nDD.MM.YYYY - DD.MM.YYYY\n\n' +
      'Example: 10.03.2026 - 16.03.2026\n\n' +
      'Minimum period duration: 7 calendar days.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_TITLE: '🕒 Temporary schedule setup',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_HINT:
      'Choose day with button below, then enter start and end time.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TITLE: '🕒 Day setup',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_FROM:
      'Enter start time in HH:MM format\nExample: 10:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TO:
      'Enter end time in HH:MM format\nExample: 18:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIRM_BODY:
      '⚠️ Confirmation\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Period: {dateFrom} - {dateTo}\n\n' +
      '🕒 New temporary schedule:\n{schedule}\n\n' +
      'After confirmation this schedule will work only in selected period.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SUCCESS_BODY:
      '✅ Temporary schedule set successfully\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Active period: {dateFrom} - {dateTo}\n\n' +
      '🕒 Schedule:\n{schedule}',

    MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE: '⚠️ Deletion confirmation',
    MASTER_PANEL_SCHEDULE_DELETE_DAY_OFF_BODY:
      'Are you sure you want to delete this day off?\n\n' +
      '📅 Date: {date}\n\n' +
      'After deletion the master becomes available for booking on this date again.',
    MASTER_PANEL_SCHEDULE_DELETE_VACATION_BODY:
      'Are you sure you want to delete this vacation period?\n\n' +
      '📅 Period: {dateFrom} - {dateTo}\n\n' +
      'After deletion you will be available for booking in this period again.',
    MASTER_PANEL_SCHEDULE_DELETE_TEMPORARY_BODY:
      'Are you sure you want to delete this temporary schedule change?\n\n' +
      '📅 Period: {dateFrom} - {dateTo}\n\n' +
      'After deletion base weekly schedule will be used again for this period.',

    MASTER_PANEL_OWN_PROFILE_MAIN_TITLE: '👤 Your master profile',
    MASTER_PANEL_OWN_PROFILE_MAIN_HINT: 'Choose profile subsection with buttons below.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_TITLE: '💼 Services management',
    MASTER_PANEL_OWN_PROFILE_SERVICES_EMPTY: 'No services added yet.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_TITLE: '➕ Add service',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_EMPTY: 'No available services to add right now.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_TITLE: '➖ Disable service',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_EMPTY: 'No active services to disable.',
    MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_TITLE: '🎓 Professional information',
    MASTER_PANEL_OWN_PROFILE_CERTIFICATES_EMPTY: 'No certificates added yet.',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_TITLE: 'ℹ️ Additional information',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_HINT: 'These details are shown to clients in your profile.',

    MASTER_PANEL_OWN_PROFILE_BTN_SERVICES: '💼 Services management',
    MASTER_PANEL_OWN_PROFILE_BTN_PROFESSIONAL: '🎓 Professional information',
    MASTER_PANEL_OWN_PROFILE_BTN_ADDITIONAL: 'ℹ️ Additional information',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE: '👤 Back to master profile',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_SERVICES: '⬅️ Back to services management',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_DISPLAY_NAME: '👩‍🎨 Edit name',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_STARTED_ON: '📅 Edit start date',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PROCEDURES_DONE_TOTAL: '📈 Update procedures count',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_BIO: '📝 Edit description',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_MATERIALS: '🧴 Edit materials',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PHONE: '📞 Edit phone',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_EMAIL: '✉️ Edit email',

    MASTER_PANEL_OWN_PROFILE_CERTS_TITLE: '🎓 Diploma and certificate management',
    MASTER_PANEL_OWN_PROFILE_CERTS_EMPTY: 'No documents added yet.',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_ADD: '➕ Add document',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_DELETE: '➖ Delete document',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK: '⬅️ Back to professional info',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_TITLE: '➕ Add diploma or certificate',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_HINT:
      'Enter document title.\n\nExample: Manicure and nail modeling — Beauty Academy',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_TITLE: '⚠️ Add confirmation',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_HINT: 'Confirm to add this document to your profile.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_TITLE: '➖ Delete diploma or certificate',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_EMPTY: 'No documents to delete.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_TITLE: '⚠️ Delete confirmation',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_HINT:
      'Are you sure you want to delete this document?',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_ADD: '✅ Add document',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_DELETE: '🗑 Delete document',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION: '❌ Cancel action',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK_TO_CERTS: '⬅️ Back to documents',

    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_BIO: 'profile description',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_MATERIALS: 'materials',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PHONE: 'contact phone',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_EMAIL: 'contact email',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DISPLAY_NAME: 'master profile name',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_STARTED_ON: 'work start date',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PROCEDURES_DONE_TOTAL: 'completed procedures count',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DEFAULT: 'profile field',
    MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET: 'Not set',

    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_TITLE: '📝 Edit profile description',
    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_HINT: 'Enter new description (minimum 10 characters).',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_TITLE: '🧴 Edit materials',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_HINT: 'Enter materials you work with.',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_TITLE: '📞 Edit contact phone',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_HINT: 'Enter phone in format +420123456789.',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_TITLE: '✉️ Edit contact email',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_HINT: 'Enter new email (example: name@example.com).',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_TITLE: '👩‍🎨 Edit master name',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_HINT:
      'Enter new display name for profile.\nExample: Anna V.',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_TITLE: '📅 Edit work start date',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_HINT:
      'Enter new date in DD.MM.YYYY format.\nExample: 12.04.2019',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_TITLE: '📈 Edit procedures count',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_HINT: 'Enter a number from 0 to 100000.',

    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_TITLE: '⚠️ Update confirmation',
    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_HINT: 'Confirm to save changes.',
    MASTER_PANEL_OWN_PROFILE_EDIT_SUCCESS: '✅ Field "{field}" updated.',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_CANCEL: '❌ Cancel',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_SAVE: '✅ Save',
  },
  cs: {
    MENU_MASTER_PANEL: '🛠 Panel mistra',

    MASTER_PANEL_TITLE: '👩‍🎨 Panel mistra',
    MASTER_PANEL_GREETING: 'Vítejte, {name}!',
    MASTER_PANEL_STATUS_AVAILABLE: '🟢 Stav mistra: dostupný pro nové rezervace',
    MASTER_PANEL_STATUS_UNAVAILABLE: '🟠 Stav mistra: dočasně nedostupný pro nové rezervace',
    MASTER_PANEL_ROOT_DESCRIPTION:
      'Zde můžete spravovat své rezervace, pracovní rozvrh a profil mistra.\n' +
      'Vyberte sekci níže.',
    MASTER_PANEL_ACCESS_DENIED:
      '🔒 Panel mistra není pro tento profil dostupný.\n\n' +
      'Pokud má být přístup otevřen, kontaktujte administrátora salonu.',

    MASTER_PANEL_BTN_PROFILE: '👤 Můj profil',
    MASTER_PANEL_BTN_BOOKINGS: '📅 Moje rezervace',
    MASTER_PANEL_BTN_SCHEDULE: '🕒 Můj rozvrh',
    MASTER_PANEL_BTN_STATS: '📊 Moje statistika',
    MASTER_PANEL_BTN_FINANCE: '💰 Finance',
    MASTER_PANEL_BTN_BACK_TO_PANEL: '⬅️ Zpět do panelu mistra',
    MASTER_PANEL_BTN_BACK_TO_SCHEDULE: '⬅️ Zpět do rozvrhu',

    MASTER_PANEL_SECTION_STUB_BODY:
      'Tato sekce bude připojena v dalších blocích implementace.\n' +
      'Skeleton panelu je připraven, jdeme krok za krokem.',

    MASTER_PANEL_PROFILE_TITLE: '👤 Můj profil',
    MASTER_PANEL_PROFILE_STATUS_AVAILABLE_SHORT: '🟢 Dostupný pro rezervace',
    MASTER_PANEL_PROFILE_STATUS_UNAVAILABLE_SHORT: '🟠 Dočasně nedostupný pro rezervace',
    MASTER_PANEL_PROFILE_USAGE_HINT:
      'Tyto údaje se používají v panelu mistra a v rezervacích klientů.',

    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 Moje rezervace',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Správa rezervací.\nVyberte kategorii:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 Nové rezervace (čekají na potvrzení)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Dnes',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Zítra',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 Všechny rezervace',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Zrušené',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU: '📅 Do menu rezervací',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_LIST: '⬅️ Zpět na seznam',
    MASTER_PANEL_BOOKINGS_BTN_BACK_TO_BOOKINGS_MENU_ALT: '⬅️ Zpět do menu rezervací',
    MASTER_PANEL_BOOKINGS_BTN_PREV: '⬅️ Předchozí',
    MASTER_PANEL_BOOKINGS_BTN_NEXT: '➡️ Další',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_PENDING_QUEUE: '🆕 Do fronty pending',
    MASTER_PANEL_BOOKINGS_BTN_NEXT_PENDING: '🆕 Další nepotvrzená rezervace',
    MASTER_PANEL_BOOKINGS_BTN_CONFIRM: '✅ Potvrdit',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL: '❌ Zrušit',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE: '🔄 Přesunout',
    MASTER_PANEL_BOOKINGS_BTN_CLIENT_PROFILE: '👤 Profil klienta',
    MASTER_PANEL_BOOKINGS_BTN_OPEN_CLIENT_HISTORY: '📅 Zobrazit všechny rezervace klienta',
    MASTER_PANEL_BOOKINGS_BTN_TO_CLIENT_PROFILE: '👤 Do profilu klienta',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_CONFIRM: '✅ Ano, zrušit',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_REJECT: '↩️ Ne, zpět',
    MASTER_PANEL_BOOKINGS_BTN_CANCEL_ACTION: '❌ Zrušit akci',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_CONFIRM: '✅ Potvrdit přesun',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_DATE: '⬅️ Zpět na výběr data',
    MASTER_PANEL_BOOKINGS_BTN_RESCHEDULE_BACK_TO_TIME: '⬅️ Zpět na výběr času',

    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 Nejsou žádné nové rezervace čekající na potvrzení.\n\n' +
      'Všechny požadavky jsou zpracovány. Nové rezervace se zde objeví automaticky.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 Na dnešek nejsou žádné rezervace.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 Na zítřek nejsou žádné rezervace.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 Žádné rezervace nenalezeny.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 Žádné zrušené rezervace nenalezeny.',

    MASTER_PANEL_BOOKINGS_STATUS_PENDING: '🟡 Čeká na potvrzení',
    MASTER_PANEL_BOOKINGS_STATUS_CONFIRMED: '🟢 Potvrzeno',
    MASTER_PANEL_BOOKINGS_STATUS_COMPLETED: '⚪ Dokončeno',
    MASTER_PANEL_BOOKINGS_STATUS_CANCELED: '🔴 Zrušeno',
    MASTER_PANEL_BOOKINGS_STATUS_TRANSFERRED: '🟣 Přesunuto',

    MASTER_PANEL_BOOKINGS_CLIENT_FALLBACK: 'Klient',
    MASTER_PANEL_BOOKINGS_NOT_SET: 'Neuvedeno',

    MASTER_PANEL_BOOKINGS_PENDING_CARD_TITLE: '🆕 Nová rezervace',
    MASTER_PANEL_BOOKINGS_PENDING_CARD_STATUS_WAITING: '📌 Stav: ⏳ Čeká na potvrzení',
    MASTER_PANEL_BOOKINGS_CARD_TITLE: '📄 Karta rezervace',

    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_TITLE: '⚠️ Potvrzení zrušení',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_BODY: 'Opravdu chcete tuto rezervaci zrušit?',
    MASTER_PANEL_BOOKINGS_CANCEL_CONFIRM_WARNING_CONFIRMED:
      '⚠️ Rušíte již potvrzenou rezervaci.\nUjistěte se, že je vše domluveno s klientem.',

    MASTER_PANEL_BOOKINGS_HINT_CANCELED:
      '⚠️ Tato rezervace je již zrušená.\nDostupné je pouze zobrazení.',
    MASTER_PANEL_BOOKINGS_HINT_COMPLETED:
      '⚠️ Tato rezervace je již dokončená.\nDostupné je pouze zobrazení.',
    MASTER_PANEL_BOOKINGS_HINT_TRANSFERRED:
      '⚠️ Tato rezervace je označena jako přesunutá.\nDostupné je pouze zobrazení.',
    MASTER_PANEL_BOOKINGS_HINT_PENDING:
      'ℹ️ Pro zpracování pending rezervace použijte sekci:\n„🆕 Nové rezervace (čekají na potvrzení)“.',
    MASTER_PANEL_BOOKINGS_HINT_CONFIRMED:
      'ℹ️ Pro potvrzenou rezervaci jsou dostupné akce:\npřesun nebo zrušení.',

    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_1: '🔄 Přesun rezervace — krok 1/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_2: '🔄 Přesun rezervace — krok 2/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_STEP_3: '🔄 Přesun rezervace — krok 3/3',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_DATE: 'Vyberte nové datum přesunu.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_SELECT_TIME: 'Vyberte nový čas.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_CONFIRM: 'Potvrďte přesun rezervace.',
    MASTER_PANEL_BOOKINGS_RESCHEDULE_WARNING_CONFIRMED:
      '⚠️ Měníte již potvrzenou rezervaci. Ujistěte se, že nový čas je domluven s klientem.',

    MASTER_PANEL_CLIENT_PROFILE_TITLE: '👤 Profil klienta',
    MASTER_PANEL_CLIENT_PROFILE_LANG_UK: 'Ukrajinština',
    MASTER_PANEL_CLIENT_PROFILE_LANG_EN: 'Angličtina',
    MASTER_PANEL_CLIENT_PROFILE_LANG_CS: 'Čeština',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_STATUS: 'Stav telefonu',
    MASTER_PANEL_CLIENT_PROFILE_EMAIL_STATUS: 'Stav emailu',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_ON: 'Zapnuto',
    MASTER_PANEL_CLIENT_PROFILE_NOTIFICATION_OFF: 'Vypnuto',
    MASTER_PANEL_CLIENT_PROFILE_ADDITIONAL_INFO: '📊 Doplňující informace',
    MASTER_PANEL_CLIENT_PROFILE_LAST_VISIT_EMPTY: 'Zatím nebylo',
    MASTER_PANEL_CLIENT_HISTORY_TITLE: '📅 Rezervace klienta',
    MASTER_PANEL_CLIENT_HISTORY_EMPTY: '📭 Zatím nejsou rezervace k tomuto mistrovi.',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_ADDED: '⚪ Nepřidáno',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_VERIFIED: '🟢 Ověřeno',
    MASTER_PANEL_CLIENT_PROFILE_PHONE_NOT_VERIFIED: '🟠 Neověřeno',

    MASTER_PANEL_STATS_TITLE: '📊 VAŠE STATISTIKA',
    MASTER_PANEL_STATS_PERIOD_CURRENT_MONTH: '📅 Období statistiky: aktuální měsíc',
    MASTER_PANEL_STATS_TOP_SERVICES_EMPTY: 'V aktuálním měsíci zatím nejsou dokončené procedury.',

    MASTER_PANEL_FINANCE_TITLE: '👩‍🎨 Váš finanční report',
    MASTER_PANEL_FINANCE_EMPTY_VALUE: '—',
    MASTER_PANEL_FINANCE_BTN_BACK: '⬅️ Zpět',

    MASTER_PANEL_SCHEDULE_TITLE: '🕒 Můj rozvrh',
    MASTER_PANEL_SCHEDULE_SECTION_WEEKLY: '📅 Aktuální týdenní rozvrh:',
    MASTER_PANEL_SCHEDULE_SECTION_TEMPORARY: '📌 Dočasné změny rozvrhu:',
    MASTER_PANEL_SCHEDULE_SECTION_DAYS_OFF: '🏝 Nejbližší volné dny:',
    MASTER_PANEL_SCHEDULE_SECTION_VACATIONS: '🏖 Nejbližší dovolené:',
    MASTER_PANEL_SCHEDULE_ACTION_PROMPT: 'Vyberte akci tlačítky níže.',

    MASTER_PANEL_SCHEDULE_WEEKLY_NOT_CONFIGURED: '⚠️ Základní týdenní rozvrh ještě není nastaven.',
    MASTER_PANEL_SCHEDULE_LIST_EMPTY: 'žádné',
    MASTER_PANEL_SCHEDULE_DAY_NOT_CONFIGURED: 'nenastaveno',
    MASTER_PANEL_SCHEDULE_DAY_OFF: 'volno',

    MASTER_PANEL_SCHEDULE_BTN_CONFIGURE_DAY: '👩‍🎨 Nastavení pracovního dne',
    MASTER_PANEL_SCHEDULE_BTN_SET_DAY_OFF: '📅 Nastavit volný den',
    MASTER_PANEL_SCHEDULE_BTN_LIST_DAYS_OFF: '📋 Zobrazit volné dny',
    MASTER_PANEL_SCHEDULE_BTN_VACATIONS: '🏖 Dovolená',
    MASTER_PANEL_SCHEDULE_BTN_TEMPORARY_HOURS: '🕒 Dočasná změna rozvrhu',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH: '🔄 Obnovit rozvrh',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_SHORT: '🔄 Obnovit',
    MASTER_PANEL_SCHEDULE_BTN_REFRESH_LIST: '🔄 Obnovit seznam',
    MASTER_PANEL_SCHEDULE_BTN_SET_VACATION_PERIOD: '➕ Nastavit období dovolené',
    MASTER_PANEL_SCHEDULE_BTN_SET_TEMPORARY_PERIOD: '➕ Nastavit dočasný rozvrh',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_BY_INDEX: '🗑 Smazat {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_DELETE_PERIOD_BY_INDEX: '🗑 Smazat období {index}️⃣',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_DELETE: '✅ Potvrdit smazání',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM: '✅ Potvrdit',
    MASTER_PANEL_SCHEDULE_BTN_CONFIRM_SCHEDULE: '✅ Potvrdit rozvrh',
    MASTER_PANEL_SCHEDULE_BTN_CANCEL_ACTION: '❌ Zrušit akci',
    MASTER_PANEL_SCHEDULE_BTN_MAKE_DAY_OFF: '🚫 Nastavit volno',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_VACATIONS: '⬅️ Zpět na dovolenou',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_TEMPORARY: '⬅️ Zpět na dočasný rozvrh',
    MASTER_PANEL_SCHEDULE_BTN_BACK_TO_DAYS_CONFIG: '⬅️ Zpět na nastavení dnů',

    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_TITLE: '👩‍🎨 Nastavení pracovního dne',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SELECT_WEEKDAY: 'Vyberte den týdne tlačítkem níže.',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TITLE: '🕒 Nastavení pracovního dne',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_FROM:
      'Zadejte čas začátku ve formátu HH:MM\nPříklad: 8:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_INPUT_TO:
      'Zadejte čas konce ve formátu HH:MM\nPříklad: 17:00',
    MASTER_PANEL_SCHEDULE_CONFIGURE_DAY_SUCCESS_TITLE: '✅ Pracovní den aktualizován',

    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_TITLE: '📅 Nastavit volný den',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_GUIDE:
      'Vyberte datum, pro které chcete nastavit volno.\n\n' +
      'Nové rezervace budou v tento den nedostupné.\n\n' +
      'Pokud existují aktivní rezervace, systém vás nejdřív požádá o jejich přesun nebo zrušení.\n\n' +
      '⸻\n\n' +
      'Formát data: DD.MM.RRRR\nPříklad: 12.03.2026',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_TITLE: '⚠️ Potvrzení',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_CONFIRM_BODY:
      'Opravdu chcete nastavit volný den na datum:\n\n{date}\n\n' +
      'Nové rezervace budou v tento den nedostupné.',
    MASTER_PANEL_SCHEDULE_SET_DAY_OFF_SUCCESS:
      '✅ Volný den nastaven\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Datum: {date}\n\n' +
      'Klienti si v tento den nebudou moci rezervovat procedury.',

    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_TITLE: '📋 Vaše volné dny',
    MASTER_PANEL_SCHEDULE_DAYS_OFF_LIST_EMPTY: '📭 Nebyly nalezeny žádné blízké volné dny.',

    MASTER_PANEL_SCHEDULE_VACATION_LIST_TITLE: '🏖 Vaše období dovolené',
    MASTER_PANEL_SCHEDULE_VACATION_LIST_EMPTY: '📭 Nebyla nalezena žádná blízká období dovolené.',
    MASTER_PANEL_SCHEDULE_VACATION_SET_TITLE: '🏖 Nastavit období dovolené',
    MASTER_PANEL_SCHEDULE_VACATION_SET_GUIDE:
      'Zadejte období dovolené ve formátu:\nDD.MM.RRRR - DD.MM.RRRR\n\n' +
      'Příklad: 15.07.2026 - 25.07.2026\n\n' +
      'Nové rezervace budou v tomto období nedostupné.',
    MASTER_PANEL_SCHEDULE_VACATION_CONFIRM_BODY:
      '⚠️ Potvrzení\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Opravdu chcete nastavit období dovolené:\n\n' +
      '📅 {dateFrom} - {dateTo}\n\n' +
      'Nové rezervace budou v tomto období nedostupné.',
    MASTER_PANEL_SCHEDULE_VACATION_SUCCESS_BODY:
      '✅ Dovolená byla úspěšně nastavena\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Období: {dateFrom} - {dateTo}\n\n' +
      'V tomto období budete nedostupní pro nové rezervace.',

    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_TITLE: '🕒 Dočasné změny rozvrhu',
    MASTER_PANEL_SCHEDULE_TEMPORARY_LIST_EMPTY: '📭 Nebyly nalezeny žádné dočasné změny rozvrhu.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_TITLE: '🕒 Nastavit dočasný rozvrh',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SET_GUIDE:
      'Zadejte období platnosti ve formátu:\nDD.MM.RRRR - DD.MM.RRRR\n\n' +
      'Příklad: 10.03.2026 - 16.03.2026\n\n' +
      'Minimální délka období: 7 kalendářních dní.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_TITLE: '🕒 Nastavení dočasného rozvrhu',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIG_HINT:
      'Vyberte den tlačítkem níže a pak zadejte čas „od“ a „do“.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TITLE: '🕒 Nastavení dne',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_FROM:
      'Zadejte čas začátku ve formátu HH:MM\nPříklad: 10:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_DAY_INPUT_TO:
      'Zadejte čas konce ve formátu HH:MM\nPříklad: 18:00',
    MASTER_PANEL_SCHEDULE_TEMPORARY_CONFIRM_BODY:
      '⚠️ Potvrzení\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Období: {dateFrom} - {dateTo}\n\n' +
      '🕒 Nový dočasný rozvrh:\n{schedule}\n\n' +
      'Po potvrzení bude tento rozvrh platit pouze ve zvoleném období.',
    MASTER_PANEL_SCHEDULE_TEMPORARY_SUCCESS_BODY:
      '✅ Dočasný rozvrh byl úspěšně nastaven\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '📅 Platnost: {dateFrom} - {dateTo}\n\n' +
      '🕒 Rozvrh:\n{schedule}',

    MASTER_PANEL_SCHEDULE_DELETE_CONFIRM_TITLE: '⚠️ Potvrzení smazání',
    MASTER_PANEL_SCHEDULE_DELETE_DAY_OFF_BODY:
      'Opravdu chcete smazat tento volný den?\n\n' +
      '📅 Datum: {date}\n\n' +
      'Po smazání bude mistr v tento den znovu dostupný pro rezervace.',
    MASTER_PANEL_SCHEDULE_DELETE_VACATION_BODY:
      'Opravdu chcete smazat toto období dovolené?\n\n' +
      '📅 Období: {dateFrom} - {dateTo}\n\n' +
      'Po smazání budete v tomto období znovu dostupní pro rezervace.',
    MASTER_PANEL_SCHEDULE_DELETE_TEMPORARY_BODY:
      'Opravdu chcete smazat tuto dočasnou změnu rozvrhu?\n\n' +
      '📅 Období: {dateFrom} - {dateTo}\n\n' +
      'Po smazání se pro toto období znovu použije základní týdenní rozvrh.',

    MASTER_PANEL_OWN_PROFILE_MAIN_TITLE: '👤 Váš profil mistra',
    MASTER_PANEL_OWN_PROFILE_MAIN_HINT: 'Vyberte podsekci profilu tlačítky níže.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_TITLE: '💼 Správa služeb',
    MASTER_PANEL_OWN_PROFILE_SERVICES_EMPTY: 'Služby zatím nejsou přidány.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_TITLE: '➕ Přidat službu',
    MASTER_PANEL_OWN_PROFILE_SERVICES_ADD_EMPTY: 'Momentálně nejsou dostupné služby k přidání.',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_TITLE: '➖ Vypnout službu',
    MASTER_PANEL_OWN_PROFILE_SERVICES_REMOVE_EMPTY: 'Žádné aktivní služby k vypnutí.',
    MASTER_PANEL_OWN_PROFILE_PROFESSIONAL_TITLE: '🎓 Profesní informace',
    MASTER_PANEL_OWN_PROFILE_CERTIFICATES_EMPTY: 'Certifikáty zatím nejsou přidány.',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_TITLE: 'ℹ️ Doplňující informace',
    MASTER_PANEL_OWN_PROFILE_ADDITIONAL_HINT: 'Tyto údaje se zobrazují klientům ve vašem profilu.',

    MASTER_PANEL_OWN_PROFILE_BTN_SERVICES: '💼 Správa služeb',
    MASTER_PANEL_OWN_PROFILE_BTN_PROFESSIONAL: '🎓 Profesní informace',
    MASTER_PANEL_OWN_PROFILE_BTN_ADDITIONAL: 'ℹ️ Doplňující informace',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_PROFILE: '👤 Do profilu mistra',
    MASTER_PANEL_OWN_PROFILE_BTN_BACK_TO_SERVICES: '⬅️ Zpět ke správě služeb',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_DISPLAY_NAME: '👩‍🎨 Změnit jméno',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_STARTED_ON: '📅 Změnit datum začátku práce',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PROCEDURES_DONE_TOTAL: '📈 Aktualizovat počet procedur',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_BIO: '📝 Změnit popis',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_MATERIALS: '🧴 Změnit materiály',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_PHONE: '📞 Změnit telefon',
    MASTER_PANEL_OWN_PROFILE_BTN_EDIT_EMAIL: '✉️ Změnit email',

    MASTER_PANEL_OWN_PROFILE_CERTS_TITLE: '🎓 Správa diplomů a certifikátů',
    MASTER_PANEL_OWN_PROFILE_CERTS_EMPTY: 'Dokumenty zatím nejsou přidány.',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_ADD: '➕ Přidat dokument',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_DELETE: '➖ Smazat dokument',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK: '⬅️ Zpět na profesní informace',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_TITLE: '➕ Přidat diplom nebo certifikát',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_INPUT_HINT:
      'Zadejte název dokumentu.\n\nPříklad: Manikúra a modelace nehtů — Beauty Academy',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_TITLE: '⚠️ Potvrzení přidání',
    MASTER_PANEL_OWN_PROFILE_CERTS_ADD_CONFIRM_HINT: 'Potvrďte přidání dokumentu do profilu.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_TITLE: '➖ Smazat diplom nebo certifikát',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_LIST_EMPTY: 'Žádné dokumenty ke smazání.',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_TITLE: '⚠️ Potvrzení smazání',
    MASTER_PANEL_OWN_PROFILE_CERTS_DELETE_CONFIRM_HINT:
      'Opravdu chcete tento dokument smazat?',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_ADD: '✅ Přidat dokument',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CONFIRM_DELETE: '🗑 Smazat dokument',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_CANCEL_ACTION: '❌ Zrušit akci',
    MASTER_PANEL_OWN_PROFILE_CERTS_BTN_BACK_TO_CERTS: '⬅️ Zpět na dokumenty',

    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_BIO: 'popis profilu',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_MATERIALS: 'materiály',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PHONE: 'kontaktní telefon',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_EMAIL: 'kontaktní email',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DISPLAY_NAME: 'jméno mistra v profilu',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_STARTED_ON: 'datum začátku práce',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_PROCEDURES_DONE_TOTAL: 'počet provedených procedur',
    MASTER_PANEL_OWN_PROFILE_EDIT_LABEL_DEFAULT: 'pole profilu',
    MASTER_PANEL_OWN_PROFILE_EDIT_INPUT_NOT_SET: 'Neuvedeno',

    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_TITLE: '📝 Úprava popisu profilu',
    MASTER_PANEL_OWN_PROFILE_EDIT_BIO_HINT: 'Zadejte nový popis (minimálně 10 znaků).',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_TITLE: '🧴 Úprava materiálů',
    MASTER_PANEL_OWN_PROFILE_EDIT_MATERIALS_HINT: 'Zadejte materiály, se kterými pracujete.',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_TITLE: '📞 Úprava kontaktního telefonu',
    MASTER_PANEL_OWN_PROFILE_EDIT_PHONE_HINT: 'Zadejte telefon ve formátu +420123456789.',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_TITLE: '✉️ Úprava kontaktního emailu',
    MASTER_PANEL_OWN_PROFILE_EDIT_EMAIL_HINT: 'Zadejte nový email (příklad: name@example.com).',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_TITLE: '👩‍🎨 Úprava jména mistra',
    MASTER_PANEL_OWN_PROFILE_EDIT_DISPLAY_NAME_HINT:
      'Zadejte nové jméno pro zobrazení v profilu.\nPříklad: Anna V.',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_TITLE: '📅 Úprava data začátku práce',
    MASTER_PANEL_OWN_PROFILE_EDIT_STARTED_ON_HINT:
      'Zadejte nové datum ve formátu DD.MM.RRRR.\nPříklad: 12.04.2019',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_TITLE: '📈 Úprava počtu procedur',
    MASTER_PANEL_OWN_PROFILE_EDIT_PROCEDURES_HINT: 'Zadejte číslo od 0 do 100000.',

    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_TITLE: '⚠️ Potvrzení změny',
    MASTER_PANEL_OWN_PROFILE_EDIT_CONFIRM_HINT: 'Potvrďte uložení změn.',
    MASTER_PANEL_OWN_PROFILE_EDIT_SUCCESS: '✅ Pole "{field}" bylo aktualizováno.',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_CANCEL: '❌ Zrušit',
    MASTER_PANEL_OWN_PROFILE_EDIT_BTN_SAVE: '✅ Uložit',
  },
} as const;
