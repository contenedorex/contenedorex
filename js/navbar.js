// js/navbar.js
(function () {
  const nav = document.getElementById('site-nav');
  const header = document.querySelector('header');
  if (!nav || !header) return;

  const links  = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const toggle = document.getElementById('menu-toggle');        // checkbox
  const burger = document.querySelector('label.hamburger');     // label visible

  /* ========= SCROLL-SPY ========= */
  const idFromHash = (h) => (h && h.startsWith('#') ? h.slice(1) : null);
  const idToLink = new Map();
  links.forEach(a => {
    const id = idFromHash(a.getAttribute('href') || '');
    const el = id && document.getElementById(id);
    if (id && el) idToLink.set(id, a);
  });
  const targets = Array.from(idToLink.keys()).map(id => document.getElementById(id)).filter(Boolean);
  const headerH = () => header.getBoundingClientRect().height;

  function setActive(id){
    links.forEach(a => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
    const a = idToLink.get(id);
    if (a){ a.classList.add('is-active'); a.setAttribute('aria-current','page'); }
  }

  const PIVOT_VP = 0.33;
  const BOTTOM_SNAP_PX = 160;

  let tickingSpy = false;
  function updateActiveByScroll(){
    if (tickingSpy) return;
    tickingSpy = true;
    requestAnimationFrame(() => {
      const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const y = window.scrollY || 0;
      const winH = window.innerHeight;

      // Snap al final: CONTACTO
      const bottomGap = docH - (y + winH);
      const contacto = document.getElementById('CONTACTO');
      if (contacto && bottomGap <= BOTTOM_SNAP_PX){
        setActive('CONTACTO'); tickingSpy = false; return;
      }

      const pivotY = headerH() + winH * PIVOT_VP;

      let bestId = null, bestDelta = Infinity;
      for (const el of targets){
        const r = el.getBoundingClientRect();
        const delta = (r.top <= pivotY && r.bottom >= pivotY)
          ? 0 : (r.top > pivotY ? r.top - pivotY : pivotY - r.bottom);
        if (delta < bestDelta){ bestDelta = delta; bestId = el.id; }
      }
      if (bestId) setActive(bestId);
      tickingSpy = false;
    });
  }

  /* ========= AUTO-HIDE SOLO EN MÓVIL ========= */
  const mqMobile = window.matchMedia('(max-width: 599px)');
  let lastY = window.scrollY || 0;
  let tickingHide = false;

  function updateHeaderHide(){
    if (!mqMobile.matches){              // escritorio: siempre visible
      header.classList.remove('header--hidden');
      return;
    }
    if (toggle && toggle.checked){       // menú abierto: visible
      header.classList.remove('header--hidden');
      return;
    }

    if (tickingHide) return;
    tickingHide = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const dy = y - lastY;
      lastY = y;

      if (y < headerH() + 4){
        header.classList.remove('header--hidden');
      } else if (dy > 0){
        header.classList.add('header--hidden');   // bajando -> ocultar
      } else if (dy < 0){
        header.classList.remove('header--hidden'); // subiendo -> mostrar
      }
      tickingHide = false;
    });
  }

  /* ========= AUTOCIERRE DEL MENÚ AL SCROLL (mejorado) ========= */
  // Armado con retardo + umbral para evitar cierres “instantáneos”.
  const CLOSE_DELTA = 12;       // píxeles mínimos de desplazamiento reales
  const ARMED_DELAY_MS = 180;   // retardo tras abrir antes de permitir autocierre
  let openStartY = window.scrollY || 0;
  let armedClose = false;

  function syncBurgerAria(){ if (burger && toggle) burger.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false'); }

  function armAutoCloseSoon(){
    armedClose = false;
    // pequeño retardo para ignorar micro-eventos tras abrir
    setTimeout(() => { armedClose = true; }, ARMED_DELAY_MS);
  }

  function closeMenu(){
    if (!toggle) return;
    if (toggle.checked){
      toggle.checked = false;
      syncBurgerAria();
      updateHeaderHide(); // reactivar auto-hide normal
    }
  }

  if (toggle){
    toggle.addEventListener('change', () => {
      syncBurgerAria();
      if (toggle.checked){
        openStartY = window.scrollY || 0;
        armAutoCloseSoon();
      }
      updateHeaderHide();
    });
    syncBurgerAria();
  }

  // Cierra en scroll *intencional* (cuando hay movimiento real y ya está armado)
  function maybeCloseOnScroll(){
    if (toggle && toggle.checked && armedClose){
      const y = window.scrollY || 0;
      if (Math.abs(y - openStartY) >= CLOSE_DELTA){
        closeMenu();
      }
    }
  }

  // También cerramos si hay intento de desplazamiento táctil o con rueda tras el armado
  function maybeCloseOnIntent(){
    if (toggle && toggle.checked && armedClose){
      closeMenu();
    }
  }

  /* ========= EVENTOS GLOBALES ========= */
  const onScroll = () => { maybeCloseOnScroll(); updateActiveByScroll(); updateHeaderHide(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { updateActiveByScroll(); updateHeaderHide(); });

  // Intentos de desplazamiento (sin esperar a que el scroll cambie Y)
  window.addEventListener('wheel',  maybeCloseOnIntent, { passive: true });
  window.addEventListener('touchmove', maybeCloseOnIntent, { passive: true });

  // Al clicar un enlace del menú, cerramos también
  links.forEach(a => a.addEventListener('click', () => closeMenu()));

  // Estado inicial
  document.addEventListener('DOMContentLoaded', () => { updateActiveByScroll(); updateHeaderHide(); });
  updateActiveByScroll();
  updateHeaderHide();
})();
