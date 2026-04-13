/**
 * @file custom-data.seed.ts
 * @summary Централізований SQL seed (custom data) для базового наповнення БД.
 */

export const SQL_CUSTOM_DATA_UP = `
-- ===== studios =====
INSERT INTO studios (id, name, city, address_line, phone_e164, email, timezone, currency_code, is_active)
VALUES
  (1001, 'Nail Studio Prague', 'Prague', 'Vinohradska 120', '+420777111222', 'studio.prague@example.com', 'Europe/Prague', 'CZK', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ===== app_users =====
INSERT INTO app_users (
  id, studio_id, telegram_user_id, telegram_username, first_name, last_name, phone_e164, phone_verified_at,
  email, email_verified_at, preferred_language, timezone, is_active
)
VALUES
  (2001, 1001, 9000000001, 'client_seed', 'Olena', 'Client', '+420601111111', now(), 'olena.client@example.com', now(), 'uk', 'Europe/Prague', TRUE),
  (2002, 1001, 9000000002, 'master_seed', 'Anna', 'Master', '+420602222222', now(), 'anna.master@example.com', now(), 'uk', 'Europe/Prague', TRUE),
  (2003, 1001, 9000000003, 'admin_seed', 'Ihor', 'Admin', '+420603333333', now(), 'ihor.admin@example.com', now(), 'uk', 'Europe/Prague', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ===== user_roles =====
INSERT INTO user_roles (user_id, role, granted_by)
VALUES
  (2001, 'client', 2003),
  (2002, 'master', 2003),
  (2003, 'admin', 2003)
ON CONFLICT (user_id, role) DO NOTHING;

-- ===== studio_global_settings =====
INSERT INTO studio_global_settings (
  studio_id, booking_horizon_days, min_cancel_notice_hours, reminder_before_hours, slot_step_minutes,
  allow_booking_without_phone_verification, no_show_limit, default_language
)
VALUES
  (1001, 60, 24, 24, 30, FALSE, 3, 'uk')
ON CONFLICT (studio_id) DO NOTHING;

-- ===== masters =====
INSERT INTO masters (
  user_id, studio_id, display_name, bio, experience_years, procedures_done_total, rating_avg, rating_count,
  started_on, materials_info, contact_phone_e164, contact_email, is_bookable
)
VALUES
  (2002, 1001, 'Anna Master', 'Професійний майстер манікюру', 6, 3200, 4.90, 180, '2020-01-10',
   'Преміальні сертифіковані матеріали', '+420602222222', 'anna.master@example.com', TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- ===== master_certificates =====
INSERT INTO master_certificates (id, master_id, title, issuer, issued_on, document_url)
VALUES
  (3001, 2002, 'Сертифікат апаратного манікюру', 'Beauty Academy', '2021-03-20', 'https://example.com/cert/3001')
ON CONFLICT (id) DO NOTHING;

-- ===== services =====
INSERT INTO services (
  id, studio_id, name, description, duration_minutes, base_price, currency_code, result_description, is_active
)
VALUES
  (4001, 1001, 'Манікюр класичний', 'Базовий догляд за нігтями', 60, 650.00, 'CZK', 'Охайні нігті та доглянута кутикула', TRUE),
  (4002, 1001, 'Покриття гель-лак', 'Стійке покриття гель-лаком', 90, 890.00, 'CZK', 'Стійкий блиск та захист нігтів', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ===== service_steps =====
INSERT INTO service_steps (service_id, step_no, title, description, duration_minutes)
VALUES
  (4001, 1, 'Підготовка', 'Очищення та підготовка нігтів', 15),
  (4001, 2, 'Обробка', 'Формування та обробка кутикули', 30),
  (4001, 3, 'Фініш', 'Завершальний догляд', 15),
  (4002, 1, 'Підготовка', 'Підготовка нігтів до покриття', 20),
  (4002, 2, 'Нанесення', 'Нанесення бази, кольору, топу', 50),
  (4002, 3, 'Завершення', 'Фінальна обробка та рекомендації', 20)
ON CONFLICT (service_id, step_no) DO NOTHING;

-- ===== service_guarantees =====
INSERT INTO service_guarantees (service_id, guarantee_no, guarantee_text, valid_days)
VALUES
  (4001, 1, 'Гарантія якості обробки', 3),
  (4002, 1, 'Гарантія стійкості покриття', 7)
ON CONFLICT (service_id, guarantee_no) DO NOTHING;

-- ===== master_services =====
INSERT INTO master_services (studio_id, master_id, service_id, custom_price, custom_duration_minutes, is_active)
VALUES
  (1001, 2002, 4001, NULL, NULL, TRUE),
  (1001, 2002, 4002, NULL, NULL, TRUE)
ON CONFLICT (studio_id, master_id, service_id) DO NOTHING;

-- ===== studio_weekly_hours =====
INSERT INTO studio_weekly_hours (studio_id, weekday, is_open, open_time, close_time)
VALUES
  (1001, 1, TRUE, '09:00', '19:00'),
  (1001, 2, TRUE, '09:00', '19:00'),
  (1001, 3, TRUE, '09:00', '19:00'),
  (1001, 4, TRUE, '09:00', '19:00'),
  (1001, 5, TRUE, '09:00', '19:00'),
  (1001, 6, TRUE, '10:00', '16:00'),
  (1001, 7, FALSE, NULL, NULL)
ON CONFLICT (studio_id, weekday) DO NOTHING;

-- ===== studio_days_off =====
INSERT INTO studio_days_off (id, studio_id, off_date, reason, created_by)
VALUES
  (5001, 1001, DATE '2027-01-01', 'Новорічний вихідний', 2003)
ON CONFLICT (id) DO NOTHING;

-- ===== studio_holidays =====
INSERT INTO studio_holidays (id, studio_id, holiday_date, holiday_name, created_by)
VALUES
  (5002, 1001, DATE '2027-12-24', 'Christmas Eve', 2003)
ON CONFLICT (id) DO NOTHING;

-- ===== studio_temporary_hours =====
INSERT INTO studio_temporary_hours (
  id, studio_id, date_from, date_to, weekday, is_open, open_time, close_time, note, created_by
)
VALUES
  (5003, 1001, DATE '2027-08-01', DATE '2027-08-31', 6, TRUE, '09:00', '14:00', 'Літній графік суботи', 2003)
ON CONFLICT (id) DO NOTHING;

-- ===== master_weekly_hours =====
INSERT INTO master_weekly_hours (master_id, weekday, is_working, open_time, close_time)
VALUES
  (2002, 1, TRUE, '09:00', '18:00'),
  (2002, 2, TRUE, '09:00', '18:00'),
  (2002, 3, TRUE, '09:00', '18:00'),
  (2002, 4, TRUE, '09:00', '18:00'),
  (2002, 5, TRUE, '09:00', '18:00'),
  (2002, 6, TRUE, '10:00', '15:00'),
  (2002, 7, FALSE, NULL, NULL)
ON CONFLICT (master_id, weekday) DO NOTHING;

-- ===== master_days_off =====
INSERT INTO master_days_off (id, master_id, off_date, reason, created_by)
VALUES
  (5004, 2002, DATE '2027-02-14', 'Особистий вихідний', 2002)
ON CONFLICT (id) DO NOTHING;

-- ===== master_vacations =====
INSERT INTO master_vacations (id, master_id, date_from, date_to, reason, created_by)
VALUES
  (5005, 2002, DATE '2027-07-10', DATE '2027-07-20', 'Літня відпустка', 2002)
ON CONFLICT (id) DO NOTHING;

-- ===== master_temporary_hours =====
INSERT INTO master_temporary_hours (
  id, master_id, date_from, date_to, weekday, is_working, open_time, close_time, note, created_by
)
VALUES
  (5006, 2002, DATE '2027-09-01', DATE '2027-09-30', 3, TRUE, '11:00', '19:00', 'Осінній тимчасовий графік', 2002)
ON CONFLICT (id) DO NOTHING;

-- ===== studio_content_blocks =====
INSERT INTO studio_content_blocks (studio_id, block_key, language, content, updated_by)
VALUES
  (1001, 'about', 'uk', 'Ми працюємо за попереднім записом у комфортній атмосфері.', 2003),
  (1001, 'booking_rules', 'uk', 'Запис вважається активним після підтвердження майстром.', 2003)
ON CONFLICT (studio_id, block_key, language) DO NOTHING;

-- ===== faq_entries =====
INSERT INTO faq_entries (id, studio_id, sort_order, is_active)
VALUES
  (6001, 1001, 1, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ===== faq_entry_translations =====
INSERT INTO faq_entry_translations (faq_id, language, question, answer)
VALUES
  (6001, 'uk', 'Як скасувати запис?', 'Скасувати можна в боті не пізніше ніж за 24 години.')
ON CONFLICT (faq_id, language) DO NOTHING;

-- ===== user_notification_settings =====
INSERT INTO user_notification_settings (user_id, notification_type, enabled)
VALUES
  (2001, 'booking_confirmation', TRUE),
  (2001, 'status_change', TRUE),
  (2001, 'visit_reminder', TRUE),
  (2001, 'promo_news', FALSE)
ON CONFLICT (user_id, notification_type) DO NOTHING;

-- ===== verification_codes =====
INSERT INTO verification_codes (
  id, user_id, channel, purpose, destination, code_hash,
  attempts_used, max_attempts, expires_at, consumed_at, last_sent_at, created_at
)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    2001,
    'email',
    'email_verify',
    'olena.client@example.com',
    'seed_code_hash_1',
    0,
    3,
    now() + interval '10 minutes',
    NULL,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ===== rate_limit_buckets =====
INSERT INTO rate_limit_buckets (
  id, subject_type, subject_key, action_key, window_started_at, window_ends_at,
  attempts, max_attempts, blocked_until
)
VALUES
  (7001, 'user', '2001', 'booking_create', now() - interval '5 minutes', now() + interval '55 minutes', 1, 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== appointments =====
INSERT INTO appointments (
  id, studio_id, client_id, booked_for_user_id, master_id, service_id, source, status,
  attendee_name, attendee_phone_e164, attendee_email, client_comment, internal_comment,
  start_at, end_at, price_amount, currency_code, created_by, updated_by, confirmed_at,
  canceled_at, completed_at, transferred_at, canceled_reason, deleted_at, deleted_by
)
VALUES
  (
    8001, 1001, 2001, NULL, 2002, 4001, 'telegram_bot', 'confirmed',
    'Olena Client', '+420601111111', 'olena.client@example.com', 'Перший візит', NULL,
    now() + interval '2 days', now() + interval '2 days 1 hour',
    650.00, 'CZK', 2001, 2002, now(), NULL, NULL, NULL, NULL, NULL, NULL
  ),
  (
    8002, 1001, 2001, NULL, 2002, 4002, 'telegram_bot', 'transferred',
    'Olena Client', '+420601111111', 'olena.client@example.com', NULL, 'Перенесено адміністратором',
    now() + interval '7 days', now() + interval '7 days 1 hour 30 minutes',
    890.00, 'CZK', 2001, 2003, now(), NULL, NULL, now(), NULL, NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ===== appointment_transfers =====
INSERT INTO appointment_transfers (id, from_appointment_id, to_appointment_id, transferred_by, reason)
VALUES
  (9001, 8001, 8002, 2003, 'Перенесення на зручніший час')
ON CONFLICT (id) DO NOTHING;

-- ===== appointment_status_history =====
INSERT INTO appointment_status_history (id, appointment_id, old_status, new_status, changed_by, comment)
VALUES
  (9002, 8001, NULL, 'confirmed', 2002, 'initial status'),
  (9003, 8002, 'confirmed', 'transferred', 2003, 'Перенесено')
ON CONFLICT (id) DO NOTHING;

-- ===== appointment_financials =====
INSERT INTO appointment_financials (
  appointment_id, payment_status, amount_total, amount_paid, salon_share_amount, master_share_amount, paid_at, payment_method
)
VALUES
  (8001, 'unpaid', 650.00, 0, 390.00, 260.00, NULL, NULL),
  (8002, 'partially_paid', 890.00, 300.00, 500.00, 300.00, NULL, 'card')
ON CONFLICT (appointment_id) DO NOTHING;

-- ===== appointment_reviews =====
INSERT INTO appointment_reviews (appointment_id, client_id, master_id, rating, review_text)
VALUES
  (8001, 2001, 2002, 5, 'Дуже задоволена сервісом')
ON CONFLICT (appointment_id) DO NOTHING;

-- ===== notification_queue =====
INSERT INTO notification_queue (
  id, user_id, appointment_id, notification_type, channel, status, payload, scheduled_for, sent_at, attempts, last_error
)
VALUES
  (
    9101, 2001, 8001, 'visit_reminder', 'telegram', 'pending',
    '{"message":"Нагадування про візит"}'::jsonb, now() + interval '1 day', NULL, 0, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ===== audit_logs =====
INSERT INTO audit_logs (id, actor_user_id, entity_type, entity_id, action, payload)
VALUES
  (9201, 2003, 'appointment', '8002', 'transfer', '{"reason":"Перенесення на інший час"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
`;

