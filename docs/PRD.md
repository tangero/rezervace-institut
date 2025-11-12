# PRD: Rezervační systém Institut Pí

## 1. Přehled projektu

**Název:** Institut Pí Event Management System
**Doména:** akce.institutpi.cz
**Účel:** Komplexní rezervační systém pro správu a registraci na akce politického think-tanku Institut Pí

**O organizaci:**
Institut π je nezávislý politický think-tank, který iniciuje a rozvíjí diskurz o obtížných a pro životaschopnost demokratické společnosti důležitých otázkách. Institut se věnuje tvorbě dlouhodobých řešení společenských problémů ve spolupráci s akademickou obcí, experty a dobrovolníky. Více na [www.institutpi.cz](https://www.institutpi.cz)

## 2. Technický stack (Cloudflare Free Tier)

### Backend
- **Cloudflare Workers** - API endpoints a business logika
- **Cloudflare D1** - SQLite databáze pro události, registrace, nastavení
- **Cloudflare R2** - úložiště obrázků akcí
- **Cloudflare Queues** - fronta pro odesílání emailů
- **Cloudflare Cron Triggers** - plánované úlohy (upomínky)

### Frontend
- **Cloudflare Pages** - hosting statického webu
- **Framework:** SvelteKit (lightweight, SSR support)
- **Styling:** Tailwind CSS (stejně jako hlavní web)
- **Design:** Mobile-first responsive design

### Email
- **Resend API** (free tier: 100 emails/den, 3000/měsíc) nebo **SendGrid** jako fallback
- Transactional emails: potvrzení registrace, upomínky, poděkování

### Platby
- **QR kódy pro české banky** (formát dle ČNB standardu - SPD)
- Možnost integrace s platební bránou (Stripe) v budoucnu

---

## 3. Design System & Brand Guidelines

### 3.1 Barevná paleta (převzato z institutpi.cz)

```css
/* Primární barvy */
--pii-cyan: rgb(39, 130, 175);      /* #2782AF - hlavní akcent */
--grey-800: rgb(31, 31, 31);         /* #1F1F1F - tmavá navigace */
--grey-50: rgb(248, 249, 250);       /* #F8F9FA - světlé pozadí */
--white: #FFFFFF;
--black: #000000;

/* Sekundární barvy */
--grey-100: #F3F4F6;
--grey-200: #E5E7EB;
--grey-600: #4B5563;

/* Utility */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: var(--pii-cyan);
```

### 3.2 Typografie

**Fonty (stejné jako institutpi.cz):**
```css
/* Nadpisy - Bebas Neue */
@import url('/fonts/bebas-neue/style.css');
font-family: 'Bebas Neue', sans-serif;

/* Tělo textu - Source Serif */
@import url('/fonts/source-serif/style.css');
font-family: 'Source Serif 4', serif;

/* UI elementy - System sans-serif */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Type scale:**
```
H1: font-bebas text-4xl md:text-5xl uppercase (Bebas Neue)
H2: font-bebas text-3xl md:text-4xl uppercase (Bebas Neue)
H3: font-serif text-xl md:text-2xl font-bold (Source Serif)
Body: font-serif text-base leading-6 (Source Serif)
Small: font-serif text-sm (Source Serif)
UI: font-sans text-sm md:text-base
```

### 3.3 Layout & Spacing

**Container sizes:**
```
Mobile: 100% - 1rem padding
Tablet: max-w-3xl (768px)
Desktop: max-w-5xl (1024px)
Wide: max-w-7xl (1280px)
```

**Spacing scale (Tailwind):**
```
xs: 0.25rem (1)
sm: 0.5rem (2)
md: 1rem (4)
lg: 1.5rem (6)
xl: 2rem (8)
2xl: 2.5rem (10)
```

### 3.4 Mobile-First Breakpoints

```css
/* Base styles - Mobile (320px+) */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
```

**Design priority:**
1. Mobile (375px) - primární design
2. Tablet (768px) - adaptace layoutu
3. Desktop (1024px+) - rozšířený prostor

### 3.5 Komponenty

**Buttons:**
```html
<!-- Primary -->
<button class="bg-pii-cyan hover:bg-pii-cyan/90 text-white font-sans uppercase tracking-wide px-6 py-3 rounded transition-colors">
  Registrovat se
</button>

<!-- Secondary -->
<button class="bg-grey-800 hover:bg-grey-800/90 text-white font-sans uppercase tracking-wide px-6 py-3 rounded transition-colors">
  Zobrazit detail
</button>

<!-- Outline -->
<button class="border-2 border-pii-cyan text-pii-cyan hover:bg-pii-cyan hover:text-white font-sans uppercase tracking-wide px-6 py-3 rounded transition-all">
  Přidat do kalendáře
</button>
```

**Cards:**
```html
<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <img src="..." class="w-full h-48 object-cover" />
  <div class="p-6">
    <small class="text-pii-cyan uppercase font-bold tracking-wide">
      Datum a čas
    </small>
    <h3 class="font-serif text-xl font-bold mt-2 mb-3">
      Název akce
    </h3>
    <p class="font-serif text-grey-600 leading-5">
      Krátký popisek akce...
    </p>
  </div>
</div>
```

**Header:**
```html
<header class="sticky top-0 bg-grey-800 py-4 md:py-8 shadow-lg z-50">
  <div class="container mx-auto px-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3">
      <img src="/logo.svg" class="h-8 md:h-10" alt="Institut Pí" />
      <span class="font-bebas text-white text-2xl md:text-3xl uppercase">
        Akce
      </span>
    </a>
    <nav class="hidden md:flex gap-6 text-white font-sans uppercase text-sm">
      <a href="/" class="hover:text-pii-cyan transition-colors">Akce</a>
      <a href="/archiv" class="hover:text-pii-cyan transition-colors">Archiv</a>
      <a href="https://www.institutpi.cz" class="hover:text-pii-cyan transition-colors">O nás</a>
    </nav>
    <button class="md:hidden text-white">
      <!-- Hamburger icon -->
    </button>
  </div>
</header>
```

### 3.6 Mobile-First Design Principles

**Navigace:**
- Hamburger menu na mobile (< 768px)
- Horizontální navigace na desktop
- Touch-friendly target sizes (min 44x44px)
- Sticky header s kompaktní výškou na mobile

**Formuláře:**
- Full-width inputy na mobile
- Velké, snadno klikatelné buttony
- Inline validace s jasným feedbackem
- Auto-focus na první input (desktop only)

**Karty akcí:**
- Stack layout na mobile (1 sloupec)
- 2 sloupce na tabletu
- 3 sloupce na desktopu
- Horizontální scroll pro tagy/hosty na mobile

**Detail akce:**
- Obrázek full-width na mobile
- Sticky CTA button na mobile (bottom fixed)
- Collapsible sekce na mobile (Program, Hosté)
- Side-by-side layout na desktop

**Performance:**
- Lazy loading obrázků
- Responsive images (srcset)
- Critical CSS inline
- Preload fontů

---

## 4. Datový model

### 4.1 Tabulka: `events`
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  program TEXT,
  image_url TEXT,
  image_alt TEXT,
  venue_address TEXT NOT NULL,
  venue_name TEXT,
  event_date TEXT NOT NULL, -- ISO 8601
  start_time TEXT NOT NULL, -- HH:MM
  duration_minutes INTEGER NOT NULL,
  guest_names TEXT, -- JSON array
  is_paid BOOLEAN DEFAULT 0,
  price_czk INTEGER DEFAULT 0,
  payment_qr_data TEXT, -- QR kód data pro platbu
  payment_account TEXT, -- Číslo účtu
  payment_variable_symbol TEXT,
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, published, cancelled, completed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Tabulka: `registrations`
```sql
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  email TEXT NOT NULL,
  confirmation_token TEXT UNIQUE NOT NULL,
  is_confirmed BOOLEAN DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  payment_confirmed_at TEXT,
  registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE(event_id, email)
);
```

### 4.3 Tabulka: `reminder_settings`
```sql
CREATE TABLE reminder_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  days_before INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Výchozí data
INSERT INTO reminder_settings (name, days_before) VALUES
  ('Měsíc před akcí', 30),
  ('Týden před akcí', 7),
  ('Den před akcí', 1);
