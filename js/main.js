/* The Chedee — shared interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Hero video: respect reduced-motion, fall back to poster frame
     ------------------------------------------------------------------- */
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && reduceMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  /* ---------------------------------------------------------------------
     Header: scroll state + mobile nav
     ------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  if (header) {
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = body.classList.toggle("nav-open");
      body.classList.toggle("nav-locked", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("nav-open", "nav-locked");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        body.classList.remove("nav-open", "nav-locked");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     ------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var group = entry.target.closest(".reveal-stagger");
            if (group) {
              Array.prototype.forEach.call(group.children, function (child, i) {
                child.style.setProperty("--stagger-i", i);
              });
            }
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Testimonial carousel
     ------------------------------------------------------------------- */
  var track = document.querySelector(".testimonial-track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".testimonial"));
    var dotsWrap = document.querySelector(".dots");
    var current = 0;
    var timer = null;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Show testimonial " + (i + 1));
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", function () { goTo(i); restart(); });
        dotsWrap.appendChild(b);
      });
    }

    function goTo(i) {
      slides[current].classList.remove("is-active");
      if (dotsWrap) dotsWrap.children[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      if (dotsWrap) dotsWrap.children[current].classList.add("is-active");
    }

    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    if (slides.length) {
      slides[0].classList.add("is-active");
      restart();
      track.addEventListener("mouseenter", function () { clearInterval(timer); });
      track.addEventListener("mouseleave", restart);
      track.addEventListener("focusin", function () { clearInterval(timer); });
      track.addEventListener("focusout", restart);
    }
  }

  /* ---------------------------------------------------------------------
     Gallery filter + lightbox
     ------------------------------------------------------------------- */
  var galleryGrid = document.querySelector(".gallery-grid");
  if (galleryGrid) {
    var filterBtns = document.querySelectorAll(".filter-btn");
    var items = Array.prototype.slice.call(galleryGrid.querySelectorAll(".gallery-item"));

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var cat = btn.dataset.filter;
        items.forEach(function (item) {
          var match = cat === "all" || item.dataset.category === cat;
          item.classList.toggle("hidden", !match);
        });
      });
    });

    var lightbox = document.querySelector(".lightbox");
    if (lightbox) {
      var lbMedia = lightbox.querySelector(".lightbox-media");
      var lbCaption = lightbox.querySelector(".lightbox-caption");
      var lbClose = lightbox.querySelector(".lightbox-close");
      var lbPrev = lightbox.querySelector(".lightbox-prev");
      var lbNext = lightbox.querySelector(".lightbox-next");
      var visibleItems = [];
      var lbIndex = 0;
      var lastFocused = null;

      function openLightbox(item) {
        visibleItems = items.filter(function (i) { return !i.classList.contains("hidden"); });
        lbIndex = visibleItems.indexOf(item);
        lastFocused = document.activeElement;
        render();
        lightbox.classList.add("is-open");
        body.classList.add("nav-locked");
        lbClose.focus();
      }

      function render() {
        var item = visibleItems[lbIndex];
        var src = item.querySelector(".media-frame").innerHTML;
        lbMedia.innerHTML = '<div class="media-frame ratio-16x9" style="border-radius:0;height:100%">' + src + "</div>";
        lbCaption.textContent = item.dataset.caption || "";
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        body.classList.remove("nav-locked");
        if (lastFocused) lastFocused.focus();
      }

      items.forEach(function (item) {
        item.addEventListener("click", function () { openLightbox(item); });
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");
        item.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(item); }
        });
      });

      lbClose.addEventListener("click", closeLightbox);
      lbPrev.addEventListener("click", function () { lbIndex = (lbIndex - 1 + visibleItems.length) % visibleItems.length; render(); });
      lbNext.addEventListener("click", function () { lbIndex = (lbIndex + 1) % visibleItems.length; render(); });
      lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") lbPrev.click();
        if (e.key === "ArrowRight") lbNext.click();
      });
    }
  }

  /* ---------------------------------------------------------------------
     Back to top
     ------------------------------------------------------------------- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () { backToTop.classList.toggle("is-visible", window.scrollY > 700); },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (front-end only demo submission)
     ------------------------------------------------------------------- */
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var fields = contactForm.querySelectorAll("[required]");
      fields.forEach(function (field) {
        var wrap = field.closest(".field");
        var ok = field.value.trim() !== "" && (field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        if (wrap) wrap.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        var firstError = contactForm.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }
      var success = document.querySelector("#contact-success");
      contactForm.reset();
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });

    contactForm.querySelectorAll("[required]").forEach(function (field) {
      field.addEventListener("input", function () {
        var wrap = field.closest(".field");
        if (wrap) wrap.classList.remove("has-error");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Booking widget: sensible default dates
     ------------------------------------------------------------------- */
  var checkIn = document.querySelector("#bw-checkin");
  var checkOut = document.querySelector("#bw-checkout");
  if (checkIn && checkOut) {
    var today = new Date();
    var inDate = new Date(today.getTime() + 7 * 86400000);
    var outDate = new Date(today.getTime() + 9 * 86400000);
    function fmt(d) { return d.toISOString().slice(0, 10); }
    checkIn.min = fmt(today);
    checkIn.value = fmt(inDate);
    checkOut.min = fmt(inDate);
    checkOut.value = fmt(outDate);
    checkIn.addEventListener("change", function () {
      var newOut = new Date(checkIn.value);
      newOut.setDate(newOut.getDate() + 2);
      checkOut.min = checkIn.value;
      if (checkOut.value <= checkIn.value) checkOut.value = fmt(newOut);
    });
  }

  /* ---------------------------------------------------------------------
     Current year in footer
     ------------------------------------------------------------------- */
  var yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
