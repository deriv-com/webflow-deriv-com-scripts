import { getCookieByKey } from "../cookies";

/**
 * URL mappings for wallet redirection
 * Maps old URLs to new hub.deriv.com URLs
 */
const URL_MAPPINGS = {
  "https://deriv.com/cashier": "https://hub.deriv.com/tradershub/wallets",
  "https://app.deriv.com/wallet/withdrawal":
    "https://hub.deriv.com/tradershub/wallets/withdrawal",
  "https://deriv.com/cashier/withdrawal":
    "https://hub.deriv.com/tradershub/wallets/withdrawal",
  "https://deriv.com/cashier/account-transfer":
    "https://hub.deriv.com/tradershub/wallets/transfer",
  "https://app.deriv.com/cashier/account-transfer":
    "https://hub.deriv.com/tradershub/wallets/transfer",
};


// Checks if wallet redirection should be applied
const shouldApplyWalletRedirection = () => {
  try {
    const clientInformation = getCookieByKey(
      document.cookie,
      "client_information"
    );
    const walletAccount = getCookieByKey(document.cookie, "wallet_account");

    return (
      clientInformation &&
      walletAccount === "true" &&
      window.location.hostname === "deriv.com"
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

    // Find matching URL mapping
    const matchedMapping = Object.entries(URL_MAPPINGS).find(([oldUrl]) =>
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