```

### 4.4 Tabulka: `sent_reminders`
```sql
CREATE TABLE sent_reminders (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);
```

### 4.5 Tabulka: `admin_users`
```sql
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoints

### 5.1 Public API

#### GET `/api/events`
- Vrací seznam publikovaných budoucích akcí
- Query params: `?limit=10&offset=0&status=published`
- Response: `{ events: [...], total: number }`

#### GET `/api/events/:slug`
- Detail konkrétní akce
- Response: event object + `{ available_spots: number }`

#### GET `/api/events/archive`
- Archiv proběhlých akcí
- Query params: `?limit=20&offset=0`

#### POST `/api/events/:eventId/register`
- Registrace na akci
- Body: `{ email: string }`
- Validace: kontrola kapacity, duplicit
- Odešle potvrzovací email
- Response: `{ success: true, message: "Zkontrolujte email" }`

#### GET `/api/events/confirm/:token`
- Potvrzení registrace přes token z emailu
- Redirect na stránku s potvrzením
- Aktualizuje `is_confirmed` a `confirmed_at`

#### GET `/api/events/:eventId/calendar`
- Generuje .ics soubor pro přidání do kalendáře
- Content-Type: `text/calendar`

### 5.2 Admin API (vyžaduje autentizaci)

#### POST `/api/admin/login`
- Body: `{ email, password }`
- Response: JWT token

