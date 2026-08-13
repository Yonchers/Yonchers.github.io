(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = $('[data-project-progress]');
  const nav = $('[data-project-nav]');
  const navToggle = $('[data-project-nav-toggle]');
  const motionButton = $('[data-project-motion]');
  const lightbox = $('#projectLightbox');
  const lightboxImage = $('[data-lightbox-image]', lightbox || doc);
  const lightboxCaption = $('[data-lightbox-caption]', lightbox || doc);
  const lightboxClose = $('[data-lightbox-close]', lightbox || doc);
  let motionPaused = reducedMotion;

  function updateScrollProgress() {
    if (!progress) return;
    const max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
  }

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(Boolean(open)));
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  function setMotionState(paused) {
    motionPaused = paused;
    doc.body.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    }
  }

  setMotionState(motionPaused);
  motionButton?.addEventListener('click', () => setMotionState(!motionPaused));

  const reveals = $$('.project-reveal');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((element) => observer.observe(element));
  }

  function openLightbox(button) {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    const image = $('img', button);
    if (!image) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = button.dataset.caption || image.alt;
    try {
      lightbox.showModal();
    } catch (_error) {
      lightbox.setAttribute('open', '');
    }
    root.style.overflow = 'hidden';
  }

  $$('[data-lightbox]').forEach((button) => button.addEventListener('click', () => openLightbox(button)));

  function closeLightbox() {
    if (!lightbox) return;
    if (lightbox.open) lightbox.close();
    else lightbox.removeAttribute('open');
    root.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener('close', () => { root.style.overflow = ''; });

  $('#projectYear')?.replaceChildren(String(new Date().getFullYear()));

  // Lightweight starfield that follows the page accent color without loading
  // an external animation library.
  const canvas = $('#projectStarfield');
  const context = canvas?.getContext('2d');
  let stars = [];
  let raf = 0;

  function accentRgb() {
    const value = getComputedStyle(doc.body).getPropertyValue('--project-accent-rgb').trim();
    const parts = value.split(',').map((part) => Number(part.trim()));
    return parts.length === 3 && parts.every(Number.isFinite) ? parts : [242, 122, 26];
  }

  function resizeCanvas() {
    if (!canvas || !context) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(45, Math.min(150, Math.round(window.innerWidth * window.innerHeight / 13000)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.35 + Math.random() * 1.25,
      a: 0.12 + Math.random() * 0.55,
      s: 0.015 + Math.random() * 0.055,
      p: Math.random() * Math.PI * 2,
    }));
  }

  function drawStarfield(time = 0) {
    if (!canvas || !context) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const [red, green, blue] = accentRgb();
    stars.forEach((star) => {
      const pulse = motionPaused ? 1 : 0.75 + Math.sin(time * star.s * 0.01 + star.p) * 0.25;
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${star.a * pulse})`;
      context.fill();
    });
    raf = window.requestAnimationFrame(drawStarfield);
  }

  if (canvas && context) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    raf = window.requestAnimationFrame(drawStarfield);
  }

  window.addEventListener('pagehide', () => window.cancelAnimationFrame(raf));
})();
