// Fundo dinâmico de partículas da apresentação principal
(function setupHeroParticleCanvas() {
  const canvas = document.getElementById("heroSpeedCanvas");
  if (!canvas || typeof canvas.getContext !== "function") return;

  const hero = canvas.closest(".hero");
  if (!hero) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layers = [
    { count: 272, minRadius: 1.25, maxRadius: 3.5, alpha: 0.55, speed: 2, color: [0, 20, 48] },
    { count: 112, minRadius: 3.88, maxRadius: 10.13, alpha: 0.43, speed: 1.2, color: [0, 30, 62] },
    { count: 16, minRadius: 14, maxRadius: 34.38, alpha: 0.3, speed: 0.64, color: [2, 42, 78] }
  ];

  let width = 0;
  let height = 0;
  let particles = [];
  let frame = null;
  let isVisible = true;
  let previousFrameTime = 0;
  const pointer = { x: 0, y: 0, active: false };

  function createParticle(layer, layerIndex) {
    return {
      layer: layerIndex,
      x: Math.random() * width,
      y: Math.random() * height,
      radius: layer.minRadius + Math.random() * (layer.maxRadius - layer.minRadius),
      alpha: layer.alpha * (0.35 + Math.random() * 0.65),
      phase: Math.random() * Math.PI * 2,
      driftX: (-0.5 + Math.random()) * layer.speed,
      driftY: (-0.5 + Math.random()) * layer.speed
    };
  }

  function resetParticles() {
    particles = [];
    layers.forEach(function (layer, layerIndex) {
      for (let index = 0; index < layer.count; index += 1) {
        particles.push(createParticle(layer, layerIndex));
      }
    });
  }

  function resizeCanvas() {
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    resetParticles();
    render(performance.now(), false);
  }

  function drawGlow(x, y, radiusX, radiusY, color, alpha) {
    context.save();
    context.translate(x, y);
    context.scale(1, radiusY / radiusX);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radiusX);
    glow.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
    glow.addColorStop(0.42, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.42})`);
    glow.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, radiusX, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawLights(time) {
    const t = time * 0.00048;
    drawGlow(
      width * 0.58 + Math.sin(t) * width * 0.08,
      height * 0.47 + Math.cos(t * 1.3) * 26,
      Math.min(width * 0.34, 430),
      100 + Math.sin(t * 1.7) * 22,
      [106, 198, 232],
      0.25
    );
    drawGlow(
      width * 0.68 + Math.cos(t * 0.8) * width * 0.09,
      height * 0.55 + Math.sin(t) * 42,
      Math.min(width * 0.27, 360),
      180,
      [84, 213, 232],
      0.15
    );
    drawGlow(
      width * 0.43 + Math.sin(t * 1.6) * width * 0.12,
      height * 0.4 + Math.cos(t) * 55,
      145,
      95,
      [42, 232, 216],
      0.12
    );

    if (pointer.active) {
      drawGlow(pointer.x, pointer.y, 190, 135, [76, 224, 244], 0.22);
    }
  }

  function drawParticles(time, shouldMove) {
    context.save();
    context.globalCompositeOperation = "source-over";
    particles.forEach(function (particle) {
      const layer = layers[particle.layer];
      if (shouldMove) {
        particle.x += particle.driftX;
        particle.y += particle.driftY;

        if (pointer.active) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          const influenceRadius = 175;
          if (distance > 0 && distance < influenceRadius) {
            const force = (1 - distance / influenceRadius) * (particle.layer === 0 ? 2.2 : 1.35);
            particle.x += (deltaX / distance) * force;
            particle.y += (deltaY / distance) * force;
          }
        }

        if (particle.x < -40) particle.x = width + 40;
        if (particle.x > width + 40) particle.x = -40;
        if (particle.y < -40) particle.y = height + 40;
        if (particle.y > height + 40) particle.y = -40;
      }

      const pulse = 0.62 + Math.sin(time * 0.0012 + particle.phase) * 0.38;
      context.globalAlpha = particle.alpha * pulse;
      context.fillStyle = `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      if (particle.layer === 0) {
        context.lineWidth = 1;
        context.strokeStyle = context.fillStyle;
        context.stroke();
      } else {
        context.fill();
      }
    });
    context.restore();
  }

  function render(time, shouldMove = true) {
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = "lighter";
    drawLights(time);
    context.restore();
    drawParticles(time, shouldMove);
  }

  function animate(time) {
    if (time - previousFrameTime >= 42) {
      render(time);
      previousFrameTime = time;
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
      render(performance.now(), false);
      return;
    }
    if (!isVisible || document.visibilityState === "hidden") return;
    previousFrameTime = performance.now();
    frame = window.requestAnimationFrame(animate);
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(hero);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(function (entries) {
      isVisible = entries.some((entry) => entry.isIntersecting);
      syncAnimation();
    }, { threshold: 0.05 });
    visibilityObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", syncAnimation);
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncAnimation);
  } else {
    reducedMotion.addListener(syncAnimation);
  }

  function updatePointer(clientX, clientY) {
    const bounds = hero.getBoundingClientRect();
    pointer.x = clientX - bounds.left;
    pointer.y = clientY - bounds.top;
    pointer.active = true;
    if (reducedMotion.matches) render(performance.now(), false);
  }

  hero.addEventListener("pointermove", function (event) {
    updatePointer(event.clientX, event.clientY);
  });

  hero.addEventListener("pointerdown", function (event) {
    updatePointer(event.clientX, event.clientY);
  });

  hero.addEventListener("pointerleave", function (event) {
    if (event.pointerType !== "touch") pointer.active = false;
  });

  hero.addEventListener("pointerup", function (event) {
    if (event.pointerType === "touch") pointer.active = false;
  });

  hero.addEventListener("pointercancel", function () {
    pointer.active = false;
  });

  hero.addEventListener("touchstart", function (event) {
    const touch = event.touches[0];
    if (touch) updatePointer(touch.clientX, touch.clientY);
  }, { passive: true });

  hero.addEventListener("touchmove", function (event) {
    const touch = event.touches[0];
    if (touch) updatePointer(touch.clientX, touch.clientY);
  }, { passive: true });

  hero.addEventListener("touchend", function () {
    pointer.active = false;
  }, { passive: true });

  hero.addEventListener("touchcancel", function () {
    pointer.active = false;
  }, { passive: true });

  resizeCanvas();
  syncAnimation();
})();
