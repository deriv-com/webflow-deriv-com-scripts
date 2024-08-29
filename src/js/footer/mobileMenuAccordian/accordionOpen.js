// Function to handle the scrolling behavior
function scrollToActiveAccordion() {
  const activeAccordion = document.querySelector(
    ".navbar_accordion-trigger.open"
  );
  if (activeAccordion) {
    activeAccordion.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
// Add click event listener to accordion triggers
const accordionTriggers = document.querySelectorAll(
  ".navbar_accordion-trigger"
);
accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", function () {
    setTimeout(scrollToActiveAccordion, 300); // Delay to ensure CSS transitions are complete
  });
});
// Add a class to make the header sticky when the accordion is active
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      const target = mutation.target;
      if (target.classList.contains("open")) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});
// Observe the accordion items for changes in their class attribute
const accordionItems = document.querySelectorAll(".navbar_accordion-item");
accordionItems.forEach((item) => {
  observer.observe(item, { attributes: true });
});
