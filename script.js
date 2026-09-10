(function() {
  'use strict';

  // ===== PRICING CALCULATOR =====
  class PricingCalculator {
    constructor() { this.tiers = [{ id: '1-3', price: 360, screens: '1 to 3' }, { id: '4-6', price: 720, screens: '4 to 6' }, { id: '7-9', price: 1060, screens: '7 to 9' }, { id: '10-12', price: 1320, screens: '10 to 12' }]; this.selectedTier = null; this.discountPercent = 50; this.init(); }
    init() { this.bindEvents(); this.updateUI(); }
    bindEvents() {
      document.querySelectorAll('.tier-card').forEach(card => { card.addEventListener('click', () => this.selectTier(card.dataset.tier)); card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectTier(card.dataset.tier); } }); });
      const purchaseBtn = document.getElementById('purchase-btn'); if (purchaseBtn) purchaseBtn.addEventListener('click', () => this.handlePurchase());
    }
    selectTier(tierId) { this.selectedTier = tierId; this.updateUI(); this.startLoadingSequence(tierId); }
    startLoadingSequence(tierId) {
      const tier = this.tiers.find(t => t.id === tierId); if (!tier) return;
      const indicatorContainer = document.getElementById('indicator-container'); const loadingText = document.getElementById('loading-text');
      if (!indicatorContainer || !loadingText) return;
      // clear previous timers
      if (this._indicatorTimers) this._indicatorTimers.forEach(clearTimeout);
      this._indicatorTimers = [];
      // reset tick/animation state via CSS class — no inline styles needed
      indicatorContainer.style.display = 'block';
      // force reflow for fade-in
      void indicatorContainer.offsetHeight;
      indicatorContainer.classList.remove('show-tick');
      indicatorContainer.classList.add('visible');

      const texts = [
        { full: 'Choose the number of screens you need: ', highlight: `${tier.screens} screens for $${tier.price}` },
        { full: 'adding an exclusive ', highlight: '50% discount' },
        { full: 'Total amount: ', highlight: `$${(tier.price * (1 - this.discountPercent / 100)).toLocaleString()}` }
      ];

      const show = (index) => {
        const text = texts[index];
        // reset slide-up animation
        loadingText.style.animation = 'none';
        void loadingText.offsetHeight;
        loadingText.innerHTML = `${text.full}<span class="text-highlight">${text.highlight}</span>`;
        loadingText.style.animation = 'indicator-slide-up 0.45s ease forwards';
        // last text: fade in tick, keep text visible
        if (index === texts.length - 1) {
          const t = setTimeout(() => {
            indicatorContainer.classList.add('show-tick');
          }, 300);
          this._indicatorTimers.push(t);
        } else {
          const t = setTimeout(() => show(index + 1), 800 + 300);
          this._indicatorTimers.push(t);
        }
      };
      // 0.3s stagger is between texts; first shows immediately with container fade
      show(0);
    }
    handlePurchase() {
      const tier = this.tiers.find(t => t.id === this.selectedTier); if (!tier) return;
      const checkoutUrls = {
        '1-3': 'https://whop.com/checkout/plan_Ftpq1F78AqwKs',
        '4-6': 'https://whop.com/checkout/plan_z5CVodvnBanRs',
        '7-9': 'https://whop.com/checkout/plan_NjSLFoeF32P6I',
        '10-12': 'https://whop.com/checkout/plan_kOvAqdSqypaCO'
      };
      const url = checkoutUrls[this.selectedTier];
      if (url) window.location.href = url;
    }
    updateUI() {
      document.querySelectorAll('.tier-card').forEach(card => { const isSelected = card.dataset.tier === this.selectedTier; card.classList.toggle('selected', isSelected); card.setAttribute('aria-selected', isSelected); });
      const purchaseBtn = document.getElementById('purchase-btn'); if (purchaseBtn) { purchaseBtn.disabled = !this.selectedTier; }
    }
  }

  // ===== WORK MODAL =====
  const workModal = document.getElementById('work-modal');
  let workModalCloseTimer = null;
  function openWorkModal() {
    if (!workModal) return;
    if (workModalCloseTimer) { clearTimeout(workModalCloseTimer); workModalCloseTimer = null; }
    workModal.classList.remove('is-closing');
    workModal.classList.add('is-open');
    workModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeWorkModal() {
    if (!workModal) return;
    if (!workModal.classList.contains('is-open')) return;
    workModal.classList.add('is-closing');
    workModal.classList.remove('is-open');
    workModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    workModalCloseTimer = setTimeout(() => {
      workModal.classList.remove('is-closing');
      workModalCloseTimer = null;
    }, 320);
  }
  document.querySelectorAll('[data-open-work-modal]').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openWorkModal(); }));
  document.querySelectorAll('[data-close-work-modal]').forEach(el => el.addEventListener('click', closeWorkModal));
  if (workModal) workModal.addEventListener('click', (e) => { if (e.target === workModal) closeWorkModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && workModal && workModal.classList.contains('is-open')) closeWorkModal(); });

  // ===== STICKY SHRINKING LOGO — PER-SCROLL SLOW (smooth, no jumps) =====
  const heroEl = document.querySelector('.hero');
  const heroLogo = document.querySelector('.hero-logo');
  let ticking = false;
  function updateHeroShrink() {
    if (!heroEl || !heroLogo) { ticking = false; return; }
    const y = window.scrollY || window.pageYOffset || 0;
    // Very slow per-scroll: 0 -> 520px maps 400px -> 90px linearly
    const max = 520;
    const raw = Math.min(Math.max(y / max, 0), 1);
    // eased raw for smoother feel (easeOutCubic: 1 - pow(1 - t, 3)) — keeps start gentle, no abrupt jump at 0.06
    const eased = 1 - Math.pow(1 - raw, 3);
    const w = 400 - (310 * eased);
    heroLogo.style.width = w.toFixed(2) + 'px';
    // Top stays 28->10 smooth, bottom is now 120px per request (kept fixed)
    const padTop = 28 - (18 * eased);
    heroEl.style.paddingTop = padTop.toFixed(2) + 'px';
    heroEl.style.paddingBottom = '120px';
    // keep scrolled class for hooks but padding no longer depends on it
    heroEl.classList.toggle('scrolled', raw > 0.06);
    ticking = false;
  }
  // sticky avatar + actions inside hero
  const introActions = document.querySelector('.intro-actions');
  function updateHeroSticky() {
    if (!heroEl || !introActions) return;
    const rect = introActions.getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();
    const past = rect.bottom < heroRect.bottom;
    heroEl.classList.toggle('hero--show-sticky', past);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { updateHeroShrink(); updateHeroSticky(); }); }
  }, { passive: true });
  window.addEventListener('resize', updateHeroSticky, { passive: true });
  updateHeroShrink();
  updateHeroSticky();

  // ===== PAGE LOGIC =====
  const pageSections = document.querySelectorAll('section:not(.hero)');
  const pageObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  pageSections.forEach((section, index) => { section.style.opacity = '0'; section.style.transform = 'translateY(20px)'; section.style.transition = `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`; pageObserver.observe(section); });
  const heroSection = document.querySelector('.hero');
  if (heroSection) { heroSection.style.opacity = '1'; heroSection.style.transform = 'none'; }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function(e) { e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });

  document.querySelectorAll('.mockup-image').forEach((img, index) => { const transforms = [{ tx: 0, ty: 0, tr: '-2deg' }, { tx: '8px', ty: '-24px', tr: '1deg' }, { tx: '16px', ty: '-48px', tr: '-1deg' }, { tx: '24px', ty: '-72px', tr: '2deg' }]; const t = transforms[index] || transforms[0]; img.style.setProperty('--tx', t.tx); img.style.setProperty('--ty', t.ty); img.style.setProperty('--tr', t.tr); });

  // ===== INIT =====
  function init() {
    new PricingCalculator();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();