(() => {
  const root = document.querySelector('#PROYECTOS .pf');
  if (!root) return;

  // ====== Filtros ======
  const buttons = root.querySelectorAll('.pf-filters [data-filter]');
  const cards   = root.querySelectorAll('.pf-grid .pf-card');
  let activeFilter = 'all';

  function rebuildVisibleList(){
    visibleCards = Array.from(root.querySelectorAll('.pf-grid .pf-card:not(.is-hidden)'));
  }
  function applyFilter(cat){
    activeFilter = cat;
    cards.forEach(card => {
      const isMatch = (cat === 'all') || card.dataset.cat === cat;
      card.classList.toggle('is-hidden', !isMatch);
    });
  }
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      applyFilter(btn.dataset.filter);
      rebuildVisibleList();
    });
  });

  // ====== Lightbox ======
  const dlg   = root.querySelector('.pf-lightbox');
  const imgEl = dlg.querySelector('.pf-lightbox__img');
  const capEl = dlg.querySelector('.pf-lightbox__caption');

  const btnClose = dlg.querySelector('[data-close]');
  const btnPrev  = dlg.querySelector('[data-prev]');
  const btnNext  = dlg.querySelector('[data-next]');

  let visibleCards = [];
  let idx = -1;
  let lastFocused = null;

  function openAt(card){
    rebuildVisibleList();
    idx = visibleCards.indexOf(card);
    if (idx < 0) return;
    const img = card.querySelector('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    capEl.textContent = card.querySelector('.pf-chip')?.textContent || '';
    lastFocused = document.activeElement;
    dlg.showModal();
    btnClose.focus();
  }
  function show(delta){
    if (!visibleCards.length) return;
    idx = (idx + delta + visibleCards.length) % visibleCards.length;
    const card = visibleCards[idx];
    const img = card.querySelector('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    capEl.textContent = card.querySelector('.pf-chip')?.textContent || '';
  }
  function closeLightbox(){
    dlg.close();
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openAt(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(card); }
    });
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev .addEventListener('click', () => show(-1));
  btnNext .addEventListener('click', () => show(1));

  window.addEventListener('keydown', e => {
    if (!dlg.open) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(-1);
    if (e.key === 'ArrowRight') show(1);
  });

  // gestos (swipe)
  let tx = 0;
  dlg.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
  dlg.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) dx > 0 ? show(-1) : show(1);
  });

  // arranque
  rebuildVisibleList();
})();
