# FixApplianceCodes.com

FixApplianceCodes.com is a static site generator for an ad-optimized appliance/device error code troubleshooting website.

## Features
- Programmatic generation of hundreds of troubleshooting pages
- No user-facing LLM dependency
- High-intent troubleshooting layout with clean, non-deceptive UX
- SEO files (`sitemap.xml`, `robots.txt`, JSON-LD)
- Policy pages for monetization trust and compliance
- Cookie consent banner with accept/reject controls and persisted preference

## Requirements
- Node.js 20+

## Build
```bash
npm install
npm run build
```

Optional env vars:
- `GA_MEASUREMENT_ID` (default: `G-TF1KR11FSD`)

Generated site output is in `dist/` and can be deployed to Netlify, Vercel static hosting, Cloudflare Pages, GitHub Pages, or any static server.

## Automatic deploy to Cloudflare Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-cloudflare-pages.yml`.

### 1) Create a Cloudflare Pages project
- Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
- Project name: `fixappliancecodes`

### 2) Add GitHub repository secrets
In GitHub repo settings (`Settings → Secrets and variables → Actions`), add:
- `CLOUDFLARE_API_TOKEN` (token with Cloudflare Pages edit permissions)
- `CLOUDFLARE_ACCOUNT_ID` (your Cloudflare account ID)

### 3) Push to `main`
- Every push to `main` triggers build and deploy automatically.
- Build uses `SITE_URL=https://fixappliancecodes.com`.

### 4) Domain
- In Cloudflare Pages project settings, add custom domain: `fixappliancecodes.com`.

## Content Model
Source data is generated into `data/error-codes.json` by `scripts/generate-seed.mjs`.

Fields include:
- brand
- appliance
- modelFamily
- code
- symptom
- severity
- causes[]
- steps[]
- tools[]
- preventiveTips[]
- estimatedFixTime
- whenToStop

## Important
This site provides troubleshooting guidance and is not a substitute for official manufacturer safety guidance.

## AdSense & compliance review checklist
- Ensure policy pages are live and accessible: `/privacy`, `/cookies`, `/terms`, `/disclaimer`, `/editorial-policy`, `/contact`.
- Confirm consent flow appears for first-time visitors and allows rejecting non-essential cookies.
- Use a Google-certified CMP for EEA/UK/Switzerland traffic when enabling AdSense ads personalization.
- Add a valid `ads.txt` file only after your AdSense publisher ID is issued.
- Keep content original, avoid deceptive navigation, and do not encourage ad clicks.
- Re-run `npm run build` before each deploy and manually spot-check key templates in `dist/`.
