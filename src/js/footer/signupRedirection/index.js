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
      link.href = `${replaceUrl}/tradershub/signup?lang=${current_language}`;
    });
  };

  const hostname = window.location.hostname;
  if (hostname === "deriv.com") {
    updateSignupLinks("https://deriv.com", "https://hub.deriv.com");
  } else if (hostname === "staging.deriv.com") {
    updateSignupLinks(
      "https://staging.deriv.com",
      "https://staging-hub.deriv.com"
    );
  }
});
