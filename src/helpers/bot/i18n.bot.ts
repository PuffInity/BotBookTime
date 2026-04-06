import type { LanguageCode } from '../../types/db/dbEnums.type.js';
import { resolveFeatureGatedUiLanguage } from './language-feature.bot.js';
import { COMMON_PANEL_DICTIONARY } from './i18n-common-panel.bot.js';
import { MAIN_PANEL_DICTIONARY } from './i18n-main-panel.bot.js';
import { ADMIN_PANEL_DICTIONARY } from './i18n-admin-panel.bot.js';
import { MASTER_PANEL_DICTIONARY } from './i18n-master-panel.bot.js';

/**
 * @file i18n.bot.ts
 * @summary Централізований словник UI-текстів клієнтської частини бота (uk/en/cs).
 */

export type BotUiLanguage = 'uk' | 'en' | 'cs';

const BOT_LEGACY_DICTIONARY = {
  uk: {
    MAIN_MENU_TEXT:
      'Вітаю 👋\n\n' +
      'Я — бот салону Liora Beauty Studio, який допоможе вам швидко та зручно записатися на процедури ✨\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Оберіть потрібний розділ нижче:\n\n' +
      '👤 Профіль — ваші дані та налаштування\n' +
      '💼 Послуги — переглянути всі доступні процедури\n' +
      '👩‍🎨 Майстри — переглянути профілі спеціалістів\n' +
      '📅 Бронювання — створити новий запис\n' +
      '❓ FAQ — відповіді на часті запитання\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '⬇️ Скористайтесь кнопками нижче для навігації',
    MENU_PROFILE: '👤 Профіль',
    MENU_SERVICES: '💼 Послуги',
    MENU_MASTERS: '👩‍🎨 Майстри',
    MENU_BOOKING: '📅 Бронювання',
    MENU_FAQ: '❓ FAQ',
    MENU_MASTER_PANEL: '🛠 Панель майстра',
    MENU_ADMIN_PANEL: '🛡 Адмін-панель',
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
    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 Мої записи',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Керування записами.\nОберіть категорію для перегляду:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 Нові записи (очікують підтвердження)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Сьогодні',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Завтра',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 Усі записи',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Скасовані',
    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 Нових записів, що очікують підтвердження, немає.\n\n' +
      'Усі запити оброблено. Нові записи з’являться тут автоматично.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 На сьогодні записів немає.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 На завтра записів немає.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 Записів не знайдено.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 Скасованих записів не знайдено.',
    MASTERS_TITLE: '👩‍🎨 Майстри',
    MASTERS_EMPTY: 'Наразі активних майстрів немає.',
    MASTERS_EMPTY_HINT: 'Спробуйте пізніше або зверніться до адміністратора.',
    MASTERS_SELECT: 'Оберіть майстра, щоб переглянути детальний профіль:',
    MASTERS_PROFILE_TITLE: '👩‍🎨 Профіль майстра',
    MASTERS_RATING_LABEL: '⭐ Рейтинг',
    MASTERS_EXPERIENCE_LABEL: '🗓 Досвід',
    MASTERS_EXPERIENCE_NOT_SET: 'Досвід не вказано',
    MASTERS_EXPERIENCE_YEARS: '{years} років досвіду',
    MASTERS_PROCEDURES_LABEL: '📈 Виконано процедур',
    MASTERS_SPECIALIZATION_TITLE: '💼 Спеціалізація',
    MASTERS_SPECIALIZATION_EMPTY: 'Інформацію буде додано найближчим часом.',
    MASTERS_CERTIFICATES_TITLE: '🎓 Сертифікати',
    MASTERS_CERTIFICATES_EMPTY: 'Інформацію буде додано найближчим часом.',
    MASTERS_CONTACTS_TITLE: '📌 Контакти',
    MASTERS_CONTACT_PHONE: '📱 Телефон',
    MASTERS_CONTACT_EMAIL: '✉️ Email',
    MASTERS_SCHEDULE_TITLE: '🕒 Графік роботи',
    MASTERS_SCHEDULE_EMPTY: 'Інформацію про графік буде додано найближчим часом.',
    MASTERS_SCHEDULE_CHANGES_TITLE: '📅 Найближчі зміни графіка',
    MASTERS_SCHEDULE_CHANGES_EMPTY: 'Наразі запланованих змін немає.',
    MASTERS_DAY_OFF: 'вихідний',
    MASTERS_VACATION: 'відпустка',
    MASTERS_WEEKDAY_FALLBACK: 'День {weekday}',
    MASTERS_ABOUT_TITLE: '📝 Про майстра',
    MASTERS_ABOUT_EMPTY: 'Інформацію буде додано найближчим часом.',
    MASTERS_ADDITIONAL_TITLE: '🧴 Додаткова інформація',
    MASTERS_ADDITIONAL_EMPTY: 'Не вказано.',
    PROFILE_TITLE: '👤 Профіль клієнта',
    PROFILE_ID: '🪪 ID профілю',
    PROFILE_NAME: "👤 Імʼя",
    PROFILE_TELEGRAM: '💬 Telegram',
    PROFILE_PHONE: '📱 Телефон',
    PROFILE_EMAIL: '✉️ Email',
    PROFILE_LANGUAGE: '🌐 Мова',
    PROFILE_NOTIFICATIONS: '🔔 Сповіщення: керуються в розділі "Налаштування сповіщень"',
    PROFILE_NOT_SET: 'Не вказано',
    PROFILE_VERIFIED: '✅ підтверджено',
    PROFILE_NOT_VERIFIED: '⚪ не підтверджено',
    PROFILE_BOOKING_AVAILABLE: '✅ Бронювання доступне.',
    PROFILE_BOOKING_RESTRICTED: '⚠️ Бронювання може бути обмежене, поки телефон не підтверджено.',
    PROFILE_EDIT_NAME: "✏️ Змінити імʼя",
    PROFILE_EDIT_EMAIL: '✉️ Змінити email',
    PROFILE_ADD_EMAIL: '➕ Додати email',
    PROFILE_EDIT_PHONE: '📱 Змінити телефон',
    PROFILE_ADD_PHONE: '➕ Додати телефон',
    PROFILE_EDIT_LANGUAGE: '🌐 Змінити мову',
    PROFILE_VERIFY_EMAIL: '✅ Підтвердити email',
    PROFILE_BOOKING_STATUS: '📅 Статус бронювання',
    PROFILE_BOOKING_TITLE: '📅 Статус бронювання',
    PROFILE_BOOKING_UPCOMING_EMPTY: '📭 У вас наразі немає активних записів.',
    PROFILE_BOOKING_UPCOMING_EMPTY_HINT: 'Нове бронювання можна створити через кнопку «📅 Бронювання».',
    PROFILE_BOOKING_UPCOMING_TITLE: '📅 Ваш найближчий запис:',
    PROFILE_BOOKING_LABEL_SERVICE: '💼 Послуга',
    PROFILE_BOOKING_LABEL_MASTER: '👩‍🎨 Майстер',
    PROFILE_BOOKING_LABEL_TIME: '🕒 Час',
    PROFILE_BOOKING_LABEL_PRICE: '💰 Вартість',
    PROFILE_BOOKING_LABEL_STATUS: '📌 Статус',
    PROFILE_BOOKING_STATUS_PENDING: '🟡 Очікує підтвердження',
    PROFILE_BOOKING_STATUS_CONFIRMED: '🟢 Підтверджено',
    PROFILE_BOOKING_STATUS_CANCELED: '🔴 Скасовано',
    PROFILE_BOOKING_STATUS_COMPLETED: '🟢 Відвідано',
    PROFILE_BOOKING_STATUS_TRANSFERRED: '🟣 Перенесено',
    PROFILE_BOOKING_HISTORY_TITLE: '📖 Історія ваших записів',
    PROFILE_BOOKING_HISTORY_EMPTY: '📭 У вас поки що немає завершених записів.',
    PROFILE_BOOKING_VIEW_STATUS: '📅 Переглянути статус',
    PROFILE_BOOKING_CARD_TITLE: '📄 Картка запису',
    PROFILE_BOOKING_ACTION_HINT: 'Оберіть дію для цього запису нижче.',
    PROFILE_BOOKING_ACTION_DISABLED: '⚠️ Для цього запису зміна або скасування недоступні.',
    PROFILE_BOOKING_CANCEL_CONFIRM_TITLE: '⚠️ Підтвердження скасування',
    PROFILE_BOOKING_CANCEL_CONFIRM_ASK: 'Ви дійсно хочете скасувати цей запис?',
    PROFILE_BOOKING_CANCEL_SUCCESS: '✅ Запис успішно скасовано.',
    PROFILE_BOOKING_CANCEL_SUCCESS_HINT: 'Оновлений статус доступний у розділі «📅 Статус бронювання».',
    PROFILE_BOOKING_NOT_FOUND: '⚠️ Запис не знайдено',
    PROFILE_BOOKING_ACTION_STUB:
      'Цю дію вже винесено в окремий етап.\nНа наступному кроці підключимо повну робочу реалізацію.',
    PROFILE_BOOKING_BTN_RESCHEDULE: '🔄 Перенести',
    PROFILE_BOOKING_BTN_CANCEL: '❌ Скасувати бронювання',
    PROFILE_BOOKING_BTN_VIEW_ALL: '📖 Переглянути всі записи',
    PROFILE_BOOKING_BTN_CREATE: '📅 Створити запис',
    PROFILE_BOOKING_BTN_CREATE_FIRST: '📅 Створити перший запис',
    PROFILE_BOOKING_BTN_BACK_TO_HISTORY: '⬅️ Назад до списку',
    PROFILE_BOOKING_BTN_CANCEL_CONFIRM: '✅ Так, скасувати',
    PROFILE_BOOKING_BTN_CANCEL_ABORT: '❌ Ні, залишити запис',
    PROFILE_NOTIFICATION_SETTINGS: '🔔 Налаштування сповіщень',
    PROFILE_BTN_CANCEL: '❌ Скасувати',
    PROFILE_OTP_BTN_RESEND: '🔄 Надіслати код повторно',
    PROFILE_OTP_BTN_CANCEL: '❌ Скасувати',
    BACK_TO_PROFILE: '⬅️ Повернутися до профілю',
    HOME: '🏠 Головне меню',
    LANGUAGE_UK: '🇺🇦 Українська',
    LANGUAGE_EN: '🇬🇧 English',
    LANGUAGE_CS: '🇨🇿 Čeština',
    PROFILE_LANGUAGE_TITLE: '🌐 Зміна мови',
    PROFILE_LANGUAGE_CURRENT: 'Поточна мова',
    PROFILE_LANGUAGE_CHOOSE: 'Оберіть мову інтерфейсу:',
    PROFILE_LANGUAGE_UPDATED: '✅ Мову профілю оновлено',
    PROFILE_STUB_BODY:
      'Цей розділ вже зарезервований у логіці, зараз тимчасово працює як заглушка.\n' +
      'На наступному етапі підключимо повну робочу реалізацію.',
    PROFILE_NAME_BLOCKED: '⛔ Зміна імені тимчасово недоступна.\nСпробуйте знову через кілька хвилин.',
    PROFILE_NAME_COOLDOWN:
      '⏳ Ви вже змінювали імʼя протягом останніх 24 годин.\nПовторна зміна стане доступною пізніше.',
    PROFILE_NAME_PROMPT:
      "✏️ Змінити імʼя\n\n" +
      'Введіть нове імʼя, яке буде використовуватися для записів.\n\n' +
      'Імʼя повинно бути реальним та відповідати людині, яка відвідує процедуру.\n\n' +
      '⚠️ Зверніть увагу: змінити імʼя можна лише один раз протягом 24 годин.',
    PROFILE_NAME_INVALID: "⚠️ Некоректне імʼя.\nВикористовуйте тільки літери та мінімум 2 символи.",
    PROFILE_NAME_UPDATED: '✅ Імʼя успішно оновлено.',
    PROFILE_NAME_UPDATED_VALUE: 'Нове імʼя',
    PROFILE_NAME_CANCELLED: '❌ Зміну імені скасовано.',
    PROFILE_EMAIL_ADD_PROMPT:
      '➕ Додати email\n\n' +
      'Введіть email для вашого профілю.\n\n' +
      'Вимоги:\n' +
      '• валідний формат email\n' +
      '• від 5 до 100 символів',
    PROFILE_EMAIL_INVALID: '⚠️ Некоректний формат email. Спробуйте ще раз.',
    PROFILE_EMAIL_ALREADY_USED: '⚠️ Цей email вже використовується іншим користувачем.',
    PROFILE_EMAIL_ADDED_TITLE: '✅ Email успішно додано.',
    PROFILE_EMAIL_ADDED_VALUE: 'Email',
    PROFILE_EMAIL_ADDED_HINT: 'Тепер ви можете підтвердити його через кнопку "✅ Підтвердити email".',
    PROFILE_EMAIL_ADD_CANCELLED: '❌ Додавання email скасовано.',
    PROFILE_NOTIFICATION_TITLE: '🔔 Налаштування сповіщень',
    PROFILE_NOTIFICATION_CHOOSE: 'Оберіть тип сповіщень, які ви хочете отримувати:',
    PROFILE_NOTIFICATION_BOOKING_CONFIRMATION: '📩 Підтвердження запису',
    PROFILE_NOTIFICATION_VISIT_REMINDER: '🔔 Нагадування перед візитом',
    PROFILE_NOTIFICATION_STATUS_CHANGE: '🔄 Зміни статусу запису',
    PROFILE_NOTIFICATION_PROMO: '📢 Акції та новини',
    PROFILE_NOTIFICATION_DELIVERY:
      'Telegram-сповіщення надходять завжди, якщо тип увімкнений.\n' +
      'Email/SMS надходять лише для підтверджених контактів.',
    PROFILE_NOTIFICATION_ALL_ON: '🔄 Увімкнути всі',
    PROFILE_NOTIFICATION_ALL_OFF: '🔕 Вимкнути всі',
    PROFILE_NOTIFICATION_UPDATED: 'Налаштування оновлено ✅',
    COMMON_BACK: '⬅️ Назад',
    SERVICES_TITLE: '💼 Послуги',
    SERVICES_EMPTY: 'Наразі активних послуг немає.',
    SERVICES_EMPTY_HINT: 'Спробуйте пізніше або зверніться до адміністратора.',
    SERVICES_SELECT: 'Оберіть послугу, щоб переглянути детальний опис:',
    SERVICES_DURATION: 'Тривалість',
    SERVICES_PRICE: 'Вартість',
    SERVICES_DETAILS_TITLE: '📄 Опис послуги',
    SERVICES_LABEL_SERVICE: '💼 Послуга',
    SERVICES_LABEL_DURATION: '⏱ Тривалість',
    SERVICES_LABEL_PRICE: '💰 Вартість',
    SERVICES_RESULT_TITLE: '🎯 Результат',
    SERVICES_STEPS_TITLE: '✨ Як проходить процедура',
    SERVICES_STEPS_EMPTY: 'Інформацію про етапи буде додано найближчим часом.',
    SERVICES_GUARANTEES_TITLE: '🛡 Гарантії',
    SERVICES_GUARANTEES_EMPTY: 'Інформацію про гарантії буде додано найближчим часом.',
    FAQ_TITLE: '❓ FAQ — Часті запитання',
    FAQ_EMPTY: 'Наразі розділ FAQ порожній.',
    FAQ_EMPTY_HINT: 'Спробуйте пізніше або зверніться до адміністратора.',
    FAQ_SELECT_HINT: 'Для детальної інформації виберіть номер питання.',
    FAQ_QUESTION: '❓ Питання',
    FAQ_ANSWER: '✅ Відповідь',
    BOOKING_STEP_1_TITLE: '📅 Бронювання — крок 1/5',
    BOOKING_STEP_2_TITLE: '📅 Бронювання — крок 2/5',
    BOOKING_STEP_3_TITLE: '📅 Бронювання — крок 3/5',
    BOOKING_STEP_4_TITLE: '📅 Бронювання — крок 4/5',
    BOOKING_STEP_5_TITLE: '📅 Бронювання — крок 5/5',
    BOOKING_NO_SERVICES: 'Наразі немає активних послуг для запису.',
    BOOKING_NO_SERVICES_HINT: 'Спробуйте пізніше або зверніться до адміністратора.',
    BOOKING_SELECT_SERVICE: 'Оберіть послугу для запису.',
    BOOKING_LABEL_SERVICE: '💼 Послуга',
    BOOKING_LABEL_DATE: '📆 Дата',
    BOOKING_LABEL_TIME: '⏰ Час',
    BOOKING_SELECT_DATE: 'Оберіть дату візиту.',
    BOOKING_SELECT_TIME: 'Оберіть зручний час.',
    BOOKING_NO_SLOTS: '⚠️ На цю дату вже немає доступних слотів. Оберіть іншу дату.',
    BOOKING_NO_MASTERS: 'На жаль, для цієї послуги зараз немає доступних майстрів.',
    BOOKING_SELECT_MASTER: 'Оберіть майстра.',
    BOOKING_PROFILE_NAME: "👤 Ім'я з профілю",
    BOOKING_PHONE_MISSING: '📱 Номер у профілі не доданий.',
    BOOKING_PHONE_ENTER: 'Будь ласка, напишіть ваш номер телефону у форматі +420123456789.',
    BOOKING_PROFILE_PHONE: '📱 Телефон у профілі',
    BOOKING_PHONE_UNVERIFIED:
      '⚠️ Ваш номер телефону доданий, але не підтверджений.\n' +
      'Оберіть дію: перейти в профіль або використати непідтверджений номер.',
    BOOKING_CONFIRM_TITLE: '✅ Підтвердження бронювання',
    BOOKING_LABEL_MASTER: '👩‍🎨 Майстер',
    BOOKING_LABEL_DATETIME: '📆 Дата та час',
    BOOKING_LABEL_CLIENT: '👤 Клієнт',
    BOOKING_LABEL_PHONE: '📱 Телефон',
    BOOKING_CONFIRM_ASK: 'Підтвердити створення запису?',
    BOOKING_SUCCESS_TITLE: '🎉 Ваш запис успішно створено',
    BOOKING_RECORD_ID: '🆔 Номер запису',
    BOOKING_STATUS_PENDING: 'Статус: 🟡 Очікує підтвердження майстром.',
    BOOKING_BTN_CANCEL: '❌ Скасувати бронювання',
    BOOKING_BTN_GO_PROFILE: '👤 Перейти в профіль',
    BOOKING_BTN_USE_UNVERIFIED: '📱 Використати непідтверджений номер',
    BOOKING_BTN_CONFIRM: '✅ Підтвердити',
    BOOKING_BTN_CHANGE: '✏️ Змінити',
    BOOKING_CANCELLED: 'Бронювання скасовано.',
    BOOKING_TEXT_USE_BUTTONS: 'Використайте кнопки нижче, щоб продовжити.',
    BOOKING_TEXT_EXPECT_PHONE: 'Я очікую текстове повідомлення з номером телефону.',
    BOOKING_TEXT_INVALID_PHONE: '⚠️ Некоректний номер. Приклад: +420123456789',
    BOOKING_TEXT_PHONE_NOT_IN_PROFILE: 'У профілі немає номера телефону.',
    BOOKING_TEXT_BACK_STEP: '⬅️ Повертаємося до попереднього кроку.',
    BOOKING_ERROR_FALLBACK: '⚠️ Не вдалося завершити бронювання. Перевірте дані та спробуйте ще раз.',
    BOOKING_EMAIL_SENT:
      '📧 Ми надіслали лист на ваш email: запис створено і очікує підтвердження.\n' +
      'Після підтвердження майстром ви отримаєте ще один лист.',
    BOOKING_RESCHEDULE_TEXT:
      '🔄 Перенесення запису\n\n' +
      'Обраний запис: {serviceName} ({dateTime}).\n' +
      'Оберіть нову дату та час у сценарії бронювання.',
    BOOKING_CANCEL_REASON_PROFILE: 'Скасовано через Telegram-бота',
    BOOKING_CLIENT_FALLBACK: 'Клієнт',
    HELP_TEXT:
      'Список команд:\n' +
      '/start - головне меню\n' +
      '/menu - показати головне меню\n' +
      '/master - відкрити панель майстра\n' +
      '/admin - відкрити адмін-панель\n' +
      '/booking - почати сценарій запису\n' +
      '/cancel - вийти зі сценарію',
    NO_ACTIVE_SCENARIO: 'Зараз немає активного сценарію для скасування.',
    SCENARIO_CANCELLED: 'Сценарій скасовано.',
    FALLBACK_USE_MENU: 'Використайте /menu, щоб відкрити головне меню.',
    OTP_EMAIL_CODE_SENT:
      '✉️ Код підтвердження відправлено.\n' +
      'Email: {email}\n\n' +
      'Введіть 6-значний код із листа.\n' +
      'Код дійсний 5 хвилин.',
    OTP_EMAIL_ALREADY_VERIFIED: '✅ Email вже підтверджено.',
    OTP_EMAIL_MISSING: '⚠️ Email не вказано. Спочатку додайте email у профілі.',
    OTP_EMAIL_INVALID_CODE: '⚠️ Невірний OTP код. Перевірте код і спробуйте ще раз.',
    OTP_EMAIL_EXPIRED: '⌛ Термін дії коду завершився. Надішліть код повторно.',
    OTP_EMAIL_BLOCKED: '⛔ Забагато невірних спроб. Спробуйте знову через 5 хвилин.',
    OTP_EMAIL_RESEND_COOLDOWN: '⏱ Повторна відправка буде доступна через {seconds} сек.',
    OTP_EMAIL_VERIFIED: '✅ Email підтверджено успішно.\nПідтверджений email: {email}',
    OTP_EMAIL_CANCELLED: '❌ Підтвердження email скасовано.',
    OTP_EMAIL_MAILER_NOT_CONFIGURED:
      '⚙️ Сервіс email тимчасово не налаштований.\nЗверніться до адміністратора або спробуйте пізніше.',
    OTP_EMAIL_SEND_FAILED: '⚠️ Не вдалося відправити код підтвердження. Спробуйте ще раз пізніше.',
  },
  en: {
    MAIN_MENU_TEXT:
      'Welcome 👋\n\n' +
      'I am the Liora Beauty Studio bot. I help you book procedures quickly and conveniently ✨\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Choose a section below:\n\n' +
      '👤 Profile — your data and settings\n' +
      '💼 Services — view all available procedures\n' +
      '👩‍🎨 Masters — browse specialist profiles\n' +
      '📅 Booking — create a new appointment\n' +
      '❓ FAQ — answers to common questions\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '⬇️ Use the buttons below to navigate',
    MENU_PROFILE: '👤 Profile',
    MENU_SERVICES: '💼 Services',
    MENU_MASTERS: '👩‍🎨 Masters',
    MENU_BOOKING: '📅 Booking',
    MENU_FAQ: '❓ FAQ',
    MENU_MASTER_PANEL: '🛠 Master Panel',
    MENU_ADMIN_PANEL: '🛡 Admin Panel',
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
    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 My bookings',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Booking management.\nChoose a category:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 New bookings (awaiting confirmation)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Today',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Tomorrow',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 All bookings',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Canceled',
    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 There are no new bookings awaiting confirmation.\n\n' +
      'All requests are processed. New bookings will appear here automatically.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 No bookings for today.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 No bookings for tomorrow.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 No bookings found.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 No canceled bookings found.',
    MASTERS_TITLE: '👩‍🎨 Masters',
    MASTERS_EMPTY: 'There are currently no active masters.',
    MASTERS_EMPTY_HINT: 'Please try later or contact administrator.',
    MASTERS_SELECT: 'Choose a master to view detailed profile:',
    MASTERS_PROFILE_TITLE: '👩‍🎨 Master Profile',
    MASTERS_RATING_LABEL: '⭐ Rating',
    MASTERS_EXPERIENCE_LABEL: '🗓 Experience',
    MASTERS_EXPERIENCE_NOT_SET: 'Experience is not specified',
    MASTERS_EXPERIENCE_YEARS: '{years} years of experience',
    MASTERS_PROCEDURES_LABEL: '📈 Procedures done',
    MASTERS_SPECIALIZATION_TITLE: '💼 Specialization',
    MASTERS_SPECIALIZATION_EMPTY: 'Information will be added soon.',
    MASTERS_CERTIFICATES_TITLE: '🎓 Certificates',
    MASTERS_CERTIFICATES_EMPTY: 'Information will be added soon.',
    MASTERS_CONTACTS_TITLE: '📌 Contacts',
    MASTERS_CONTACT_PHONE: '📱 Phone',
    MASTERS_CONTACT_EMAIL: '✉️ Email',
    MASTERS_SCHEDULE_TITLE: '🕒 Working schedule',
    MASTERS_SCHEDULE_EMPTY: 'Schedule information will be added soon.',
    MASTERS_SCHEDULE_CHANGES_TITLE: '📅 Upcoming schedule changes',
    MASTERS_SCHEDULE_CHANGES_EMPTY: 'No planned changes right now.',
    MASTERS_DAY_OFF: 'day off',
    MASTERS_VACATION: 'vacation',
    MASTERS_WEEKDAY_FALLBACK: 'Day {weekday}',
    MASTERS_ABOUT_TITLE: '📝 About master',
    MASTERS_ABOUT_EMPTY: 'Information will be added soon.',
    MASTERS_ADDITIONAL_TITLE: '🧴 Additional information',
    MASTERS_ADDITIONAL_EMPTY: 'Not set.',
    PROFILE_TITLE: '👤 Client Profile',
    PROFILE_ID: '🪪 Profile ID',
    PROFILE_NAME: '👤 Name',
    PROFILE_TELEGRAM: '💬 Telegram',
    PROFILE_PHONE: '📱 Phone',
    PROFILE_EMAIL: '✉️ Email',
    PROFILE_LANGUAGE: '🌐 Language',
    PROFILE_NOTIFICATIONS: '🔔 Notifications: managed in "Notification Settings"',
    PROFILE_NOT_SET: 'Not set',
    PROFILE_VERIFIED: '✅ verified',
    PROFILE_NOT_VERIFIED: '⚪ not verified',
    PROFILE_BOOKING_AVAILABLE: '✅ Booking is available.',
    PROFILE_BOOKING_RESTRICTED: '⚠️ Booking may be limited until your phone is verified.',
    PROFILE_EDIT_NAME: '✏️ Change name',
    PROFILE_EDIT_EMAIL: '✉️ Change email',
    PROFILE_ADD_EMAIL: '➕ Add email',
    PROFILE_EDIT_PHONE: '📱 Change phone',
    PROFILE_ADD_PHONE: '➕ Add phone',
    PROFILE_EDIT_LANGUAGE: '🌐 Change language',
    PROFILE_VERIFY_EMAIL: '✅ Verify email',
    PROFILE_BOOKING_STATUS: '📅 Booking status',
    PROFILE_BOOKING_TITLE: '📅 Booking status',
    PROFILE_BOOKING_UPCOMING_EMPTY: '📭 You currently have no active bookings.',
    PROFILE_BOOKING_UPCOMING_EMPTY_HINT: 'You can create a new booking via the "📅 Booking" button.',
    PROFILE_BOOKING_UPCOMING_TITLE: '📅 Your nearest booking:',
    PROFILE_BOOKING_LABEL_SERVICE: '💼 Service',
    PROFILE_BOOKING_LABEL_MASTER: '👩‍🎨 Master',
    PROFILE_BOOKING_LABEL_TIME: '🕒 Time',
    PROFILE_BOOKING_LABEL_PRICE: '💰 Price',
    PROFILE_BOOKING_LABEL_STATUS: '📌 Status',
    PROFILE_BOOKING_STATUS_PENDING: '🟡 Awaiting confirmation',
    PROFILE_BOOKING_STATUS_CONFIRMED: '🟢 Confirmed',
    PROFILE_BOOKING_STATUS_CANCELED: '🔴 Canceled',
    PROFILE_BOOKING_STATUS_COMPLETED: '🟢 Completed',
    PROFILE_BOOKING_STATUS_TRANSFERRED: '🟣 Rescheduled',
    PROFILE_BOOKING_HISTORY_TITLE: '📖 Your booking history',
    PROFILE_BOOKING_HISTORY_EMPTY: '📭 You have no completed bookings yet.',
    PROFILE_BOOKING_VIEW_STATUS: '📅 View status',
    PROFILE_BOOKING_CARD_TITLE: '📄 Booking card',
    PROFILE_BOOKING_ACTION_HINT: 'Choose an action for this booking below.',
    PROFILE_BOOKING_ACTION_DISABLED: '⚠️ Changes or cancellation are not available for this booking.',
    PROFILE_BOOKING_CANCEL_CONFIRM_TITLE: '⚠️ Cancellation confirmation',
    PROFILE_BOOKING_CANCEL_CONFIRM_ASK: 'Do you really want to cancel this booking?',
    PROFILE_BOOKING_CANCEL_SUCCESS: '✅ Booking canceled successfully.',
    PROFILE_BOOKING_CANCEL_SUCCESS_HINT: 'Updated status is available in the "📅 Booking status" section.',
    PROFILE_BOOKING_NOT_FOUND: '⚠️ Booking not found',
    PROFILE_BOOKING_ACTION_STUB:
      'This action is already separated into a dedicated step.\n' +
      'A full implementation will be connected in the next phase.',
    PROFILE_BOOKING_BTN_RESCHEDULE: '🔄 Reschedule',
    PROFILE_BOOKING_BTN_CANCEL: '❌ Cancel booking',
    PROFILE_BOOKING_BTN_VIEW_ALL: '📖 View all bookings',
    PROFILE_BOOKING_BTN_CREATE: '📅 Create booking',
    PROFILE_BOOKING_BTN_CREATE_FIRST: '📅 Create first booking',
    PROFILE_BOOKING_BTN_BACK_TO_HISTORY: '⬅️ Back to list',
    PROFILE_BOOKING_BTN_CANCEL_CONFIRM: '✅ Yes, cancel',
    PROFILE_BOOKING_BTN_CANCEL_ABORT: '❌ No, keep booking',
    PROFILE_NOTIFICATION_SETTINGS: '🔔 Notification settings',
    PROFILE_BTN_CANCEL: '❌ Cancel',
    PROFILE_OTP_BTN_RESEND: '🔄 Resend code',
    PROFILE_OTP_BTN_CANCEL: '❌ Cancel',
    BACK_TO_PROFILE: '⬅️ Back to profile',
    HOME: '🏠 Home menu',
    LANGUAGE_UK: '🇺🇦 Ukrainian',
    LANGUAGE_EN: '🇬🇧 English',
    LANGUAGE_CS: '🇨🇿 Czech',
    PROFILE_LANGUAGE_TITLE: '🌐 Change language',
    PROFILE_LANGUAGE_CURRENT: 'Current language',
    PROFILE_LANGUAGE_CHOOSE: 'Choose interface language:',
    PROFILE_LANGUAGE_UPDATED: '✅ Profile language updated',
    PROFILE_STUB_BODY:
      'This section is already reserved in the flow and currently works as a placeholder.\n' +
      'We will connect full implementation in the next step.',
    PROFILE_NAME_BLOCKED: '⛔ Name change is temporarily unavailable.\nPlease try again in a few minutes.',
    PROFILE_NAME_COOLDOWN:
      '⏳ You have already changed your name within the last 24 hours.\n' +
      'The next change will be available later.',
    PROFILE_NAME_PROMPT:
      '✏️ Change name\n\n' +
      'Enter a new name that will be used for bookings.\n\n' +
      'The name should be real and match the person attending the service.\n\n' +
      '⚠️ Please note: you can change your name only once every 24 hours.',
    PROFILE_NAME_INVALID: '⚠️ Invalid name.\nUse letters only and at least 2 characters.',
    PROFILE_NAME_UPDATED: '✅ Name updated successfully.',
    PROFILE_NAME_UPDATED_VALUE: 'New name',
    PROFILE_NAME_CANCELLED: '❌ Name change canceled.',
    PROFILE_EMAIL_ADD_PROMPT:
      '➕ Add email\n\n' +
      'Enter an email for your profile.\n\n' +
      'Requirements:\n' +
      '• valid email format\n' +
      '• from 5 to 100 characters',
    PROFILE_EMAIL_INVALID: '⚠️ Invalid email format. Please try again.',
    PROFILE_EMAIL_ALREADY_USED: '⚠️ This email is already used by another user.',
    PROFILE_EMAIL_ADDED_TITLE: '✅ Email added successfully.',
    PROFILE_EMAIL_ADDED_VALUE: 'Email',
    PROFILE_EMAIL_ADDED_HINT: 'Now you can verify it using the "✅ Verify email" button.',
    PROFILE_EMAIL_ADD_CANCELLED: '❌ Email adding canceled.',
    PROFILE_NOTIFICATION_TITLE: '🔔 Notification settings',
    PROFILE_NOTIFICATION_CHOOSE: 'Choose notification types you want to receive:',
    PROFILE_NOTIFICATION_BOOKING_CONFIRMATION: '📩 Booking confirmation',
    PROFILE_NOTIFICATION_VISIT_REMINDER: '🔔 Visit reminder',
    PROFILE_NOTIFICATION_STATUS_CHANGE: '🔄 Booking status changes',
    PROFILE_NOTIFICATION_PROMO: '📢 Promotions and news',
    PROFILE_NOTIFICATION_DELIVERY:
      'Telegram notifications are sent whenever the type is enabled.\n' +
      'Email/SMS are sent only for verified contacts.',
    PROFILE_NOTIFICATION_ALL_ON: '🔄 Enable all',
    PROFILE_NOTIFICATION_ALL_OFF: '🔕 Disable all',
    PROFILE_NOTIFICATION_UPDATED: 'Settings updated ✅',
    COMMON_BACK: '⬅️ Back',
    SERVICES_TITLE: '💼 Services',
    SERVICES_EMPTY: 'There are currently no active services.',
    SERVICES_EMPTY_HINT: 'Please try later or contact administrator.',
    SERVICES_SELECT: 'Choose a service to view details:',
    SERVICES_DURATION: 'Duration',
    SERVICES_PRICE: 'Price',
    SERVICES_DETAILS_TITLE: '📄 Service details',
    SERVICES_LABEL_SERVICE: '💼 Service',
    SERVICES_LABEL_DURATION: '⏱ Duration',
    SERVICES_LABEL_PRICE: '💰 Price',
    SERVICES_RESULT_TITLE: '🎯 Result',
    SERVICES_STEPS_TITLE: '✨ How the procedure goes',
    SERVICES_STEPS_EMPTY: 'Step details will be added soon.',
    SERVICES_GUARANTEES_TITLE: '🛡 Guarantees',
    SERVICES_GUARANTEES_EMPTY: 'Guarantee details will be added soon.',
    FAQ_TITLE: '❓ FAQ — Frequently Asked Questions',
    FAQ_EMPTY: 'FAQ section is currently empty.',
    FAQ_EMPTY_HINT: 'Please try later or contact administrator.',
    FAQ_SELECT_HINT: 'Choose a question number for full details.',
    FAQ_QUESTION: '❓ Question',
    FAQ_ANSWER: '✅ Answer',
    BOOKING_STEP_1_TITLE: '📅 Booking — step 1/5',
    BOOKING_STEP_2_TITLE: '📅 Booking — step 2/5',
    BOOKING_STEP_3_TITLE: '📅 Booking — step 3/5',
    BOOKING_STEP_4_TITLE: '📅 Booking — step 4/5',
    BOOKING_STEP_5_TITLE: '📅 Booking — step 5/5',
    BOOKING_NO_SERVICES: 'There are currently no active services for booking.',
    BOOKING_NO_SERVICES_HINT: 'Please try later or contact administrator.',
    BOOKING_SELECT_SERVICE: 'Choose a service for booking.',
    BOOKING_LABEL_SERVICE: '💼 Service',
    BOOKING_LABEL_DATE: '📆 Date',
    BOOKING_LABEL_TIME: '⏰ Time',
    BOOKING_SELECT_DATE: 'Choose visit date.',
    BOOKING_SELECT_TIME: 'Choose a convenient time.',
    BOOKING_NO_SLOTS: '⚠️ No available slots for this date. Choose another date.',
    BOOKING_NO_MASTERS: 'Unfortunately, there are no available masters for this service right now.',
    BOOKING_SELECT_MASTER: 'Choose a master.',
    BOOKING_PROFILE_NAME: '👤 Profile name',
    BOOKING_PHONE_MISSING: '📱 Phone number is not added in profile.',
    BOOKING_PHONE_ENTER: 'Please send your phone number in format +420123456789.',
    BOOKING_PROFILE_PHONE: '📱 Profile phone',
    BOOKING_PHONE_UNVERIFIED:
      '⚠️ Your phone number is added but not verified.\n' +
      'Choose action: go to profile or use unverified phone.',
    BOOKING_CONFIRM_TITLE: '✅ Booking confirmation',
    BOOKING_LABEL_MASTER: '👩‍🎨 Master',
    BOOKING_LABEL_DATETIME: '📆 Date and time',
    BOOKING_LABEL_CLIENT: '👤 Client',
    BOOKING_LABEL_PHONE: '📱 Phone',
    BOOKING_CONFIRM_ASK: 'Confirm booking creation?',
    BOOKING_SUCCESS_TITLE: '🎉 Your booking has been created successfully',
    BOOKING_RECORD_ID: '🆔 Booking ID',
    BOOKING_STATUS_PENDING: 'Status: 🟡 Waiting for master confirmation.',
    BOOKING_BTN_CANCEL: '❌ Cancel booking',
    BOOKING_BTN_GO_PROFILE: '👤 Go to profile',
    BOOKING_BTN_USE_UNVERIFIED: '📱 Use unverified phone',
    BOOKING_BTN_CONFIRM: '✅ Confirm',
    BOOKING_BTN_CHANGE: '✏️ Change',
    BOOKING_CANCELLED: 'Booking canceled.',
    BOOKING_TEXT_USE_BUTTONS: 'Use buttons below to continue.',
    BOOKING_TEXT_EXPECT_PHONE: 'I expect a text message with phone number.',
    BOOKING_TEXT_INVALID_PHONE: '⚠️ Invalid phone number. Example: +420123456789',
    BOOKING_TEXT_PHONE_NOT_IN_PROFILE: 'No phone number in profile.',
    BOOKING_TEXT_BACK_STEP: '⬅️ Returning to previous step.',
    BOOKING_ERROR_FALLBACK: '⚠️ Failed to complete booking. Check your data and try again.',
    BOOKING_EMAIL_SENT:
      '📧 We sent an email: your booking is created and waiting for confirmation.\n' +
      'After master confirmation you will get one more email.',
    BOOKING_RESCHEDULE_TEXT:
      '🔄 Booking reschedule\n\n' +
      'Selected booking: {serviceName} ({dateTime}).\n' +
      'Choose a new date and time in the booking flow.',
    BOOKING_CANCEL_REASON_PROFILE: 'Canceled via Telegram bot',
    BOOKING_CLIENT_FALLBACK: 'Client',
    HELP_TEXT:
      'Command list:\n' +
      '/start - main menu\n' +
      '/menu - show main menu\n' +
      '/master - open master panel\n' +
      '/admin - open admin panel\n' +
      '/booking - start booking flow\n' +
      '/cancel - leave current flow',
    NO_ACTIVE_SCENARIO: 'There is no active flow to cancel now.',
    SCENARIO_CANCELLED: 'Flow canceled.',
    FALLBACK_USE_MENU: 'Use /menu to open main menu.',
    OTP_EMAIL_CODE_SENT:
      '✉️ Verification code sent.\n' +
      'Email: {email}\n\n' +
      'Enter the 6-digit code from the email.\n' +
      'The code is valid for 5 minutes.',
    OTP_EMAIL_ALREADY_VERIFIED: '✅ Email is already verified.',
    OTP_EMAIL_MISSING: '⚠️ Email is missing. Add email in profile first.',
    OTP_EMAIL_INVALID_CODE: '⚠️ Invalid OTP code. Check and try again.',
    OTP_EMAIL_EXPIRED: '⌛ The code has expired. Please resend it.',
    OTP_EMAIL_BLOCKED: '⛔ Too many invalid attempts. Try again in 5 minutes.',
    OTP_EMAIL_RESEND_COOLDOWN: '⏱ Resend will be available in {seconds} sec.',
    OTP_EMAIL_VERIFIED: '✅ Email verified successfully.\nVerified email: {email}',
    OTP_EMAIL_CANCELLED: '❌ Email verification canceled.',
    OTP_EMAIL_MAILER_NOT_CONFIGURED:
      '⚙️ Email service is temporarily not configured.\nContact administrator or try again later.',
    OTP_EMAIL_SEND_FAILED: '⚠️ Failed to send verification code. Please try again later.',
  },
  cs: {
    MAIN_MENU_TEXT:
      'Vítejte 👋\n\n' +
      'Jsem bot salonu Liora Beauty Studio. Pomohu vám rychle a pohodlně vytvořit rezervaci ✨\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      'Vyberte sekci níže:\n\n' +
      '👤 Profil — vaše údaje a nastavení\n' +
      '💼 Služby — zobrazit dostupné procedury\n' +
      '👩‍🎨 Mistři — profily specialistů\n' +
      '📅 Rezervace — vytvořit nový termín\n' +
      '❓ FAQ — časté otázky\n\n' +
      '━━━━━━━━━━━━━━\n\n' +
      '⬇️ Pro navigaci použijte tlačítka níže',
    MENU_PROFILE: '👤 Profil',
    MENU_SERVICES: '💼 Služby',
    MENU_MASTERS: '👩‍🎨 Mistři',
    MENU_BOOKING: '📅 Rezervace',
    MENU_FAQ: '❓ FAQ',
    MENU_MASTER_PANEL: '🛠 Panel mistra',
    MENU_ADMIN_PANEL: '🛡 Admin panel',
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
    MASTER_PANEL_BOOKINGS_MENU_TITLE: '📅 Moje rezervace',
    MASTER_PANEL_BOOKINGS_MENU_SUBTITLE: 'Správa rezervací.\nVyberte kategorii:',
    MASTER_PANEL_BOOKINGS_CATEGORY_PENDING: '🆕 Nové rezervace (čekají na potvrzení)',
    MASTER_PANEL_BOOKINGS_CATEGORY_TODAY: '📍 Dnes',
    MASTER_PANEL_BOOKINGS_CATEGORY_TOMORROW: '📆 Zítra',
    MASTER_PANEL_BOOKINGS_CATEGORY_ALL: '🗂 Všechny rezervace',
    MASTER_PANEL_BOOKINGS_CATEGORY_CANCELED: '❌ Zrušené',
    MASTER_PANEL_BOOKINGS_EMPTY_PENDING:
      '📭 Nejsou žádné nové rezervace čekající na potvrzení.\n\n' +
      'Všechny požadavky jsou zpracovány. Nové rezervace se zde zobrazí automaticky.',
    MASTER_PANEL_BOOKINGS_EMPTY_TODAY: '📭 Dnes nejsou žádné rezervace.',
    MASTER_PANEL_BOOKINGS_EMPTY_TOMORROW: '📭 Na zítřek nejsou žádné rezervace.',
    MASTER_PANEL_BOOKINGS_EMPTY_ALL: '📭 Nebyly nalezeny žádné rezervace.',
    MASTER_PANEL_BOOKINGS_EMPTY_CANCELED: '📭 Nebyly nalezeny žádné zrušené rezervace.',
    MASTERS_TITLE: '👩‍🎨 Mistři',
    MASTERS_EMPTY: 'Aktivní mistři zatím nejsou k dispozici.',
    MASTERS_EMPTY_HINT: 'Zkuste to později nebo kontaktujte administrátora.',
    MASTERS_SELECT: 'Vyberte mistra pro zobrazení detailního profilu:',
    MASTERS_PROFILE_TITLE: '👩‍🎨 Profil mistra',
    MASTERS_RATING_LABEL: '⭐ Hodnocení',
    MASTERS_EXPERIENCE_LABEL: '🗓 Praxe',
    MASTERS_EXPERIENCE_NOT_SET: 'Praxe není uvedena',
    MASTERS_EXPERIENCE_YEARS: '{years} let praxe',
    MASTERS_PROCEDURES_LABEL: '📈 Provedené procedury',
    MASTERS_SPECIALIZATION_TITLE: '💼 Specializace',
    MASTERS_SPECIALIZATION_EMPTY: 'Informace budou doplněny brzy.',
    MASTERS_CERTIFICATES_TITLE: '🎓 Certifikáty',
    MASTERS_CERTIFICATES_EMPTY: 'Informace budou doplněny brzy.',
    MASTERS_CONTACTS_TITLE: '📌 Kontakty',
    MASTERS_CONTACT_PHONE: '📱 Telefon',
    MASTERS_CONTACT_EMAIL: '✉️ Email',
    MASTERS_SCHEDULE_TITLE: '🕒 Pracovní rozvrh',
    MASTERS_SCHEDULE_EMPTY: 'Informace o rozvrhu budou doplněny brzy.',
    MASTERS_SCHEDULE_CHANGES_TITLE: '📅 Nejbližší změny rozvrhu',
    MASTERS_SCHEDULE_CHANGES_EMPTY: 'Momentálně nejsou naplánované změny.',
    MASTERS_DAY_OFF: 'volno',
    MASTERS_VACATION: 'dovolená',
    MASTERS_WEEKDAY_FALLBACK: 'Den {weekday}',
    MASTERS_ABOUT_TITLE: '📝 O mistrovi',
    MASTERS_ABOUT_EMPTY: 'Informace budou doplněny brzy.',
    MASTERS_ADDITIONAL_TITLE: '🧴 Doplňující informace',
    MASTERS_ADDITIONAL_EMPTY: 'Není uvedeno.',
    PROFILE_TITLE: '👤 Profil klienta',
    PROFILE_ID: '🪪 ID profilu',
    PROFILE_NAME: '👤 Jméno',
    PROFILE_TELEGRAM: '💬 Telegram',
    PROFILE_PHONE: '📱 Telefon',
    PROFILE_EMAIL: '✉️ Email',
    PROFILE_LANGUAGE: '🌐 Jazyk',
    PROFILE_NOTIFICATIONS: '🔔 Oznámení: správa v sekci "Nastavení oznámení"',
    PROFILE_NOT_SET: 'Neuvedeno',
    PROFILE_VERIFIED: '✅ ověřeno',
    PROFILE_NOT_VERIFIED: '⚪ neověřeno',
    PROFILE_BOOKING_AVAILABLE: '✅ Rezervace je dostupná.',
    PROFILE_BOOKING_RESTRICTED: '⚠️ Rezervace může být omezená, dokud není telefon ověřen.',
    PROFILE_EDIT_NAME: '✏️ Změnit jméno',
    PROFILE_EDIT_EMAIL: '✉️ Změnit email',
    PROFILE_ADD_EMAIL: '➕ Přidat email',
    PROFILE_EDIT_PHONE: '📱 Změnit telefon',
    PROFILE_ADD_PHONE: '➕ Přidat telefon',
    PROFILE_EDIT_LANGUAGE: '🌐 Změnit jazyk',
    PROFILE_VERIFY_EMAIL: '✅ Ověřit email',
    PROFILE_BOOKING_STATUS: '📅 Stav rezervace',
    PROFILE_BOOKING_TITLE: '📅 Stav rezervace',
    PROFILE_BOOKING_UPCOMING_EMPTY: '📭 Aktuálně nemáte žádné aktivní rezervace.',
    PROFILE_BOOKING_UPCOMING_EMPTY_HINT: 'Novou rezervaci vytvoříte přes tlačítko „📅 Rezervace“.',
    PROFILE_BOOKING_UPCOMING_TITLE: '📅 Nejbližší rezervace:',
    PROFILE_BOOKING_LABEL_SERVICE: '💼 Služba',
    PROFILE_BOOKING_LABEL_MASTER: '👩‍🎨 Mistr',
    PROFILE_BOOKING_LABEL_TIME: '🕒 Čas',
    PROFILE_BOOKING_LABEL_PRICE: '💰 Cena',
    PROFILE_BOOKING_LABEL_STATUS: '📌 Stav',
    PROFILE_BOOKING_STATUS_PENDING: '🟡 Čeká na potvrzení',
    PROFILE_BOOKING_STATUS_CONFIRMED: '🟢 Potvrzeno',
    PROFILE_BOOKING_STATUS_CANCELED: '🔴 Zrušeno',
    PROFILE_BOOKING_STATUS_COMPLETED: '🟢 Dokončeno',
    PROFILE_BOOKING_STATUS_TRANSFERRED: '🟣 Přesunuto',
    PROFILE_BOOKING_HISTORY_TITLE: '📖 Historie vašich rezervací',
    PROFILE_BOOKING_HISTORY_EMPTY: '📭 Zatím nemáte dokončené rezervace.',
    PROFILE_BOOKING_VIEW_STATUS: '📅 Zobrazit stav',
    PROFILE_BOOKING_CARD_TITLE: '📄 Karta rezervace',
    PROFILE_BOOKING_ACTION_HINT: 'Vyberte akci pro tuto rezervaci níže.',
    PROFILE_BOOKING_ACTION_DISABLED: '⚠️ Změna nebo zrušení není pro tuto rezervaci dostupné.',
    PROFILE_BOOKING_CANCEL_CONFIRM_TITLE: '⚠️ Potvrzení zrušení',
    PROFILE_BOOKING_CANCEL_CONFIRM_ASK: 'Opravdu chcete zrušit tuto rezervaci?',
    PROFILE_BOOKING_CANCEL_SUCCESS: '✅ Rezervace byla úspěšně zrušena.',
    PROFILE_BOOKING_CANCEL_SUCCESS_HINT: 'Aktualizovaný stav je dostupný v sekci „📅 Stav rezervace“.',
    PROFILE_BOOKING_NOT_FOUND: '⚠️ Rezervace nebyla nalezena',
    PROFILE_BOOKING_ACTION_STUB:
      'Tato akce je už oddělena do samostatného kroku.\n' +
      'Plnou implementaci připojíme v další fázi.',
    PROFILE_BOOKING_BTN_RESCHEDULE: '🔄 Přesunout',
    PROFILE_BOOKING_BTN_CANCEL: '❌ Zrušit rezervaci',
    PROFILE_BOOKING_BTN_VIEW_ALL: '📖 Zobrazit všechny rezervace',
    PROFILE_BOOKING_BTN_CREATE: '📅 Vytvořit rezervaci',
    PROFILE_BOOKING_BTN_CREATE_FIRST: '📅 Vytvořit první rezervaci',
    PROFILE_BOOKING_BTN_BACK_TO_HISTORY: '⬅️ Zpět na seznam',
    PROFILE_BOOKING_BTN_CANCEL_CONFIRM: '✅ Ano, zrušit',
    PROFILE_BOOKING_BTN_CANCEL_ABORT: '❌ Ne, ponechat',
    PROFILE_NOTIFICATION_SETTINGS: '🔔 Nastavení oznámení',
    PROFILE_BTN_CANCEL: '❌ Zrušit',
    PROFILE_OTP_BTN_RESEND: '🔄 Odeslat kód znovu',
    PROFILE_OTP_BTN_CANCEL: '❌ Zrušit',
    BACK_TO_PROFILE: '⬅️ Zpět do profilu',
    HOME: '🏠 Hlavní menu',
    LANGUAGE_UK: '🇺🇦 Ukrajinština',
    LANGUAGE_EN: '🇬🇧 Angličtina',
    LANGUAGE_CS: '🇨🇿 Čeština',
    PROFILE_LANGUAGE_TITLE: '🌐 Změna jazyka',
    PROFILE_LANGUAGE_CURRENT: 'Aktuální jazyk',
    PROFILE_LANGUAGE_CHOOSE: 'Vyberte jazyk rozhraní:',
    PROFILE_LANGUAGE_UPDATED: '✅ Jazyk profilu byl aktualizován',
    PROFILE_STUB_BODY:
      'Tato sekce je už rezervována v logice a aktuálně funguje jako dočasná zástupka.\n' +
      'Plnou implementaci připojíme v dalším kroku.',
    PROFILE_NAME_BLOCKED: '⛔ Změna jména je dočasně nedostupná.\nZkuste to znovu za pár minut.',
    PROFILE_NAME_COOLDOWN:
      '⏳ Jméno jste už změnili během posledních 24 hodin.\n' +
      'Další změna bude dostupná později.',
    PROFILE_NAME_PROMPT:
      '✏️ Změnit jméno\n\n' +
      'Zadejte nové jméno, které bude použito pro rezervace.\n\n' +
      'Jméno musí být reálné a odpovídat osobě, která přijde na proceduru.\n\n' +
      '⚠️ Upozornění: jméno lze změnit jen jednou za 24 hodin.',
    PROFILE_NAME_INVALID: '⚠️ Neplatné jméno.\nPoužijte pouze písmena a minimálně 2 znaky.',
    PROFILE_NAME_UPDATED: '✅ Jméno bylo úspěšně změněno.',
    PROFILE_NAME_UPDATED_VALUE: 'Nové jméno',
    PROFILE_NAME_CANCELLED: '❌ Změna jména byla zrušena.',
    PROFILE_EMAIL_ADD_PROMPT:
      '➕ Přidat email\n\n' +
      'Zadejte email pro svůj profil.\n\n' +
      'Požadavky:\n' +
      '• platný formát emailu\n' +
      '• od 5 do 100 znaků',
    PROFILE_EMAIL_INVALID: '⚠️ Neplatný formát emailu. Zkuste to znovu.',
    PROFILE_EMAIL_ALREADY_USED: '⚠️ Tento email už používá jiný uživatel.',
    PROFILE_EMAIL_ADDED_TITLE: '✅ Email byl úspěšně přidán.',
    PROFILE_EMAIL_ADDED_VALUE: 'Email',
    PROFILE_EMAIL_ADDED_HINT: 'Nyní jej můžete ověřit tlačítkem „✅ Ověřit email“.',
    PROFILE_EMAIL_ADD_CANCELLED: '❌ Přidání emailu bylo zrušeno.',
    PROFILE_NOTIFICATION_TITLE: '🔔 Nastavení oznámení',
    PROFILE_NOTIFICATION_CHOOSE: 'Vyberte typy oznámení, které chcete dostávat:',
    PROFILE_NOTIFICATION_BOOKING_CONFIRMATION: '📩 Potvrzení rezervace',
    PROFILE_NOTIFICATION_VISIT_REMINDER: '🔔 Připomínka návštěvy',
    PROFILE_NOTIFICATION_STATUS_CHANGE: '🔄 Změny stavu rezervace',
    PROFILE_NOTIFICATION_PROMO: '📢 Akce a novinky',
    PROFILE_NOTIFICATION_DELIVERY:
      'Telegram oznámení chodí vždy, když je typ zapnutý.\n' +
      'Email/SMS chodí jen pro ověřené kontakty.',
    PROFILE_NOTIFICATION_ALL_ON: '🔄 Zapnout vše',
    PROFILE_NOTIFICATION_ALL_OFF: '🔕 Vypnout vše',
    PROFILE_NOTIFICATION_UPDATED: 'Nastavení aktualizováno ✅',
    COMMON_BACK: '⬅️ Zpět',
    SERVICES_TITLE: '💼 Služby',
    SERVICES_EMPTY: 'Aktuálně nejsou dostupné žádné aktivní služby.',
    SERVICES_EMPTY_HINT: 'Zkuste to později nebo kontaktujte administrátora.',
    SERVICES_SELECT: 'Vyberte službu pro zobrazení detailu:',
    SERVICES_DURATION: 'Doba trvání',
    SERVICES_PRICE: 'Cena',
    SERVICES_DETAILS_TITLE: '📄 Detail služby',
    SERVICES_LABEL_SERVICE: '💼 Služba',
    SERVICES_LABEL_DURATION: '⏱ Doba trvání',
    SERVICES_LABEL_PRICE: '💰 Cena',
    SERVICES_RESULT_TITLE: '🎯 Výsledek',
    SERVICES_STEPS_TITLE: '✨ Jak probíhá procedura',
    SERVICES_STEPS_EMPTY: 'Informace o krocích budou doplněny brzy.',
    SERVICES_GUARANTEES_TITLE: '🛡 Záruky',
    SERVICES_GUARANTEES_EMPTY: 'Informace o zárukách budou doplněny brzy.',
    FAQ_TITLE: '❓ FAQ — Často kladené otázky',
    FAQ_EMPTY: 'Sekce FAQ je momentálně prázdná.',
    FAQ_EMPTY_HINT: 'Zkuste to později nebo kontaktujte administrátora.',
    FAQ_SELECT_HINT: 'Pro detailní informace vyberte číslo otázky.',
    FAQ_QUESTION: '❓ Otázka',
    FAQ_ANSWER: '✅ Odpověď',
    BOOKING_STEP_1_TITLE: '📅 Rezervace — krok 1/5',
    BOOKING_STEP_2_TITLE: '📅 Rezervace — krok 2/5',
    BOOKING_STEP_3_TITLE: '📅 Rezervace — krok 3/5',
    BOOKING_STEP_4_TITLE: '📅 Rezervace — krok 4/5',
    BOOKING_STEP_5_TITLE: '📅 Rezervace — krok 5/5',
    BOOKING_NO_SERVICES: 'Aktuálně nejsou dostupné aktivní služby pro rezervaci.',
    BOOKING_NO_SERVICES_HINT: 'Zkuste to později nebo kontaktujte administrátora.',
    BOOKING_SELECT_SERVICE: 'Vyberte službu pro rezervaci.',
    BOOKING_LABEL_SERVICE: '💼 Služba',
    BOOKING_LABEL_DATE: '📆 Datum',
    BOOKING_LABEL_TIME: '⏰ Čas',
    BOOKING_SELECT_DATE: 'Vyberte datum návštěvy.',
    BOOKING_SELECT_TIME: 'Vyberte vhodný čas.',
    BOOKING_NO_SLOTS: '⚠️ Pro toto datum nejsou volné sloty. Vyberte jiné datum.',
    BOOKING_NO_MASTERS: 'Bohužel pro tuto službu teď nejsou dostupní mistři.',
    BOOKING_SELECT_MASTER: 'Vyberte mistra.',
    BOOKING_PROFILE_NAME: '👤 Jméno z profilu',
    BOOKING_PHONE_MISSING: '📱 Telefonní číslo v profilu není přidané.',
    BOOKING_PHONE_ENTER: 'Pošlete prosím telefonní číslo ve formátu +420123456789.',
    BOOKING_PROFILE_PHONE: '📱 Telefon v profilu',
    BOOKING_PHONE_UNVERIFIED:
      '⚠️ Vaše telefonní číslo je přidané, ale neověřené.\n' +
      'Vyberte akci: přejít do profilu nebo použít neověřené číslo.',
    BOOKING_CONFIRM_TITLE: '✅ Potvrzení rezervace',
    BOOKING_LABEL_MASTER: '👩‍🎨 Mistr',
    BOOKING_LABEL_DATETIME: '📆 Datum a čas',
    BOOKING_LABEL_CLIENT: '👤 Klient',
    BOOKING_LABEL_PHONE: '📱 Telefon',
    BOOKING_CONFIRM_ASK: 'Potvrdit vytvoření rezervace?',
    BOOKING_SUCCESS_TITLE: '🎉 Vaše rezervace byla úspěšně vytvořena',
    BOOKING_RECORD_ID: '🆔 ID rezervace',
    BOOKING_STATUS_PENDING: 'Stav: 🟡 Čeká na potvrzení mistrem.',
    BOOKING_BTN_CANCEL: '❌ Zrušit rezervaci',
    BOOKING_BTN_GO_PROFILE: '👤 Přejít do profilu',
    BOOKING_BTN_USE_UNVERIFIED: '📱 Použít neověřené číslo',
    BOOKING_BTN_CONFIRM: '✅ Potvrdit',
    BOOKING_BTN_CHANGE: '✏️ Změnit',
    BOOKING_CANCELLED: 'Rezervace byla zrušena.',
    BOOKING_TEXT_USE_BUTTONS: 'Pro pokračování použijte tlačítka níže.',
    BOOKING_TEXT_EXPECT_PHONE: 'Očekávám textovou zprávu s telefonním číslem.',
    BOOKING_TEXT_INVALID_PHONE: '⚠️ Neplatné telefonní číslo. Příklad: +420123456789',
    BOOKING_TEXT_PHONE_NOT_IN_PROFILE: 'V profilu není telefonní číslo.',
    BOOKING_TEXT_BACK_STEP: '⬅️ Vracíme se na předchozí krok.',
    BOOKING_ERROR_FALLBACK: '⚠️ Rezervaci se nepodařilo dokončit. Zkontrolujte údaje a zkuste to znovu.',
    BOOKING_EMAIL_SENT:
      '📧 Poslali jsme email: rezervace je vytvořena a čeká na potvrzení.\n' +
      'Po potvrzení mistrem dostanete další email.',
    BOOKING_RESCHEDULE_TEXT:
      '🔄 Přesun rezervace\n\n' +
      'Vybraná rezervace: {serviceName} ({dateTime}).\n' +
      'Vyberte nové datum a čas v rezervačním scénáři.',
    BOOKING_CANCEL_REASON_PROFILE: 'Zrušeno přes Telegram bota',
    BOOKING_CLIENT_FALLBACK: 'Klient',
    HELP_TEXT:
      'Seznam příkazů:\n' +
      '/start - hlavní menu\n' +
      '/menu - zobrazit hlavní menu\n' +
      '/master - otevřít panel mistra\n' +
      '/admin - otevřít admin panel\n' +
      '/booking - spustit rezervaci\n' +
      '/cancel - ukončit aktivní scénář',
    NO_ACTIVE_SCENARIO: 'Aktuálně není aktivní scénář ke zrušení.',
    SCENARIO_CANCELLED: 'Scénář byl zrušen.',
    FALLBACK_USE_MENU: 'Použijte /menu pro otevření hlavního menu.',
    OTP_EMAIL_CODE_SENT:
      '✉️ Ověřovací kód byl odeslán.\n' +
      'Email: {email}\n\n' +
      'Zadejte 6místný kód z emailu.\n' +
      'Kód je platný 5 minut.',
    OTP_EMAIL_ALREADY_VERIFIED: '✅ Email je už ověřen.',
    OTP_EMAIL_MISSING: '⚠️ Email není uveden. Nejprve přidejte email v profilu.',
    OTP_EMAIL_INVALID_CODE: '⚠️ Neplatný OTP kód. Zkontrolujte a zkuste to znovu.',
    OTP_EMAIL_EXPIRED: '⌛ Platnost kódu vypršela. Odešlete kód znovu.',
    OTP_EMAIL_BLOCKED: '⛔ Příliš mnoho neplatných pokusů. Zkuste to znovu za 5 minut.',
    OTP_EMAIL_RESEND_COOLDOWN: '⏱ Opětovné odeslání bude dostupné za {seconds} s.',
    OTP_EMAIL_VERIFIED: '✅ Email byl úspěšně ověřen.\nOvěřený email: {email}',
    OTP_EMAIL_CANCELLED: '❌ Ověření emailu bylo zrušeno.',
    OTP_EMAIL_MAILER_NOT_CONFIGURED:
      '⚙️ Email služba dočasně není nakonfigurovaná.\nKontaktujte administrátora nebo to zkuste později.',
    OTP_EMAIL_SEND_FAILED: '⚠️ Nepodařilo se odeslat ověřovací kód. Zkuste to znovu později.',
  },
} as const;

