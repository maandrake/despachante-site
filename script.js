window.addEventListener("DOMContentLoaded", function () {
  // Controle do menu mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.querySelector('.main-menu');
  const menuLinks = document.querySelectorAll('.main-menu a');
  
  if (menuToggle && mainMenu) {
    // Toggle do menu ao clicar no botão
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isActive = menuToggle.classList.toggle('active');
      mainMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', isActive);
    });

    // Fechar menu ao clicar em um link
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Fechar menu ao clicar no overlay
    document.addEventListener('click', function(e) {
      if (mainMenu.classList.contains('active') && 
          !mainMenu.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Fechar menu ao pressionar ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mainMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Fechar menu ao redimensionar janela e limpar classes de escala no mobile
    window.addEventListener('resize', function() {
      const isMobile = window.innerWidth <= 768;
      
      // Fechar menu ao voltar para desktop
      if (window.innerWidth > 768 && mainMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      
      // Remover classes de escala no mobile para evitar tremor
      if (isMobile) {
        const bannerImg = document.querySelector('.scroll-img');
        const bannerMenu = document.querySelector('.scroll-menu');
        if (bannerImg) bannerImg.classList.remove('escalado');
        if (bannerMenu) bannerMenu.classList.remove('escalado');
      }
    });
  }

  // Seleciona todos os textos do menu
  const textos = document.querySelectorAll(".menu-texto");
  // Adiciona a classe para mostrar ao carregar
  textos.forEach((el) => el.classList.add("menu-texto-visivel"));
  // Remove a classe após 5 segundos
  setTimeout(() => {
    textos.forEach((el) => el.classList.remove("menu-texto-visivel"));
  }, 5000);
});

// Variável para controlar o estado do banner e otimizar performance
let bannerApagado = false;
let ticking = false;
const shrinkEnterThreshold = 80;
const shrinkExitThreshold = 20;

function updateBannerState(shouldShrink, isMobile, banner, bannerImg, bannerMenu) {
  banner.classList.toggle('apagado', shouldShrink);

  if (shouldShrink && !isMobile) {
    bannerImg.classList.add('escalado');
    bannerMenu.classList.add('escalado');
  } else {
    bannerImg.classList.remove('escalado');
    bannerMenu.classList.remove('escalado');
  }

  bannerApagado = shouldShrink;
}

// Função unified para todos os efeitos de scroll
function handleScrollEffects() {
  const scrollY = window.scrollY;
  const isMobile = window.innerWidth <= 768; // Detectar se é mobile
  
  // Seleciona elementos do banner
  const banner = document.querySelector('.banner');
  const bannerImg = document.querySelector('.scroll-img');
  const bannerMenu = document.querySelector('.scroll-menu');
  
  if (!banner || !bannerImg || !bannerMenu) {
    ticking = false;
    return;
  }
  
  const shouldShrink = bannerApagado
    ? scrollY > shrinkExitThreshold
    : scrollY > shrinkEnterThreshold;

  if (shouldShrink !== bannerApagado) {
    updateBannerState(shouldShrink, isMobile, banner, bannerImg, bannerMenu);
  }
  
  ticking = false;
}

// Listener otimizado com requestAnimationFrame
window.addEventListener('scroll', function () {
  if (!ticking) {
    window.requestAnimationFrame(handleScrollEffects);
    ticking = true;
  }
});

window.addEventListener('resize', handleScrollEffects);
window.addEventListener('load', handleScrollEffects);

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
    // Formatação da placa
    const placaInput = document.getElementById("placa");
    if (placaInput) {
      placaInput.addEventListener("input", function(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (value.length > 3) {
          value = value.slice(0, 3) + '-' + value.slice(3, 7);
        }
        
        e.target.value = value;
      });
    }
    
    // Formatação do telefone
    const telefoneInput = document.getElementById("telefone");
    if (telefoneInput) {
      telefoneInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 2) {
          value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
        }
        if (value.length > 10) {
          value = value.slice(0, 10) + '-' + value.slice(10, 15);
        }
        
        e.target.value = value;
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
