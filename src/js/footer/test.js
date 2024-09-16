



window.customLoader = "static version"

// Listen for DOMContentLoaded event

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

if (
    window.parseCookies(document.cookie, "client_information") !== undefined
) {
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
const liveChatIconsByrel = document.querySelectorAll(
    'a[rel="liveChatBtn"]'
);
liveChatIconsByrel.forEach((liveChatIcon) => {
    liveChatIcon?.addEventListener("click", (event) => {
        event.preventDefault();
        openLiveChat();
    });
});


// <!-- Live Chat - end of code -->