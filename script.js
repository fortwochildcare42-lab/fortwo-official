/* ============================================================
   FOR TWO — script.js REDESIGN
   ============================================================ */

'use strict';

/* ---------- NAV: スクロール ---------- */
const nav = document.getElementById('nav');

const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- NAV: ハンバーガー ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

const closeNav = () => {
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'メニューを開く');
  hamburger.querySelectorAll('span').forEach(s => {
    s.style.transform = '';
    s.style.opacity   = '';
  });
};

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    closeNav();
  }
});

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

document.addEventListener('click', e => {
  if (!nav.contains(e.target)) closeNav();
});

/* ---------- FADE-IN (IntersectionObserver) ---------- */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // 兄弟要素との連鎖ディレイ
    const siblings = Array.from(
      entry.target.parentElement.querySelectorAll('.fade-in')
    );
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 0.07}s`;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.08 });

fadeEls.forEach(el => observer.observe(el));

/* ---------- ACCORDION ---------- */
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // すべて閉じる
    document.querySelectorAll('.accordion-btn').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });

    // クリックされたものだけ開く
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ---------- スムーズスクロール ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---------- ヒーロー動画フォールバック ---------- */
const heroVideo = document.querySelector('.hero-circle-wrap video');
if (heroVideo) {
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
    const fallback = heroVideo.nextElementSibling;
    if (fallback) fallback.style.display = 'flex';
  });
  // source要素のエラーも拾う
  heroVideo.querySelectorAll('source').forEach(src => {
    src.addEventListener('error', () => {
      heroVideo.style.display = 'none';
      const fallback = heroVideo.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    });
  });
}

/* ---------- 画像遅延読み込み ---------- */
document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
});

/* ---------- LINE FAB: スクロールで表示 ---------- */
const lineFab = document.querySelector('.line-fab');
if (lineFab) {
  const toggleFab = () => {
    const show = window.scrollY > 400;
    lineFab.style.opacity      = show ? '1' : '0';
    lineFab.style.pointerEvents = show ? 'auto' : 'none';
    lineFab.style.transform    = show ? 'translateY(0)' : 'translateY(12px)';
  };
  lineFab.style.opacity      = '0';
  lineFab.style.pointerEvents = 'none';
  lineFab.style.transform    = 'translateY(12px)';
  lineFab.style.transition   = 'opacity 0.4s cubic-bezier(.22,1,.36,1), transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.2s';
  window.addEventListener('scroll', toggleFab, { passive: true });
  toggleFab();
}

/* ---------- トラストバッジ: カウントアップ ---------- */
const countUp = (el, target, suffix = '', duration = 1000) => {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

// ヒーローが画面に入ったらカウントアップ
const heroSection = document.getElementById('hero');
if (heroSection) {
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      heroObs.disconnect();
      setTimeout(() => {
        const nums = document.querySelectorAll('.trust-num');
        // "8年以上" のカウントアップ
        if (nums[0]) countUp(nums[0], 8, '年以上', 900);
        // "6" のカウントアップ
        if (nums[1]) countUp(nums[1], 6, '', 700);
      }, 600);
    });
  }, { threshold: 0.3 });
  heroObs.observe(heroSection);
}

/* ---------- サービスカード: ホバー時のスコアライン ---------- */
// CSSで対応済み — JS不要

/* ---------- OverviewItem: 数字のインタラクティブカウント ---------- */
const overviewSection = document.querySelector('.overview');
if (overviewSection) {
  const ovObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      ovObs.disconnect();
      // カードに順番にアニメーションをかける
      entry.target.querySelectorAll('.overview-item').forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.08}s`;
        item.classList.add('visible');
      });
    });
  }, { threshold: 0.2 });
  ovObs.observe(overviewSection);
}
