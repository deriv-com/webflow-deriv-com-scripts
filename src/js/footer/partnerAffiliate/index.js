import { getCookieByKey, setCookie, deleteCookie } from "../cookies";

// Setting cookie for master affiliates which will be used by signup.deriv.com
const urlObject = new URL(window.location.href);
const params = new URLSearchParams(urlObject.search);
const token = params.get("t");
if (params.has("referrer") && token != null) {
  const referrer_token = getCookieByKey(document.cookie, "referrer_token");
  if (referrer_token !== token) {
    deleteCookie("referrer_token");
    setCookie("referrer_token", token, 365);
  }
}
