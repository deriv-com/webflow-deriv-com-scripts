export function setCookie(name, value, days, domain) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  if (domain) {
    document.cookie =
      name + "=" + (value || "") + expires + `;domain=${domain}` + `;path=/`;
  } else {
    document.cookie = name + "=" + (value || "") + expires + ";path=/";
  }
}

export function getCookie(name) {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}
export function getCookieByKey(cookieString, key) {
  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const [key, val] = cookie.split("=").map((c) => c.trim());
    cookies[key] = decodeURIComponent(val);
  });
  return cookies[key];
}
export function setLanguageCookie(language) {
  setCookie("webflow-user-language", language, 30);
  setCookie("webflow-user-language", language, 30, `.${window.location.hostname}`);
}
export function deleteCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999;";
}