#### GET/POST/PUT/DELETE `/api/admin/events`
- CRUD operace pro události
- Upload obrázků do R2

#### GET `/api/admin/events/:eventId/registrations`
- Seznam registrací na akci
- Export do CSV

#### PUT `/api/admin/registrations/:id/payment`
- Manuální potvrzení platby
- Body: `{ paid: true }`

#### GET/POST/PUT/DELETE `/api/admin/reminder-settings`
- Správa nastavení upomínek

#### GET `/api/admin/stats`
- Dashboard statistiky
- Počet registrací, nadcházejících akcí, revenue

---

## 6. Frontend Struktura

```
/src
  /routes
    +layout.svelte (hlavní layout s headerem, designem dle institutpi.cz)
    +page.svelte (homepage - seznam akcí, mobile-first)
    /akce
      [slug]
        +page.svelte (detail akce)
        +page.server.ts (SSR data loading)
    /archiv
      +page.svelte (archiv akcí)
    /potvrzeni
      +page.svelte (potvrzení registrace)
    /admin
      +layout.svelte (admin layout s auth guard)
      +page.svelte (dashboard)
      /akce
        +page.svelte (seznam akcí)
        /nova
          +page.svelte (vytvoření akce)
        /[id]
          +page.svelte (editace akce)
          /registrace
            +page.svelte (seznam registrací)
      /nastaveni
        +page.svelte (nastavení upomínek)

  /components
    # Public
    Header.svelte (sticky header dle institutpi.cz)
    Footer.svelte
    EventCard.svelte (mobile-first card)
    EventDetail.svelte
    EventHero.svelte (hero section s obrázkem)
    RegistrationForm.svelte (mobilní formulář)
    QRCodeDisplay.svelte
    CalendarButton.svelte
    MobileNav.svelte (hamburger menu)
    EventMeta.svelte (datum, čas, místo)
    GuestList.svelte

    # Admin
    AdminNav.svelte
    AdminSidebar.svelte
    EventForm.svelte (s image upload)
    RegistrationTable.svelte
    StatsCard.svelte

  /lib
    api.ts (API client)
    stores.ts (Svelte stores)
    utils.ts
    design.ts (design tokens, barvy, fonty)

  /styles
    global.css (Tailwind imports + custom CSS)
    fonts.css (Bebas Neue, Source Serif)
```

