import { getCookieByKey } from "../cookies";

const modal = document.querySelector(".redirection_background-wrapper");
const cancelRedirect = document.getElementById("cancel-redirect");
const proceedRedirect = document.getElementById("proceed-redirect");
const hasDataLayer = window.dataLayer;
const clientInformation = getCookieByKey(document.cookie, "client_information");
const isLoggedIn = !!clientInformation;

document.addEventListener("DOMContentLoaded", () => {
  if (hasDataLayer) {
    window.dataLayer.push({
      loggedIn: isLoggedIn,
      language:
        getCookieByKey(document.cookie, "webflow-user-language") || "en",
      ...(isLoggedIn && {
        visitorId: clientInformation?.loginid,
        currency: clientInformation?.currency,
        email: clientInformation?.email,
      }),
    });
  }
});

if (
  window.isEuRegion(window.location.pathname) &&
  modal &&
  cancelRedirect &&
  proceedRedirect
) {
  const internalDomains = [
    "deriv.me",
    "deriv.be",
    "deriv.com",
    "app.deriv.me",
    "app.deriv.be",
    "app.deriv.com",
    "docs.deriv.com",
    "community.deriv.com",
    "deriv.statuspage.io",
    "signup.deriv.com",
    "login.deriv.com",
    "api.deriv.com",
    "hub.deriv.com",
  ];

  let pendingRedirect = "";
  let currentTarget = "_self";

  function attachRedirectListeners() {
    document.querySelectorAll("a").forEach(function (anchor) {
      const anchorUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (
        !internalDomains.includes(anchorUrl.host) &&
        anchorUrl.host !== currentUrl.host
      ) {
        // Remove any previous handler to avoid duplicates
        anchor.removeEventListener("click", handleRedirectClick);
        anchor.addEventListener("click", handleRedirectClick);
      }
    });
  }

  function handleRedirectClick(event) {
    event.preventDefault();
    pendingRedirect = this.href;
    currentTarget = this.target || "_self";
    modal.classList.remove("hide-element");
    document.body.style.overflow = "hidden";
  }

  // On page load
  attachRedirectListeners();

  // Listen for Finsweet pagination events
  const paginationWrapper = document.querySelector(".w-pagination-wrapper");

  if (paginationWrapper) {
    paginationWrapper.addEventListener("click", (event) => {
      const target = event.target;

      if (
        target.closest(".blogs_page") ||
        target.closest(".blogs_prev-button") ||
        target.closest(".blogs_next-button")
      ) {
        attachRedirectListeners();
      }
    });
  }

  cancelRedirect.addEventListener("click", function () {
    modal.classList.add("hide-element");
    document.body.style.overflow = "auto";
    pendingRedirect = "";
  });

  proceedRedirect.addEventListener("click", function () {
    if (pendingRedirect) {
      window.open(pendingRedirect, currentTarget);
      pendingRedirect = "";
      modal.classList.add("hide-element");
      document.body.style.overflow = "auto";
    }
  });
}
