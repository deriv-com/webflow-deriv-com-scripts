const accordionItems = document.querySelectorAll(".navbar_accordion-item");
// Close all accordion items on load
accordionItems.forEach((item) => {
  const trigger = item.querySelector(".navbar_accordion-trigger");
  trigger.classList.remove("open");
  const content = item.querySelector(".navbar_accordion-content");
  content.classList.remove("open");
  content.style.maxHeight = "0px"; // Initially collapse content
  content.style.overflow = "hidden";
  content.style.transition = "max-height 0.3s ease-in, opacity 0.3s ease-in";
  content.style.opacity = "0";
});
accordionItems.forEach((item) => {
  const trigger = item.querySelector(".navbar_accordion-trigger");
  trigger.addEventListener("click", function () {
    const isOpen = trigger.classList.contains("open");
    // Close all accordion sections
    accordionItems.forEach((i) => {
      i.querySelector(".navbar_accordion-trigger").classList.remove("open");
      const content = i.querySelector(".navbar_accordion-content");
      content.classList.remove("open");
      content.style.maxHeight = "0px"; // Collapse all content
      content.style.opacity = "0";
    });
    // Toggle the clicked section
    if (!isOpen) {
      trigger.classList.add("open");
      const content = trigger.nextElementSibling;
      content.classList.add("open");
      // Expand content with animation
      content.style.maxHeight = content.scrollHeight + "px";
      content.style.opacity = "1";
    }
  });
});

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
const accordionItemsGeneration = document.querySelectorAll(
  ".navbar_accordion-item"
);
accordionItemsGeneration.forEach((item) => {
  observer.observe(item, { attributes: true });
});
// iphone back button press close menu