---

## 7. Mobile-First Wireframes

### 7.1 Homepage (Mobile 375px)

```
┌─────────────────────────────┐
│ [Logo] AKCE     [≡]         │ ← Sticky header grey-800
├─────────────────────────────┤
│                             │
│  NADCHÁZEJÍCÍ AKCE          │ ← H1 Bebas Neue
│                             │
│ ┌───────────────────────┐   │
│ │ [Obrázek akce]       │   │
│ │                       │   │
│ ├───────────────────────┤   │
│ │ 15. 12. 2025          │   │ ← cyan text
│ │ Název akce            │   │
│ │ Krátký popis...       │   │
│ │ [Detail →]            │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ [Další akce...]       │   │
│ └───────────────────────┘   │
│                             │
│ [Archiv akcí]               │
│                             │
├─────────────────────────────┤
│ Footer                      │
└─────────────────────────────┘
```

### 7.2 Detail akce (Mobile)

```
┌─────────────────────────────┐
│ ← Zpět    AKCE    [≡]       │
├─────────────────────────────┤
│ [Hero obrázek full-width]   │
│                             │
├─────────────────────────────┤
│ 15. 12. 2025 · 18:00        │ ← Meta info
│ Pirátské centrum Praha      │
│                             │
│ NÁZEV AKCE                  │ ← H1
│                             │
│ Krátký popis akce...        │
│                             │
│ ▼ Program ──────────────    │ ← Collapsible
│                             │
│ ▼ Hosté ────────────────    │
│                             │
│ Dlouhý popis akce...        │
│ ...více textu...            │
│                             │
│                             │
├─────────────────────────────┤
│ [REGISTROVAT SE]            │ ← Fixed bottom CTA
└─────────────────────────────┘
```

### 7.3 Registrační formulář (Modal/Page)

```
┌─────────────────────────────┐
│ ×  REGISTRACE               │
├─────────────────────────────┤
│                             │
│ Název akce                  │
│ 15. 12. 2025 · 18:00        │
│                             │
│ ┌─────────────────────────┐ │
│ │ Email                   │ │
│ │ vas@email.cz            │ │
│ └─────────────────────────┘ │
│                             │
│ [Platba: 200 Kč]            │ ← Pokud placená
│ [QR kód]                    │
│                             │
│ [✓] Souhlasím s GDPR       │
│                             │
│ [POTVRDIT REGISTRACI]       │
│                             │
│ Po odeslání obdržíte email  │
│ s potvrzovacím odkazem.     │
│                             │
└─────────────────────────────┘
```

### 7.4 Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────┐
│  [Logo] AKCE      Akce | Archiv | O nás      │
├──────────────────────────────────────────────┤
│                                              │
│  NADCHÁZEJÍCÍ AKCE                           │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ Akce 1 │  │ Akce 2 │  │ Akce 3 │         │
│  │        │  │        │  │        │         │
│  └────────┘  └────────┘  └────────┘         │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ Akce 4 │  │ Akce 5 │  │ Akce 6 │         │
│  └────────┘  └────────┘  └────────┘         │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 8. Klíčové Features

### 8.1 Registrace na akci
1. Uživatel vyplní email
2. Systém zkontroluje kapacitu a duplicity
3. Vytvoří registraci s tokenem
4. Přidá email do fronty
5. Worker odešle potvrzovací email
6. Uživatel klikne na link (mobile-friendly button)
7. Registrace potvrzena

### 8.2 Platby QR kódem
- Generování QR kódu podle českého standardu (SPD - Short Payment Descriptor)
- Data: účet, částka, variabilní symbol, zpráva
- Zobrazení QR v emailu + na webu po registraci
- Responsive QR kód (větší na mobile)
- Manuální potvrzení platby v adminu

