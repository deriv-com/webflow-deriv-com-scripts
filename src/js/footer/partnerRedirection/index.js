document.addEventListener("DOMContentLoaded", function () {
  const getPartnersHubUrl = (baseDomain) => {
    return `https://hub.${baseDomain}/partnershub/`;
  };

  const updatePartnerLoginLinks = () => {
    const hostname = window.location.hostname;
    const baseDomain = hostname.split(".").slice(-2).join(".");
    const partnersHubUrl = getPartnersHubUrl(baseDomain);

    document
      .querySelectorAll('a[href^="https://login.deriv."]')
      .forEach((link) => {
        if (
          /https:\/\/login\.deriv\.(com|me|be)\/signin\.php/.test(link.href)
        ) {
          link.href = partnersHubUrl;
        }
      });
  };

  const updatePartnerSignupLinks = (baseDomain) => {
    let signupUrl = `https://hub.deriv.com/partnershub/signup`;
    if (baseDomain === "deriv.me") {
      signupUrl = `https://hub.deriv.me/partnershub/signup`;
    } else if (baseDomain === "deriv.be") {
      signupUrl = `https://hub.deriv.be/partnershub/signup`;
    }
    document
      .querySelectorAll('a[href="https://hub.deriv.com/partnershub/signup"]')
      .forEach((link) => {
        link.href = signupUrl;
      });
  };

  const intervalId = setInterval(() => {
    const client_country = window?.getClientCountry?.();
    if (client_country) {
      updatePartnerLoginLinks();
      updatePartnerSignupLinks(baseDomain);
      clearInterval(intervalId);
    }
  }, 300);
});
