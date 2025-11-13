# Cloudflare Pages Deployment Guide

## Nastavení v Cloudflare Pages Dashboard

Pro správný deployment je potřeba nastavit build konfiguraci v Cloudflare Pages dashboard:

### 1. Přihlaste se do Cloudflare Dashboard
- Jděte na [dash.cloudflare.com](https://dash.cloudflare.com)
- Vyberte **Pages** v levém menu

### 2. Vyberte nebo vytvořte Pages projekt
- Pokud projekt už existuje, klikněte na něj
- Pokud ne, klikněte **Create a project** → **Connect to Git**

### 3. Nakonfigurujte Build settings

V sekci **Build settings** nastavte následující:

```
Production branch: main

Build command:
npm run build

Build output directory:
.svelte-kit/cloudflare

Root directory:
(leave empty)

Environment variables:
NODE_VERSION = 18
```

### 4. Environment Variables (volitelné)

Pro production můžete přidat:

```
SITE_URL = https://akce.institutpi.cz
MAIN_SITE_URL = https://www.institutpi.cz
BANK_ACCOUNT = 2002103571/2010
ADMIN_EMAIL = patrick.zandl@institutpi.cz
```

### 5. Preview Deployments

Cloudflare Pages automaticky vytvoří preview pro každý pull request nebo push do jiné branch než `main`.

Preview URL formát: `https://[commit-hash].rezervace-institut.pages.dev`

### 6. D1 Database (budoucí použití)

Pro připojení D1 databáze:
1. Vytvořte D1 databázi: `npx wrangler d1 create institutpi-events`
2. V Pages Settings → Functions → D1 database bindings
3. Přidejte binding: `DB` → vyberte databázi `institutpi-events`

### 7. R2 Bucket (budoucí použití)

Pro připojení R2 bucketu:
1. Vytvořte R2 bucket: `npx wrangler r2 bucket create institutpi-images`
2. V Pages Settings → Functions → R2 bucket bindings
3. Přidejte binding: `IMAGES` → vyberte bucket `institutpi-images`

## Troubleshooting

### Build fails s "Output directory not found"

Ujistěte se, že:
- Build command je správně nastaven na `npm run build`
- Build output directory je `.svelte-kit/cloudflare`
- NODE_VERSION je 18 nebo vyšší

### Build prebíhá, ale stránka je prázdná

Zkontrolujte:
- Console v browseru (F12) pro JavaScript chyby
- Cloudflare Pages Functions logs
- Správné nastavení `wrangler.toml` s `pages_build_output_dir`

### Deploy je úspěšný, ale stránka zobrazuje 404

- Ujistěte se, že custom domain (akce.institutpi.cz) je správně nakonfigurovaná v Pages Settings → Custom domains

## Manuální Deploy (backup)

Pokud Git integration nefunguje, můžete deployovat manuálně:

```bash
# Build lokálně
npm run build

# Deploy pomocí Wrangler
npx wrangler pages deploy .svelte-kit/cloudflare
```

## Continuous Deployment

Po správném nastavení, Cloudflare Pages automaticky:
- ✅ Builduje a deployuje při každém push do `main` (production)
- ✅ Vytváří preview při pull requestech
- ✅ Invaliduje cache
- ✅ Spouští edge functions

---

**Poznámka:** Tento projekt používá SvelteKit s `@sveltejs/adapter-cloudflare`, který automaticky generuje správnou strukturu pro Cloudflare Pages včetně `_worker.js` a routing.