type BotDictionaryMap = Record<BotUiLanguage, Record<string, string>>;

function mergePanelDictionaries(...dictionaries: BotDictionaryMap[]): BotDictionaryMap {
  return {
    uk: Object.assign({}, ...dictionaries.map((dictionary) => dictionary.uk)),
    en: Object.assign({}, ...dictionaries.map((dictionary) => dictionary.en)),
    cs: Object.assign({}, ...dictionaries.map((dictionary) => dictionary.cs)),
  };
}

function keepOnlyMissingLegacyKeys(
  legacy: BotDictionaryMap,
  panel: BotDictionaryMap,
): BotDictionaryMap {
  const panelKeys = new Set(Object.keys(panel.uk));

  const pickMissing = (languageMap: Record<string, string>): Record<string, string> =>
    Object.fromEntries(
      Object.entries(languageMap).filter(([key]) => !panelKeys.has(key)),
    );

  return {
    uk: pickMissing(legacy.uk),
    en: pickMissing(legacy.en),
    cs: pickMissing(legacy.cs),
  };
}

const BOT_PANEL_DICTIONARY = mergePanelDictionaries(
  COMMON_PANEL_DICTIONARY as BotDictionaryMap,
  MAIN_PANEL_DICTIONARY as BotDictionaryMap,
  ADMIN_PANEL_DICTIONARY as BotDictionaryMap,
  MASTER_PANEL_DICTIONARY as BotDictionaryMap,
);

