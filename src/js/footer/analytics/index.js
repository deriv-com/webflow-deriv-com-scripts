// <!--Analytics block starts here-->
const setEvent = (event) => {
  let storedEvents = [];
  let cacheCookie = parseCookies(document.cookie, "cached_analytics_events");
  if (cacheCookie) storedEvents = JSON.parse(cacheCookie);

  storedEvents.push(event);
  document.cookie = `cached_analytics_events=${JSON.stringify(
    storedEvents
  )}; path=/; Domain=.deriv.com`;
};

const trackEventWithCache = (event) => {
  if (Analytics) {
    Analytics?.Analytics?.trackEvent(event.name, event.properties);
  } else {
    setEvent(event);
  }
};

window.addClickListener = function (button, eventName, eventProperties) {
  if (button) {
    button.addEventListener("click", function () {
      trackEventWithCache({
        name: eventName,
        properties: eventProperties,
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  var btnLiveChat = document?.getElementsByClassName("livechatbtn");
  var btnWhatsapp = document?.getElementsByClassName("whatsapp_chat");
  var btnTradershub = document?.getElementsByClassName("tradershub-btn");
  var btnTryFreeDemo = document.querySelectorAll(".btn-free-demo .w-button");
  var btnTryFreeDemoFooter = document.querySelectorAll(
    '.btn-free-demo [data-class="w-button"]'
  );

  const btnNavbarPrimary = document.querySelectorAll(
    '[data-attributes="btn-primary-nav"]'
  );
  const btnLoginNavbar = document.querySelectorAll(
    '[data-attributes="btn-secondary-nav"]'
  );

  if (btnLiveChat) {
    Array.from(btnLiveChat).forEach((button) => {
      window.addClickListener(button, "ce_widget_usage_form", {
        action: "click",
        widget_name: "livechat",
      });
    });
  }
  if (btnWhatsapp) {
    Array.from(btnWhatsapp).forEach((button) => {
      window.addClickListener(button, "ce_widget_usage_form", {
        action: "click",
        widget_name: "whatsapp",
      });
    });
  }
  if (btnTradershub) {
    Array.from(btnTradershub).forEach((button) => {
      window.addClickListener(button, "ce_cta_clicks", {
        action: "click",
        cta_name: "Traders Hub",
      });
    });
  }
  if (btnTryFreeDemo) {
    Array.from(btnTryFreeDemo).forEach((button) => {
      window.addClickListener(button, "ce_cta_clicks", {
        action: "click",
        cta_name: "Try free demo",
      });
    });
  }
  if (btnTryFreeDemoFooter) {
    Array.from(btnTryFreeDemoFooter).forEach((button) => {
      window.addClickListener(button, "ce_cta_clicks", {
        action: "click",
        cta_name: "Try free demo",
      });
    });
  }

  if (btnNavbarPrimary) {
    Array.from(btnNavbarPrimary).forEach((button) => {
      if (!button.classList.contains("tradershub-btn")) {
        window.addClickListener(button, "ce_cta_clicks", {
          action: "click",
          cta_name: "Try free demo",
        });
      }
    });
  }

  if (btnLoginNavbar) {
    Array.from(btnLoginNavbar).forEach((button) => {
      window.addClickListener(button, "ce_cta_clicks", {
        action: "click",
        cta_name: "Login",
      });
    });
  }

  const RUDDERSTACK_STAGING_KEY = process.env.RUDDERSTACK_STAGING_KEY;
  const RUDDERSTACK_PRODUCTION_KEY = process.env.RUDDERSTACK_PRODUCTION_KEY;
  const GB_STAGING_CLIENT_KEY = process.env.GB_STAGING_CLIENT_KEY;
  const GB_STAGING_DECRYPTION_KEY = "";
  const GB_PROD_CLIENT_KEY = process.env.GB_PROD_CLIENT_KEY;
  const GB_PROD_DECRYPTION_KEY = process.env.GB_PROD_DECRYPTION_KEY;
  var GB_CLIENT_KEY, RUDDERSTACK_KEY, GB_DECRYPTION_KEY;

  if (
    window.location.hostname === "deriv.com" ||
    window.location.hostname === "deriv.be" ||
    window.location.hostname === "deriv.me"
  ) {
    GB_CLIENT_KEY = GB_PROD_CLIENT_KEY;
    GB_DECRYPTION_KEY = GB_PROD_DECRYPTION_KEY;
    RUDDERSTACK_KEY = RUDDERSTACK_PRODUCTION_KEY;
  } else {
    GB_CLIENT_KEY = GB_STAGING_CLIENT_KEY;
    GB_DECRYPTION_KEY = GB_STAGING_DECRYPTION_KEY;
    RUDDERSTACK_KEY = RUDDERSTACK_STAGING_KEY;
  }
  client_information = window.parseCookies(
    document.cookie,
    "client_information"
  );
  const clientInfo = client_information ? JSON.parse(client_information) : null;
  const utm_data_string = window.parseCookies(document.cookie, "utm_data");
  const utm_data = utm_data_string ? JSON.parse(utm_data_string) : {};
  const { utm_source, utm_medium, utm_campaign } = utm_data;
  const cookies = window.parseCookies(document.cookie, "signup_device");
  let signupDevice = null;
  const isBrowser = () => typeof window !== "undefined";
  const getLanguage = () =>
    isBrowser() ? localStorage.getItem("i18n") || navigator.language : null;
  if (cookies) {
    signupDevice = JSON.parse(cookies)?.signup_device || null;
  }
  const initialiseConfig = {
    growthbookKey: GB_CLIENT_KEY,
    growthbookDecryptionKey: GB_DECRYPTION_KEY,
    rudderstackKey: RUDDERSTACK_KEY,
    growthbookOptions: {
      navigate: (url) => window.location.replace(url),
      antiFlicker: false,
      navigateDelay: 0,
      attributes: {
        country:
          window.parseCookies(document.cookie, "clients_country") ||
          window.parseCookies(document.cookie, "website_status"),
        user_language:
          window.parseCookies(document.cookie, "user_language") ||
          getLanguage(),
        device_language:
          window.parseCookies(document.cookie, "language") || " ",
        device_type: signupDevice,
        utm_source: utm_data?.["utm_source"],
        utm_medium: utm_data?.["utm_medium"],
        utm_campaign: utm_data?.["utm_campaign"],
        is_authorised: !!window.parseCookies(
          document.cookie,
          "client_information"
        ),
        loggedIn: !!window.parseCookies(document.cookie, "client_information"),
        url: window.location.href,
      },
    },
  };
  try {
    Analytics?.Analytics.initialise(initialiseConfig);
    // Analytics?.Analytics?.getInstances()?.ab?.GrowthBook?.loadFeatures();
    const userId = clientInfo?.user_id
      ? clientInfo?.user_id
      : Analytics?.Analytics?.getInstances?.().tracking?.getAnonymousId();
    Analytics?.Analytics?.identifyEvent(userId);
  } catch (error) {
    console.error("Error during initialisation:", error);
  }
  // Analytics?.Analytics?.getInstances()?.ab?.GrowthBook?.loadFeatures();
  Analytics?.Analytics?.pageView(location.pathname, "Deriv.com");
  // Analytics?.Analytics?.getInstances()?.ab?.GrowthBook?.setURL(window.location.href)
  window.useGrowthbookFeatureFlag = function ({ featureFlag }) {
    let featureFlagValue = Analytics?.Analytics?.getFeatureValue(featureFlag);
    function updateFeatureFlagValue() {
      const value = Analytics?.Analytics?.getFeatureValue(featureFlag);
      featureFlagValue = value;
    }
    Analytics?.Analytics?.getInstances()?.ab?.GrowthBook?.setRenderer(
      updateFeatureFlagValue
    );
    return featureFlagValue;
  };
});
