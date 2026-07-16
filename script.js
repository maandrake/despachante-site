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

(function setupGoogleReviews() {
  const section = document.getElementById("avaliacoes");
  if (!section) return;

  const apiKey = "AIzaSyC_7au5yuzWE38JI8VSzm2q2X7Q1TCOemI";
  const placeId = "ChIJ8zI32D0f4JQRiuik9OeR3O0";
  const profileUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const summary = document.getElementById("googleReviewsSummary");
  const ratingElement = document.getElementById("googleReviewsRating");
  const summaryStars = document.getElementById("googleReviewsSummaryStars");
  const countElement = document.getElementById("googleReviewsCount");
  const status = document.getElementById("googleReviewsStatus");
  const grid = document.getElementById("googleReviewsGrid");
  const navigation = document.getElementById("googleReviewsNavigation");
  const previousButton = document.getElementById("googleReviewsPrevious");
  const nextButton = document.getElementById("googleReviewsNext");
  const pagination = document.getElementById("googleReviewsPagination");

  let reviews = [];
  let currentPage = 0;
  let pageSize = getPageSize();
  let loadingStarted = false;
  let resizeTimer;

  function getPageSize() {
    if (window.matchMedia("(max-width: 768px)").matches) return 1;
    if (window.matchMedia("(max-width: 980px)").matches) return 2;
    return 3;
  }

  function setFallback() {
    status.hidden = false;
    status.textContent = "Não foi possível carregar as avaliações agora. Você ainda pode consultá-las diretamente no Google Maps.";
    grid.hidden = true;
    navigation.hidden = true;
  }

  function createExternalLink(url, className, label) {
    const link = document.createElement("a");
    link.href = url;
    link.className = className;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }

  function createAvatarFallback(authorName) {
    const fallback = document.createElement("span");
    fallback.className = "google-review-avatar-fallback";
    fallback.setAttribute("aria-hidden", "true");
    fallback.textContent = (authorName || "Cliente")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
    return fallback;
  }

  function createReviewCard(review) {
    const article = document.createElement("article");
    article.className = "google-review-card";

    const author = review.authorAttribution || {};
    const authorName = author.displayName || "Cliente Google";
    const authorArea = document.createElement("div");
    authorArea.className = "google-review-author";

    let avatar = createAvatarFallback(authorName);
    if (author.photoURI) {
      const image = document.createElement("img");
      image.className = "google-review-avatar";
      image.src = author.photoURI;
      image.alt = `Foto de ${authorName}`;
      image.width = 48;
      image.height = 48;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () {
        image.replaceWith(createAvatarFallback(authorName));
      }, { once: true });
      avatar = image;
    }
    authorArea.appendChild(avatar);

    const authorDetails = document.createElement("div");
    authorDetails.className = "google-review-author-details";
    if (author.uri) {
      authorDetails.appendChild(createExternalLink(author.uri, "google-review-author-name", authorName));
    } else {
      const name = document.createElement("span");
      name.className = "google-review-author-name";
      name.textContent = authorName;
      authorDetails.appendChild(name);
    }

    if (review.relativePublishTimeDescription) {
      const date = document.createElement("span");
      date.className = "google-review-date";
      date.textContent = review.relativePublishTimeDescription;
      authorDetails.appendChild(date);
    }
    authorArea.appendChild(authorDetails);
    article.appendChild(authorArea);

    const reviewRating = Number(review.rating) || 0;
    const stars = document.createElement("span");
    stars.className = "google-review-stars";
    stars.textContent = "★★★★★";
    stars.style.setProperty("--rating", String(reviewRating));
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `Avaliação de ${reviewRating.toLocaleString("pt-BR")} de 5 estrelas`);
    article.appendChild(stars);

    const reviewText = document.createElement("p");
    reviewText.className = "google-review-text";
    reviewText.textContent = typeof review.text === "string" && review.text.trim()
      ? review.text.trim()
      : "Este cliente avaliou o atendimento no Google sem deixar um comentário.";
    article.appendChild(reviewText);

    if (review.googleMapsURI) {
      const source = createExternalLink(review.googleMapsURI, "google-review-source", "Ver avaliação no Google Maps");
      source.setAttribute("aria-label", `Ver a avaliação de ${authorName} no Google Maps (abre em nova guia)`);
      article.appendChild(source);
    }

    return article;
  }

  function renderCurrentPage() {
    const pageCount = Math.ceil(reviews.length / pageSize);
    currentPage = Math.min(currentPage, Math.max(pageCount - 1, 0));
    const firstReview = currentPage * pageSize;

    grid.replaceChildren(...reviews.slice(firstReview, firstReview + pageSize).map(createReviewCard));
    grid.hidden = reviews.length === 0;

    navigation.hidden = pageCount <= 1;
    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= pageCount - 1;
    pagination.textContent = pageCount > 0 ? `Página ${currentPage + 1} de ${pageCount}` : "";
  }

  previousButton.addEventListener("click", function () {
    if (currentPage === 0) return;
    currentPage -= 1;
    renderCurrentPage();
    grid.focus({ preventScroll: true });
  });

  nextButton.addEventListener("click", function () {
    const pageCount = Math.ceil(reviews.length / pageSize);
    if (currentPage >= pageCount - 1) return;
    currentPage += 1;
    renderCurrentPage();
    grid.focus({ preventScroll: true });
  });

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      const nextPageSize = getPageSize();
      if (nextPageSize === pageSize) return;
      pageSize = nextPageSize;
      currentPage = 0;
      renderCurrentPage();
    }, 150);
  });

  window.initGoogleReviews = async function () {
    try {
      const { Place } = await google.maps.importLibrary("places");
      const place = new Place({ id: placeId, requestedLanguage: "pt-BR" });
      await place.fetchFields({
        fields: ["displayName", "rating", "userRatingCount", "reviews", "googleMapsURI"]
      });

      const placeRating = Number(place.rating) || 0;
      const reviewCount = Number(place.userRatingCount) || 0;
      reviews = Array.isArray(place.reviews) ? place.reviews : [];

      if (placeRating > 0) {
        ratingElement.textContent = placeRating.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
        summaryStars.style.setProperty("--rating", String(placeRating));
        countElement.textContent = `${reviewCount.toLocaleString("pt-BR")} ${reviewCount === 1 ? "avaliação" : "avaliações"}`;
        summary.setAttribute("aria-label", `Nota ${placeRating.toLocaleString("pt-BR")} de 5, com ${reviewCount.toLocaleString("pt-BR")} avaliações no Google Maps`);
        summary.hidden = false;
      }

      const resolvedProfileUrl = place.googleMapsURI || profileUrl;
      document.querySelectorAll(".google-maps-attribution, .google-reviews-actions a:first-child")
        .forEach((link) => { link.href = resolvedProfileUrl; });

      if (reviews.length === 0) {
        setFallback();
        return;
      }

      status.hidden = true;
      renderCurrentPage();
    } catch {
      setFallback();
    }
  };

  window.gm_authFailure = setFallback;

  function loadGoogleMapsApi() {
    if (loadingStarted) return;
    loadingStarted = true;
    status.textContent = "Carregando avaliações do Google Maps...";

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places&v=weekly&callback=initGoogleReviews`;
    script.async = true;
    script.defer = true;
    script.onerror = setFallback;
    document.head.appendChild(script);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadGoogleMapsApi();
    }, { rootMargin: "400px 0px" });
    observer.observe(section);
  } else {
    loadGoogleMapsApi();
  }
})();

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

// Formulário
document.addEventListener("DOMContentLoaded", function () {
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
