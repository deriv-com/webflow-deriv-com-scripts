import { getCookie } from "../cookies";

const baseDomains = ["https://deriv.com", "https://staging.deriv.com"];

const restrictedPaths = [
  "/trade/options",
  "/markets/derived-indices/synthetic-indices",
  "/tradingview",
  "/mt5-trading-signals#signal-subscriber",
  "/economic-calendar",
  "/market-buzz",
  "/trading-central",
  "/trading-platforms/deriv-ctrader",
  "/trading-platforms/deriv-x",
  "/trading-platforms/deriv-trader",
  "/trading-platforms/deriv-go",
  "/trading-platforms/deriv-bot",
  "/p2p",
  "/blog",
  "/trading-terms-glossary",
  "/partners",
  "/fraud-prevention",
  "/partners-help-centre",
  "/terms-and-conditions/deriv-mauritius-ltd-additional-terms",
  "/terms-and-conditions/deriv-fx-ltd-additional-terms",
  "/terms-and-conditions/deriv-bvi-ltd-additional-terms",
  "/terms-and-conditions/deriv-v-ltd-additional-terms",
  "/terms-and-conditions/business-partners-general-terms",
  "/terms-and-conditions/affiliates-introducing-brokers-ibs",
  "/terms-and-conditions/payment-agents",
  "/terms-and-conditions/api-users",
  "/terms-and-conditions/bug-bounty-program",
  "/trading-specifications#forex",
  "/trading-specifications#derived-indices",
  "/trading-specifications#stocks",
  "/trading-specifications#stock-indices",
  "/trading-specifications#commodities",
  "/trading-specifications#cryptocurrencies",
  "/trading-specifications#etfs",
  "/payment-methods",
];

const uaeRestrictedPages = baseDomains.flatMap((domain) =>
  restrictedPaths.map((path) => `${domain}${path}`)
);

function normalizeUrl(url) {
  // Lowercase, remove trailing slash (except for root), remove hash/query
  try {
    const u = new URL(url);
    let path = u.pathname.replace(/\/$/, "");
    return `${u.origin}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

// Remove a leading locale segment like "/fr", "/ar" or "/zh-cn" from a pathname
function stripLocaleFromPath(pathname) {
  if (!pathname || pathname === "/") return "/";
  const segments = pathname.split("/");
  if (segments.length > 1) {
    const firstSegment = segments[1];
    if (/^[a-z]{2}(?:-[a-z]{2})?$/i.test(firstSegment)) {
      const rest = segments.slice(2).join("/");
      return rest ? `/${rest}` : "/";
    }
  }
  return pathname;
}

function isUaeRestrictedPage() {
  const strippedPath = stripLocaleFromPath(window.location.pathname);
  const currentUrl = window.location.origin + strippedPath;
  const normalizedCurrent = normalizeUrl(currentUrl);
  return uaeRestrictedPages.some((base) => {
    const normalizedBase = normalizeUrl(base);
    // Match base or any subpage
    return (
      normalizedCurrent === normalizedBase ||
      normalizedCurrent.startsWith(normalizedBase + "/")
    );
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const isInternalUser = getCookie("internal");
  if (isInternalUser === "true") return;
  const geomodalBg = document.querySelector("#geomodal");
  const intervalId = setInterval(() => {
    const clientsCountry = window.getClientCountry();
    if (clientsCountry) {
      clearInterval(intervalId);
      if (clientsCountry.toLowerCase() === "ae" && isUaeRestrictedPage()) {
        if (geomodalBg && geomodalBg.classList.contains("hide-element")) {
          geomodalBg.classList.remove("hide-element");
          document.body.style.overflow = "hidden";
        }
      } else {
        // If not restricted, ensure geomodal is hidden
        if (geomodalBg && !geomodalBg.classList.contains("hide-element")) {
          geomodalBg.classList.add("hide-element");
          document.body.style.overflow = "";
        }
      }
    }
  }, 100);
});
