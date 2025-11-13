# ⚡ Cloudflare Pages - Quick Setup

## MUSÍTE NASTAVIT V DASHBOARD!

Cloudflare Pages vyžaduje build konfiguraci v UI, **nelze** ji dát do `wrangler.toml`.

### 📍 Kde nastavit

```
Cloudflare Dashboard
  → Pages
    → rezervace-institut (váš projekt)
      → Settings
        → Builds & deployments
          → Configure Production deployments
```

### ✅ Co nastavit

| Pole | Hodnota |
|------|---------|
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `.svelte-kit/cloudflare` |
| **Root directory** | _(ponechat prázdné)_ |

### 🔧 Environment Variables (doporučené)

V sekci **Environment variables** → **Add variable**:

| Name | Value |
|------|-------|
| `NODE_VERSION` | `18` |

### 🚀 Po nastavení

1. **Save** configuration
2. Jděte na **Deployments** tab
3. Klikněte **Retry deployment** na poslední failed deploymetu

nebo

4. Pushněte nový commit → automatický deploy

---

## 🆘 Troubleshooting

### ❌ Error: "Output directory not found"
**Příčina:** Build command není nastaven nebo je špatně
**Řešení:** Zkontrolujte build command v dashboard (viz výše)

### ❌ Error: "No build command specified"
**Příčina:** Build command chybí v dashboard
**Řešení:** Přidejte `npm run build` v Build settings

### ❌ Build uspěje, ale stránka je prázdná/404
**Příčina:** Chybná output directory
**Řešení:** Ujistěte se, že output dir je `.svelte-kit/cloudflare` (včetně tečky)

### ⚠️ Warning: "vars not inherited by environments"
**Status:** Neškodná warning, můžete ignorovat
**Příčina:** `wrangler.toml` má bindings na top level, ne v env.preview
**Dopad:** Žádný - v MVP nepotřebujeme preview environment bindings

---

## 📚 Detailní dokumentace

Kompletní deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔗 Užitečné odkazy

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
