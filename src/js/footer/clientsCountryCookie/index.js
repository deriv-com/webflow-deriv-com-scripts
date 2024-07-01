import { setCookie, getCookieByKey, deleteCookie } from "../cookies";
import populateFooterComponent from "../footerComponent";

const message = JSON.stringify({ website_status: 1 });
const messageType = "website_status";

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
const clientsCountryFromCookie = getCookieByKey(
  document.cookie,
  "clients_country"
);
if (!clientsCountryFromCookie) {
  window
    .socketMessageSend(message, messageType)
    .then((response) => {
      const clientsCountryFromCookie = getCookieByKey(
        document.cookie,
        "clients_country"
      );
      if (
        clientsCountryFromCookie !== response.website_status.clients_country
      ) {
        deleteCookie("clients_country");
        setCookie(
          "clients_country",
          response.website_status.clients_country,
          30
        );
      }
      populateFooterComponent();
    })
    .catch((error) => {
      console.error("Error received:", error);
    });
}
