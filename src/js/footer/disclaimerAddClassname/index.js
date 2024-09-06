var hasBannerDisclaimer = document.querySelector(".banner_disclaimer");

if (hasBannerDisclaimer) {
  document.body.classList.add("disclaimer-visible");
} else {
  document.body.classList.remove("disclaimer-visible");
}
