window.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.querySelector(".main-menu");
  const menuLinks = document.querySelectorAll(".main-menu a");

  function setMenuState(isOpen, returnFocus = false) {
    if (!menuToggle || !mainMenu) return;
    menuToggle.classList.toggle("active", isOpen);
    mainMenu.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    if (!isOpen && returnFocus) menuToggle.focus();
  }

  if (menuToggle && mainMenu) {
    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setMenuState(!mainMenu.classList.contains("active"));
    });
    menuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));
    document.addEventListener("click", function (event) {
      if (mainMenu.classList.contains("active") &&
          !mainMenu.contains(event.target) &&
          !menuToggle.contains(event.target)) {
        setMenuState(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mainMenu.classList.contains("active")) {
        setMenuState(false, true);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768 && mainMenu.classList.contains("active")) {
        setMenuState(false);
      }
    });
  }

  const textos = document.querySelectorAll(".menu-texto");
  textos.forEach((elemento) => elemento.classList.add("menu-texto-visivel"));
  setTimeout(() => {
    textos.forEach((elemento) => elemento.classList.remove("menu-texto-visivel"));
  }, 5000);
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

// Funções de animação fade-in
document.addEventListener("DOMContentLoaded", function () {
  const fadeElements = document.querySelectorAll(".fade-in");

  function handleScroll() {
    fadeElements.forEach(element => {
      // Verificar se o elemento está visível na viewport
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const isVisible = elementTop < window.innerHeight && elementBottom > 0;

      if (isVisible) {
        element.classList.add("show");
      }
    });
  }

  // Verifica os elementos ao carregar a página
  handleScroll();

  // Adiciona o evento de scroll para fade-in
  window.addEventListener("scroll", handleScroll);

  // Configuração do formulário de orçamento
  const form = document.getElementById("orcamentoForm");
  const formStatus = document.getElementById("formStatus");
  
  if (form) {
    // Formatação das placas no padrão antigo e Mercosul
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

    // Formatação de telefone fixo e celular
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

    form.addEventListener("submit", function(e) {
      e.preventDefault();

      formStatus.textContent = "Enviando...";
      formStatus.className = "form-status";
      formStatus.style.display = "block";

      const submitBtn = form.querySelector(".btn-enviar");
      if (submitBtn) submitBtn.disabled = true;

      // Use o endpoint definido no atributo action do formulário
      const endpoint = form.getAttribute("action") || "https://formspree.io/f/movlrkyn";

      const payload = new FormData(form);
      // Opcional: definir/garantir assunto via JS
      if (!payload.has("_subject")) {
        payload.append("_subject", "Solicitação de orçamento - Site");
      }

      fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: { "Accept": "application/json" }
      })
      .then(async (res) => {
        if (res.ok) {
          formStatus.textContent = "Orçamento solicitado com sucesso! Em breve entraremos em contato.";
          formStatus.className = "form-status success";
          form.reset();
        } else {
          let msg = "Erro ao enviar o orçamento. Por favor, tente novamente mais tarde.";
          try {
            const data = await res.json();
            if (data.errors && data.errors.length) {
              msg = data.errors.map(e => e.message).join(" ");
            }
          } catch {}
          formStatus.textContent = msg;
          formStatus.className = "form-status error";
        }
      })
      .catch(() => {
        formStatus.textContent = "Falha de rede ao enviar o orçamento. Verifique sua conexão e tente novamente.";
        formStatus.className = "form-status error";
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }
});
