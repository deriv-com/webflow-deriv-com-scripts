function clickElementWithAriaLabel(label) {
  const element = document.querySelector(`[aria-label="${label}"]`);

  if (element) {
    element.click();
  }
}

window.addEventListener("load", function () {
  clickElementWithAriaLabel("Minimize window");
});

clickElementWithAriaLabel("Minimize window");
