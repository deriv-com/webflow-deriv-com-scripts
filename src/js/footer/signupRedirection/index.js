document.addEventListener("DOMContentLoaded", function () {
  const languages = [
    "en",
    "fr",
    "ar",
    "pt",
    "es",
    "ru",
    "vi",
    "bn",
    "si",
    "tr",
    "sw",
    "zh-cn",
    "zh-tw",
    "ko",
    "it",
    "de",
    "pl",
    "uz",
    "mn",
    "km",
    "ta",
  ];
  const paths = window.location.pathname.split("/");
  const first_path = paths[1];
  const current_language = languages.includes(first_path) ? first_path : "en";

  const updateSignupLinks = (selectorUrl, replaceUrl) => {
    const links = Array.from(document.querySelectorAll("a")).filter(
      (link) =>
        link.href === `${selectorUrl}/signup` ||
        link.href === `${selectorUrl}/${current_language}/signup` ||
        link.href === `${selectorUrl}/landing/signup` ||
        link.href === `${selectorUrl}/${current_language}/landing/signup`
    );
    links.forEach((link) => {
      let language = current_language;
      if (language === "zh-tw") language = "zh_tw";
      if (language === "zh-cn") language = "zh_cn";
      link.href = `${replaceUrl}/tradershub/signup?lang=${language}`;
    });
  };

  const hostnameMap = {
    "staging.deriv.com": {
      selectorUrl: "https://staging.deriv.com",
      replaceUrl: "https://staging-home.deriv.com",
    },
    "deriv.com": {
      selectorUrl: "https://deriv.com",
      replaceUrl: "https://home.deriv.com",
    },
    "deriv.be": {
      selectorUrl: "https://deriv.be",
      replaceUrl: "https://hub.deriv.be",
    },
    "deriv.me": {
      selectorUrl: "https://deriv.me",
      replaceUrl: "https://hub.deriv.me",
    },
  };

  const hostname = window.location.hostname;
  const mapping = hostnameMap[hostname];
  if (mapping) {
    updateSignupLinks(mapping.selectorUrl, mapping.replaceUrl);
  }
});
