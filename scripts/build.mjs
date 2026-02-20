import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const dataPath = resolve("data/error-codes.json");
const cssPath = resolve("src/styles.css");
const baseUrl = (process.env.SITE_URL || "https://fixappliancecodes.com").replace(/\/$/, "");

if (!existsSync(dataPath)) {
  throw new Error("Missing data/error-codes.json. Run `npm run seed` first.");
}

const entries = JSON.parse(readFileSync(dataPath, "utf8"));
if (!Array.isArray(entries) || entries.length === 0) {
  throw new Error("No entries found in data/error-codes.json");
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(resolve("dist/assets"), { recursive: true });
copyFileSync(cssPath, resolve("dist/assets/styles.css"));

const byBrand = groupBy(entries, (entry) => entry.brandSlug);
const byAppliance = groupBy(entries, (entry) => entry.applianceSlug);

function groupBy(list, keyFn) {
  return list.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function slugLabel(input) {
  return input
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function writePage(relativePath, html) {
  const path = resolve("dist", relativePath, "index.html");
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, html);
}

function nav() {
  return `
    <header class="site">
      <div class="wrap nav">
        <a class="brand" href="/">FixApplianceCodes.com</a>
        <nav class="nav-links">
          <a href="/">Home</a>
          <a href="/brands">Brands</a>
          <a href="/appliances">Appliances</a>
          <a href="/editorial-policy">Editorial Policy</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

function footer() {
  return `
    <footer>
      <div class="wrap">
        <div class="links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/editorial-policy">Editorial Policy</a>
          <a href="/contact">Contact</a>
        </div>
        <small>© 2026 FixApplianceCodes.com · Troubleshooting guidance only. Always follow official safety manuals.</small>
      </div>
    </footer>
  `;
}

function layout({ title, description, canonicalPath, content, jsonLd = [] }) {
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const ldScripts = jsonLd
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <link rel="stylesheet" href="/assets/styles.css" />
    ${ldScripts}
  </head>
  <body>
    ${nav()}
    ${content}
    ${footer()}
  </body>
</html>`;
}

const searchIndex = entries.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  brand: entry.brand,
  brandSlug: entry.brandSlug,
  appliance: entry.appliance,
  applianceSlug: entry.applianceSlug,
  code: entry.code,
  summary: entry.summary,
  severity: entry.severity
}));

writeFileSync(resolve("dist/search-index.json"), JSON.stringify(searchIndex));

