# Institut Pí Event Management System

Rezervační systém pro správu a registraci na akce politického think-tanku [Institut Pí](https://www.institutpi.cz).

## 🎯 O projektu

Moderní, mobile-first webová aplikace pro správu akcí, registrací a plateb. Postavená na Cloudflare platformě pro maximální výkon a dostupnost.

**Živá doména:** [akce.institutpi.cz](https://akce.institutpi.cz)

## ⚠️ Důležité: Cloudflare Pages Setup

Pro správný deployment je **nutné** nastavit build konfiguraci v Cloudflare Pages dashboard:

**Build Settings:**
```
Build command: npm run build
Build output directory: .svelte-kit/cloudflare
Node version: 18
```

📖 **Detailní instrukce:** viz [DEPLOYMENT.md](DEPLOYMENT.md)

## 🛠️ Technologie

### Frontend
- **SvelteKit** - SSR framework
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

### Backend
- **Cloudflare Workers** - Edge API
- **Cloudflare D1** - SQLite databáze
- **Cloudflare R2** - Object storage
- **Cloudflare Queues** - Email fronta
- **Cloudflare Cron** - Plánované upomínky

### Email & Platby
- **Resend API** - Transactional emails
- **QR kódy** - České bankovnictví (SPD standard)

## 🚀 Rychlý start

### Prerequisites

- Node.js 18+
- npm nebo yarn
- Cloudflare účet (free tier stačí)
- Wrangler CLI

### Instalace

```bash
# Clone repository
git clone https://github.com/tangero/rezervace-institut.git
cd rezervace-institut

# Nainstaluj dependencies
npm install

# Vytvoř D1 databázi
npx wrangler d1 create institutpi-events

# Inicializuj databázové schema
npx wrangler d1 execute institutpi-events --file=./database/schema.sql

# (Volitelně) Naplň testovacími daty
npx wrangler d1 execute institutpi-events --file=./database/seed.sql

# Vytvoř R2 bucket
npx wrangler r2 bucket create institutpi-images

# Vytvoř email queue
npx wrangler queues create email-queue
```

### Environment Variables

Vytvoř `.dev.vars` soubor v root složce:

```env
RESEND_API_KEY=re_xxxxxxxx
JWT_SECRET=your-secret-key
SITE_URL=http://localhost:5173
MAIN_SITE_URL=https://www.institutpi.cz
BANK_ACCOUNT=2002103571/2010
ADMIN_EMAIL=patrick.zandl@institutpi.cz
```

### Development

```bash
# Spusť dev server (SvelteKit)
npm run dev

# Spusť Workers dev server (v jiném terminálu)
npx wrangler dev workers/index.ts
```

Aplikace běží na `http://localhost:5173`

### Build & Deploy

Projekt používá dvě oddělené Cloudflare konfigurace:

#### Frontend (Cloudflare Pages)

```bash
# Build frontend
npm run build

# Deploy na Cloudflare Pages (automatický z GitHub)
# Nebo manuálně:
npx wrangler pages deploy .svelte-kit/cloudflare
```

**Konfigurace:** `wrangler.toml` a `.pages.yaml`

#### Backend API (Cloudflare Workers) - Volitelné

```bash
# Deploy Workers API (až bude potřeba)
npx wrangler deploy --config wrangler-api.toml
```

**Konfigurace:** `wrangler-api.toml`

> **Poznámka:** Pro MVP stačí pouze Pages deployment. Workers API se použije později pro pokročilé funkce (email queue, cron jobs).

## 📁 Struktura projektu

```
/
├── src/                    # SvelteKit frontend
│   ├── routes/            # Pages & layouts
│   ├── components/        # Svelte components
│   ├── lib/               # Utilities & stores
│   └── app.css           # Global styles
│
├── workers/               # Cloudflare Workers
│   ├── api/              # API endpoints
│   ├── index.ts          # Main worker
│   ├── router.ts         # Request router
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
│
├── database/             # Database files
│   ├── schema.sql       # D1 schema
│   └── seed.sql         # Test data
│
├── docs/                # Documentation
│   └── PRD.md          # Product Requirements
│
└── static/             # Static assets
```

## 🎨 Design System

Aplikace používá design system inspirovaný hlavním webem Institut Pí:

- **Primární barva:** `#2782AF` (cyan)
- **Fonty:** Bebas Neue (nadpisy), Source Serif 4 (text)
- **Mobile-first:** Optimalizováno pro 375px+
- **Accessibility:** WCAG 2.1 AA compliant

## 📊 Features

### ✅ MVP (Fáze 1)
- [x] Seznam nadcházejících akcí
- [x] Detail akce s registračním formulářem
- [x] Email potvrzení registrace
- [x] Archiv proběhlých akcí
- [x] Mobile-first responsive design

### 🚧 V development
- [ ] Admin panel (login, CRUD akcí)
- [ ] Upload obrázků do R2
- [ ] QR kód generování pro platby
- [ ] Automatické upomínky (cron)
- [ ] Kalendářní export (.ics)
- [ ] Email templates s Resend API

### 🔮 Budoucí features
- [ ] PWA support
- [ ] Push notifikace
- [ ] Google/Apple Wallet passes
- [ ] Stripe integrace
- [ ] Multilanguage (EN)

## 📝 API Endpoints

### Public API

- `GET /api/events` - Seznam akcí
- `GET /api/events/:slug` - Detail akce
- `GET /api/events/archive` - Archiv akcí
- `POST /api/events/:eventId/register` - Registrace
- `GET /api/events/confirm/:token` - Potvrzení registrace
- `GET /api/events/:eventId/calendar` - iCalendar export

### Admin API (Coming soon)

- `POST /api/admin/login` - Přihlášení
- `GET/POST/PUT/DELETE /api/admin/events` - Správa akcí
- `GET /api/admin/stats` - Dashboard statistiky

## 🧪 Testing

```bash
# Type checking
npm run check

# Build test
npm run build

# Wrangler type check
npx wrangler types
```

## 📖 Dokumentace

- [PRD (Product Requirements Document)](docs/PRD.md) - Kompletní specifikace
- [Claude.md](Claude.md) - Přehled pro AI asistenta
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [SvelteKit Docs](https://kit.svelte.dev/)

## 🤝 Contributing

Příspěvky jsou vítány! Prosím:

1. Fork repository
2. Vytvoř feature branch (`git checkout -b feature/amazing-feature`)
3. Commit změny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevři Pull Request

## 📄 Licence

ISC License - viz [LICENSE](LICENSE) soubor.

## 👥 Autoři

- **Institut Pí** - [www.institutpi.cz](https://www.institutpi.cz)
- **Patrick Zandl** - patrick.zandl@institutpi.cz

## 🙏 Poděkování

- Cloudflare za skvělou free tier platformu
- SvelteKit komunita
- Všichni přispěvatelé a testeři

---

**Made with ❤️ for Institut Pí**
