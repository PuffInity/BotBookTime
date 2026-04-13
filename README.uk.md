# BotBook

Telegram-орієнтований backend для салону краси з бронюванням, профілями, панелями ролей і сповіщеннями.

# 1. Назва проєкту + короткий опис
**BotBook** — production-oriented Telegram bot backend на Node.js/TypeScript для керування записами, профілями користувачів, майстрами, послугами, FAQ, сповіщеннями та ролями (client/master/admin).

---

# 2. Про проєкт
Проєкт реалізує бізнес-логіку салону в Telegram-інтерфейсі (Telegraf scenes + inline/reply navigation) та підтримує:
- життєвий цикл застосунку (startup/shutdown/process handlers),
- стійку роботу з PostgreSQL і Redis,
- багатомовний UI (uk/en/cs) з feature-gate,
- автопереклад контенту БД (Google Translate API + Redis cache),
- email/SMS/Telegram канали сповіщень,
- регулярні воркери (нагадування, прострочені pending записи),
- ops-скрипти для адміністрування і health-check.

---

# 3. Для кого підходить
- Команди, що будують Telegram-first booking систему.
- Невеликі/середні салони з ролями клієнт/майстер/адмін.
- Проєкти, де потрібні керовані міграції, CLI-операції та контрольовані сповіщення.

---

# 4. Архітектура
### Frontend
- Окремий web/frontend шар у репозиторії відсутній.
- Користувацький інтерфейс реалізовано в Telegram через `Telegraf` scenes, inline/reply кнопки та view-helpers.

### Backend
- Runtime: Node.js + TypeScript (`ES2022`, `NodeNext`).
- Bot engine: `telegraf`.
- Data: PostgreSQL (`pg`) + Redis (`redis`).
- Validation: `zod` (ENV і user input).
- Logging: `winston` (через централізовані loggers).
- Error handling: уніфікований адаптер/нормалізація помилок.
- Domain layers:
  - `helpers/db/*` — доступ до БД,
  - `helpers/db-sql/*` — SQL-константи,
  - `helpers/bot/*` — UI/render/navigation/i18n,
  - `bot/scenes/*`, `bot/commands/*` — сценарії та команди.

### Інфраструктура
- PostgreSQL: основне сховище доменної моделі.
- Redis: сесії Telegraf, OTP/rate-limits, кэш перекладів, технічні маркери воркерів.
- SMTP (Nodemailer): email-сповіщення/OTP.
- Twilio (опційно): SMS-OTP (feature availability через ENV).
- Cron workers (`node-cron`):
  - auto-cancel прострочених pending бронювань,
  - reminder-розсилка перед візитом.

---

# 5. Основний функціонал
- Telegram flow:
  - `/start`, `/help`, `/menu`, `/booking`, `/master`, `/admin`, `/cancel`.
- Профіль користувача:
  - get-or-create по Telegram ID,
  - редагування імені,
  - email/phone з OTP-підтвердженням,
  - налаштування каналів сповіщень.
- Бронювання:
  - вибір послуги → дати → часу → майстра,
  - перевірка доступності по графіках і зайнятих слотах,
  - створення pending-запису,
  - cancel/reschedule user flows.
- Майстер-панель:
  - розклад, вихідні/відпустки/тимчасові зміни,
  - перегляд записів, профілів клієнтів, статистики.
- Адмін-панель:
  - керування записами, майстрами, послугами, FAQ, доступами.
- Сповіщення:
  - telegram/email/sms routing по політиках і user settings,
  - локалізація payload під мову користувача.
- I18n:
  - словники `common/main/admin/master`,
  - runtime translation для контенту БД.

---

# 6. Огляд API
HTTP REST API у проєкті не реалізований. Інтеграційні поверхні:
- **Telegram Bot API**: вхідні updates (`message`, `callback_query`), команди і scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

---

