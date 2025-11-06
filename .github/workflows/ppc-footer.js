<script>
    window.parseCookies = function (cookieString, value) {
      const cookies = {};
      cookieString.split(";").forEach((cookie) => {
        const [key, val] = cookie.split("=").map((c) => c.trim());
        cookies[key] = decodeURIComponent(val);
      });
      return cookies[value];
    };
  
    function setCookie(name, value, days, domain) {
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
    function getCookieByKey(cookieString, key) {
      const cookies = {};
      cookieString.split(";").forEach((cookie) => {
        const [key, val] = cookie.split("=").map((c) => c.trim());
        cookies[key] = decodeURIComponent(val);
      });
      return cookies[key];
    }
  
    function setLanguageCookie(language) {
      setCookie("webflow-user-language", language, 30);
    }
  
    const languages = ["ar", "fr", "pt", "ru", "es", "th", "hk", "si"];
    function updateURLAsPerUserLanguage() {
      const current_path = window.location.pathname;
      const current_hash = window.location.hash;
      const current_query = window.location.search;
      const paths = current_path.split("/");
      const first_path = paths[1];
      const has_language_in_url = languages.includes(first_path || "");
      const user_language =
        getCookieByKey(document.cookie, "webflow-user-language")?.toLowerCase() ||
        "en";
  
      // Set the language cookie on all pages
      if (has_language_in_url) {
        setLanguageCookie(first_path);
      } else {
        setLanguageCookie("en"); // Ensure the cookie is set to "en" if no language is in the URL
      }
  
      // Update the URL only on the signup-success page and if language is not "en"
      if (
        (current_path.includes("signup-success") ||
          current_path.includes("check-email")) &&
        !has_language_in_url &&
        user_language !== "en"
      ) {
        const updated_path = "/" + user_language + current_path; // Prefix user language
        const new_url = updated_path + current_query + current_hash;
        window.location.href = new_url;
      }
    }
  
    document.addEventListener("DOMContentLoaded", function () {
      updateURLAsPerUserLanguage();
    });
  
    window.establishWebSocketConnection = () => {
      return new Promise((resolve, reject) => {
        const urlPath = window.location.pathname;
        const langMatch = urlPath.split("/")[1];
        const language = /^[a-z]{2}$/.test(langMatch) ? langMatch : "en";

        const configServerUrl = localStorage.getItem("config.server_url");
        const server_url = configServerUrl || "green.derivws.com";
  
        // Check if the pathname contains '/academy' or '/partners' to set app_id
        let app_id;
        if (urlPath.includes("/partners")) {
          app_id = "62837";
        } else if (urlPath.includes("/academy")) {
          app_id = "37228";
        } else {
          app_id = "61554";
        }
  
        window.websocket = new WebSocket(
          `wss://${server_url}/websockets/v3?app_id=${app_id}&l=${language}&brand=deriv`
        );
        window.websocket.addEventListener("open", (event) => {
          window.websocket.addEventListener("close", () => {
            window.websocket.close();
          });
          window.websocket.addEventListener("message", (event) => {
            const receivedMessage = JSON.parse(event.data);
          });
          resolve(window.websocket);
        });
        window.websocket.addEventListener("error", (error) => {
          console.error("WebSocket connection error:", error);
          window?.websocket?.close();
          reject(error);
        });
      });
    };
  
    window.socketMessageSend = async (message, message_type) => {
      try {
        if (
          !window?.websocket ||
          window?.websocket?.readyState !== WebSocket?.OPEN
        ) {
          return establishWebSocketConnection()
            .then(() => {
              websocket.send(message);
              return new Promise((resolve, reject) => {
                websocket.addEventListener("message", (event) => {
                  const data = JSON.parse(event.data);
                  if (message_type === data.msg_type) {
                    if (data.error) {
                      reject(data.error);
                    } else {
                      resolve(data);
                    }
                  }
                });
              });
            })
            .catch((error) => {
              console.error("Failed to establish WebSocket connection:", error);
              return Promise.reject(error);
            });
        } else {
          window.websocket.send(message);
          return new Promise((resolve, reject) => {
            window.websocket.addEventListener("message", (event) => {
              const data = JSON.parse(event.data);
              if (message_type === data.msg_type) {
                if (data.error) {
                  reject(data.error);
                } else {
                  resolve(data);
                }
              }
            });
          });
        }
      } catch (error) {
        console.error("An error occurred:", error);
        return Promise.reject(error);
      }
    };
  
    const getDataLink = (data) => {
      let data_link = "";
      if (data) {
        Object.keys(data).forEach((elem) => {
          data_link += `&${elem}=${data[elem]}`;
        });
      }
      return data_link;
    };
  
    window.loginUrl = () => {
      const server_url = localStorage.getItem("config.server_url");
      const langCookie = window.parseCookies(
        document.cookie,
        "webflow-user-language"
      );
      let language = langCookie ? langCookie.toLowerCase() : "en";
      if (language === "zh-cn" || language === "zh-tw") {
        language = language.replace("-", "_");
      }
      const cookies_value = getUTMData();
      const cookies_link = getDataLink(cookies_value);
      const affiliate_token = window.parseCookies(
        document.cookie,
        "affiliate_tracking"
      );
      const affiliate_token_link = affiliate_token
        ? `&affiliate_token=${affiliate_token}`
        : "";
  
      const supported_platforms = ["mt5", "bot", "derivx"];
      const redirectToTradingPlatform = () => {
        supported_platforms.filter(
          (platform) => window.location.pathname.includes(platform) && platform
        );
      };
      const sub_url = redirectToTradingPlatform() || "";
      let app_id = "16929"; //default app_id
      const { hostname, pathname } = window.location;
      if (pathname.includes("/partners")) {
        if (hostname.includes("webflow.io")) {
          app_id = "62573";
        } else {
          app_id = "62837";
        }
      }
      return `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&l=${language}&brand=deriv${affiliate_token_link}${cookies_link}&platform=${sub_url}`;
    };
  
    const submitBtn = document.getElementById("create");
    if (submitBtn) submitBtn.setAttribute("type", "button");
  
    const emailInput = document.getElementById("Email");
    const emailErrorText = document.getElementById("email-sign-up-error-text");
    const emailErrorIcon = document.getElementById("email-sign-up-error-icon");
    const checkBox = document.getElementById("checkbox-c-trader-signup");
    const checkBoxErrorText = document.getElementById(
      "checkbox-c-trader-signup-error-text"
    );
  
    const emailPattern = window.emailRegex || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    function handleInputValidation(event) {
      const input = event.target;
      const inputValue = input.value.trim();
      const isValidEmail = emailPattern.test(inputValue);
  
      if (isValidEmail) {
        input.classList.remove("error-field-block");
        emailErrorText.classList.remove("error-field-block");
        emailErrorIcon.classList.remove("error-field-block");
      } else {
        input.classList.add("error-field-block");
        emailErrorText.classList.add("error-field-block");
        emailErrorIcon.classList.add("error-field-block");
      }
    }
  
    if (emailInput) {
      emailInput.addEventListener("input", handleInputValidation);
    }
  
    // Utility functions for cookies
    const getCookiesFields = () => [
      "utm_source",
      "utm_ad_id",
      "utm_adgroup_id",
      "utm_adrollclk_id",
      "utm_campaign",
      "utm_campaign_id",
      "utm_content",
      "utm_fbcl_id",
      "utm_ttclid",
      "utm_sccid",
      "utm_gl_client_id",
      "utm_medium",
      "gclid",
      "gclid_url",
      "utm_msclk_id",
      "utm_term",
      "affiliate_data",
      "affiliate_token",
      "affiliate_tracking",
    ];
  
    const getUTMData = () => {
      const utmDataString =
        window.parseCookies(document.cookie, "utm_data") || "{}";
      const gclid = window.parseCookies(document.cookie, "gclid");
  
      if (utmDataString) {
        const utmData = JSON.parse(utmDataString);
        const cookiesFields = getCookiesFields();
        const filteredData = {};
        console.log(utmData);
        cookiesFields.forEach((field) => {
          if (
            utmData.hasOwnProperty(field) &&
            utmData[field] &&
            utmData[field] !== "null"
          ) {
            filteredData[field] = utmData[field];
          }
        });
  
        if (gclid) {
          filteredData["gclid_url"] = gclid;
        }
  
        // Match backend validation regex
        Object.keys(filteredData).forEach((key) => {
          if (filteredData[key]) {
            filteredData[key] = filteredData[key]
              .toString()
              .replace(/[^a-zA-Z0-9\s\-\._]/g, "")
              .substring(0, 100);
          }
        });
  
        return filteredData;
      }
  
      return null;
    };
  
    const getDateFirstContact = () => {
      const dateFirstContactString =
        window.parseCookies(document.cookie, "date_first_contact") || "{}";
      if (dateFirstContactString) {
        const parsedData = JSON.parse(dateFirstContactString);
        return parsedData.date_first_contact
          ? { date_first_contact: parsedData.date_first_contact }
          : null;
      }
      return null;
    };
  
    const getSignupDevice = () => {
      const signupDeviceString =
        window.parseCookies(document.cookie, "signup_device") || "{}";
      if (signupDeviceString) {
        const parsedData = JSON.parse(signupDeviceString);
        return parsedData.signup_device
          ? { signup_device: parsedData.signup_device }
          : null;
      }
      return null;
    };
  
    const getAffiliateData = () => {
      const affiliateDataString = window.parseCookies(
        document.cookie,
        "affiliate_data"
      );
  
      if (affiliateDataString && affiliateDataString !== "{}") {
        const affiliateData = JSON.parse(affiliateDataString);
        const cookiesFields = getCookiesFields();
        const filteredData = {};
        cookiesFields.forEach((field) => {
          if (
            affiliateData.hasOwnProperty(field) &&
            affiliateData[field] &&
            affiliateData[field] !== "null"
          ) {
            filteredData[field] = affiliateData[field];
          }
        });
  
        return filteredData;
      }
  
      return null;
    };
  
    const createMarketingObject = () => {
      const utmData = getUTMData();
      const dataObject = {
        ...(utmData || {}),
      };
      // Remove keys with null values
      Object.keys(dataObject).forEach(
        (key) => dataObject[key] == null && delete dataObject[key]
      );
      return Object.keys(dataObject).length ? dataObject : null;
    };

    const getAdPlatformData = () => {
        const stpDataString = window.parseCookies(
            document.cookie,
            "stp_data"
        );
        if (stpDataString && stpDataString !== "{}") {
            const stpData = JSON.parse(stpDataString);
            return stpData;
        }
    
        return null;
    }
  
    const generateData = (formatted_email) => {
      const affiliate_data = getAffiliateData();
      const affiliate_tracking_cookie = window.parseCookies(
        document.cookie,
        "affiliate_tracking"
      );
  
      let all_cookies = {
        ...(getSignupDevice() || {}),
        ...(getDateFirstContact() || {}),
      };
      // backward compatibility (PLEASE DEPRECATE LATER) affiliate_data.affiliate_token === affiliate_tracking_cookie
      if (
        affiliate_data &&
        affiliate_data?.affiliate_token === affiliate_tracking_cookie
      ) {
        all_cookies = { ...all_cookies, ...(affiliate_data || {}) };
      } else {
        // Fallback to createMarketingObject if no affiliate_data
        // backward compatibility check for affiliate_tracking (PLEASE DEPRECATE LATER)
        const marketing_values = createMarketingObject();
        let has_invalid_affiliate_data = false;
  
        // backward compatibility check for affiliate_tracking (PLEASE DEPRECATE LATER)
        if (
          marketing_values?.utm_medium === "affiliate" &&
          !affiliate_tracking_cookie
        ) {
          has_invalid_affiliate_data = true;
          console.error(
            "Invalid Affiliate link: utm medium affiliate however there is no affiliate tracking"
          );
        }
        if (marketing_values && !has_invalid_affiliate_data) {
          all_cookies = {
            ...all_cookies,
            ...(marketing_values || {}),
            ...(affiliate_tracking_cookie
              ? { affiliate_token: affiliate_tracking_cookie }
              : {}),
          };
        }
      }
      const ad_platform_cookies = getAdPlatformData();
  
      return {
        verify_email: formatted_email,
        type: "account_opening",
        url_parameters: all_cookies,
        ad_platform_cookies,
      };
    };

    const isV2Country = async (country_code, email) => {
      try {
        const payload = { email, country_code };
        const response = await fetch("https://api-core.deriv.com/v1/lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        
        // Return true only if brand_name is explicitly "deriv"
        if (data && data.brand_name === "deriv") {
          return true;
        }
        
        // Return false for any other case (no response, different brand_name, etc.)
        return false;
      } catch (error) {
        console.error("isV2Country API error:", error);
        return false;
      }
    };

    const handleV2SignUp = async (email, preferred_language, residence_country, tracking_data) => {
      try {
        const payload = { email, preferred_language, residence_country, tracking_data };
        const response = await fetch("https://api-core.deriv.com/v1/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("V2 signup request failed");
        }

        const data = await response.json();
        console.log("V2 signup response:", data);
        
        // Return the response data
        return data.data;
        
      } catch (error) {
        console.error("handleV2SignUp error:", error);
        return null;
      }
    };

    const handleV1SignUp = (email) => {
      const data = generateData(email);
      const langCookie = window.parseCookies(
        document.cookie,
        "webflow-user-language"
      );
      const language = langCookie ? langCookie.toLowerCase() : "en";

      window
        .socketMessageSend(JSON.stringify(data), "verify_email")
        .then((res) => {
          if (language && language !== "en") {
              window.location.href = `/${language}/signup-success?email=${email}`;
          } else {
              window.location.href = `/signup-success?email=${email}`;
          }
        })
        .catch((error) => {
          Analytics?.Analytics?.trackEvent("ce_virtual_signup_form", {
            action: "signup_flow_error",
            form_source: window.location.hostname,
            form_name: "virtual_signup_ppc_landing",
          });
        });
    };
  
    if (submitBtn) {
      submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (typeof window.addStpCookieData === 'function') {
            window.addStpCookieData();
        } else {
            console.warn('addStpCookieData function not available');
        }

        const email = emailInput?.value.trim();
  
        if (!emailPattern.test(email)) {
          emailInput?.classList.add("error-field-block");
          emailErrorText?.classList.add("error-field-block");
          emailErrorIcon?.classList.add("error-field-icon");
          return;
        }
  
        const isV2Signup = localStorage.getItem("nuzhy-v2-signup") === "true";
        if (isV2Signup) {
          console.log("proceed v2 signup");
          
          // const country_code = "ar";
          const countryInput = document.getElementById('Symbols-2');
          const country_code = countryInput.getAttribute('data-alpha2');
          console.log("country_code", country_code);
          
          isV2Country(country_code, email).then((isV2) => {
            if (isV2) {
              const tracking_data = typeof window.getMarketingCookiesPayloadData === 'function' 
                ? window.getMarketingCookiesPayloadData() 
                : {};
              handleV2SignUp(email, "en", country_code, tracking_data).then((responseData) => {
                // Check if response status is 200 and code is "Success"
                if (responseData && responseData.status === 200 && responseData.code === "Success") {
                  // Set user-email cookie
                  setCookie("user-email", email, 1, ".deriv.com");
                  
                  // Redirect to verification page
                  window.location.href = `https://home.deriv.com/dashboard/verify?CountryCode=${country_code}&IsFromSignup=true&IsPhoneNumber=false&type=email`;
                }
              });
            } else {
              handleV1SignUp(email);
            }
          });
        } else {
          handleV1SignUp(email);
        }
      });
    }
  
    const googleButton = document.getElementById("dm-signup-google");
    const facebookButton = document.getElementById("dm-signup-facebook");
    const appleButton = document.getElementById("dm-signup-apple");
  
    if (googleButton) {
      googleButton.addEventListener("click", handleSocialSignup);
    }
    if (facebookButton) {
      facebookButton.addEventListener("click", handleSocialSignup);
    }
    if (appleButton) {
      appleButton.addEventListener("click", handleSocialSignup);
    }
  
    const Login = (() => {
      const brand = "deriv";
      const oauth_url = "https://oauth.deriv.com/oauth2/authorize";
  
      const dateFirstContact = getDateFirstContact()?.date_first_contact;
      const device = getSignupDevice()?.signup_device;
      const aff_token = window.parseCookies(
        document.cookie,
        "affiliate_tracking"
      );
      const langCookie = window.parseCookies(
        document.cookie,
        "webflow-user-language"
      );
      const lang = langCookie ? langCookie.toLowerCase() : "en";
  
      const affiliate_token_link = aff_token
        ? `&affiliate_token=${aff_token}`
        : "";
  
      const initOneAll = (provider) => {
        const social_login_url = `${oauth_url}?app_id=16929&brand=${brand}&social_signup=${provider}${affiliate_token_link}&l=${lang}&date_first_contact=${dateFirstContact}&signup_device=${device}`;
        window.location.href = social_login_url;
      };
  
      return {
        initOneAll,
      };
    })();
  
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
              form_name: "virtual_signup_ppc_landing",
              cookie_data: getUserCookieData(),
            },
          },
        },
      ]);
  
      window.location.href = `${window.loginUrl()}&social_signup=${data_provider}`;
    }

    // UAE signup API call
    const uaeSignup = (email, preferred_language = "en") => {
        const payload = { email, preferred_language };
        return fetch("https://api.deriv.ae/v1/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        }).then(async (response) => {
            const responseBody = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw responseBody || { message: "UAE signup request failed" };
            }
            const isSuccess = Array.isArray(responseBody?.data) && responseBody.data[0]?.status === 200;
            if (!isSuccess) {
                throw responseBody || { message: "UAE signup response not successful" };
            }
            setCookie("user-email", email, 1, `.deriv.ae`);
            window.location.href = `https://app.deriv.ae/uae/otp?action=signup&lang=${preferred_language}`;
        });
    };

    //Start - UAE signup
    const submitUAEBtn = document.getElementById("create_uae");
    if (submitUAEBtn) {
        submitUAEBtn.addEventListener("click", function (event) {
            event.preventDefault();
            
            const email = emailInput?.value.trim();
            if (!emailPattern.test(email)) {
                emailInput?.classList.add("error-field-block");
                emailErrorText?.classList.add("error-field-block");
                emailErrorIcon?.classList.add("error-field-icon");
            return;
            }

            const preferred_language = getPreferredLanguage();

            uaeSignup(email, preferred_language).catch((error) => {
                console.error("UAE signup error:", error);
                emailInput?.classList.add("error-field-block");
                emailErrorText?.classList.add("error-field-block");
            });
            
        });
    }
    //End - UAE signup

    const getPreferredLanguage = () => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const first = (segments[0] || '').toLowerCase();
        if (first === 'ar' || first === 'ar2') return 'ar';
        return 'en';
    }

</script>

<script>
  // Prevent "Enter" from submitting the form
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form'); // or use a more specific selector if you have multiple forms
    
    if (!form) return;
  
    // Prevent "Enter" from submitting the form
    form.addEventListener('keydown', (e) => {
      // Check if Enter key is pressed inside an input or textarea
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    });
  });
</script>  

<script>
  document.addEventListener("DOMContentLoaded", function () {
    function trackEvent() {
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
      let device = getSignupDevice()?.signup_device;
    }

    if (
      !["/signup-success", "/check-email"].includes(window.location.pathname)
    ) {
      setTimeout(trackEvent, 500);
    }
  });
</script>
