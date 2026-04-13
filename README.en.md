# BotBook

Telegram-oriented backend for beauty salon operations with bookings, profiles, role panels, and notifications.

# 1. Project Name + Short Description
**BotBook** is a production-oriented Telegram bot backend built with Node.js/TypeScript for booking management, user/master profiles, admin workflows, notifications, and role-based access.

---

# 2. About the Project
The project implements salon business flows directly inside Telegram (Telegraf scenes + inline/reply navigation) and includes:
- application lifecycle orchestration (startup/shutdown/process handlers),
- resilient PostgreSQL and Redis integration,
- multilingual UI (uk/en/cs) with feature gating,
- runtime DB-content translation (Google Translate API + Redis cache),
- email/SMS/Telegram notification channels,
- scheduled workers (visit reminders, expired pending bookings),
- operational CLI scripts for administration and health checks.

---

# 3. Who It Is For
- Teams building Telegram-first booking systems.
- Small/medium beauty businesses with client/master/admin roles.
- Projects requiring controlled migrations, operational CLI tooling, and notification routing.

---

# 4. Architecture
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

---

# 5. Core Features
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

---

# 6. API Overview
No HTTP REST API is implemented. Integration surfaces are:
- **Telegram Bot API**: inbound updates (`message`, `callback_query`), command and scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

---

# 7. Repository Structure
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

# 8. Environment Requirements
- Node.js 18+ (LTS recommended).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP account for email delivery.
- (Optional) Twilio account for SMS OTP.
- (Optional) Google Cloud Translation API key for runtime translation.

---

# 9. Installation from GitHub
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

---

# 10. Environment Setup (.env)
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

---

# 11. Run the Project
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

# 12. Migrations and Administrator
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

---

# 13. Local Run (Optional)
### Docker Compose (recommended)
```bash
docker compose up -d --build
docker compose logs -f app
```

Stop:
```bash
docker compose down
```

Stop and remove volumes:
```bash
docker compose down -v
```

### Without Docker
1. Start local PostgreSQL and Redis.
2. Fill `.env`.
3. Run migrations.
4. Start with `npm run dev`.

---

# 14. Upload Limits
File upload is not implemented in the current version (no HTTP upload endpoint/middleware). This section is reserved for future expansion.

---

# 15. Security
- `zod` validation for input and ENV.
- Role model: `client/master/admin`.
- OTP flows with TTL, resend cooldown, attempt limits, and blocking.
- Error normalization without leaking internal details to non-privileged users.
- Centralized logging for critical admin/master actions.
- Optional integrations (Twilio/Translate) controlled by feature gates.

---

# 16. Content Manager Workflow
Typical operational workflow:
1. Run infrastructure check: `npm run ops -- health-check`.
2. Apply migrations: `npm run migrate`.
3. Seed custom data if needed: `npm run ops -- seed-custom-data`.
4. Grant admin/master roles via ops commands.
5. Manage content through Telegram admin panel (FAQ, services, masters, bookings).
6. Monitor logs in `logs/`.

---

# 17. Troubleshooting
- **Bot does not start**: verify `BOT_TOKEN`, PostgreSQL/Redis availability, run `npm run ops -- health-check`.
- **Migration errors**: validate DB credentials and DB user permissions.
- **SMS unavailable**: verify Twilio ENV values; without them SMS channel is disabled.
- **Translation not working**: verify `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, Redis cache availability.
- **Email not sent**: validate SMTP credentials, `SMTP_SECURE/PORT`, and `MAIL_FROM`.

---

# 18. License

MIT License
---
