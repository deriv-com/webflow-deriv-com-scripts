/**
 * generate_ae_sitemap.js
 *
 * Fetches the sitemap from https://staging-ae.deriv.com/sitemap.xml.
 * Production (deriv.ae) no longer publishes a sitemap; it 301s to
 * deriv.com/ae/sitemap.xml, which 404s. The staging file still lists the
 * published deriv.ae URLs, and those are rewritten to https://deriv.com/ae.
 * robots.txt is still read from the published host. Staging robots.txt is
 * "Disallow: /" and must not be copied into the production output.
 *
 * Handles two cases for sitemap.xml:
 *   1. A plain <urlset> sitemap (list of <url><loc> entries)
 *   2. A <sitemapindex> that points to one or more child sitemaps -
 *      each child sitemap is also downloaded and rewritten.
 *
 * Requires Node 18+ (uses global fetch).
 */

const fs = require("fs");
const path = require("path");

// Where the sitemap file is actually published. Production does not serve one.
const SITEMAP_ORIGIN = "https://staging-ae.deriv.com";
// Host written inside that sitemap. Rewrite these, not the staging host.
const PUBLISHED_ORIGIN = "https://deriv.ae";
const TARGET_DOMAIN = "https://deriv.com/ae";
// Written under an "ae" subfolder so that when this gets uploaded to R2
// (alongside the existing deriv.com content), it lands at <bucket>/ae/...
// i.e. https://r2-domain.com/ae/sitemap.xml
const OUTPUT_DIR = path.join(process.cwd(), "output", "ae");

function rewriteDomain(text) {
  // Replace both "https://deriv.ae" and "http://deriv.ae" just in case,
  // then normalize any accidental double slashes introduced by the rewrite.
  return text
    .replace(/https?:\/\/deriv\.ae/g, TARGET_DOMAIN)
    .replace(/(deriv\.com\/ae)\/{2,}/g, "$1/");
}

function extractLocs(xml) {
  const matches = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)];
  return matches.map((m) => m[1]);
}

async function fetchText(url) {
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

function fileNameFromUrl(url) {
  const u = new URL(url);
  let name = path.basename(u.pathname);
  if (!name || name === "/") name = "sitemap.xml";
  return name;
}

function sitemapFetchUrl(url) {
  // An index may point child files at the published host, which has no sitemap.
  return url.replace(/^https?:\/\/deriv\.ae(?=\/|$)/i, SITEMAP_ORIGIN);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Main sitemap (staging). Locations inside still use the published host.
  const mainSitemapUrl = `${SITEMAP_ORIGIN}/sitemap.xml`;
  const mainSitemapRaw = await fetchText(mainSitemapUrl);
  const isIndex = /<sitemapindex/i.test(mainSitemapRaw);

  if (isIndex) {
    console.log("Detected a sitemap index. Processing child sitemaps...");
    const childUrls = extractLocs(mainSitemapRaw);

    for (const childUrl of childUrls) {
      const childRaw = await fetchText(sitemapFetchUrl(childUrl));
      const childRewritten = rewriteDomain(childRaw);
      const outName = fileNameFromUrl(childUrl);
      fs.writeFileSync(path.join(OUTPUT_DIR, outName), childRewritten, "utf8");
      console.log(`Wrote ${outName}`);
    }
  }

  // Rewrite the (index or plain) sitemap itself and write it out as sitemap.xml
  const mainRewritten = rewriteDomain(mainSitemapRaw);
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), mainRewritten, "utf8");
  console.log("Wrote sitemap.xml");

  // 2. robots.txt
  try {
    const robotsUrl = `${PUBLISHED_ORIGIN}/robots.txt`;
    const robotsRaw = await fetchText(robotsUrl);
    const robotsRewritten = rewriteDomain(robotsRaw);
    fs.writeFileSync(path.join(OUTPUT_DIR, "robots.txt"), robotsRewritten, "utf8");
    console.log("Wrote robots.txt");
  } catch (err) {
    console.warn(`Skipping robots.txt: ${err.message}`);
  }

  console.log(`Done. Files written to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
