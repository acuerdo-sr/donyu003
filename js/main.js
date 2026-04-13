/* ===========================================
   ACUERDO SR - 労務顧問 初期導入LP
   main.js（全面改修版）
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================
     1. ヘッダー：スクロール時スタイル変更
     ======================================== */
  const header  = document.getElementById('header');
  const pagetop = document.getElementById('pagetop');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    pagetop.classList.toggle('show', y > 300);
    updateNavActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  pagetop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ========================================
     2. ハンバーガーメニュー
     ======================================== */
  const hamburger = document.getElementById('hamburger');
  const headerNav = document.getElementById('headerNav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    headerNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  headerNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      headerNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target) && headerNav.classList.contains('open')) {
      hamburger.classList.remove('open');
      headerNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ========================================
     3. スムーズスクロール
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ========================================
     4. ナビ アクティブ切替
     ======================================== */
  const navLinks   = document.querySelectorAll('.header-nav a');
  const navSections = [];
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      const sec = document.querySelector(href);
      if (sec) navSections.push({ link, sec });
    }
  });

  function updateNavActive() {
    const offset = 120;
    let current = null;
    navSections.forEach(({ sec }) => {
      if (sec.getBoundingClientRect().top - offset <= 0) current = sec.id;
    });
    navLinks.forEach(link => {
      const active = current && link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', !!active);
    });
  }

  onScroll();

  /* ========================================
     5. Reveal アニメーション
     ======================================== */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(revealEls).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), (idx % 4) * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ========================================
     6. アコーディオン
     ======================================== */
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach(trigger => {
    const bodyId = trigger.getAttribute('aria-controls');
    const body   = document.getElementById(bodyId);
    if (!body) return;

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const nowOpen  = !expanded;

      trigger.setAttribute('aria-expanded', nowOpen);

      if (nowOpen) {
        body.hidden = false;
        // heightアニメーション
        body.style.maxHeight = '0';
        body.style.overflow  = 'hidden';
        body.style.transition = 'max-height 0.4s ease';
        requestAnimationFrame(() => {
          body.style.maxHeight = body.scrollHeight + 'px';
        });
        body.addEventListener('transitionend', () => {
          body.style.maxHeight = '';
          body.style.overflow  = '';
        }, { once: true });
      } else {
        // 閉じる
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.overflow  = 'hidden';
        body.style.transition = 'max-height 0.35s ease';
        requestAnimationFrame(() => {
          body.style.maxHeight = '0';
        });
        body.addEventListener('transitionend', () => {
          body.hidden = true;
          body.style.maxHeight  = '';
          body.style.overflow   = '';
          body.style.transition = '';
        }, { once: true });
      }
    });
  });

  /* ========================================
     7. チェックリスト
     ======================================== */
  const STORAGE_KEY = 'acuerdo_checklist_v2';

  // 全員用と追加用を分けて管理
  const baseItems  = document.querySelectorAll('.cl-item:not(.cl-item-extra)');
  const extraItems = document.querySelectorAll('.cl-item.cl-item-extra');
  const allItems   = document.querySelectorAll('.cl-item');

  const checkedCountEl = document.getElementById('checkedCount');
  const totalCountEl   = document.getElementById('totalCount');
  const progressBar    = document.getElementById('progressBar');
  const completeEl     = document.getElementById('checklistComplete');
  const resetBtn       = document.getElementById('resetBtn');

  // totalCount は全件
  const total = allItems.length;
  if (totalCountEl) totalCountEl.textContent = total;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateProgress() {
    let checked = 0;
    allItems.forEach(item => { if (item.classList.contains('checked')) checked++; });
    if (checkedCountEl) checkedCountEl.textContent = checked;
    const pct = total > 0 ? (checked / total) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (completeEl) completeEl.classList.toggle('show', checked === total && total > 0);
  }

  // 保存状態を反映
  const savedState = loadState();
  allItems.forEach(item => {
    const id       = item.dataset.id;
    const checkbox = document.getElementById(id);
    if (savedState[id]) {
      item.classList.add('checked');
      if (checkbox) checkbox.checked = true;
    }

    item.addEventListener('click', e => {
      e.preventDefault();
      const isChecked = item.classList.toggle('checked');
      if (checkbox) checkbox.checked = isChecked;
      const state = loadState();
      state[id] = isChecked;
      saveState(state);
      updateProgress();

      if (isChecked) {
        item.style.transform = 'scale(1.01)';
        setTimeout(() => { item.style.transform = ''; }, 180);
      }
    });
  });

  updateProgress();

  // リセット
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('チェックをすべてリセットしますか？')) return;
      allItems.forEach(item => {
        item.classList.remove('checked');
        const checkbox = document.getElementById(item.dataset.id);
        if (checkbox) checkbox.checked = false;
      });
      saveState({});
      updateProgress();
    });
  }

  /* ========================================
     8. ヒーローCTAボタン：波紋エフェクト
     ======================================== */
  const ctaBtn = document.querySelector('.hero-cta-btn');
  if (ctaBtn) {
    // rippleアニメーション用CSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(rippleStyle);

    ctaBtn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      Object.assign(ripple.style, {
        position: 'absolute',
        width: size + 'px', height: size + 'px',
        top:  (e.clientY - rect.top  - size / 2) + 'px',
        left: (e.clientX - rect.left - size / 2) + 'px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        transform: 'scale(0)',
        animation: 'rippleAnim 0.5s ease-out forwards',
        pointerEvents: 'none',
      });
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

});