### 8.3 Automatické upomínky
- Cron trigger běží každou hodinu
- Kontroluje akce s `event_date` v rozmezí dnů dle `reminder_settings`
- Pro každou potvrzenou registraci bez odeslané upomínky:
  - Přidá email do fronty
  - Zaznamená do `sent_reminders`

### 8.4 Kalendářní export
- Generování .ics souboru
- Obsahuje: název, datum, čas, místo, popis
- Mobile-friendly download
- Deep links pro Apple/Google Calendar

### 8.5 Admin dashboard
- Responsive admin panel
- Přehled nadcházejících akcí
- Statistiky registrací
- Seznam účastníků s možností exportu
- Správa akcí (CRUD)
- Upload obrázků s optimalizací
- Nastavení upomínek

---

## 9. Email Templates (Mobile-Optimized)

### 9.1 Potvrzovací email
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Source Serif 4', Georgia, serif; }
    .btn {
      background: #2782AF;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      display: inline-block;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      min-height: 44px; /* Touch target */
    }
    h1 { font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; }
  </style>
</head>
<body>
  <h1>Potvrďte registraci</h1>
  <p>Děkujeme za zájem o akci <strong>[Název akce]</strong>.</p>

  <p>Kliknutím na tlačítko níže potvrdíte svou registraci:</p>

  <p style="text-align: center; margin: 32px 0;">
    <a href="[Odkaz]" class="btn">POTVRDIT REGISTRACI</a>
  </p>

  <div style="background: #F8F9FA; padding: 20px; border-radius: 8px;">
    <p><strong>📅 Datum:</strong> [Datum a čas]</p>
    <p><strong>📍 Místo:</strong> [Adresa]</p>
  </div>

  <!-- Pokud placená akce -->
  <div style="margin-top: 24px;">
    <h2>Platba</h2>
    <p>Částka: <strong>[200 Kč]</strong></p>
    <img src="[QR kód]" alt="QR platba" style="max-width: 200px;" />
  </div>

  <p style="margin-top: 32px; color: #4B5563; font-size: 14px;">
    S pozdravem,<br/>
    Institut Pí
  </p>
</body>
</html>
```

### 9.2 Upomínka (Mobile-Optimized)
- Podobná struktura
- Důraz na CTA button (Přidat do kalendáře)
- Responsive QR kód
- Kompaktní meta informace

---

## 10. Bezpečnost

- **Admin API:** JWT autentizace
- **Rate limiting:** Cloudflare Workers rate limiting (10 requests/min per IP)
- **CORS:** Správná konfigurace pro akce.institutpi.cz
- **Input validation:** Zod schema validation
- **SQL injection:** Prepared statements v D1
- **XSS protection:** Sanitizace HTML v long_description
- **CSRF:** Token validation pro admin formuláře
- **HTTPS:** Vynuceno Cloudflare

---

## 11. Performance & Mobile Optimization

### 11.1 Performance Budget
- First Contentful Paint: < 1.5s (mobile)
- Time to Interactive: < 3.5s (mobile)
- Lighthouse Score: > 90 (mobile)

### 11.2 Optimalizace
- **Obrázky:**
  - WebP format s JPEG fallback
  - Responsive images (srcset)
  - Lazy loading
  - R2 CDN delivery
  - Max width: 1920px
  - Compression: 80% quality

- **Fonty:**
  - Preload Bebas Neue & Source Serif
  - WOFF2 format
  - font-display: swap
  - Subset fontů (pouze české znaky)

- **CSS:**
  - Critical CSS inline
  - Tailwind JIT mode
  - PurgeCSS v produkci
  - < 50KB gzipped

- **JavaScript:**
  - Code splitting
  - Lazy load admin bundle
  - < 100KB gzipped (public site)
  - No third-party scripts (kromě nezbytných)

### 11.3 Mobile-Specific
- Touch target min 44x44px
- Optimalizované SVG ikony
- Horizontal scroll pro lists
- Pull-to-refresh (native)
- Haptic feedback na buttony (iOS)
- Safe area insets (notch support)

---

## 12. Deployment

### Cloudflare Workers
```bash
npx wrangler deploy
```

### D1 Database
```bash
npx wrangler d1 create institutpi-events
npx wrangler d1 execute institutpi-events --file=./schema.sql
```

### R2 Bucket
```bash
npx wrangler r2 bucket create institutpi-images
```

### Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy ./build
```