# 7. Структура репозиторію
```text
botbook/
├─ src/
│  ├─ bot/
│  │  ├─ commands/
│  │  ├─ scenes/
│  │  └─ createBot.ts
│  ├─ config/
│  ├─ emails/templates/
│  ├─ helpers/
│  │  ├─ bot/
│  │  ├─ db/
│  │  ├─ db-sql/
│  │  ├─ email/
│  │  ├─ notification/
│  │  ├─ otp/
│  │  ├─ redis/
│  │  └─ translate/
│  ├─ migration/
│  │  ├─ migrate-files/
│  │  └─ *.migration.ts
│  ├─ scripts/
│  ├─ startup/
│  │  └─ life-cycle/
│  ├─ types/
│  ├─ utils/
│  ├─ validator/
│  └─ index.ts
├─ dist/
├─ logs/
├─ .env.example
├─ package.json
└─ tsconfig.json
```

---

# 8. Вимоги до середовища
- Node.js 18+ (рекомендовано LTS).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP акаунт для email.
- (Опційно) Twilio акаунт для SMS OTP.
- (Опційно) Google Cloud Translation API key для runtime-перекладу.

---

# 9. Встановлення з GitHub
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

---

# 10. Налаштування середовища (.env)
1. Скопіюйте шаблон:
```bash
cp .env.example .env
```
2. Мінімум для запуску:
- `BOT_TOKEN`
- `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_TTL`, `REDIS_TOUCH`
- SMTP-блок (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, таймаути/pool)

3. Опційні фічі:
- Переклад:
  - `TRANSLATE_ENABLED=true`
  - `TRANSLATE_PROVIDER=google`
  - `GOOGLE_TRANSLATE_API_KEY=...`
- Twilio SMS OTP:
  - `TWILIO_ACCOUNT_SID=...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=...`

> Якщо Twilio ENV відсутні, SMS OTP вважається недоступним, інші канали працюють.

---

# 11. Запуск проєкту
### Development
```bash
npm run dev
```

### Production build + run
```bash
npm run build
npm run start
```

---

# 12. Міграції та адміністратор
### Міграції
```bash
npm run migrate
npm run migration:status
npm run rollback
```

### Видача/зняття ролей
```bash
npm run ops -- grant-admin --telegram-id=<ID>
npm run ops -- revoke-admin --telegram-id=<ID>
npm run ops -- grant-master --telegram-id=<ID>
```

---

# 13. Локальний запуск (опційно)
Приклад швидкого Redis локально:
```bash
docker run -d --name bot-redis -p 6379:6379 redis:7
```
Далі:
1. Підняти PostgreSQL локально.
2. Заповнити `.env`.
3. Виконати міграції.
4. Запустити `npm run dev`.

---

# 14. Обмеження завантажень (Upload)
У поточній реалізації механізм file upload відсутній (немає HTTP upload endpoint або middleware для файлів). Секція зарезервована для майбутнього розширення.

---

# 15. Безпека
- Валідація input/ENV через `zod`.
- Рольова модель `client/master/admin`.
- OTP-потоки з TTL, resend cooldown, лімітами спроб і блокуванням.
- Нормалізація помилок без витоку внутрішніх деталей для непривілейованих користувачів.
- Централізоване логування критичних дій (admin/master operations).
- Опційні інтеграції (Twilio/Translate) керуються feature-gate.

---

# 16. Робочий процес контент-менеджера
Базовий операційний workflow:
1. Перевірити статус інфраструктури: `npm run ops -- health-check`.
2. Застосувати міграції: `npm run migrate`.
3. За потреби додати seed-дані: `npm run ops -- seed-custom-data`.
4. Надати ролі адміну/майстру через `ops` команди.
5. Керувати контентом через адмін-панель у Telegram (FAQ, послуги, майстри, записи).
6. Моніторити логи в `logs/`.

---

# 17. Вирішення проблем (Troubleshooting)
- **Бот не стартує**: перевірити `BOT_TOKEN`, PostgreSQL/Redis доступність, `npm run ops -- health-check`.
- **Помилки міграцій**: перевірити DB credentials і права користувача БД.
- **SMS недоступні**: перевірити Twilio ENV; без них SMS-канал відключається.
- **Переклад не працює**: перевірити `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, доступ до Redis cache.
- **Email не відправляються**: перевірити SMTP credentials, `SMTP_SECURE/PORT`, та `MAIL_FROM`.

---

# 18. Ліцензія
MIT License
---
