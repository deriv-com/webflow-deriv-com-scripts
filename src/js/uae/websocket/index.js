function getCookieByKey(cookieString, key) {
  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const [key, val] = cookie.split("=").map((c) => c.trim());
    cookies[key] = decodeURIComponent(val);
  });
  return cookies[key];
}

const DEFAULT_SERVER_URL = "green.derivws.com";

const getServerUrl = () => {
  try {
    return localStorage.getItem("config.server_url") || DEFAULT_SERVER_URL;
  } catch (error) {
    console.warn("Warning: Error accessing localStorage:", error);
    return DEFAULT_SERVER_URL;
  }
};

window.getAppId = () => {
  return localStorage.getItem("config.server_url") || 61554;
};

window.establishWebSocketConnection = () => {
  return new Promise((resolve, reject) => {
    const langCookie = getCookieByKey(document.cookie, "webflow-user-language");
    const language = langCookie ? langCookie.toLowerCase() : "en";
    const server_url = getServerUrl();
    window.websocket = new WebSocket(
      `wss://${server_url}/websockets/v3?app_id=${window.getAppId()}&l=${
        language || "en"
      }&brand=deriv`
    );
    window.websocket.addEventListener("open", (event) => {
      // Add event listener for close event to clear the interval
      window.websocket.addEventListener("close", () => {
        window.websocket.close();
      });

      // subscribe to `message` event
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
