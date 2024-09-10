function hide_platform(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    element.style.display = "none";
  });
}

const deriv_go_hide_pages = ["help-centre"];
const url = window.location.href;

// Check if the current URL matches any item in the deriv_go_hide_pages array
const isHideDerivGo = deriv_go_hide_pages.some((page) => url.includes(page));

if (isHideDerivGo) {
  const url_obj = new URL(url);
  const params = url_obj.searchParams;

  if (params.has("platform") && params.get("platform") === "derivgo") {
    hide_platform(".derivgo-query-element");
  }
}
