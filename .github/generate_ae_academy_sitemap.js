/**
 * generate_ae_academy_sitemap.js
 *
 * Fetches https://academy.deriv.ae/sitemap.xml (and .../robots.txt),
 * rewrites every "https://academy.deriv.ae" occurrence to
 * "https://deriv.com/ae/academy", and writes the results to the output
 * directory.
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

const SOURCE_DOMAIN = "https://academy.deriv.ae";
const TARGET_DOMAIN = "https://deriv.com/ae/academy";

// Written under an "ae/academy" subfolder so that when this gets uploaded
// to R2 (alongside the existing deriv.com content), it lands at
// <bucket>/ae/academy/... i.e. https://urls.deriv.com/ae/academy/sitemap.xml
const OUTPUT_DIR = path.join(process.cwd(), "output", "ae", "academy");

function rewriteDomain(text) {
  // Replace both "https://academy.deriv.ae" and "http://academy.deriv.ae"
  // just in case, then normalize any accidental double slashes introduced
  // by the rewrite.
  return text
    .replace(/https?:\/\/academy\.deriv\.ae/g, TARGET_DOMAIN)
    .replace(/(deriv\.com\/ae\/academy)\/{2,}/g, "$1/");
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

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Main sitemap
  const mainSitemapUrl = `${SOURCE_DOMAIN}/sitemap.xml`;
  const mainSitemapRaw = await fetchText(mainSitemapUrl);
  const isIndex = /<sitemapindex/i.test(mainSitemapRaw);

  if (isIndex) {
    console.log("Detected a sitemap index. Processing child sitemaps...");
    const childUrls = extractLocs(mainSitemapRaw);

    for (const childUrl of childUrls) {
      const childRaw = await fetchText(childUrl);
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
    const robotsUrl = `${SOURCE_DOMAIN}/robots.txt`;
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
