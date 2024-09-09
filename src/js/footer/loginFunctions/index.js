import { loginUrl } from "../helper";

const loginLink = document.getElementById("navbar-home_login");
if (loginLink) {
  loginLink.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = loginUrl();
  });
}

const resLoginLink = document.getElementById("res-navbar-home_login");
if (resLoginLink) {
  resLoginLink.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = loginUrl();
  });
}

const whiteLoginBar = document.getElementById("white-navbar_login");
if (whiteLoginBar) {
  whiteLoginBar.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = loginUrl();
  });
}

const resWhiteLoginBar = document.getElementById("res-white-navbar_login");
if (resWhiteLoginBar) {
  resWhiteLoginBar.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = loginUrl();
  });
}
