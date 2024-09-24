import { getCookieByKey } from "../cookies";
//----- start of auth check -----
function useAuthCheck() {
  let is_logged_in = false;
  let is_auth_checked = false;
  let checkCookieInterval;

  const isLoggedIn = () => {
    return !!getCookieByKey(document.cookie, "client_information");
  };

  const checkAuthStatus = () => {
    is_auth_checked = true;
    is_logged_in = isLoggedIn();
    if (is_logged_in) {
      clearInterval(checkCookieInterval);
    }
    // Trigger a custom event to notify the outer scope
    document.dispatchEvent(new Event("authStatusChange"));
  };

  // Perform initial authentication check
  checkAuthStatus();

  // Set interval to periodically check authentication status
  checkCookieInterval = setInterval(checkAuthStatus, 800);

  // Return a function to allow the outer scope to listen for authentication status changes
  return {
    getLoggedInStatus: () => is_logged_in,
    getAuthCheckedStatus: () => is_auth_checked,
    onAuthStatusChange: (callback) =>
      document.addEventListener("authStatusChange", callback),
  };
}

const authChecker = useAuthCheck();

// Listen for authentication status changes
authChecker.onAuthStatusChange(() => {
  if (authChecker.getAuthCheckedStatus() && authChecker.getLoggedInStatus()) {
    const elements_logged_in = document.querySelectorAll(".logged-in-btn");

    elements_logged_in.forEach((elements_logged_in) => {
      elements_logged_in.classList.remove("hide-element");
    });

    const elements_logged_out = document.querySelectorAll(".logged-out-btn");

    elements_logged_out.forEach((elements_logged_out) => {
      elements_logged_out.classList.add("hide-element");
    });
  } else if (
    authChecker.getAuthCheckedStatus() &&
    !authChecker.getLoggedInStatus()
  ) {
    const elements_logged_out = document.querySelectorAll(".logged-out-btn");

    elements_logged_out.forEach((elements_logged_out) => {
      elements_logged_out.classList.remove("hide-element");
    });

    const elements_logged_in = document.querySelectorAll(".logged-in-btn");

    elements_logged_in.forEach((elements_logged_in) => {
      elements_logged_in.classList.add("hide-element");
    });
  }
});

//----- end of auth check -----
