import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const dataPath = resolve("data/error-codes.json");
const cssPath = resolve("src/styles.css");
const baseUrl = (process.env.SITE_URL || "https://fixappliancecodes.com").replace(/\/$/, "");
const policyUpdatedAt = "2026-02-20";

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
  const year = new Date().getFullYear();
  return `
    <footer>
      <div class="wrap">
        <div class="links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/cookies">Cookies</a>
          <a href="/terms">Terms</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/editorial-policy">Editorial Policy</a>
          <a href="/contact">Contact</a>
        </div>
        <small>© ${year} FixApplianceCodes.com · Troubleshooting guidance only. Always follow official safety manuals.</small>
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
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <link rel="stylesheet" href="/assets/styles.css" />
    ${ldScripts}
  </head>
  <body>
    ${nav()}
    ${content}
    <div id="cookie-consent" class="cookie-consent" hidden>
      <p>This site uses cookies for essential functionality and, with your permission, for analytics and advertising. See our <a href="/cookies">Cookie Policy</a>.</p>
      <div class="cookie-actions">
        <button id="cookie-accept" type="button">Accept all</button>
        <button id="cookie-reject" type="button" class="btn-muted">Reject non-essential</button>
      </div>
    </div>
    ${footer()}
    <script>
      (function () {
        var key = 'fac_cookie_consent_v1';
        var banner = document.getElementById('cookie-consent');
        var accept = document.getElementById('cookie-accept');
        var reject = document.getElementById('cookie-reject');

        function setConsent(state) {
          localStorage.setItem(key, state);
          document.documentElement.setAttribute('data-cookie-consent', state);
          if (banner) banner.hidden = true;
        }

        function openBanner() {
          if (banner) banner.hidden = false;
        }

        var saved = localStorage.getItem(key);
        if (saved === 'accepted' || saved === 'rejected') {
          document.documentElement.setAttribute('data-cookie-consent', saved);
        } else {
          openBanner();
        }

        if (accept) {
          accept.addEventListener('click', function () {
            setConsent('accepted');
          });
        }

        if (reject) {
          reject.addEventListener('click', function () {
            setConsent('rejected');
          });
        }

        document.querySelectorAll('[data-open-consent]').forEach(function (button) {
          button.addEventListener('click', function () {
            openBanner();
          });
        });
      })();
    </script>
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

      <section class="card">
        <h2>Top matches</h2>
        <ul id="results" class="list"></ul>
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
        <section class="card">
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
        <section class="card">
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
    <p><strong>Last updated:</strong> ${policyUpdatedAt}</p>
    <p>We process limited technical data (for example IP address, user-agent, page URLs, and timestamps) to operate, secure, and improve this website.</p>
    <p>If advertising is enabled, third-party partners (including Google) may process identifiers and cookie data for ad delivery, fraud prevention, frequency capping, measurement, and (where consented) personalization.</p>
    <p>We do not knowingly collect special-category personal data and we do not sell personal data directly.</p>
    <p>You can request access, correction, deletion, or objection rights by contacting <a href="mailto:flip2dip@gmail.com">flip2dip@gmail.com</a>.</p>
    <p>For details on Google partner data use, see <a href="https://www.google.com/policies/privacy/partners/" rel="nofollow">How Google uses information from sites or apps that use our services</a>.</p>
  `
});

simplePage({
  path: "cookies",
  title: "Cookie Policy",
  body: `
    <p><strong>Last updated:</strong> ${policyUpdatedAt}</p>
    <p>We use storage technologies (cookies/local storage) for: (1) strictly necessary functions, and optionally (2) analytics and (3) advertising.</p>
    <h2>Strictly necessary</h2>
    <p>Required to provide core site functionality and security. These do not require consent in many jurisdictions.</p>
    <h2>Analytics</h2>
    <p>Help us understand site usage and improve content quality.</p>
    <h2>Advertising</h2>
    <p>Used by ad partners for delivery, measurement, fraud prevention, and (if allowed) personalization.</p>
    <h2>Consent and withdrawal</h2>
    <p>Visitors in regions requiring consent are asked to choose before non-essential cookies are used. You can change your choice at any time:</p>
    <p><button type="button" data-open-consent>Open cookie choices</button></p>
    <p>You can also manage storage via browser settings. Blocking cookies may affect some features.</p>
  `
});

simplePage({
  path: "terms",
  title: "Terms of Use",
  body: `
    <p><strong>Last updated:</strong> ${policyUpdatedAt}</p>
    <p>FixApplianceCodes.com provides informational troubleshooting content only. No warranty is provided for completeness, accuracy, or repair outcomes.</p>
    <p>You are responsible for your own actions and safety decisions. Always follow manufacturer instructions and local legal/safety requirements.</p>
    <p>This site is not affiliated with, endorsed by, or sponsored by appliance manufacturers referenced on the site.</p>
    <p>Unauthorized copying or bulk republication of our content is prohibited.</p>
  `
});

simplePage({
  path: "disclaimer",
  title: "Disclaimer",
  body: `
    <p><strong>Last updated:</strong> ${policyUpdatedAt}</p>
    <p>Content on FixApplianceCodes.com is general information, not professional repair, legal, engineering, or safety advice.</p>
    <p>Stop immediately and contact a licensed professional for gas smells, electrical burning odor, overheating, active leaks, smoke, or repeated breaker trips.</p>
    <p>Always consult official manuals and qualified technicians before attempting repairs involving electricity, gas, heat, refrigeration systems, or water lines.</p>
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
  "/cookies",
  "/terms",
  "/disclaimer",
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
