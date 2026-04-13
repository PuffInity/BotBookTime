# BotBook

Telegram-орієнтований backend для салону краси: онлайн-бронювання, профілі клієнтів/майстрів, адмін-панель, сповіщення та операційні скрипти.

---

## Українська

## 1. Назва проєкту + короткий опис
**BotBook** — production-oriented Telegram bot backend на Node.js/TypeScript для керування записами, профілями користувачів, майстрами, послугами, FAQ, сповіщеннями та ролями (client/master/admin).

## 2. Про проєкт
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

## 4. Архітектура
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

## 5. Основний функціонал
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

## 6. Огляд API
HTTP REST API у проєкті не реалізований. Інтеграційні поверхні:
- **Telegram Bot API**: вхідні updates (`message`, `callback_query`), команди і scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

## 7. Структура репозиторію
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

## 8. Вимоги до середовища
- Node.js 18+ (рекомендовано LTS).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP акаунт для email.
- (Опційно) Twilio акаунт для SMS OTP.
- (Опційно) Google Cloud Translation API key для runtime-перекладу.

## 9. Встановлення з GitHub
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

## 10. Налаштування середовища (.env)
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

## 11. Запуск проєкту
### Development
```bash
npm run dev
```

### Production build + run
```bash
npm run build
npm run start
```

## 12. Міграції та адміністратор
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

## 13. Локальний запуск (опційно)
Приклад швидкого Redis локально:
```bash
docker run -d --name bot-redis -p 6379:6379 redis:7
```
Далі:
1. Підняти PostgreSQL локально.
2. Заповнити `.env`.
3. Виконати міграції.
4. Запустити `npm run dev`.

## 14. Обмеження завантажень (Upload)
У поточній реалізації механізм file upload відсутній (немає HTTP upload endpoint або middleware для файлів). Секція зарезервована для майбутнього розширення.

## 15. Безпека
- Валідація input/ENV через `zod`.
- Рольова модель `client/master/admin`.
- OTP-потоки з TTL, resend cooldown, лімітами спроб і блокуванням.
- Нормалізація помилок без витоку внутрішніх деталей для непривілейованих користувачів.
- Централізоване логування критичних дій (admin/master operations).
- Опційні інтеграції (Twilio/Translate) керуються feature-gate.

## 16. Робочий процес контент-менеджера
Базовий операційний workflow:
1. Перевірити статус інфраструктури: `npm run ops -- health-check`.
2. Застосувати міграції: `npm run migrate`.
3. За потреби додати seed-дані: `npm run ops -- seed-custom-data`.
4. Надати ролі адміну/майстру через `ops` команди.
5. Керувати контентом через адмін-панель у Telegram (FAQ, послуги, майстри, записи).
6. Моніторити логи в `logs/`.

