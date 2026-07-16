// Fundo dinâmico "Velocidade" da apresentação principal
(function setupHeroSpeedCanvas() {
  const canvas = document.getElementById("heroSpeedCanvas");
  if (!canvas || typeof canvas.getContext !== "function") return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let streaks = [];
  let frame = null;
  let isVisible = true;
  let previousFrameTime = 0;

  function createStreak() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      length: 42 + Math.random() * 128,
      speed: 2.4 + Math.random() * 4.2,
      thickness: 0.8 + Math.random() * 2.2,
      opacity: 0.13 + Math.random() * 0.32,
      slope: -0.035 - Math.random() * 0.055
    };
  }

  function resetStreaks() {
    const total = Math.min(42, Math.max(20, Math.round(width / 32)));
    streaks = Array.from({ length: total }, createStreak);
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    resetStreaks();
    drawFrame(0, false);
  }

  function drawFrame(time, shouldMove = true) {
    context.clearRect(0, 0, width, height);

    streaks.forEach(function (streak) {
      if (shouldMove) streak.x += streak.speed;
      if (streak.x - streak.length > width) {
        streak.x = -streak.length;
        streak.y = Math.random() * height;
      }

      const endY = streak.y + streak.length * streak.slope;
      const gradient = context.createLinearGradient(
        streak.x - streak.length,
        streak.y,
        streak.x,
        endY
      );
      gradient.addColorStop(0, "rgba(127, 203, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");

      context.beginPath();
      context.strokeStyle = gradient;
      context.globalAlpha = streak.opacity;
      context.lineWidth = streak.thickness;
      context.lineCap = "round";
      context.moveTo(streak.x - streak.length, streak.y);
      context.lineTo(streak.x, endY);
      context.stroke();
    });

    context.globalAlpha = 1;
    if (time) previousFrameTime = time;
  }

  function animate(time) {
    if (time - previousFrameTime >= 32) {
      drawFrame(time);
    }
    frame = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
  }

  function syncAnimation() {
    stopAnimation();
    if (reducedMotion.matches) {
      drawFrame(0, false);
      return;
    }
    if (!isVisible || document.visibilityState === "hidden") return;
    previousFrameTime = performance.now();
    frame = window.requestAnimationFrame(animate);
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(function (entries) {
      isVisible = entries.some((entry) => entry.isIntersecting);
      syncAnimation();
    }, { threshold: 0.05 });
    visibilityObserver.observe(canvas);
  }

  document.addEventListener("visibilitychange", syncAnimation);
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncAnimation);
  } else {
    reducedMotion.addListener(syncAnimation);
  }
  resizeCanvas();
  syncAnimation();
})();
