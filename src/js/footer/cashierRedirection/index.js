document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(
    'a[href="https://app.deriv.com/cashier/account-transfer"]'
  );

  links.forEach((link) => {
    link.href =
      "https://app.deriv.com/redirect?action=ctrader_account_transfer";
  });
});
