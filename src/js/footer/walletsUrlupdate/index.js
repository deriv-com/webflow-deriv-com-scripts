import { getCookieByKey } from "../cookies";

// Gets the appropriate hub URL based on current hostname
const getHubUrl = () => {
  const isStaging = window.location.hostname === "staging.deriv.com";
  return isStaging
    ? "https://staging-hub.deriv.com/tradershub"
    : "https://hub.deriv.com/tradershub";
};

/**
 * Base URL patterns for wallet redirection
 * Maps URL patterns to their corresponding wallet paths
 */
const URL_PATTERNS = {
  "/cashier": "/wallets",
  "/cashier/withdrawal": "/wallets/withdrawal",
  "/cashier/account-transfer": "/wallets/transfer",
  "/wallet/withdrawal": "/wallets/withdrawal",
};

/**
 * Supported domains for wallet redirection
 */
const SUPPORTED_DOMAINS = [
  "https://deriv.com",
  "https://staging.deriv.com",
  "https://app.deriv.com",
];

/**
 * Cache for URL mappings to avoid recalculation
 */
let cachedUrlMappings = null;
let cachedHubUrl = null;

/**
 * Gets URL mappings for wallet redirection based on current environment
 * Uses caching to improve performance
 * @returns {Object} URL mappings object
 */
const getUrlMappings = () => {
  const currentHubUrl = getHubUrl();

  // Return cached mappings if hub URL hasn't changed
  if (cachedUrlMappings && cachedHubUrl === currentHubUrl) {
    return cachedUrlMappings;
  }

  // Generate new mappings
  const mappings = {};

  SUPPORTED_DOMAINS.forEach((domain) => {
    Object.entries(URL_PATTERNS).forEach(([oldPath, newPath]) => {
      const oldUrl = `${domain}${oldPath}`;
      const newUrl = `${currentHubUrl}${newPath}`;
      mappings[oldUrl] = newUrl;
    });
  });

  // Cache the results
  cachedUrlMappings = mappings;
  cachedHubUrl = currentHubUrl;

  return mappings;
};

// Checks if wallet redirection should be applied
const shouldApplyWalletRedirection = () => {
  try {
    const clientInformation = getCookieByKey(
      document.cookie,
      "client_information"
    );
    const walletAccount = getCookieByKey(document.cookie, "wallet_account");
    const currentDomain = window.location.hostname
      .split(".")
      .slice(-2)
      .join(".");

    return (
      clientInformation &&
      walletAccount === "true" &&
      currentDomain === "deriv.com"
    );
  } catch (error) {
    console.warn("Error checking wallet redirection conditions:", error);
    return false;
  }
};

// Updates a link's href if it matches any URL mapping
const updateLinkIfMatched = (link) => {
  try {
    const href = link.getAttribute("href");
    if (!href) return;

    // Get current URL mappings based on environment
    const urlMappings = getUrlMappings();

    // Find matching URL mapping
    const matchedMapping = Object.entries(urlMappings).find(([oldUrl]) =>
      href.startsWith(oldUrl)
    );

    if (matchedMapping) {
      const [oldUrl, newUrl] = matchedMapping;

      // Preserve query parameters if they exist
      const queryParams = href.includes("?")
        ? href.substring(href.indexOf("?"))
        : "";

      link.setAttribute("href", newUrl + queryParams);
    }
  } catch (error) {
    console.warn("Error updating link:", error);
  }
};

// Applies wallet redirection to all matching links on the page
const applyWalletRedirection = () => {
  try {
    const links = document.querySelectorAll("a[href]");
    links.forEach(updateLinkIfMatched);
  } catch (error) {
    console.error("Error applying wallet redirection:", error);
  }
};

// Initialize wallet redirection functionality
const initWalletRedirection = () => {
  if (shouldApplyWalletRedirection()) {
    applyWalletRedirection();
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initWalletRedirection);
