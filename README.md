# FixSignal

FixSignal is a static site generator for an ad-optimized appliance/device error code troubleshooting website.

## Features
- Programmatic generation of hundreds of troubleshooting pages
- No user-facing LLM dependency
- Ad slot placeholders and high-intent page layout
- SEO files (`sitemap.xml`, `robots.txt`, JSON-LD)
- Policy pages for monetization trust and compliance

## Requirements
- Node.js 20+

## Build
```bash
npm install
npm run build
```

Generated site output is in `dist/` and can be deployed to Netlify, Vercel static hosting, Cloudflare Pages, GitHub Pages, or any static server.

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