const BOT_LEGACY_FALLBACK_DICTIONARY = keepOnlyMissingLegacyKeys(
  BOT_LEGACY_DICTIONARY as BotDictionaryMap,
  BOT_PANEL_DICTIONARY,
);

const BOT_DICTIONARY = mergePanelDictionaries(
  BOT_LEGACY_FALLBACK_DICTIONARY,
  BOT_PANEL_DICTIONARY,
);

export type BotDictionaryKey = keyof (typeof BOT_DICTIONARY)['uk'];

/**
 * @summary Повертає UI-мову з урахуванням feature-gate перекладу.
 */
export function resolveBotUiLanguage(language?: LanguageCode | null): BotUiLanguage {
  return resolveFeatureGatedUiLanguage(language);
}

/**
 * @summary Повертає текст словника за ключем.
 */
export function tBot(language: BotUiLanguage, key: BotDictionaryKey): string {
  const dictionary = BOT_DICTIONARY[language] as Record<BotDictionaryKey, string>;
  const fallbackDictionary = BOT_DICTIONARY.uk as Record<BotDictionaryKey, string>;
  return dictionary[key] ?? fallbackDictionary[key];
}

/**
 * @summary Повертає текст словника з підстановкою шаблонів виду `{name}`.
 */
export function tBotTemplate(
  language: BotUiLanguage,
  key: BotDictionaryKey,
  params: Record<string, string | number>,
): string {
  let text = tBot(language, key);
  for (const [paramKey, paramValue] of Object.entries(params)) {
    text = text.replaceAll(`{${paramKey}}`, String(paramValue));
  }
  return text;
}

/**
 * @summary Повертає локалізований label мови.
 */
export function getLanguageLabel(language: LanguageCode, uiLanguage: BotUiLanguage): string {
  if (language === 'en') return tBot(uiLanguage, 'LANGUAGE_EN');
  if (language === 'cs') return tBot(uiLanguage, 'LANGUAGE_CS');
  return tBot(uiLanguage, 'LANGUAGE_UK');
}
