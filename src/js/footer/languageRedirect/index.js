import { setCookie, getCookie } from "../cookies";
// Function for setting cookies when changing language and redirecting to the current language page
let localeItems = document.querySelectorAll(".w-locales-items");

if (localeItems.length > 0) {
  localeItems.forEach(function (item) {
    let links = item.querySelectorAll("a");
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        let language = link.getAttribute("hreflang");
        setCookie("webflow-user-language", language, 30);
        window.location.href = link.href;
      });
    });
  });

  function clickLinkWithLanguage(language) {
    let link = document.querySelector('a[hreflang="' + language + '"]');
    if (link && window.location.pathname !== link.getAttribute("href")) {
      link.click();
    }
  }
  window.setLanguageCookie = (language) => {
    setCookie("webflow-user-language", language, 30);
  };

  let languageCookie = getCookie("webflow-user-language");
  let targetPaths = [
    "/careers",
    "/locations",
    "/derivtech",
    "/derivlife",
    "/eu-careers",
    "/our-locations",
  ];
  let path = window.location.pathname;
  let targetPathUrl = false;

  // Check if the current path matches any of the target paths
  if (targetPaths.some((targetPath) => path.includes(targetPath))) {
    targetPathUrl === true;
  }
  if (languageCookie && targetPathUrl) {
    clickLinkWithLanguage(languageCookie);
  }
}
