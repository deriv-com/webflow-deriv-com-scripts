import { setLanguageCookie, getCookieByKey } from "../cookies";

const languages = [
  "ar",
  "bn",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ko",
  "pl",
  "pt",
  "ru",
  "si",
  "sw",
  "tr",
  "vi",
  "zh_cn",
  "zh_tw",
  "zh-cn",
  "zh-tw",
];
const updateURLAsPerUserLanguage = () => {
  const current_path = window.location.pathname;
  const current_hash = window.location.hash;
  const current_query = window.location.search;
  const paths = current_path.split("/");
  const first_path = paths[1];

  const has_language_in_url = languages.includes(first_path || "");
  const is_no_language = [
    "careers",
    "locations",
    "derivtech",
    "derivlife",
    "trading-terms-glossary",
    "product-explorer",
    "eu-careers",
    "our-locations",
    "academy",
    "trading-specifications",
  ].some((path) => paths.includes(path));

  setLanguageCookie(has_language_in_url ? first_path : "en");

  const user_language =
    getCookieByKey(document.cookie, "webflow-user-language")?.toLowerCase() ||
    "en";
  const language = has_language_in_url ? first_path : user_language;

  if (!has_language_in_url && user_language === "en") return;
  if (first_path === user_language) return;
  if (has_language_in_url && first_path !== user_language) {
    setLanguageCookie(language);
    return;
  }

  if (!is_no_language) {
    const updated_path = has_language_in_url
      ? paths.map((item) => (item === first_path ? language : item)).join("/")
      : language + paths.join("/");
    const new_url = updated_path + current_query + current_hash;
    window.location.href = "/" + new_url;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  updateURLAsPerUserLanguage();
});
