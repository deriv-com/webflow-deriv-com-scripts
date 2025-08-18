  // Version 1.0.13
  const cacheTrackEvents = {
    interval: null,
    responses: [],
    isTrackingResponses: false,
    hash: (inputString, desiredLength = 32) => {
      const fnv1aHash = (string) => {
        let hash = 0x811c9dc5;
        for (let i = 0; i < string.length; i++) {
          hash ^= string.charCodeAt(i);
          hash = (hash * 0x01000193) >>> 0;
        }
        return hash.toString(16);
      };

      const base64Encode = (string) => btoa(string);

      let hash = fnv1aHash(inputString);
      let combined = base64Encode(hash);

      while (combined.length < desiredLength) {
        combined += base64Encode(fnv1aHash(combined));
      }

      return combined.substring(0, desiredLength);
    },
    getCookies: (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = decodeURIComponent(parts.pop().split(";").shift());

        try {
          return JSON.parse(cookieValue);
        } catch (e) {
          return cookieValue;
        }
      }
      return null;
    },
    trackPageUnload: () => {
      window.addEventListener("beforeunload", (event) => {
        if (!cacheTrackEvents.isPageViewSent()) {
          cacheTrackEvents.push("cached_analytics_page_views", {
            name: window.location.href,
            properties: {
              url: window.location.href,
            },
          });
        }
      });
    },
    trackResponses: () => {
      const originalXhrOpen = XMLHttpRequest.prototype.open;
      const originalXhrSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        this._method = method;
        return originalXhrOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
          let parsedPayload = null;

          if (typeof body === "string") {
            try {
              parsedPayload = JSON.parse(body);
            } catch (e) {
              parsedPayload = body;
            }
          }

          const responseData = {
            url: this._url,
            method: this._method,
            status: this.status,
            headers: this.getAllResponseHeaders(),
            data:
              this.responseType === "" || this.responseType === "text"
                ? this.responseText
                : null,
            payload: parsedPayload,
          };

          cacheTrackEvents.responses.push(responseData);
        });

        return originalXhrSend.apply(this, arguments);
      };
    },
    isReady: () => {
      if (typeof Analytics === "undefined" || Analytics === null) {
        return false;
      }

      const instances = Analytics.Analytics.getInstances();
      return !!instances?.tracking;
    },
    parseCookies: (cookieName) => {
      const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value);
        return acc;
      }, {});

      try {
        return cookies[cookieName] ? JSON.parse(cookies[cookieName]) : null;
      } catch (error) {
        return null;
      }
    },
    isPageViewSent: () =>
      !!cacheTrackEvents.responses.find(
        (e) => e.payload?.type === "page" && e.payload?.anonymousId
      ),
    set: (event) => {
      cacheTrackEvents.push("cached_analytics_events", event);
    },
    push: (cookieName, data) => {
      let storedCookies = [];
      const cacheCookie = cacheTrackEvents.parseCookies(cookieName);
      if (cacheCookie) storedCookies = cacheCookie;
      storedCookies.push(data);

      document.cookie = `${cookieName}=${JSON.stringify(
        storedCookies
      )}; path=/; Domain=.deriv.com`;
    },
    processEvent: (event) => {
      const clientInfo = cacheTrackEvents.getCookies("client_information");

      if (clientInfo) {
        const { email = null } = clientInfo;

        if (email) {
          event.properties.email_hash = cacheTrackEvents.hash(email);
        }
      }
      if (event?.properties?.email) {
        const email = event.properties.email;
        delete event.properties.email;
        event.properties.email_hash = cacheTrackEvents.hash(email);
      }

      return event;
    },
    track: (originalEvent, cache) => {
      const event = cacheTrackEvents.processEvent(originalEvent);

      if (cacheTrackEvents.isReady() && !cache) {
        Analytics.Analytics.trackEvent(event.name, event.properties);
      } else {
        cacheTrackEvents.set(event);
      }
    },
    pageView: () => {
      if (!cacheTrackEvents.isTrackingResponses) {
        cacheTrackEvents.trackResponses();
        cacheTrackEvents.trackPageUnload();
      }

      let pageViewInterval = null;

      pageViewInterval = setInterval(() => {
        const clientInfo = cacheTrackEvents.parseCookies("client_information");
        const signupDevice =
          cacheTrackEvents.parseCookies("signup_device")?.signup_device;

        if (
          typeof window.Analytics !== "undefined" &&
          typeof window.Analytics.Analytics?.pageView === "function" &&
          cacheTrackEvents.isReady()
        ) {
          window.Analytics.Analytics.pageView(window.location.href, {
            loggedIn: !!clientInfo,
            device_type: signupDevice,
            network_type: window?.navigator?.connection?.effectiveType,
            network_rtt: window?.navigator?.connection?.rtt,
            network_downlink: window?.navigator?.connection?.downlink,
          });
        }

        if (cacheTrackEvents.isPageViewSent()) {
          clearInterval(pageViewInterval);
        }
      }, 1000);
    },
    listen: (
      element,
      { name = "", properties = {} },
      cache = false,
      callback = null
    ) => {
      // Debounce utility function
      const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      };

      const addClickListener = (el) => {
        if (!el.dataset.clickEventTracking) {
          // Debounced click handler with 300ms delay
          const debouncedHandler = debounce((e) => {
            let event = {
              name,
              properties,
              cache,
            };

            if (typeof callback === "function") {
              event = callback(e);
            }

            cacheTrackEvents.track(event);
          }, 300); // 300ms debounce delay

          el.addEventListener("click", debouncedHandler);
          el.dataset.clickEventTracking = "true";
        }
      };

      const elements =
        element instanceof NodeList ? Array.from(element) : [element];

      elements.forEach(addClickListener);
    },

    addEventhandler: (items) => {
      cacheTrackEvents.interval = setInterval(() => {
        let allListenersApplied = true;

        items.forEach(
          ({ element, event = {}, cache = false, callback = null }) => {
            const elem =
              element instanceof Element
                ? element
                : document.querySelectorAll(element);
            const elements =
              elem instanceof NodeList ? Array.from(elem) : [elem];

            if (!elements.length) {
              allListenersApplied = false;
            }

            elements.forEach((el) => {
              if (!el.dataset.clickEventTracking) {
                cacheTrackEvents.listen(el, event, cache, callback);
                allListenersApplied = false;
              }
            });
          }
        );

        if (allListenersApplied) {
          clearInterval(cacheTrackEvents.interval);
        }
      }, 1);

      return cacheTrackEvents;
    },
    loadEvent: (items) => {
      items.forEach(({ event, cache }) => {
        const { name, properties } = event;
        cacheTrackEvents.track(
          {
            name,
            properties,
          },
          cache
        );
      });

      return cacheTrackEvents;
    },
    pageLoadEvent: (items) => {
      const pathname = window.location.pathname.slice(1);
      items.forEach(
        ({ pages = [], excludedPages = [], event, callback = null }) => {
          let dispatch = false;
          if (pages.length) {
            if (pages.includes(pathname)) {
              dispatch = true;
            }
          } else if (excludedPages.length) {
            if (!excludedPages.includes(pathname)) {
              dispatch = true;
            }
          } else {
            dispatch = true;
          }

          if (dispatch) {
            const eventData = callback ? callback() : event;
            cacheTrackEvents.loadEvent([{ event: eventData }]);
          }
        }
      );

      return cacheTrackEvents;
    },
    trackConsoleErrors: (callback) => {
      const originalConsoleError = console.error;
      console.error = function (...args) {
        // Log the error to the console as usual
        originalConsoleError.apply(console, args);

        // Create a clean error message without __trackjs_state__
        const errorMessage = args
          .map((arg) =>
            arg && typeof arg === "object" && arg.message
              ? arg.message
              : typeof arg === "object"
              ? JSON.stringify(arg, (key, value) =>
                  key.startsWith("__trackjs") ? undefined : value
                )
              : String(arg)
          )
          .join(" ");

        if (typeof callback === "function") {
          callback(errorMessage);
        }
      };
    },
  };

  cacheTrackEvents
    .pageLoadEvent([
      {
        pages: ["signup", "eu/signup"],
        event: {
          name: "ce_virtual_signup_form",
          properties: {
            action: "open",
            form_source: window.location.hostname,
            form_name: "default_diel_deriv",
            url: window.location.href,
          },
        },
      },
      {
        pages: ["signup-success", "eu/signup-success"],
        callback: () => {
          const url = new URL(window.location.href);
          const email = url.searchParams.get("email");
          const formattedEmail = decodeURIComponent(email).replace(/ /g, "+");

          return {
            name: "ce_virtual_signup_form",
            properties: {
              action: "email_confirmation_sent",
              form_source: window.location.hostname,
              form_name: "virtual_signup_banner_homepage",
              url: window.location.href,
              email: formattedEmail,
            },
          };
        },
      },
    ])
    .addEventhandler([
      {
        element: ".livechatbtn",
        event: {
          name: "ce_widget_usage_form",
          properties: {
            action: "click",
            widget_name: "livechat",
          },
        },
      },
      {
        element: ".whatsapp_chat",
        event: {
          name: "ce_widget_usage_form",
          properties: {
            action: "click",
            widget_name: "whatsapp",
          },
        },
      },
      {
        element: "#create",
        callback: (e) => {
          const emailElement = document.getElementById("Email");
          const email = emailElement ? emailElement.value : "";

          return {
            name: "ce_virtual_signup_form",
            properties: {
              action: "started",
              signup_provider: "email",
              form_source: window.location.hostname,
              form_name: "virtual_signup_banner_homepage",
              email,
            },
          };
        },
        cache: true,
      },
      {
        element: "#signup_login",
        event: {
          name: "ce_virtual_signup_form",
          properties: {
            action: "go_to_login",
            signup_provider: "email",
            form_source: window.location.hostname,
            form_name: "default_diel_deriv",
          },
        },
      },
      {
        element: ".sign-up_banner-badges-wrapper a",
        callback: (e) => {
          const provider = e?.currentTarget?.getAttribute("data-provider");

          return {
            name: "ce_virtual_signup_form",
            properties: {
              signup_provider: provider,
              action: "started",
              form_source: window.location.hostname,
              form_name: "default_diel_deriv",
            },
          };
        },
      },
    ])
    .pageView();

  const trackSignupErrorEvent = (action, errorMessage, screen_name) => {
    const form_name = isMobile()
      ? "virtual_signup_web_mobile_default"
      : "virtual_signup_web_desktop_default";
    cacheTrackEvents.loadEvent([
      {
        event: {
          name: "ce_virtual_signup_form",
          properties: {
            action,
            form_name,
            error_message: errorMessage,
            screen_name,
          },
        },
      },
    ]);
  };

  cacheTrackEvents.trackConsoleErrors((errorMessage) => {
    window.is_tracking_signup_errors = window.useGrowthbookFeatureFlag({
      featureFlag: "signup_flow_error_enabled",
    });

    if (is_tracking_signup_errors) {
      if (errorMessage) {
        const currentUrl = window.location.href;
        if (
          currentUrl.includes("signup") ||
          currentUrl.includes("signup-success")
        ) {
          const screen_name = currentUrl.includes("signup-success")
            ? "signup-success"
            : "signup";
          trackSignupErrorEvent("signup_flow_error", errorMessage, screen_name);
        }
      }
    }
  });

  //Analytics block for cta_clicks method starts here
  (function () {
  const getLastNonEmptySegment = (href) => {
  if (href) {
    const parts = href.split("/").filter(Boolean); // Remove empty elements
    let lastSegment = parts.length > 0 ? parts[parts.length - 1] : ""; 
    return lastSegment.split("?")[0]; // Remove anything after "?"
  }
  return "";
};

  const getSectionName = (element) => {
    let section = element.closest("section") || element.closest("div[id]");
    return section
      ? section.id || section.className?.split(" ")[0] || "unknown"
      : "unknown";
  };

  const getIdentifier = (element) => {
  let href = element.getAttribute("href");
  let dataHref =
    element.getAttribute("data-href") ||
    element.getAttribute("data-attributes") ||
    "";
  // Apply getLastNonEmptySegment to href if it's not empty
  if (href && href !== "#") {
    href = getLastNonEmptySegment(href);
  } else {
    href = getLastNonEmptySegment(dataHref) || "unknown";
  }
  return href;
};

  const trackCTAEvents = (event) => {
    const target = event.target.closest("a, label, input");
    if (!target) return;
    const sectionName = getSectionName(target);
    const identifier = getIdentifier(target);
    
    let symbols;
    let volumesInLots;
    let asset_price;

    if (target.value == "Calculate") {
        symbols = document.getElementById("Symbols-2")?.value;
        volumesInLots = document.getElementById("Volume-in-Lots")?.value;
        asset_price = document.getElementById("Asset-price")?.value;
      }


    if (identifier && sectionName) {
      const eventName = "ce_cta_clicks";
      const eventProperties = {
        action: "click",
        component_type: "btn",
        component_name: identifier,
        section_name: sectionName,
        symbols: symbols,
        volumesInLots: volumesInLots,
        asset_price: asset_price,
        cta_name:target.textContent.replace(/[\uF000-\uF8FF]/g, "").trim()
      };

      cacheTrackEvents.track({
        name: eventName,
        properties: eventProperties,
      });
    }
  };

  const addEventListeners = () => {
    if (document.body) {
      document.body.addEventListener("click", (event) => {
        if (!event.target.closest("input")) {
          trackCTAEvents(event);
        }
      });

        document.body.addEventListener("mousedown", (event) => {
        const inputElement = event.target.closest("input");
        if (inputElement && (inputElement.type === "submit" || inputElement.type === "button")) {
          trackCTAEvents(event);
        }
      });
    }
  };

  const interval = setInterval(() => {
    if (document.body) {
      addEventListeners();
      clearInterval(interval);
    }
  }, 10);
})();

  //Analytics block for cta_clicks method ends here

  document.addEventListener("DOMContentLoaded", () => {
    const RUDDERSTACK_STAGING_KEY = "2mmmTCZy9LNia85JObhPez0koy0";
    const RUDDERSTACK_PRODUCTION_KEY = "2hrePojvWH0mpU7La2XfDgYivgC";
    const GB_STAGING_CLIENT_KEY = "sdk-9wuqJ1mlcQsSyZQ";
    const GB_STAGING_DECRYPTION_KEY = "";
    const GB_PROD_CLIENT_KEY = "sdk-UhZV3cNEg5nLNLNS";
    const GB_PROD_DECRYPTION_KEY = "nre64BV0dNIa44zW4tz5ow==";
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
    const client_information = window.parseCookies(
      document.cookie,
      "client_information"
    );
    const clientInfo = client_information
      ? JSON.parse(client_information)
      : null;
    const utm_data_string = window.parseCookies(document.cookie, "utm_data");
    const utm_data = utm_data_string ? JSON.parse(utm_data_string) : {};
    const { utm_source, utm_medium, utm_campaign } = utm_data;
    const cookies = window.parseCookies(document.cookie, "signup_device");
    let signupDevice = null;
    const isBrowser = () => typeof window !== "undefined";
    const getLanguage = () => {
      if (!isBrowser()) return null;
      try {
        return localStorage.getItem("i18n") || navigator.language;
      } catch (error) {
        console.warn("Warning: Error accessing localStorage:", error);
        return navigator.language;
      }
    };
    if (cookies) {
      signupDevice = JSON.parse(cookies)?.signup_device || null;
    }
    const initialiseConfig = {
      growthbookKey: typeof _growthbook !== "undefined" ? null : GB_CLIENT_KEY,
      growthbookDecryptionKey:
        typeof _growthbook !== "undefined" ? null : GB_DECRYPTION_KEY,
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
          loggedIn: !!window.parseCookies(
            document.cookie,
            "client_information"
          ),
          url: window.location.href,
          network_type: navigator.connection?.effectiveType,
          network_rtt: navigator.connection?.rtt,
          network_downlink: navigator.connection?.downlink,
          user_id: clientInfo?.user_id || "",
        },
      },
    };
    try {
      window.Analytics?.Analytics.initialise(initialiseConfig);

      /**const userId = clientInfo?.user_id
        ? clientInfo?.user_id
        : window.Analytics?.Analytics?.getInstances?.().tracking?.getAnonymousId();
      window.Analytics?.Analytics?.identifyEvent(userId);*/
      const userId = clientInfo?.user_id;

      if (userId) {
        window.Analytics?.Analytics?.identifyEvent(userId);
      }
    } catch (error) {
      console.error("Error during initialisation:", error);
    }

    window.Analytics?.Analytics?.pageView(location.pathname, "Deriv.com");

    window.getGrowthbookInstance = function () {
      if (typeof _growthbook !== "undefined") {
        return _growthbook;
      } else {
        return window.Analytics?.Analytics?.getInstances?.().ab?.GrowthBook;
      }
    };
    window.useGrowthbookFeatureFlag = function ({ featureFlag }) {
      const growthBookInstance = window?.getGrowthbookInstance?.();
      if (!growthBookInstance) return null;
      let featureFlagValue = growthBookInstance.getFeatureValue(featureFlag);
      function updateFeatureFlagValue() {
        const value = growthBookInstance.getFeatureValue(featureFlag);
        featureFlagValue = value;
      }
      growthBookInstance.setRenderer(updateFeatureFlagValue);
      return featureFlagValue;
    };

    document
      .querySelectorAll('[data-dwp-button="social"]')
      .forEach((button) => {
        button.addEventListener("click", handleSocialSignup);
      });

    function handleSocialSignup(e) {
      e.preventDefault();
      const data_provider = e.currentTarget.getAttribute("data-provider");

      // Track social signup event
      cacheTrackEvents.loadEvent([
        {
          event: {
            name: "ce_virtual_signup_form",
            properties: {
              signup_provider: data_provider,
              action: "started",
              form_source: window.location.hostname,
              form_name: "virtual_signup_banner_homepage",
            },
          },
        },
      ]);
    }
  });