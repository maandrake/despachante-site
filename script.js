document.documentElement.classList.add("js");

window.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.querySelector(".main-menu");
  const menuLinks = mainMenu ? Array.from(mainMenu.querySelectorAll("a")) : [];
  const mobileBreakpoint = 768;

  function isMobileViewport() {
    return window.innerWidth <= mobileBreakpoint;
  }

  function setMenuAvailability(isAvailable) {
    if (!mainMenu) return;
    mainMenu.inert = !isAvailable;
    if (isAvailable) {
      mainMenu.removeAttribute("aria-hidden");
    } else {
      mainMenu.setAttribute("aria-hidden", "true");
    }
  }

  function setMenuState(isOpen, returnFocus = false) {
    if (!menuToggle || !mainMenu) return;

    menuToggle.classList.toggle("active", isOpen);
    mainMenu.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");

    if (isMobileViewport()) {
      setMenuAvailability(isOpen);
    } else {
      setMenuAvailability(true);
    }

    if (!isOpen && returnFocus) {
      menuToggle.focus();
    }
  }

  function syncMenuAccessibility() {
    if (!menuToggle || !mainMenu) return;

    if (isMobileViewport()) {
      setMenuAvailability(mainMenu.classList.contains("active"));
    } else {
      if (mainMenu.classList.contains("active")) {
        setMenuState(false);
      }
      setMenuAvailability(true);
    }
  }

  function getMenuFocusables() {
    if (!menuToggle || !mainMenu) return [];
    return [menuToggle].concat(menuLinks.filter((link) => !link.hasAttribute("disabled")));
  }

  if (menuToggle && mainMenu) {
    syncMenuAccessibility();

    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setMenuState(!mainMenu.classList.contains("active"));
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        if (isMobileViewport()) setMenuState(false, true);
      });
    });

    document.addEventListener("click", function (event) {
      if (mainMenu.classList.contains("active") &&
          !mainMenu.contains(event.target) &&
          !menuToggle.contains(event.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!isMobileViewport() || !mainMenu.classList.contains("active")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setMenuState(false, true);
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = getMenuFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!focusables.includes(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", syncMenuAccessibility);
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    const textos = document.querySelectorAll(".menu-texto");
    textos.forEach((elemento) => elemento.classList.add("menu-texto-visivel"));
    window.setTimeout(() => {
      textos.forEach((elemento) => elemento.classList.remove("menu-texto-visivel"));
    }, 5000);
  }
});

// Controle do banner durante rolagem e redimensionamento
let bannerApagado = false;
let ticking = false;
let ultimoModoMobile = null;
const shrinkEnterThreshold = 80;
const shrinkExitThreshold = 20;
const banner = document.querySelector(".banner");
const bannerImg = document.querySelector(".scroll-img");
const bannerMenu = document.querySelector(".scroll-menu");

function updateBannerState(shouldShrink, isMobile) {
  if (!banner || !bannerImg || !bannerMenu) return;
  banner.classList.toggle("apagado", shouldShrink);
  bannerImg.classList.toggle("escalado", shouldShrink && !isMobile);
  bannerMenu.classList.toggle("escalado", shouldShrink && !isMobile);
  bannerApagado = shouldShrink;
  ultimoModoMobile = isMobile;
}

function handleScrollEffects() {
  if (!banner || !bannerImg || !bannerMenu) {
    ticking = false;
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const shouldShrink = bannerApagado
    ? window.scrollY > shrinkExitThreshold
    : window.scrollY > shrinkEnterThreshold;

  if (shouldShrink !== bannerApagado || isMobile !== ultimoModoMobile) {
    updateBannerState(shouldShrink, isMobile);
  }

  ticking = false;
}

window.addEventListener("scroll", function () {
  if (!ticking) {
    window.requestAnimationFrame(handleScrollEffects);
    ticking = true;
  }
}, { passive: true });
window.addEventListener("resize", handleScrollEffects);
window.addEventListener("load", handleScrollEffects);

// Animações e formulário
document.addEventListener("DOMContentLoaded", function () {
  const fadeElements = document.querySelectorAll(".fade-in");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealVisibleElements() {
    fadeElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const isVisible = elementTop < window.innerHeight && elementBottom > 0;
      if (isVisible) element.classList.add("show");
    });
  }

  if (prefersReducedMotion) {
    fadeElements.forEach((element) => element.classList.add("show"));
  } else {
    revealVisibleElements();
    window.addEventListener("scroll", revealVisibleElements, { passive: true });
  }

  const form = document.getElementById("orcamentoForm");
  const formStatus = document.getElementById("formStatus");

  if (!form || !formStatus) return;

  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  requiredFields.forEach((field) => {
    field.addEventListener("invalid", function () {
      field.setAttribute("aria-invalid", "true");
    });

    const clearInvalidState = function () {
      if (field.checkValidity()) field.removeAttribute("aria-invalid");
    };

    field.addEventListener("input", clearInvalidState);
    field.addEventListener("change", clearInvalidState);
  });

  const placaInput = document.getElementById("placa");
  if (placaInput) {
    placaInput.addEventListener("input", function (event) {
      const value = event.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 7);

      event.target.value = /^[A-Z]{3}\d{1,4}$/.test(value)
        ? value.slice(0, 3) + "-" + value.slice(3)
        : value;
    });
  }

  const telefoneInput = document.getElementById("telefone");
  if (telefoneInput) {
    telefoneInput.addEventListener("input", function (event) {
      const numeros = event.target.value.replace(/\D/g, "").slice(0, 11);

      if (numeros.length === 0) {
        event.target.value = "";
      } else if (numeros.length <= 2) {
        event.target.value = "(" + numeros;
      } else if (numeros.length <= 10) {
        const parteLocal = numeros.slice(2);
        event.target.value = "(" + numeros.slice(0, 2) + ") " +
          parteLocal.slice(0, 4) +
          (parteLocal.length > 4 ? "-" + parteLocal.slice(4) : "");
      } else {
        event.target.value = "(" + numeros.slice(0, 2) + ") " +
          numeros.slice(2, 7) + "-" + numeros.slice(7, 11);
      }
    });
  }

  function setFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = "form-status" + (type ? " " + type : "");
    const isError = type === "error";
    formStatus.setAttribute("role", isError ? "alert" : "status");
    formStatus.setAttribute("aria-live", isError ? "assertive" : "polite");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitBtn = form.querySelector(".btn-enviar");
    const originalButtonText = submitBtn ? submitBtn.textContent : "";
    form.setAttribute("aria-busy", "true");
    setFormStatus("Enviando sua solicitação...", "is-pending");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    const endpoint = form.getAttribute("action") || "https://formspree.io/f/movlrkyn";
    const payload = new FormData(form);

    if (!payload.has("_subject")) {
      payload.append("_subject", "Solicitação de orçamento - Site");
    }

    fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: { "Accept": "application/json" }
    })
      .then(async (response) => {
        if (response.ok) {
          setFormStatus(
            "Orçamento solicitado com sucesso! Em breve entraremos em contato.",
            "success"
          );
          form.reset();
          requiredFields.forEach((field) => field.removeAttribute("aria-invalid"));
          return;
        }

        let message = "Erro ao enviar o orçamento. Por favor, tente novamente mais tarde.";
        try {
          const data = await response.json();
          if (data.errors && data.errors.length) {
            message = data.errors.map((item) => item.message).join(" ");
          }
        } catch {}

        setFormStatus(message, "error");
      })
      .catch(() => {
        setFormStatus(
          "Falha de rede ao enviar o orçamento. Verifique sua conexão e tente novamente.",
          "error"
        );
      })
      .finally(() => {
        form.setAttribute("aria-busy", "false");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalButtonText;
        }
      });
  });
});
