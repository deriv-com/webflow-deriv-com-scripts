window.fallbackLoader = "Migrated All + Removal of Webflow array functions";

// <!-- Responsive Menu - end of code -->
// This function adds a red line to the current accordion trigger

// Find all accordion triggers
let triggers = document.querySelectorAll(".navbar_accordion-trigger");

triggers.forEach((trigger) => {
  trigger.addEventListener("click", function () {
    // Remove the .current class from all triggers
    triggers.forEach((t) => t.classList.remove("current"));

    // Add the .current class to the clicked trigger
    this.classList.add("current");
  });
});

// Find the current page link in Navbar
let currentLink = document.querySelector(".navbar_accordion-link.w--current");

if (currentLink) {
  // Find the closest accordion item
  let accordionItem = currentLink.closest(".navbar_accordion-item");

  if (accordionItem) {
    // Find the trigger element within the found parent
    let trigger = accordionItem.querySelector(".navbar_accordion-trigger");

    if (trigger) {
      // Add the .current class to the trigger
      trigger.classList.add("current");
    }
  }
}

// <!-- Mobile Menu - end of code -->

// <!-- Display current language - start of code -->

let currentLocaleElement = document.querySelector(
  ".locale > .new-navbar_dropdown-link.w--current"
);

if (currentLocaleElement) {
  let currentLocaleIsoCode = currentLocaleElement.getAttribute("hreflang");

  let currentLocaleIsoCodeTexts = document.querySelectorAll(
    ".current-locale-iso-code"
  );

  if (currentLocaleIsoCode && currentLocaleIsoCodeTexts.length) {
    for (let currentLocaleIsoCodeText of currentLocaleIsoCodeTexts) {
      currentLocaleIsoCodeText.innerText = currentLocaleIsoCode;
    }
  }
}

// <!-- Display current language - end of code -->

// Function for setting cookies when changing language and redirecting to the current language page

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

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

if (document.querySelector(".new-navbar_component")) {
  // Find the .new-navbar_component element
  const navbarComponent = document.querySelector(".new-navbar_component");

  // Add event listeners for hover
  navbarComponent.addEventListener("mouseenter", () => {
    if (window.innerWidth > 991) {
      disableScroll();
    }
  });
  navbarComponent.addEventListener("mouseleave", () => {
    if (window.innerWidth > 991) {
      enableScroll();
    }
  });

  // Function to disable scroll
  function disableScroll() {
    document.body.classList.add("disable-scroll");
  }

  // Function to enable scroll
  function enableScroll() {
    document.body.classList.remove("disable-scroll");
  }
}

const clientsCountry = window.getClientCountry();

const getDateFirstContact = () => {
  const dateFirstContactString = window.parseCookies(
    document.cookie,
    "date_first_contact"
  );
  if (dateFirstContactString) {
    const parsedData = JSON.parse(dateFirstContactString);
    return parsedData.date_first_contact
      ? { date_first_contact: parsedData.date_first_contact }
      : null;
  }
  return null;
};

const getSignupDevice = () => {
  const signupDeviceString = window.parseCookies(
    document.cookie,
    "signup_device"
  );
  if (signupDeviceString) {
    const parsedData = JSON.parse(signupDeviceString);
    return parsedData.signup_device
      ? { signup_device: parsedData.signup_device }
      : null;
  }
  return null;
};

const lang = window.parseCookies(document.cookie, "webflow-user-language");

const countriesToRedirect = [
  "as",
  "au",
  "at",
  "be",
  "bg",
  "ca",
  "hr",
  "cy",
  "cz",
  "dk",
  "ee",
  "fi",
  "fr",
  "gr",
  "gu",
  "gg",
  "hk",
  "hu",
  "ir",
  "ie",
  "im",
  "il",
  "it",
  "je",
  "ng",
  "mm",
  "sy",
  "kp",
  "lv",
  "lt",
  "lu",
  "my",
  "mt",
  "nl",
  "nz",
  "mp",
  "py",
  "pl",
  "pt",
  "pr",
  "ro",
  "rw",
  "sk",
  "si",
  "es",
  "se",
  "ae",
  "gb",
  "us",
  "um",
  "vu",
  "vi",
  "ky",
  "cu",
  "de",
];

