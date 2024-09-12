import { getCookieByKey } from "../cookies";

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
          !!getCookieByKey(document.cookie, "client_information")
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

    const utm_data_string = getCookieByKey(document.cookie, "utm_data");
    const utm_data = utm_data_string ? JSON.parse(utm_data_string) : {};
    const { utm_source, utm_medium, utm_campaign } = utm_data;

    const client_information = getCookieByKey(
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
  return !!getCookieByKey(document.cookie, "client_information");
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

document.addEventListener("DOMContentLoaded", () => {
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
});
