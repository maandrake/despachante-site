(function setupPageTransitions() {
  const transition = document.querySelector(".page-transition");
  if (!transition) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionDuration = 1200;
  let navigationStarted = false;

  function finishEntry() {
    transition.classList.remove("is-entry", "is-exiting");
    document.body.removeAttribute("aria-busy");
    navigationStarted = false;
  }

  function replayEntry() {
    transition.classList.remove("is-entry", "is-exiting");
    void transition.offsetWidth;
    transition.classList.add("is-entry");
    window.setTimeout(finishEntry, 900);
  }

  function shouldTransition(event, link) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute("download") || link.dataset.noPageTransition !== undefined) return false;

    const target = (link.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") return false;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return false;

    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return false;
    }

    if (!["http:", "https:"].includes(destination.protocol)) return false;
    if (destination.origin !== window.location.origin) return false;

    const current = new URL(window.location.href);
    const sameDocument =
      destination.pathname === current.pathname &&
      destination.search === current.search;

    return !sameDocument;
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a");
    if (!link || navigationStarted || reducedMotion.matches) return;
    if (!shouldTransition(event, link)) return;

    event.preventDefault();
    navigationStarted = true;
    document.body.setAttribute("aria-busy", "true");
    transition.classList.remove("is-entry");
    void transition.offsetWidth;
    transition.classList.add("is-exiting");

    window.setTimeout(function () {
      window.location.assign(link.href);
    }, transitionDuration);
  });

  window.addEventListener("pageshow", function (event) {
    if (reducedMotion.matches) {
      finishEntry();
      return;
    }

    if (event.persisted) {
      replayEntry();
    } else {
      window.setTimeout(finishEntry, 900);
    }
  });
})();
