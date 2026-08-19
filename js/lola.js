(function () {
  /* Navigation */
  var panel = document.getElementById("nav-panel");
  var openBtn = document.getElementById("nav-open");
  var closeBtn = document.getElementById("nav-close");

  if (panel && openBtn && closeBtn) {
    function openNav() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeNav() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      if (!document.body.classList.contains("viewer-open")) {
        document.body.style.overflow = "";
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
  var iframe = document.getElementById("viewer-iframe");
  var imageWrap = document.getElementById("viewer-image-wrap");
  var imageEl = document.getElementById("viewer-image");

  function openViewer(opts) {
    var src = opts.src;
    var title = opts.title || "Document";
    var isPdf = opts.type === "pdf";

    titleEl.textContent = title;
    downloadEl.href = src;
    downloadEl.hidden = false;

    if (isPdf) {
      iframe.hidden = false;
      imageWrap.hidden = true;
      imageEl.removeAttribute("src");
      iframe.src = src;
    } else {
      iframe.hidden = true;
      iframe.removeAttribute("src");
      imageWrap.hidden = false;
      imageEl.src = src;
      imageEl.alt = title;
    }

    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-open");
    document.body.style.overflow = "hidden";
    closeViewerBtn.focus();
  }

  function closeViewer() {
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-open");
    iframe.removeAttribute("src");
    imageEl.removeAttribute("src");
    document.body.style.overflow = panel && panel.classList.contains("is-open") ? "hidden" : "";
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

  closeViewerBtn.addEventListener("click", closeViewer);
  backdrop.addEventListener("click", closeViewer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (viewer.classList.contains("is-open")) closeViewer();
      else if (panel && panel.classList.contains("is-open") && closeBtn) closeBtn.click();
    }
  });
})();
