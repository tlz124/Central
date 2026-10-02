/* Central landing page */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    // Close the menu when tapping outside it
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
    // Close the menu if the screen grows past the phone layout
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) {
      if (mq.matches) closeNav();
    });
  }

  /* ---------- Pre-select the form topic from program buttons ---------- */
  var interest = document.getElementById("interest");
  document.querySelectorAll("[data-interest]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (interest) interest.value = btn.getAttribute("data-interest");
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  function setError(id, msg) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-error");
    var field = input.closest(".field");
    err.textContent = msg || "";
    field.classList.toggle("has-error", !!msg);
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-error");
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
    return !msg;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-success");

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var topic = form.interest.value;

      var ok = true;
      ok = setError("name", name ? "" : "Enter your name.") && ok;
      ok = setError("email",
        !email ? "Enter your email." :
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter an email like name@example.com.") && ok;
      ok = setError("interest", topic ? "" : "Choose what you're interested in.") && ok;

      if (!ok) {
        var firstBad = form.querySelector("[aria-invalid='true']");
        if (firstBad) firstBad.focus();
        return;
      }

      // No backend yet: connect this to Formspree, Netlify Forms, or your email service.
      status.textContent = "Message sent. Thanks, " + name.split(" ")[0] + "! We'll be in touch soon.";
      status.classList.add("is-success");
      form.reset();
    });
  }

  /* ---------- Photo lightbox ---------- */
  var photos = Array.prototype.slice.call(document.querySelectorAll(".photo"));
  var box = document.getElementById("lightbox");
  var boxImg = document.getElementById("lightbox-img");
  var boxCap = document.getElementById("lightbox-caption");
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    var img = photos[current].querySelector("img");
    // Full-size version for the viewer; phones get the size that fits their screen
    boxImg.src = img.getAttribute("data-full") || img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = photos[current].getAttribute("data-caption") || "";
  }

  function openBox(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close").focus();
  }

  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  if (box && photos.length) {
    photos.forEach(function (p, i) {
      p.addEventListener("click", function () { openBox(i); });
    });
    box.querySelector(".lightbox-close").addEventListener("click", closeBox);
    box.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) closeBox(); });

    // Swipe left/right between photos, swipe down to close
    var startX = 0, startY = 0;
    box.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
      else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) closeBox();
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "Tab") {
        var f = box.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
