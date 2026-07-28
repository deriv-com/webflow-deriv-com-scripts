/**
 * generate_ae_academy_sitemap.js
 *
 * Fetches https://academy.deriv.ae/sitemap.xml (and .../robots.txt) and
 * rewrites every URL to the new deriv.com/ae structure.
 *
 * IMPORTANT path rule: if the URL has a locale prefix (e.g. "/ar/..."),
 * the locale must come BEFORE "academy" in the new path, not after:
 *
 *   https://academy.deriv.ae/ar/trading-guides/
 *     -> https://deriv.com/ae/ar/academy/trading-guides/   (locale first)
 *
 *   https://academy.deriv.ae/trading-guides/   (default language, no locale)
 *     -> https://deriv.com/ae/academy/trading-guides/
 *
 * Add any additional locale codes used by academy.deriv.ae to KNOWN_LOCALES
 * below (e.g. if a Spanish version is added later).
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
const TARGET_HOST = "https://deriv.com";

// Locale codes that appear as the FIRST path segment on academy.deriv.ae
// and need to be moved in front of "academy" in the new URL.
const KNOWN_LOCALES = ["ar"];

// Written under an "ae/academy" subfolder so that when this gets uploaded
// to R2 (alongside the existing deriv.com content), it lands at
// <bucket>/ae/academy/... i.e. https://urls.deriv.com/ae/academy/sitemap.xml
const OUTPUT_DIR = path.join(process.cwd(), "output", "ae", "academy");

/**
 * Given the path portion of a source URL (e.g. "/ar/trading-guides/",
 * "/trading-guides/", "/", or ""), build the new deriv.com/ae path with
 * the locale (if any) moved before "academy".
 */
function buildNewPath(origPath) {
  const hadTrailingSlash = origPath.endsWith("/");
  const trimmed = origPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const segments = trimmed === "" ? [] : trimmed.split("/");

  let locale = null;
  if (segments.length && KNOWN_LOCALES.includes(segments[0])) {
    locale = segments.shift();
  }

  const rest = segments.join("/");
  let newPath = locale ? `/ae/${locale}/academy` : `/ae/academy`;
  if (rest) newPath += `/${rest}`;
  if (hadTrailingSlash) newPath += `/`;
  return newPath;
}

function rewriteText(text) {
  return text.replace(
    /https?:\/\/academy\.deriv\.ae(\/[^\s"'<>]*)?/g,
    (_match, pathPart) => `${TARGET_HOST}${buildNewPath(pathPart || "")}`
  );
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
      const childRewritten = rewriteText(childRaw);
      const outName = fileNameFromUrl(childUrl);
      fs.writeFileSync(path.join(OUTPUT_DIR, outName), childRewritten, "utf8");
      console.log(`Wrote ${outName}`);
    }
  }

  // Rewrite the (index or plain) sitemap itself and write it out as sitemap.xml
  const mainRewritten = rewriteText(mainSitemapRaw);
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), mainRewritten, "utf8");
  console.log("Wrote sitemap.xml");

  // 2. robots.txt
  try {
    const robotsUrl = `${SOURCE_DOMAIN}/robots.txt`;
    const robotsRaw = await fetchText(robotsUrl);
    const robotsRewritten = rewriteText(robotsRaw);
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