if (
  window.location.pathname.endsWith("p2p") &&
  !window.location.pathname.startsWith("/blog")
) {
  const clientsCountry = window.getClientCountry();
  if (clientsCountry && countriesToRedirect.includes(clientsCountry)) {
    if (lang === "en") {
      window.location.replace("/404");
    } else {
      window.location.replace(`/${lang}/404`);
    }
  }
}

if (window.parseCookies(document.cookie, "client_information") !== undefined) {
  let purchaseButtons = document.querySelectorAll(
    "a.live-markets_button.is-secondary.is-small.is-purchase.w-button"
  );

  let sellButtons = document.querySelectorAll(
    "a.live-markets_button.is-secondary.is-small.is-sell.w-button"
  );

  function updateHref(buttons) {
    buttons.forEach((button) => {
      button.href = "https://app.deriv.com/appstore/traders-hub";
    });
  }

  updateHref(purchaseButtons);
  updateHref(sellButtons);
}

//live chat button hide on menu appear
const mobileMenu = document.getElementById("mobile-menu");
const liveChatWrapper = document.getElementById("live_chat-wrapper");

let isLiveChatVisible = true;
let isLiveChatActivated = false;

function fadeIn(element) {
  var opacity = 0;
  var timer = setInterval(function () {
    if (opacity >= 1) {
      clearInterval(timer);
    }
    element.style.opacity = opacity;
    opacity += 0.1;
  }, 30);
}

function fadeOut(element) {
  var opacity = 1;
  var timer = setInterval(function () {
    if (opacity <= 0) {
      clearInterval(timer);
      element.style.display = "none";
    }
    element.style.opacity = opacity;
    opacity -= 0.1;
  }, 30);
}

// <!-- Live Chat - start of code -->

const licenceKey = "12049137";
const loadLiveChatScript = () => {
  window.__lc = window.__lc || {};
  window.__lc.license = licenceKey;
  window.LC_API = window.LC_API || { loaded: false };
  if (!window.LC_API.loaded) {
    const lcScript = document.createElement("script");
    lcScript.async = true;
    lcScript.src = "https://cdn.livechatinc.com/tracking.js";
    lcScript.onload = () => {
      window.LC_API.loaded = true; // Mark as loaded
      window.LC_API.on_after_load = function () {
        performLiveChatAction(
          !!window.parseCookies(document.cookie, "client_information")
        );
        checkUrlForLiveChat();
      };
      if (typeof LiveChatWidget !== "undefined" && LiveChatWidget.init) {
        LiveChatWidget.init();
      }
    };
    document.body.appendChild(lcScript);
  } else {
    checkUrlForLiveChat();
  }
};
const openLiveChat = () => {
  if (window.LC_API && window.LC_API.open_chat_window) {
    window.LC_API.open_chat_window();
  }
};
const checkUrlForLiveChat = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("is_livechat_open") === "true") {
    openLiveChat();
  }
};

//dashboard send data
const performLiveChatAction = (is_logged_in) => {
  window?.LiveChatWidget?.on("ready", () => {
    // we open and close the window to trigger the widget to listen for new events
    window.LC_API.open_chat_window();
    window.LC_API.hide_chat_window();
    checkUrlForLiveChat();

    const utm_data_string = window.parseCookies(document.cookie, "utm_data");
    const utm_data = utm_data_string ? JSON.parse(utm_data_string) : {};
    const { utm_source, utm_medium, utm_campaign } = utm_data;

    const client_information = window.parseCookies(
      document.cookie,
      "client_information"
    );
    const url_params = new URLSearchParams(window.location.search);

    const {
      loginid,
      email,
      landing_company_shortcode,
      currency,
      residence,
      first_name,
      last_name,
    } = client_information ? JSON.parse(client_information) : {};

    /* the session variables are sent to CS team dashboard to notify user has logged in
          and also acts as custom variables to trigger targeted engagement */
    const session_variables = {
      is_logged_in: is_logged_in,
      loginid: loginid ?? "",
      landing_company_shortcode: landing_company_shortcode ?? "",
      currency: currency ?? "",
      residence: residence ?? "",
      email: email ?? "",
      platform: url_params.get("platform") ?? "",
      utm_source: utm_source ?? "",
      utm_medium: utm_medium ?? "",
      utm_campaign: utm_campaign ?? "",
    };

    window.LiveChatWidget.call("set_session_variables", session_variables);

    if (is_logged_in) {
      if (email) {
        window.LiveChatWidget.call("set_customer_email", email);
      }
      if (first_name && last_name) {
        window.LiveChatWidget.call(
          "set_customer_name",
          `${first_name} ${last_name}`
        );
      }
    } else {
      // clear name and email fields after chat has ended
      window.LC_API.on_chat_ended = () => {
        window.LiveChatWidget.call("set_customer_email", " ");
        window.LiveChatWidget.call("set_customer_name", " ");
      };
    }
    checkUrlForLiveChat();

    // open chat widget when there is an incoming greeting/announcement
    window.LiveChatWidget.on("new_event", (event) => {
      if (event.greeting) {
        window.LC_API.open_chat_window();
      }
    });
  });
};
let is_logged_in = false;
let checkCookieInterval;