### Environment Variables
```toml
[vars]
RESEND_API_KEY = "..."
JWT_SECRET = "..."
ADMIN_EMAIL = "patrick.zandl@institutpi.cz"
SITE_URL = "https://akce.institutpi.cz"
MAIN_SITE_URL = "https://www.institutpi.cz"
BANK_ACCOUNT = "2002103571/2010"

[[d1_databases]]
binding = "DB"
database_name = "institutpi-events"
database_id = "..."

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "institutpi-images"

[[queues.producers]]
binding = "EMAIL_QUEUE"
queue = "email-queue"
```

---

## 13. Monitoring & Analytics

- Cloudflare Workers Analytics
- Cloudflare Web Analytics (privacy-friendly, no cookies)
- Error tracking přes Cloudflare Logs
- Email delivery tracking (Resend dashboard)
- Custom metrics:
  - Conversion rate (zobrazení → registrace)
  - Confirmation rate (registrace → potvrzení)
  - Show-up rate (odhad)
  - Email open rate

---

## 14. Accessibility (WCAG 2.1 AA)

- Semantic HTML5
- ARIA labels kde potřeba
- Keyboard navigation
- Focus indicators
- Alt text pro všechny obrázky
- Kontrast min 4.5:1 (text)
- Kontrast min 3:1 (UI components)
- Skip to content link
- Screen reader testováno

---

## 15. Future Enhancements

**V1.1:**
- PWA support (Add to Home Screen)
- Push notifications (upomínky)
- Offline mode (cached events)

**V2.0:**
- Google/Apple Wallet passes
- Automatická kontrola plateb přes bank API
- Čekací listina při plné kapacitě
- QR check-in kódy při vstupu

**V3.0:**
- Uživatelské účty s historií
- Ankety po akci
- Multilanguage (EN)
- Stripe integrace
- Apple Pay / Google Pay

---

## 16. Milestones

**Fáze 1 - MVP (2 týdny):**
- ✅ Design system setup
- ✅ D1 databáze + schema
- ✅ Basic Worker API
- ✅ Frontend homepage + detail akce (mobile-first)
- ✅ Registrace s email potvrzením

**Fáze 2 - Admin (1 týden):**
- ✅ Admin panel (login, CRUD akcí)
- ✅ Upload obrázků do R2
- ✅ QR kód generování
- ✅ Mobile-responsive admin

**Fáze 3 - Automatizace (1 týden):**
- ✅ Cron job pro upomínky
- ✅ Kalendářní export
- ✅ Archiv akcí
- ✅ Email templates (HTML)

**Fáze 4 - Polish (3 dny):**
- ✅ Dashboard statistiky
- ✅ Mobile optimalizace
- ✅ Performance tuning
- ✅ Accessibility audit
- ✅ Production deployment

**Launch:** 4 týdny od startu

---

## 17. Success Metrics

**Launch KPIs:**
- Mobile Lighthouse score > 90
- Desktop Lighthouse score > 95
- Registration conversion > 60%
- Email confirmation rate > 80%
- Zero downtime
- Response time < 200ms (p95)

**Business KPIs:**
- Počet registrací/akci
- Show-up rate
- Email delivery rate > 99%
- User satisfaction > 4/5

---

## 18. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Email deliverability | Vysoký | Resend + SendGrid fallback, DKIM/SPF setup |
| Cloudflare Free limits | Střední | Monitoring, upgrade plán |
| Mobile performance | Střední | Performance budget, optimalizace |
| GDPR compliance | Vysoký | Legal review, consent management |
| Spam registrace | Střední | Rate limiting, honeypot, reCAPTCHA |

---
