# BotBook

Telegram backend pro provoz salonu s rezervacemi, profily, role panely a notifikacemi.

# 1. Název projektu + stručný popis
**BotBook** je production-oriented backend pro Telegram bot na Node.js/TypeScript pro správu rezervací, profilů uživatelů/masterů, admin workflow, notifikací a role-based přístupu.

---

# 2. O projektu
Projekt implementuje salonní business flow přímo v Telegramu (Telegraf scenes + inline/reply navigace) a obsahuje:
- lifecycle orchestrace aplikace (startup/shutdown/process handlers),
- spolehlivou integraci PostgreSQL a Redis,
- vícejazyčné UI (uk/en/cs) s feature gate,
- runtime překlad DB obsahu (Google Translate API + Redis cache),
- email/SMS/Telegram notifikační kanály,
- plánované workery (remindery, expirované pending rezervace),
- provozní CLI skripty pro správu a health-check.

---

# 3. Pro koho je vhodný
- Týmy, které staví Telegram-first rezervační systém.
- Malé/střední beauty provozy s rolemi client/master/admin.
- Projekty s požadavkem na řízené migrace, ops CLI nástroje a notifikační routing.

---

# 4. Architektura
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

---

# 5. Hlavní funkcionalita
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

---

# 6. Přehled API
HTTP REST API v projektu není implementováno. Integrace probíhá přes:
- **Telegram Bot API**: inbound updates (`message`, `callback_query`), command a scene transitions.
- **Ops CLI API** (`npm run ops -- <command>`):
  - `grant-admin`, `revoke-admin`, `grant-master`,
  - `repair-bookings`, `notification-dry-run`,
  - `seed-custom-data`, `health-check`,
  - `migrate`, `rollback`, `migration:status`.
- **Migration CLI**:
  - `npm run migrate`, `npm run rollback`, `npm run migration:status`.

---

# 7. Struktura repozitáře
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

# 8. Požadavky na prostředí
- Node.js 18+ (doporučeno LTS).
- npm 9+.
- PostgreSQL 14+.
- Redis 7+.
- Telegram bot token.
- SMTP účet pro email.
- (Volitelné) Twilio účet pro SMS OTP.
- (Volitelné) Google Cloud Translation API key pro runtime překlad.

---

# 9. Instalace z GitHubu
```bash
git clone <YOUR_REPOSITORY_URL>
cd botbook
npm install
```

---

# 10. Nastavení prostředí (.env)
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

---

# 11. Spuštění projektu
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

# 12. Migrace a administrátor
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

---

# 13. Lokální spuštění (volitelné)
### Docker Compose (doporučeno)
```bash
docker compose up -d --build
docker compose logs -f app
```

Zastavení:
```bash
docker compose down
```

Zastavení a smazání volume:
```bash
docker compose down -v
```

### Bez Dockeru
1. Spusťte lokální PostgreSQL a Redis.
2. Doplňte `.env`.
3. Proveďte migrace.
4. Spusťte `npm run dev`.

---

# 14. Omezení uploadu
V aktuální verzi není implementován file upload (žádný HTTP upload endpoint/middleware). Sekce je rezervována pro budoucí rozšíření.

---

# 15. Bezpečnost
- `zod` validace vstupů a ENV.
- Role model: `client/master/admin`.
- OTP flow s TTL, resend cooldown, limitem pokusů a blokací.
- Normalizace chyb bez úniku interních detailů pro neprivilegované uživatele.
- Centralizovaný logging kritických admin/master akcí.
- Volitelné integrace (Twilio/Translate) řízené feature gate.

---

# 16. Workflow content managera
Typický provozní workflow:
1. Spustit kontrolu infrastruktury: `npm run ops -- health-check`.
2. Aplikovat migrace: `npm run migrate`.
3. Případně seednout custom data: `npm run ops -- seed-custom-data`.
4. Přidělit admin/master role přes ops příkazy.
5. Spravovat obsah přes admin panel v Telegramu (FAQ, služby, mašteři, rezervace).
6. Monitorovat logy v `logs/`.

---

# 17. Řešení problémů (Troubleshooting)
- **Bot nestartuje**: ověřit `BOT_TOKEN`, dostupnost PostgreSQL/Redis, spustit `npm run ops -- health-check`.
- **Chyby migrací**: ověřit DB credentials a oprávnění DB uživatele.
- **SMS nedostupné**: ověřit Twilio ENV; bez nich je SMS kanál vypnut.
- **Překlad nefunguje**: ověřit `TRANSLATE_ENABLED`, `GOOGLE_TRANSLATE_API_KEY`, dostupnost Redis cache.
- **Email se neodesílá**: ověřit SMTP credentials, `SMTP_SECURE/PORT` a `MAIL_FROM`.

---

# 18. Licence
MIT License
