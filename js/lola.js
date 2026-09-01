(function () {
  /* Navigation */
  var panel = document.getElementById("nav-panel");
  var openBtn = document.getElementById("nav-open");
  var closeBtn = document.getElementById("nav-close");

  if (panel && openBtn && closeBtn) {
    function openNav() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
    }

    function closeNav() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      if (!document.body.classList.contains("viewer-open")) {
        document.body.classList.remove("nav-open");
      }
    }

    openBtn.addEventListener("click", openNav);
    closeBtn.addEventListener("click", closeNav);

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  /* Document viewer (PDF + images) */
  var viewer = document.getElementById("viewer");
  if (!viewer) return;

  var backdrop = document.getElementById("viewer-backdrop");
  var closeViewerBtn = document.getElementById("viewer-close");
  var titleEl = document.getElementById("viewer-title");
  var downloadEl = document.getElementById("viewer-download");
  var openTabEl = document.getElementById("viewer-open-tab");
  var iframe = document.getElementById("viewer-iframe");
  var embed = document.getElementById("viewer-embed");
  var fallback = document.getElementById("viewer-fallback");
  var fallbackLink = document.getElementById("viewer-fallback-link");
  var imageWrap = document.getElementById("viewer-image-wrap");
  var imageEl = document.getElementById("viewer-image");

  function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  function absoluteUrl(src) {
    try {
      return new URL(src, window.location.href).href;
    } catch (e) {
      return src;
    }
  }

  function hidePdfViews() {
    iframe.hidden = true;
    iframe.removeAttribute("src");
    embed.hidden = true;
    embed.removeAttribute("src");
    fallback.hidden = true;
  }

  function openViewer(opts) {
    var src = opts.src;
    var title = opts.title || "Document";
    var isPdf = opts.type === "pdf";
    var url = absoluteUrl(src);

    titleEl.textContent = title;
    downloadEl.href = src;
    downloadEl.hidden = false;
    openTabEl.href = url;
    openTabEl.hidden = isPdf ? false : true;
    fallbackLink.href = url;

    imageWrap.hidden = true;
    imageEl.removeAttribute("src");
    hidePdfViews();

    if (isPdf) {
      if (isMobile()) {
        window.open(url, "_blank", "noopener");
        return;
      }

      embed.hidden = false;
      embed.src = url;
      iframe.hidden = false;
      iframe.src = url;

      window.setTimeout(function () {
        if (embed.hidden) return;
        /* Safari/iOS often blocks inline PDF — keep fallback visible in toolbar via Ouvrir */
      }, 800);
    } else {
      imageWrap.hidden = false;
      imageEl.src = src;
      imageEl.alt = title;
      downloadEl.hidden = false;
    }

    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-open");
    closeViewerBtn.focus();
  }

  function closeViewer() {
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-open");
    hidePdfViews();
    imageEl.removeAttribute("src");
    if (!panel || !panel.classList.contains("is-open")) {
      document.body.classList.remove("nav-open");
    }
  }

  function bindOpeners(selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener("click", function () {
        var pdf = el.getAttribute("data-pdf");
        var image = el.getAttribute("data-image");
        var title = el.getAttribute("data-title") || "Document";

        if (pdf) {
          openViewer({ src: pdf, title: title, type: "pdf" });
        } else if (image) {
          openViewer({ src: image, title: title, type: "image" });
        }
      });
    });
  }

  bindOpeners("[data-pdf]");
  bindOpeners("[data-image]");

  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }, { passive: true });
  }

  closeViewerBtn.addEventListener("click", closeViewer);
  backdrop.addEventListener("click", closeViewer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (viewer.classList.contains("is-open")) closeViewer();
      else if (panel && panel.classList.contains("is-open") && closeBtn) closeBtn.click();
    }
  });
})();
