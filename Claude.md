# Institut Pí Event Management System

## Přehled projektu

**Rezervační systém pro politický think-tank Institut Pí**

- **Doména:** akce.institutpi.cz
- **Stack:** SvelteKit + Cloudflare (Workers, D1, R2, Pages)
- **Design:** Mobile-first, responsive, brand-aligned s institutpi.cz
- **Účel:** Registrace na akce, správa účastníků, QR platby

## Klíčové technologie

### Frontend
- **SvelteKit** - SSR framework
- **Tailwind CSS** - utility-first styling
- **Mobile-first** - primární design pro 375px

### Backend (Cloudflare Free Tier)
- **Workers** - API endpoints
- **D1** - SQLite databáze
- **R2** - úložiště obrázků
- **Queues** - email fronta
- **Cron** - automatické upomínky

### Email & Platby
- **Resend API** - transactional emails
- **QR kódy** - české bankovnictví (SPD standard)

## Design System

### Barvy
```css
--pii-cyan: #2782AF     /* hlavní akcent */
--grey-800: #1F1F1F     /* navigace */
--grey-50: #F8F9FA      /* pozadí */
--grey-600: #4B5563     /* text */
```

### Fonty
- **Bebas Neue** - nadpisy (uppercase)
- **Source Serif 4** - tělo textu
- **System sans-serif** - UI elementy

### Breakpoints
```
Mobile: 320px+ (primární)
Tablet: 768px
Desktop: 1024px+
```

## Struktura projektu

```
/src
  /routes              # SvelteKit pages
    +layout.svelte     # Main layout
    +page.svelte       # Homepage (seznam akcí)
    /akce/[slug]       # Detail akce
    /archiv            # Archiv akcí
    /admin             # Admin panel

  /components
    Header.svelte      # Sticky header
    EventCard.svelte   # Karta akce
    RegistrationForm.svelte

  /lib
    api.ts             # API client
    design.ts          # Design tokens
    utils.ts

/workers               # Cloudflare Workers
  /api                 # API endpoints

/database
  schema.sql           # D1 schema
```

## Datový model

### Tabulky
- `events` - akce (title, date, venue, capacity, payment)
- `registrations` - registrace (email, token, payment_status)
- `reminder_settings` - nastavení upomínek
- `sent_reminders` - log odeslaných upomínek
- `admin_users` - admin přístupy

## API Endpoints

### Public
- `GET /api/events` - seznam akcí
- `GET /api/events/:slug` - detail akce
- `POST /api/events/:eventId/register` - registrace
- `GET /api/events/confirm/:token` - potvrzení
- `GET /api/events/:eventId/calendar` - .ics export

### Admin (JWT auth)
- `POST /api/admin/login`
- `GET/POST/PUT/DELETE /api/admin/events`
- `GET /api/admin/events/:eventId/registrations`
- `GET /api/admin/stats`

## Klíčové features

1. **Registrace s potvrzením**
   - Email s tokenem
   - Mobile-friendly potvrzovací stránka

2. **QR platby**
   - Český standard (SPD)
   - Zobrazení v emailu + na webu
   - Manuální potvrzení v adminu

3. **Automatické upomínky**
   - Cron každou hodinu
   - Konfigurovatelné (30, 7, 1 den před)

4. **Kalendářní export**
   - .ics soubor
   - Deep links pro Apple/Google Calendar

5. **Admin panel**
   - CRUD akcí
   - Upload obrázků
   - Seznam registrací
   - Statistiky

## Mobile-first design principles

- Stack layout (1 sloupec) na mobile
- Touch targets min 44x44px
- Sticky header s hamburger menu
- Bottom-fixed CTA na detailu
- Collapsible sekce
- Horizontal scroll pro lists
- Responsive images (srcset)
- Lazy loading

## Performance budget

- First Contentful Paint: < 1.5s (mobile)
- Time to Interactive: < 3.5s (mobile)
- Lighthouse Score: > 90 (mobile)
- CSS: < 50KB gzipped
- JS: < 100KB gzipped

## Bezpečnost

- JWT autentizace pro admin
- Rate limiting (10 req/min)
- Input validation (Zod)
- Prepared statements (D1)
- XSS protection
- HTTPS only

## Environment variables

```toml
RESEND_API_KEY = "..."
JWT_SECRET = "..."
ADMIN_EMAIL = "patrick.zandl@institutpi.cz"
SITE_URL = "https://akce.institutpi.cz"
BANK_ACCOUNT = "2002103571/2010"
```

## Deployment

```bash
# Frontend
npm run build
npx wrangler pages deploy ./build

# Workers
npx wrangler deploy

# D1 Database
npx wrangler d1 create institutpi-events
npx wrangler d1 execute institutpi-events --file=./schema.sql

# R2 Bucket
npx wrangler r2 bucket create institutpi-images
```

## Development workflow

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Type checking
npm run check

# Deploy
npm run deploy
```

## Success metrics

### Launch KPIs
- Mobile Lighthouse: > 90
- Desktop Lighthouse: > 95
- Registration conversion: > 60%
- Email confirmation: > 80%
- Response time: < 200ms (p95)

### Business KPIs
- Počet registrací/akci
- Show-up rate
- Email delivery: > 99%
- User satisfaction: > 4/5

## Future enhancements

**V1.1:** PWA, push notifications, offline mode
**V2.0:** Wallet passes, bank API, čekací listina
**V3.0:** User accounts, multilanguage, Stripe

## Dokumentace

- [PRD](docs/PRD.md) - Kompletní Product Requirements Document
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [SvelteKit Docs](https://kit.svelte.dev/)

## Kontakt

**Institut Pí**
- Web: www.institutpi.cz
- Admin: patrick.zandl@institutpi.cz
- Doména: akce.institutpi.cz

---

**Poznámky pro AI:**
- Design musí být konzistentní s www.institutpi.cz
- Mobile-first je priorita #1
- Všechny fonty, barvy a komponenty musí odpovídat brand guidelines
- Optimalizovat pro Cloudflare Free Tier (limity)
- České texty a formátování (datumy, čísla)
