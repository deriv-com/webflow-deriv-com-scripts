import { hideElems, showElems } from "./data.js";
import { getCookieByKey } from "../cookies";

export default () => {
  const clientsCountry = window.getClientCountry();
  hideElems.forEach((array) => {
    const shouldHide =
      array.id === "hideDiel"
        ? !array.countries.includes(clientsCountry)
        : array.countries.includes(clientsCountry);

    if (clientsCountry && shouldHide) {
      return array.selectors.forEach((selectorString) => {
        const selectors = document.querySelectorAll(selectorString);
        selectors.forEach((selector) => {
          if (selector) {
            if (array.id === "w-dyn-item-p2p") {
              const nestedElement = selector.querySelector(
                "#card_block_p2p.help_category"
              );
              if (nestedElement) {
                selector.style.display = "none";
              }
            } else {
              selector.style.display = "none";
            }
          }
        });
      });
    } else if (!shouldHide) {
      const dielIcons = document.querySelector(".footer_social-icons.diel");
      if (dielIcons) {
        dielIcons.style.display = "flex";
      }
    }
  });

  showElems.forEach((array) => {
    if (clientsCountry && array.countries.includes(clientsCountry)) {
      array.selectors.forEach((selectorString) => {
        const selectors = document.querySelectorAll(selectorString);
        selectors.forEach((selector) => {
          if (selector) {
            const page_wrapper = document.querySelector(".page-wrapper");
            if (selectorString === ".banner_disclaimer") {
              page_wrapper.classList.add("disclaimer-show");
              selector.classList.remove("hide-element");
            } else {
              selector.style.display = "block";
            }
          }
        });
      });
    } else {
      array.selectors.forEach((selectorString) => {
        const selectors = document.querySelectorAll(selectorString);
        selectors.forEach((selector) => {
          if (selector) {
            selectorString === ".banner_disclaimer"
              ? selector.classList.add("hide-element")
              : (selector.style.display = "none");
          }
        });
      });
    }
  });
};