const isLoggedIn = () => {
  return !!window.parseCookies(document.cookie, "client_information");
};

const checkLoggedIn = () => {
  const new_login_status = isLoggedIn();
  if (new_login_status !== is_logged_in) {
    performLiveChatAction(new_login_status);
    is_logged_in = new_login_status;
  }
};

// Perform initial authentication check
checkLoggedIn();

// Set interval to periodically check authentication status
checkCookieInterval = setInterval(checkLoggedIn, 2000);
//end of dashboard send data

loadLiveChatScript();
const liveChatIcons = document.querySelectorAll(".livechatbtn");
if (liveChatIcons.length > 0) {
  liveChatIcons.forEach((liveChatIcon) => {
    liveChatIcon.addEventListener("click", (event) => {
      event.preventDefault();
      openLiveChat();
    });
  });
}
const liveChatIconById = document.getElementById("liveChatBtn");
if (liveChatIconById) {
  liveChatIconById.addEventListener("click", (event) => {
    event.preventDefault();
    openLiveChat();
  });
}
const liveChatIconsByrel = document.querySelectorAll('a[rel="liveChatBtn"]');
liveChatIconsByrel.forEach((liveChatIcon) => {
  liveChatIcon?.addEventListener("click", (event) => {
    event.preventDefault();
    openLiveChat();
  });
});

// <!-- Live Chat - end of code -->

// <!-- mobile menu height calculation - start of code -->

let navbarMenuBtn = document.querySelector(".navbar_menu-button");

if (navbarMenuBtn) {
  navbarMenuBtn.addEventListener("click", function () {
    let windowHeight = window.innerHeight;

    let navbarWrapper = document.querySelector(".new-navbar_main-wrapper");

    if (navbarWrapper) {
      let navbarHeight = navbarWrapper.offsetHeight;

      let calculatedHeight = windowHeight - navbarHeight;

      let navbarMenu = document.querySelector(".new-navbar_menu");
      if (navbarMenu) {
        navbarMenu.style.height = `${calculatedHeight}px`;
      }
    }
  });
}

// <!-- mobile menu height calculation - end of code -->

// <!-- scroll list of languages -->
// this code ensures opening a list of languages on mobile starting from the top

let langMobButton = document.querySelector(".lang-mob");

if (langMobButton) {
  langMobButton.addEventListener("click", function () {
    let mobileMenuWrapper = document.querySelector(".new-navbar_menu-wrapper");

    if (mobileMenuWrapper) {
      mobileMenuWrapper.scrollBy({ top: -3000 });
    }
  });
}

// <!-- end of scroll list of languages -->

// <!--EU cookie pop up -->
class CookieStorage {
  constructor(cookieName) {
    this.cookieName = cookieName;
  }

