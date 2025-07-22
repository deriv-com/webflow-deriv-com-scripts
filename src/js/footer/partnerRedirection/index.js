document.addEventListener("DOMContentLoaded", function () {
  const hostname = window.location.hostname;
  const baseDomain = hostname.split(".").slice(-2).join(".");

  const getPartnersHubUrl = () => {
    return `https://hub.${baseDomain}/partnershub/`;
  };

  const updatePartnerLoginLinks = () => {
    const partnersHubUrl = getPartnersHubUrl();

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

  const updatePartnerSignupLinks = () => {
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
      updatePartnerSignupLinks();
      clearInterval(intervalId);
    }
  }, 300);
});
