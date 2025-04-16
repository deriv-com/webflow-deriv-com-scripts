import { getCookie, setLanguageCookie } from "../cookies";
// Function for setting cookies when changing language and redirecting to the current language page
let localeItems = document.querySelectorAll(".w-locales-items");

if (localeItems.length > 0) {
  localeItems.forEach(function (item) {
    let links = item.querySelectorAll("a");
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        let language = link.getAttribute("hreflang");
        setLanguageCookie(language)
        window.location.href = link.href;
      });
    });
  });

  const clickLinkWithLanguage = (language) => {
    let link = document.querySelector('a[hreflang="' + language + '"]');
    if (link && window.location.pathname !== link.getAttribute("href")) {
      link.click();
    }
  };

  let languageCookie = getCookie("webflow-user-language");
  let targetPaths = [
    "/careers",
    "/locations",
    "/derivtech",
    "/derivlife",
    "/eu-careers",
    "/our-locations",
    "/product-explorer",
    "/academy",
    "/trading-terms-glossary",
  ];

  let path = window.location.pathname;
  let isTargetPath = false;

  // Check if the current path matches any of the target paths
  if (targetPaths.some((targetPath) => path.includes(targetPath))) {
    isTargetPath === true;
  }
  if (languageCookie && isTargetPath) {
    clickLinkWithLanguage(languageCookie);
  }
}