  setItem(value) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    const expires = "expires=" + expiryDate.toUTCString();
    const cookieValue = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${this.cookieName}=${cookieValue};${expires};path=/`;
  }
  getItem() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith(`${this.cookieName}=`)) {
        let cookieValue = cookie.substring(`${this.cookieName}=`.length);
        return JSON.parse(decodeURIComponent(cookieValue));
      }
    }
    return null;
  }
}

const tracking_status_cookie = new CookieStorage("tracking_status");
const tracking_status_cookie_declined = new CookieStorage(
  "tracking_status_decline"
);

const popupElement = document.querySelector(".cookies_background-wrapper");

//set datalayer details
const has_dataLayer = window.dataLayer;
var client_information = window.parseCookies(
  document.cookie,
  "client_information"
);

is_logged_in = !!client_information;
has_dataLayer &&
  window.dataLayer.push({
    loggedIn: is_logged_in,
    language:
      window.parseCookies(document.cookie, "webflow-user-language") || "en",
    ...(is_logged_in && {
      visitorId: client_information?.loginid,
      currency: client_information?.currency,
      email: client_information?.email,
    }),
  });

// Check if pathname contains "eu" and tracking_status_cookie is null

if (
  window.location.pathname.includes("eu") &&
  !tracking_status_cookie.getItem() &&
  !tracking_status_cookie_declined.getItem()
) {
  popupElement.classList.remove("hide-element");
  document.body.classList.add("show-cookie");
}

// Select the accept and decline buttons
const acceptButton = document.getElementById("accept-cookie");
const declineButton = document.getElementById("dont-accept-cookie");

acceptButton?.addEventListener("click", function () {
  tracking_status_cookie.setItem(true);
  popupElement.classList.add("hide-element");
  document.body.classList.remove("show-cookie");
});

declineButton?.addEventListener("click", function () {
  tracking_status_cookie_declined.setItem(true);
  tracking_status_cookie.setItem(false);
  popupElement.classList.add("hide-element");
  document.body.classList.remove("show-cookie");
});

// <!-- remove hreflanf links -->
var targetPaths = [
  "/careers",
  "/locations",
  "/derivtech",
  "/derivlife",
  "/eu-careers",
  "/our-locations",
];
var path = window.location.pathname;
if (targetPaths.some((targetPath) => path.includes(targetPath))) {
  var headTag = document.head;
  var linkElements = headTag.querySelectorAll("link");
  linkElements.forEach(function (linkElement) {
    if (linkElement.hasAttribute("hreflang")) {
      if (linkElement.getAttribute("hreflang") !== "x-default") {
        linkElement.remove();
      }
    }
  });
}
// <!-- end of hreflang links removal -->

// Parse the cookies to get the 'client_information' cookie value
const cookieValue = window.parseCookies(document.cookie, "client_information")
  ? JSON.parse(window.parseCookies(document.cookie, "client_information"))
  : null;

// Hotjar integration
if (cookieValue?.loginid) {
  window?.hj("identify", cookieValue.loginid, {
    is_logged_in: !!window.parseCookies(document.cookie, "client_information"),
    landing_company_shortcode: cookieValue.landing_company_shortcode || "null",
  });
}

const updateLinkHrefs = () => {
  const featureFlagValue = Analytics?.Analytics?.getFeatureValue(
    "trigger_os_signup_wf"
  );
  const handleOutSystemsRedirection = () => {
    const currentDomain = window.location.hostname;
    let env;
    if (
      currentDomain === "deriv.com" ||
      currentDomain === "deriv.be" ||
      currentDomain === "deriv.me"
    ) {
      env = "production";
    } else if (currentDomain === "staging.deriv.com") {
      env = "staging";
    } else {
      env = "development";
    }
    switch (env) {
      case "production":
        return "https://hub.deriv.com/tradershub/signup";
      case "staging":
        return "https://staging-hub.deriv.com/tradershub/signup";
      default:
        return "https://dev-hub.deriv.com/tradershub/signup";
    }
  };

  function isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    return /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua);
  }

  function isIOS() {
    const ua = navigator.userAgent.toLowerCase();
    return /ipad|iphone|ipod/.test(ua);
  }

  const newHref = featureFlagValue
    ? isIOS() || isSafari()
      ? `https://${window.location.host}/signup`
      : handleOutSystemsRedirection()
    : `https://${window.location.host}/signup`;

  // Update href attributes
  const mainSignupButton = document.getElementById("cta-home-btn-navbar");
  if (mainSignupButton) {
    mainSignupButton.href = newHref;
  }

  const signupButtons = document.querySelectorAll(".logged-out-btn");
  signupButtons?.forEach((btn) => {
    if (btn?.href?.indexOf("/signup") > 0) {
      btn.href = newHref;
    }
  });

  const signupButtonsPlatforms = document.querySelectorAll(".logged-out-btn a");
  signupButtonsPlatforms?.forEach((btn) => {
    if (btn?.href?.indexOf("/signup") > 0) {
      btn.href = newHref;
    }
  });
};

Analytics?.Analytics?.getInstances()
  ?.ab?.GrowthBook?.loadFeatures()
  .then(() => {
    if (window.location.href.indexOf("/partners") > -1 === false) {
      updateLinkHrefs();
    }
  });