const homeHtml = layout({
  title: "FixApplianceCodes.com — Appliance Error Code Fix Guides",
  description:
    "Find model-specific appliance error code fixes in seconds. High-intent troubleshooting pages for washers, dishwashers, dryers, AC units, refrigerators, and ovens.",
  canonicalPath: "/",
  content: `
    <main class="wrap">
      <section class="hero">
        <h1>Find the exact fix for your appliance error code</h1>
        <p class="muted">Search by brand, appliance, or code. No chatbots. Fast, structured troubleshooting pages.</p>
        <div class="search card">
          <input id="q" type="text" placeholder="Try: LG washer OE" />
          <select id="brandFilter"><option value="">All brands</option></select>
          <select id="applianceFilter"><option value="">All appliances</option></select>
        </div>
      </section>

      <section class="grid">
        <div class="card">
          <h2>Top matches</h2>
          <ul id="results" class="list"></ul>
        </div>
        <aside>
          <div class="ad-slot">Ad slot (300x250)</div>
          <div class="ad-slot tall" style="margin-top:1rem;">Ad slot (300x600)</div>
        </aside>
      </section>

      <section class="card" style="margin-top:1rem;">
        <h2>Popular entry points</h2>
        <div class="columns">
          <div>
            <h3>By brand</h3>
            <ul class="list">
              ${Object.keys(byBrand)
                .slice(0, 10)
                .map((brandSlug) => `<li class="item"><a href="/brands/${brandSlug}">${escapeHtml(slugLabel(brandSlug))} (${byBrand[brandSlug].length})</a></li>`)
                .join("")}
            </ul>
          </div>
          <div>
            <h3>By appliance</h3>
            <ul class="list">
              ${Object.keys(byAppliance)
                .map((applianceSlug) => `<li class="item"><a href="/appliances/${applianceSlug}">${escapeHtml(slugLabel(applianceSlug))} (${byAppliance[applianceSlug].length})</a></li>`)
                .join("")}
            </ul>
          </div>
        </div>
        <div class="ad-slot banner">Ad slot (728x90)</div>
      </section>
    </main>

    <script>
      const index = ${JSON.stringify(searchIndex)};
      const q = document.getElementById('q');
      const brandFilter = document.getElementById('brandFilter');
      const applianceFilter = document.getElementById('applianceFilter');
      const results = document.getElementById('results');

      const brands = [...new Set(index.map(i => i.brand))].sort();
      const appliances = [...new Set(index.map(i => i.appliance))].sort();

      for (const brand of brands) {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
      }

      for (const appliance of appliances) {
        const option = document.createElement('option');
        option.value = appliance;
        option.textContent = appliance;
        applianceFilter.appendChild(option);
      }

      function normalize(value) {
        return String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();
      }

      function runSearch() {
        const needle = normalize(q.value);
        const queryTokens = needle ? needle.split(/\\s+/).filter(Boolean) : [];
        const selectedBrand = brandFilter.value;
        const selectedAppliance = applianceFilter.value;

        const matched = index
          .filter(item => !selectedBrand || item.brand === selectedBrand)
          .filter(item => !selectedAppliance || item.appliance === selectedAppliance)
          .filter(item => {
            if (queryTokens.length === 0) return true;
            const haystack = normalize([item.title, item.brand, item.appliance, item.code, item.summary].join(' '));
            const hayTokens = haystack.split(/\\s+/).filter(Boolean);
            const brandText = normalize(item.brand);
            const applianceText = normalize(item.appliance);
            const codeText = normalize(item.code);

            return queryTokens.every(token =>
              hayTokens.some(word => word.startsWith(token)) ||
              brandText.startsWith(token) ||
              applianceText.startsWith(token) ||
              codeText.startsWith(token)
            );
          });

        const deduped = [];
        const seen = new Map();

        for (const item of matched) {
          const key = [normalize(item.brand), normalize(item.appliance), normalize(item.code)].join('|');
          if (!seen.has(key)) {
            const next = { ...item, variantCount: 1 };
            seen.set(key, next);
            deduped.push(next);
          } else {
            seen.get(key).variantCount += 1;
          }
        }

        const filtered = deduped.slice(0, 30);

        results.innerHTML = filtered.map(item => {
          return '<li class="item">'
            + '<a href="/' + item.slug + '"><strong>' + item.title + '</strong></a>'
            + '<div class="muted">' + item.summary + '</div>'
            + '<div class="badges">'
            + '<span class="badge">' + item.brand + '</span>'
            + '<span class="badge">' + item.appliance + '</span>'
            + '<span class="badge">' + item.code + '</span>'
            + '<span class="badge">' + item.variantCount + ' variants</span>'
            + '<span class="badge ' + item.severity + '">' + item.severity + '</span>'
            + '</div>'
            + '</li>';
        }).join('');

        if (filtered.length === 0) {
          results.innerHTML = '<li class="item">No direct match. Try brand + code (example: Bosch E15).</li>';
        }
      }

      q.addEventListener('input', runSearch);
      brandFilter.addEventListener('change', runSearch);
      applianceFilter.addEventListener('change', runSearch);
      runSearch();
    </script>
  `,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FixApplianceCodes.com",
      url: `${baseUrl}/`,
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ]
});

writePage("", homeHtml);

