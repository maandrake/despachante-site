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
