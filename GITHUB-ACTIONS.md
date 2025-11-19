# GitHub Actions Deployment

## 🚀 Automatický Build & Deploy

Tento projekt používá GitHub Actions pro automatický build a deploy na Cloudflare Pages. **Není nutné** konfigurovat build v Cloudflare Dashboard!

### Výhody GitHub Actions

✅ Build probíhá na GitHubu, ne na Cloudflare
✅ Není nutné nastavovat build command v dashboard
✅ Lepší kontrola nad build procesem
✅ Možnost přidat testy před deploymentem
✅ Automatický deploy při push do `main`
✅ Preview deployments pro pull requesty

## ⚙️ Nastavení GitHub Secrets

Pro funkční deployment je potřeba nastavit dva GitHub Secrets:

### 1. Získání Cloudflare API Token

1. Přihlaste se do [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Jděte na **My Profile** → **API Tokens**
3. Klikněte **Create Token**
4. Použijte šablonu **Edit Cloudflare Workers** nebo vytvořte custom token s oprávněními:
   - **Account** → **Cloudflare Pages** → **Edit**
5. Zkopírujte vygenerovaný token

### 2. Získání Account ID

1. V Cloudflare Dashboard jděte na **Pages**
2. Vyberte libovolný projekt
3. V URL vidíte: `https://dash.cloudflare.com/[ACCOUNT_ID]/pages/...`
4. Zkopírujte `ACCOUNT_ID` část z URL

nebo

1. Jděte na **Overview** v hlavním menu
2. Account ID je vidět v pravém panelu

### 3. Přidání Secrets do GitHub

1. Jděte na GitHub repository: `tangero/rezervace-institut`
2. **Settings** → **Secrets and variables** → **Actions**
3. Klikněte **New repository secret**
4. Přidejte tyto dva secrets:

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | Token z kroku 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID z kroku 2 |

## 🔄 Jak to funguje

### Automatický deployment

Při každém push do `main` branch:

```
1. GitHub Actions spustí workflow
2. Nainstaluje dependencies (npm ci)
3. Buildne SvelteKit aplikaci (npm run build)
4. Nasadí na Cloudflare Pages (wrangler pages deploy)
```

### Preview deployments

Při vytvoření Pull Requestu:

```
1. GitHub Actions spustí workflow
2. Build + deploy do preview environmentu
3. Preview URL se zobrazí v PR komentáři
```

## 📝 Workflow soubor

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout kódu
      - Setup Node.js 18
      - Install dependencies
      - Build aplikace
      - Deploy na Cloudflare Pages
```

## 🆘 Troubleshooting

### ❌ Error: "CLOUDFLARE_API_TOKEN not found"
**Řešení:** Zkontrolujte, že jste přidali secrets v GitHub Settings

### ❌ Error: "Unauthorized"
**Řešení:** API token nemá správná oprávnění. Vytvořte nový s "Cloudflare Pages - Edit"

### ❌ Build fails
**Řešení:** Spusťte `npm run build` lokálně a opravte případné chyby

### ⚠️ Warning: Multiple deployments
**Status:** Pokud máte nastavený i Cloudflare Git integration, mohou běžet dva deploymenty
**Řešení:** Vypněte Cloudflare Git integration v Pages Settings → Builds & deployments → Disable

## 🔗 Užitečné odkazy

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)

---

## 🎯 Alternativa: Cloudflare Git Integration

Pokud nechcete používat GitHub Actions, můžete použít Cloudflare Git Integration:

1. Vypněte GitHub Actions workflow (přejmenujte nebo smažte `.github/workflows/deploy.yml`)
2. Nakonfigurujte build v Cloudflare Pages Dashboard podle [QUICKSTART.md](QUICKSTART.md)

**Poznámka:** GitHub Actions způsob je doporučený, protože poskytuje lepší kontrolu a flexibilitu.
