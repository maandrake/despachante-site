window.addEventListener("DOMContentLoaded", function () {
  // Seleciona todos os textos do menu
  const textos = document.querySelectorAll(".menu-texto");
  // Adiciona a classe para mostrar ao carregar
  textos.forEach((el) => el.classList.add("menu-texto-visivel"));
  // Remove a classe após 5 segundos
  setTimeout(() => {
    textos.forEach((el) => el.classList.remove("menu-texto-visivel"));
  }, 5000);

  // Animação sequencial
  const elements = [
    document.querySelector('.box1.fade-in'),
    document.querySelector('.box2.fade-in'),
    document.querySelector('.box3.fade-in'),
    document.querySelector('.box4.fade-in'),
    document.querySelector('.box5.fade-in'),
    document.querySelector('.box6.fade-in'),
    document.querySelector('.box7.fade-in'),
    ...document.querySelectorAll('.quadro-container.fade-in')
  ];
  elements.forEach((el, i) => {
    if (el) {
      setTimeout(() => {
        el.classList.add('show');
      }, 200 + i * 250);
    }
  });
});

let bannerApagado = false;

window.addEventListener('scroll', function () {
  const items = getScrollItemsDentroDe('scroll');
  const banner = document.querySelector('.banner');
  // Marca cada item com 'efeito-scroll' e ajusta a escala conforme a rolagem
  items.forEach(item => {
    // 'efeito-scroll' pode ter estilos opcionais definidos no CSS
    item.classList.add('efeito-scroll');
    if (window.scrollY > 0) {
      item.classList.add('escalado');
    } else {
      item.classList.remove('escalado');
    }
  });

  // Reduz o banner quando houver rolagem
  if (banner) {
    if (window.scrollY > 0 && !bannerApagado) {
      banner.classList.add('apagado');
      bannerApagado = true;
    } else if (window.scrollY === 0 && bannerApagado) {
      banner.classList.remove('apagado');
      bannerApagado = false;
    }
  }
});

function getScrollItemsDentroDe(classePai) {
  return document.querySelectorAll(`.${classePai} .scroll-img, .${classePai} .scroll-menu`);
}

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

  // Adiciona o evento de scroll
  window.addEventListener("scroll", handleScroll);

  // Configurações para efeito de scroll no header
  window.addEventListener("scroll", function () {
    const banner = document.querySelector(".banner");
    const bannerImg = document.querySelector(".scroll-img");
    const bannerMenu = document.querySelector(".scroll-menu");

    if (window.scrollY > 100) {
      banner.classList.add("apagado");
      bannerImg.classList.add("escalado");
      bannerMenu.classList.add("escalado");
    } else {
      banner.classList.remove("apagado");
      bannerImg.classList.remove("escalado");
      bannerMenu.classList.remove("escalado");
    }
  });

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