export const SQL_CUSTOM_DATA_DOWN = `
DELETE FROM audit_logs WHERE id = 9201;
DELETE FROM notification_queue WHERE id = 9101;
DELETE FROM appointment_reviews WHERE appointment_id IN (8001);
DELETE FROM appointment_financials WHERE appointment_id IN (8001, 8002);
DELETE FROM appointment_status_history WHERE id IN (9002, 9003);
DELETE FROM appointment_transfers WHERE id = 9001;
DELETE FROM appointments WHERE id IN (8001, 8002);
DELETE FROM rate_limit_buckets WHERE id = 7001;
DELETE FROM verification_codes WHERE id = '11111111-1111-4111-8111-111111111111';
DELETE FROM user_notification_settings WHERE user_id = 2001;
DELETE FROM faq_entry_translations WHERE faq_id = 6001 AND language = 'uk';
DELETE FROM faq_entries WHERE id = 6001;
DELETE FROM studio_content_blocks WHERE studio_id = 1001 AND block_key IN ('about', 'booking_rules') AND language = 'uk';
DELETE FROM master_temporary_hours WHERE id = 5006;
DELETE FROM master_vacations WHERE id = 5005;
DELETE FROM master_days_off WHERE id = 5004;
DELETE FROM master_weekly_hours WHERE master_id = 2002;
DELETE FROM studio_temporary_hours WHERE id = 5003;
DELETE FROM studio_holidays WHERE id = 5002;
DELETE FROM studio_days_off WHERE id = 5001;
DELETE FROM studio_weekly_hours WHERE studio_id = 1001;
DELETE FROM master_services WHERE studio_id = 1001 AND master_id = 2002 AND service_id IN (4001, 4002);
DELETE FROM service_guarantees WHERE service_id IN (4001, 4002);
DELETE FROM service_steps WHERE service_id IN (4001, 4002);
DELETE FROM services WHERE id IN (4001, 4002);
DELETE FROM master_certificates WHERE id = 3001;
DELETE FROM masters WHERE user_id = 2002;
DELETE FROM studio_global_settings WHERE studio_id = 1001;
DELETE FROM user_roles WHERE user_id IN (2001, 2002, 2003) AND role IN ('client', 'master', 'admin');
DELETE FROM app_users WHERE id IN (2001, 2002, 2003);
DELETE FROM studios WHERE id = 1001;
`;
