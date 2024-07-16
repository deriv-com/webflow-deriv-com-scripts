import { setCookie, getCookieByKey, deleteCookie } from "../cookies";
import populateFooterComponent from "../footerComponent";

async function fetchCountryAndPopulateFooter() {
  try {
    const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
    const text = await response.text();
    const CloudflareCountry = Object.fromEntries(
      text.split("\n").map((v) => v.split("=", 2))
    ).loc.toLowerCase();
    const clientsCountryFromCookie = getCookieByKey(
      document.cookie,
      "clients_country"
    );
    if (CloudflareCountry !== clientsCountryFromCookie) {
      deleteCookie("clients_country");
      setCookie("clients_country", CloudflareCountry, 30);
    }
    populateFooterComponent();
  } catch (error) {
    console.error("Error:", error);
    populateFooterComponent();
  }
}

fetchCountryAndPopulateFooter();
