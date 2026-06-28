/* ============================================================
   FOR TWO — script.js (ブラッシュアップ版)
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
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
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
    const siblings = Array.from(
      entry.target.parentElement.querySelectorAll('.fade-in')
    );
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 0.08}s`;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

/* ---------- ACCORDION ---------- */
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // 全て閉じる
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
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
    const wrap = document.querySelector('.hero-video-wrap');
    if (wrap) wrap.style.background = 'linear-gradient(160deg,#1e5078 0%,#4AABDB 100%)';
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
    if (window.scrollY > 400) {
      lineFab.style.opacity = '1';
      lineFab.style.pointerEvents = 'auto';
    } else {
      lineFab.style.opacity = '0';
      lineFab.style.pointerEvents = 'none';
    }
  };
  lineFab.style.opacity = '0';
  lineFab.style.transition = 'opacity 0.3s, transform 0.2s, box-shadow 0.2s';
  window.addEventListener('scroll', toggleFab, { passive: true });
  toggleFab();
}

/* ---------- トラストバッジ: カウントアップ ---------- */
const countUp = (el, target, suffix = '') => {
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
};

const trustSection = document.querySelector('.hero-trust');
if (trustSection) {
  // ページロード後にカウントアップ
  window.addEventListener('load', () => {
    setTimeout(() => {
      const nums = trustSection.querySelectorAll('.trust-num');
      // 最初の"7"だけカウントアップ（他は文字列なのでスキップ）
      if (nums[0]) {
        const original = nums[0].innerHTML;
        countUp(nums[0], 7, '<small>年</small>');
        setTimeout(() => { nums[0].innerHTML = original; }, 1300);
      }
      if (nums[1]) {
        const original2 = nums[1].textContent;
        countUp(nums[1], 6, '');
        setTimeout(() => { nums[1].textContent = original2; }, 700);
      }
    }, 800);
  });
}
