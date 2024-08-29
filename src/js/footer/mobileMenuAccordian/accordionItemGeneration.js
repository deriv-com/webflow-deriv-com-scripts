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