## 17. Вирішення проблем (Troubleshooting)
- **Бот не стартує**: перевірити `BOT_TOKEN`, PostgreSQL/Redis доступність, `npm run ops -- health-check`.
- **Помилки міграцій**: перевірити DB credentials і права користувача БД.
- **SMS недоступні**: перевірити Twilio ENV; без них SMS-канал відключається.
- **Переклад не працює**: перевірити `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, доступ до Redis cache.
- **Email не відправляються**: перевірити SMTP credentials, `SMTP_SECURE/PORT`, та `MAIL_FROM`.

## 18. Ліцензія
MIT License
---

## English

## 1. Project Name + Short Description
**BotBook** is a production-oriented Telegram bot backend built with Node.js/TypeScript for booking management, user/master profiles, admin workflows, notifications, and role-based access.

## 2. About the Project
The project implements salon business flows directly inside Telegram (Telegraf scenes + inline/reply navigation) and includes:
- application lifecycle orchestration (startup/shutdown/process handlers),
- resilient PostgreSQL and Redis integration,
- multilingual UI (uk/en/cs) with feature gating,
- runtime DB-content translation (Google Translate API + Redis cache),
- email/SMS/Telegram notification channels,
- scheduled workers (visit reminders, expired pending bookings),
- operational CLI scripts for administration and health checks.

## 3. Who It Is For
- Teams building Telegram-first booking systems.
- Small/medium beauty businesses with client/master/admin roles.
- Projects requiring controlled migrations, operational CLI tooling, and notification routing.

## 4. Architecture
### Frontend
- No separate web frontend is included.
- User interaction is implemented in Telegram via Telegraf scenes, inline/reply keyboards, and view helpers.

### Backend
- Runtime: Node.js + TypeScript (`ES2022`, `NodeNext`).
- Bot engine: `telegraf`.
- Data: PostgreSQL (`pg`) + Redis (`redis`).
- Validation: `zod` (ENV + user input).
- Logging: `winston` via centralized loggers.
- Error handling: normalized error adapter strategy.
- Domain layers:
  - `helpers/db/*` — database access,
  - `helpers/db-sql/*` — SQL constants,
  - `helpers/bot/*` — UI/render/navigation/i18n,
  - `bot/scenes/*`, `bot/commands/*` — user flows.

### Infrastructure
- PostgreSQL: primary domain storage.
- Redis: Telegraf sessions, OTP/rate limits, translation cache, worker technical marks.
- SMTP (Nodemailer): email notifications/OTP.
- Twilio (optional): SMS OTP (availability controlled by ENV).
- Cron workers (`node-cron`):
  - auto-cancel expired pending bookings,
  - send pre-visit reminders.

## 5. Core Features
- Telegram flows:
  - `/start`, `/help`, `/menu`, `/booking`, `/master`, `/admin`, `/cancel`.
- User profile:
  - get-or-create by Telegram ID,
  - name editing,
  - email/phone with OTP verification,
  - notification channel settings.
- Booking:
  - service → date → time → master selection,
  - schedule and slot conflict validation,
  - pending booking creation,
  - cancel/reschedule flows.
- Master panel:
  - schedule, days off, vacations, temporary changes,
  - booking list, client profile view, statistics.
- Admin panel:
  - booking/master/service/FAQ/access management.
- Notifications:
  - telegram/email/sms policy-based routing,
  - localized payloads by user language.
- I18n:
  - dictionary split (`common/main/admin/master`),
  - runtime translation for DB-origin content.

## 6. API Overview
No HTTP REST API is implemented. Integration surfaces are:
- **Telegram Bot API**: inbound updates (`message`, `callback_query`), command and scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

## 7. Repository Structure
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

## 8. Environment Requirements
- Node.js 18+ (LTS recommended).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP account for email delivery.
- (Optional) Twilio account for SMS OTP.
- (Optional) Google Cloud Translation API key for runtime translation.

## 9. Installation from GitHub
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

## 10. Environment Setup (.env)
1. Copy template:
```bash
cp .env.example .env
```
2. Minimum required for runtime:
- `BOT_TOKEN`
- `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_TTL`, `REDIS_TOUCH`
- SMTP block (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, timeout/pool values)

3. Optional feature flags:
- Translation:
  - `TRANSLATE_ENABLED=true`
  - `TRANSLATE_PROVIDER=google`
  - `GOOGLE_TRANSLATE_API_KEY=...`
- Twilio SMS OTP:
  - `TWILIO_ACCOUNT_SID=...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=...`

> If Twilio ENV values are missing, SMS OTP is treated as unavailable while other channels continue to work.

## 11. Run the Project
### Development
```bash
npm run dev
```

### Production build + run
```bash
npm run build
npm run start
```

## 12. Migrations and Administrator
### Migrations
```bash
npm run migrate
npm run migration:status
npm run rollback
```

### Grant/Revoke roles
```bash
npm run ops -- grant-admin --telegram-id=<ID>
npm run ops -- revoke-admin --telegram-id=<ID>
npm run ops -- grant-master --telegram-id=<ID>
```

## 13. Local Run (Optional)
Quick Redis example:
```bash
docker run -d --name bot-redis -p 6379:6379 redis:7
```
Then:
1. Start local PostgreSQL.
2. Fill `.env`.
3. Run migrations.
4. Start with `npm run dev`.

## 14. Upload Limits
File upload is not implemented in the current version (no HTTP upload endpoint/middleware). This section is reserved for future expansion.

## 15. Security
- `zod` validation for input and ENV.
- Role model: `client/master/admin`.
- OTP flows with TTL, resend cooldown, attempt limits, and blocking.
- Error normalization without leaking internal details to non-privileged users.
- Centralized logging for critical admin/master actions.
- Optional integrations (Twilio/Translate) controlled by feature gates.

## 16. Content Manager Workflow
Typical operational workflow:
1. Run infrastructure check: `npm run ops -- health-check`.
2. Apply migrations: `npm run migrate`.
3. Seed custom data if needed: `npm run ops -- seed-custom-data`.
4. Grant admin/master roles via ops commands.
5. Manage content through Telegram admin panel (FAQ, services, masters, bookings).
6. Monitor logs in `logs/`.

## 17. Troubleshooting
- **Bot does not start**: verify `BOT_TOKEN`, PostgreSQL/Redis availability, run `npm run ops -- health-check`.
- **Migration errors**: validate DB credentials and DB user permissions.
- **SMS unavailable**: verify Twilio ENV values; without them SMS channel is disabled.
- **Translation not working**: verify `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, Redis cache availability.
- **Email not sent**: validate SMTP credentials, `SMTP_SECURE/PORT`, and `MAIL_FROM`.

## 18. License
MIT License
---

## Čeština

## 1. Název projektu + stručný popis
**BotBook** je production-oriented backend pro Telegram bot na Node.js/TypeScript pro správu rezervací, profilů uživatelů/masterů, admin workflow, notifikací a role-based přístupu.

## 2. O projektu
Projekt implementuje salonní business flow přímo v Telegramu (Telegraf scenes + inline/reply navigace) a obsahuje:
- lifecycle orchestrace aplikace (startup/shutdown/process handlers),
- spolehlivou integraci PostgreSQL a Redis,
- vícejazyčné UI (uk/en/cs) s feature gate,
- runtime překlad DB obsahu (Google Translate API + Redis cache),
- email/SMS/Telegram notifikační kanály,
- plánované workery (remindery, expirované pending rezervace),
- provozní CLI skripty pro správu a health-check.

## 3. Pro koho je vhodný
- Týmy, které staví Telegram-first rezervační systém.
- Malé/střední beauty provozy s rolemi client/master/admin.
- Projekty s požadavkem na řízené migrace, ops CLI nástroje a notifikační routing.

## 4. Architektura
### Frontend
- Samostatná web frontend vrstva v repozitáři není.
- Uživatelské rozhraní je realizováno v Telegramu přes Telegraf scenes, inline/reply klávesnice a view helpery.

### Backend
- Runtime: Node.js + TypeScript (`ES2022`, `NodeNext`).
- Bot engine: `telegraf`.
- Data: PostgreSQL (`pg`) + Redis (`redis`).
- Validace: `zod` (ENV + user input).
- Logging: `winston` přes centralizované loggery.
- Error handling: normalizovaný error adapter.
- Doménové vrstvy:
  - `helpers/db/*` — přístup k DB,
  - `helpers/db-sql/*` — SQL konstanty,
  - `helpers/bot/*` — UI/render/navigation/i18n,
  - `bot/scenes/*`, `bot/commands/*` — uživatelské flow.

### Infrastruktura
- PostgreSQL: primární doménové úložiště.
- Redis: Telegraf sessions, OTP/rate limits, cache překladů, technické markery workerů.
- SMTP (Nodemailer): email notifikace/OTP.
- Twilio (volitelné): SMS OTP (dostupnost řízená ENV).
- Cron workery (`node-cron`):
  - auto-cancel expirovaných pending rezervací,
  - reminder rozesílka před návštěvou.

## 5. Hlavní funkcionalita
- Telegram flow:
  - `/start`, `/help`, `/menu`, `/booking`, `/master`, `/admin`, `/cancel`.
- Profil uživatele:
  - get-or-create podle Telegram ID,
  - editace jména,
  - email/phone s OTP ověřením,
  - nastavení notifikačních kanálů.
- Rezervace:
  - výběr služby → data → času → mastera,
  - validace dostupnosti dle rozvrhů a obsazených slotů,
  - vytvoření pending rezervace,
  - cancel/reschedule flow.
- Master panel:
  - rozvrh, volné dny, dovolené, dočasné změny,
  - seznam rezervací, náhled klient profilu, statistiky.
- Admin panel:
  - správa rezervací, masterů, služeb, FAQ, přístupů.
- Notifikace:
  - telegram/email/sms routing dle policy,
  - lokalizace payloadu podle jazyka uživatele.
- I18n:
  - split slovníků (`common/main/admin/master`),
  - runtime překlad DB obsahu.

## 6. Přehled API
HTTP REST API v projektu není implementováno. Integrace probíhá přes:
- **Telegram Bot API**: inbound updates (`message`, `callback_query`), command a scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

## 7. Struktura repozitáře
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

## 8. Požadavky na prostředí
- Node.js 18+ (doporučeno LTS).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP účet pro email.
- (Volitelné) Twilio účet pro SMS OTP.
- (Volitelné) Google Cloud Translation API key pro runtime překlad.

## 9. Instalace z GitHubu
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

## 10. Nastavení prostředí (.env)
1. Zkopírujte šablonu:
```bash
cp .env.example .env
```
2. Minimum pro běh:
- `BOT_TOKEN`
- `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_TTL`, `REDIS_TOUCH`
- SMTP blok (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, timeout/pool hodnoty)

3. Volitelné feature flags:
- Překlad:
  - `TRANSLATE_ENABLED=true`
  - `TRANSLATE_PROVIDER=google`
  - `GOOGLE_TRANSLATE_API_KEY=...`
- Twilio SMS OTP:
  - `TWILIO_ACCOUNT_SID=...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=...`

> Pokud chybí Twilio ENV hodnoty, SMS OTP je nedostupné, ostatní kanály zůstávají funkční.

## 11. Spuštění projektu
### Development
```bash
npm run dev
```

### Production build + run
```bash
npm run build
npm run start
```

## 12. Migrace a administrátor
### Migrace
```bash
npm run migrate
npm run migration:status
npm run rollback
```

### Přidělení/odebrání rolí
```bash
npm run ops -- grant-admin --telegram-id=<ID>
npm run ops -- revoke-admin --telegram-id=<ID>
npm run ops -- grant-master --telegram-id=<ID>
```

## 13. Lokální spuštění (volitelné)
Rychlý příklad Redis:
```bash
docker run -d --name bot-redis -p 6379:6379 redis:7
```
Dále:
1. Spusťte lokální PostgreSQL.
2. Doplňte `.env`.
3. Proveďte migrace.
4. Spusťte `npm run dev`.

## 14. Omezení uploadu
V aktuální verzi není implementován file upload (žádný HTTP upload endpoint/middleware). Sekce je rezervována pro budoucí rozšíření.

## 15. Bezpečnost
- `zod` validace vstupů a ENV.
- Role model: `client/master/admin`.
- OTP flow s TTL, resend cooldown, limitem pokusů a blokací.
- Normalizace chyb bez úniku interních detailů pro neprivilegované uživatele.
- Centralizovaný logging kritických admin/master akcí.
- Volitelné integrace (Twilio/Translate) řízené feature gate.

## 16. Workflow content managera
Typický provozní workflow:
1. Spustit kontrolu infrastruktury: `npm run ops -- health-check`.
2. Aplikovat migrace: `npm run migrate`.
3. Případně seednout custom data: `npm run ops -- seed-custom-data`.
4. Přidělit admin/master role přes ops příkazy.
5. Spravovat obsah přes admin panel v Telegramu (FAQ, služby, mašteři, rezervace).
6. Monitorovat logy v `logs/`.

## 17. Řešení problémů (Troubleshooting)
- **Bot nestartuje**: ověřit `BOT_TOKEN`, dostupnost PostgreSQL/Redis, spustit `npm run ops -- health-check`.
- **Chyby migrací**: ověřit DB credentials a oprávnění DB uživatele.
- **SMS nedostupné**: ověřit Twilio ENV; bez nich je SMS kanál vypnut.
- **Překlad nefunguje**: ověřit `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, dostupnost Redis cache.
- **Email se neodesílá**: ověřit SMTP credentials, `SMTP_SECURE/PORT` a `MAIL_FROM`.

## 18. Licence
MIT License