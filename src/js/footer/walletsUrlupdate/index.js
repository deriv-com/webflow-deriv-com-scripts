import { getCookieByKey } from "../cookies";

// Gets the appropriate hub URL based on current hostname
const getWalletUrl = () => {
  const isStaging = window.location.hostname === "staging.deriv.com";
  return isStaging
    ? "https://staging-hub.deriv.com/tradershub/wallets"
    : "https://hub.deriv.com/tradershub/wallets";
};

/**
 * Gets the current environment's base domain
 * @returns {string} Current domain (deriv.com or staging.deriv.com)
 */
const getCurrentDomain = () => {
  const hostname = window.location.hostname;
  return hostname === "staging.deriv.com" ? "staging.deriv.com" : "deriv.com";
};

/**
 * Cache for URL mappings to avoid recalculation
 */
let cachedUrlMappings = null;
let cachedHubUrl = null;
let cachedDomain = null;

/**
 * Gets URL mappings for wallet redirection based on current environment
 * Uses caching to improve performance
 * @returns {Object} URL mappings object
 */
const getUrlMappings = () => {
  const currentWalletUrl = getWalletUrl();
  const currentDomain = getCurrentDomain();

  // Return cached mappings if hub URL and domain haven't changed
  if (
    cachedUrlMappings &&
    cachedHubUrl === currentWalletUrl &&
    cachedDomain === currentDomain
  ) {
    return cachedUrlMappings;
  }

  // Generate mappings based on current environment
  // All URLs redirect to the hub matching the current environment
  const mappings = {
    // deriv.com URLs (redirect to current environment's hub)
    "https://deriv.com/cashier": currentWalletUrl,
    "https://deriv.com/cashier/withdrawal": `${currentWalletUrl}/withdrawal`,
    "https://deriv.com/cashier/account-transfer": `${currentWalletUrl}/transfer`,

    // staging.deriv.com URLs (redirect to current environment's hub)
    "https://staging.deriv.com/cashier": currentWalletUrl,
    "https://staging.deriv.com/cashier/withdrawal": `${currentWalletUrl}/withdrawal`,
    "https://staging.deriv.com/cashier/account-transfer": `${currentWalletUrl}/transfer`,

    // app.deriv.com URLs (redirect to current environment's hub)
    "https://app.deriv.com/cashier": currentWalletUrl,
    "https://app.deriv.com/wallet/withdrawal": `${currentWalletUrl}/withdrawal`,
    "https://app.deriv.com/cashier/account-transfer": `${currentWalletUrl}/transfer`,
  };

  // Cache the results
  cachedUrlMappings = mappings;
  cachedHubUrl = currentWalletUrl;
  cachedDomain = currentDomain;

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