for (const entry of entries) {
  const faq = [
    {
      question: `What does ${entry.code} mean on ${entry.brand} ${entry.appliance}?`,
      answer: `${entry.code} usually indicates: ${entry.summary}.`
    },
    {
      question: `Can I keep using the appliance with ${entry.code}?`,
      answer: `Use caution. Severity is ${entry.severity}. ${entry.whenToStop}`
    },
    {
      question: `How long does this fix usually take?`,
      answer: `Typical first-pass troubleshooting takes ${entry.estimatedFixTime}.`
    }
  ];

  const page = layout({
    title: entry.title,
    description: `${entry.summary} Fast troubleshooting steps, causes, and safety notes for ${entry.brand} ${entry.appliance} ${entry.modelFamily}.`,
    canonicalPath: `/${entry.slug}`,
    content: `
      <main class="wrap article-page">
        <div class="breadcrumb">
          <a href="/">Home</a> / <a href="/brands/${entry.brandSlug}">${entry.brand}</a> / <a href="/appliances/${entry.applianceSlug}">${slugLabel(entry.applianceSlug)}</a> / ${entry.code}
        </div>
        <section class="grid">
          <article class="article-main">
            <h1>${escapeHtml(entry.title)}</h1>
            <p class="meta-row"><span class="verified">Editorially reviewed</span>Updated ${entry.updatedAt} · Model family: ${escapeHtml(entry.modelFamily)}</p>
            <div class="quick-answer">
              <strong>Quick answer:</strong> ${escapeHtml(entry.summary)}
            </div>

            <h2>What you’ll notice</h2>
            <p>${escapeHtml(entry.symptom)}</p>
            <div class="badges">
              <span class="badge">${escapeHtml(entry.brand)}</span>
              <span class="badge">${escapeHtml(slugLabel(entry.applianceSlug))}</span>
              <span class="badge">Code ${escapeHtml(entry.code)}</span>
              <span class="badge ${escapeHtml(entry.severity)}">${escapeHtml(entry.severity)} severity</span>
            </div>

            <h2>Common causes</h2>
            <ul>
              ${entry.causes.map((cause) => `<li>${escapeHtml(cause)}</li>`).join("")}
            </ul>

            <div class="fix-steps">
              <h2>Step-by-step fix</h2>
              <ol>
                ${entry.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
              </ol>
            </div>

            <hr class="section-divider" />

            <h2>Tools you may need</h2>
            <div class="tool-grid">
              ${entry.tools.map((tool) => `<span class="tool">${escapeHtml(tool)}</span>`).join("")}
            </div>

            <h2>Prevention</h2>
            <ul>
              ${entry.preventiveTips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}
            </ul>

            <h2>When to stop DIY</h2>
            <p>${escapeHtml(entry.whenToStop)}</p>

            <h2>FAQ</h2>
            ${faq
              .map(
                (item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`
              )
              .join("")}
          </article>

          <aside>
            <div class="ad-slot">Ad slot (300x250)</div>
            <div class="card" style="margin-top:1rem;">
              <h3>Related pages</h3>
              <ul class="list">
                ${entries
                  .filter(
                    (candidate) =>
                      candidate.brandSlug === entry.brandSlug &&
                      candidate.applianceSlug === entry.applianceSlug &&
                      candidate.slug !== entry.slug
                  )
                  .slice(0, 8)
                  .map(
                    (candidate) =>
                      `<li class="item"><a href="/${candidate.slug}">${escapeHtml(candidate.code)} · ${escapeHtml(candidate.summary)}</a></li>`
                  )
                  .join("")}
              </ul>
            </div>
            <div class="ad-slot tall" style="margin-top:1rem;">Ad slot (300x600)</div>
          </aside>
        </section>
      </main>
    `,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: entry.title,
        description: entry.summary,
        dateModified: entry.updatedAt,
        author: {
          "@type": "Organization",
          name: "FixApplianceCodes.com Editorial Team"
        },
        mainEntityOfPage: `${baseUrl}/${entry.slug}`
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  });

  writePage(entry.slug, page);
}

for (const [brandSlug, items] of Object.entries(byBrand)) {
  const page = layout({
    title: `${slugLabel(brandSlug)} Error Code Guides`,
    description: `Browse ${items.length} ${slugLabel(brandSlug)} troubleshooting pages by appliance and code.`,
    canonicalPath: `/brands/${brandSlug}`,
    content: `
      <main class="wrap">
        <section class="hero">
          <h1>${escapeHtml(slugLabel(brandSlug))} error code guides</h1>
          <p class="muted">Model-family pages with structured troubleshooting steps.</p>
        </section>
        <section class="grid">
          <div class="card">
            <ul class="list">
              ${items
                .slice()
                .sort((a, b) => a.appliance.localeCompare(b.appliance) || a.code.localeCompare(b.code))
                .map(
                  (item) =>
                    `<li class="item"><a href="/${item.slug}"><strong>${escapeHtml(item.code)}</strong> · ${escapeHtml(
                      slugLabel(item.applianceSlug)
                    )} · ${escapeHtml(item.modelFamily)}</a><div class="muted">${escapeHtml(item.summary)}</div></li>`
                )
                .join("")}
            </ul>
          </div>
          <aside>
            <div class="ad-slot">Ad slot (300x250)</div>
            <div class="ad-slot tall" style="margin-top:1rem;">Ad slot (300x600)</div>
          </aside>
        </section>
      </main>
    `
  });

  writePage(`brands/${brandSlug}`, page);
}

for (const [applianceSlug, items] of Object.entries(byAppliance)) {
  const page = layout({
    title: `${slugLabel(applianceSlug)} Error Code Guides`,
    description: `Browse ${items.length} ${slugLabel(applianceSlug)} error code pages by brand and model family.`,
    canonicalPath: `/appliances/${applianceSlug}`,
    content: `
      <main class="wrap">
        <section class="hero">
          <h1>${escapeHtml(slugLabel(applianceSlug))} error code guides</h1>
          <p class="muted">Brand and model-family specific troubleshooting pages.</p>
        </section>
        <section class="grid">
          <div class="card">
            <ul class="list">
              ${items
                .slice()
                .sort((a, b) => a.brand.localeCompare(b.brand) || a.code.localeCompare(b.code))
                .map(
                  (item) =>
                    `<li class="item"><a href="/${item.slug}"><strong>${escapeHtml(item.brand)}</strong> · ${escapeHtml(
                      item.code
                    )} · ${escapeHtml(item.modelFamily)}</a><div class="muted">${escapeHtml(item.summary)}</div></li>`
                )
                .join("")}
            </ul>
          </div>
          <aside>
            <div class="ad-slot">Ad slot (300x250)</div>
            <div class="ad-slot tall" style="margin-top:1rem;">Ad slot (300x600)</div>
          </aside>
        </section>
      </main>
    `
  });

  writePage(`appliances/${applianceSlug}`, page);
}

function simplePage({ path, title, body }) {
  writePage(
    path,
    layout({
      title,
      description: title,
      canonicalPath: `/${path}`,
      content: `<main class="wrap"><section class="hero card"><h1>${escapeHtml(title)}</h1>${body}</section></main>`
    })
  );
}

simplePage({
  path: "about",
  title: "About FixApplianceCodes.com",
  body: `
    <p>FixApplianceCodes.com publishes structured troubleshooting guides for appliance and device error codes.</p>
    <p>Our goal is to help users identify likely causes quickly and choose a safe next action.</p>
    <p>FixApplianceCodes.com is ad-supported. Ads never alter troubleshooting recommendations.</p>
  `
});

simplePage({
  path: "editorial-policy",
  title: "Editorial Policy",
  body: `
    <p>FixApplianceCodes.com content is generated from structured technical templates and reviewed for clarity, consistency, and safety wording.</p>
    <p>We avoid copying manufacturer text verbatim and provide generalized troubleshooting pathways.</p>
    <p>High-risk guidance includes explicit stop conditions and a recommendation to seek licensed service.</p>
    <p>Update cadence: data is refreshed in periodic release batches with versioned build output.</p>
  `
});

simplePage({
  path: "privacy",
  title: "Privacy Policy",
  body: `
    <p>We collect basic analytics and ad delivery telemetry to operate and improve the website.</p>
    <p>Third-party advertising partners may use cookies or similar technologies subject to their own policies.</p>
    <p>Contact us to request data access or deletion requests where applicable.</p>
  `
});

simplePage({
  path: "terms",
  title: "Terms of Use",
  body: `
    <p>FixApplianceCodes.com provides informational troubleshooting content only and does not provide warranties of repair outcomes.</p>
    <p>Always follow official manufacturer safety instructions and local electrical/mechanical codes.</p>
    <p>You are responsible for your own repair decisions and actions.</p>
  `
});

simplePage({
  path: "contact",
  title: "Contact",
  body: `
    <p>Email: flip2dip@gmail.com</p>
    <p>For urgent repair and safety issues, contact a licensed technician immediately.</p>
  `
});

const brandsPage = layout({
  title: "All Brands",
  description: "Browse all brands available on FixApplianceCodes.com.",
  canonicalPath: "/brands",
  content: `<main class="wrap"><section class="hero card"><h1>All brands</h1><ul class="list">${Object.keys(byBrand)
    .sort()
    .map((slug) => `<li class="item"><a href="/brands/${slug}">${escapeHtml(slugLabel(slug))} (${byBrand[slug].length})</a></li>`)
    .join("")}</ul></section></main>`
});
writePage("brands", brandsPage);

const appliancesPage = layout({
  title: "All Appliances",
  description: "Browse all appliance categories available on FixApplianceCodes.com.",
  canonicalPath: "/appliances",
  content: `<main class="wrap"><section class="hero card"><h1>All appliances</h1><ul class="list">${Object.keys(byAppliance)
    .sort()
    .map(
      (slug) =>
        `<li class="item"><a href="/appliances/${slug}">${escapeHtml(slugLabel(slug))} (${byAppliance[slug].length})</a></li>`
    )
    .join("")}</ul></section></main>`
});
writePage("appliances", appliancesPage);

const allPaths = [
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/editorial-policy",
  "/brands",
  "/appliances",
  ...Object.keys(byBrand).map((slug) => `/brands/${slug}`),
  ...Object.keys(byAppliance).map((slug) => `/appliances/${slug}`),
  ...entries.map((entry) => `/${entry.slug}`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (path) => `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : "0.7"}</priority></url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync(resolve("dist/sitemap.xml"), sitemap);
writeFileSync(resolve("dist/robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
writeFileSync(
  resolve("dist/404.html"),
  layout({
    title: "Page not found",
    description: "The page you requested does not exist.",
    canonicalPath: "/404",
    content: `<main class="wrap"><section class="hero card"><h1>Page not found</h1><p>Try searching from the <a href="/">homepage</a>.</p></section></main>`
  })
);

console.log(`Built ${entries.length} code pages + index pages into dist/`);
