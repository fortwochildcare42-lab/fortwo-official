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

/* ---------- INSTAGRAM FEED ---------- */
const instaGrid = document.getElementById('insta-grid');

if (instaGrid) {
  (async () => {
    try {
      const res  = await fetch('/instagram');
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'failed to load');
      }

      const posts = (data.data || []).filter(p =>
        p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM' || p.media_type === 'VIDEO'
      );

      if (posts.length === 0) {
        instaGrid.innerHTML = '<p class="insta-error">現在表示できる投稿がありません。</p>';
        return;
      }

      instaGrid.innerHTML = posts.slice(0, 8).map(post => {
        const imgSrc = post.media_type === 'VIDEO'
          ? (post.thumbnail_url || post.media_url)
          : post.media_url;
        const caption = post.caption
          ? post.caption.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 120)
          : '';

        return `
          <a class="insta-post" href="${post.permalink}" target="_blank" rel="noopener noreferrer" aria-label="Instagramの投稿を見る">
            <img src="${imgSrc}" alt="${caption || 'For Two Instagram投稿'}" loading="lazy">
            <svg class="insta-post-icon" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 9h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" opacity="0"/><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" stroke-width="1.6"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="white" stroke-width="1.6"/><circle cx="17.5" cy="6.5" r="1" fill="white"/></svg>
            ${caption ? `<span class="insta-post-overlay"><span class="insta-post-caption">${caption}</span></span>` : ''}
          </a>
        `;
      }).join('');
    } catch (err) {
      instaGrid.innerHTML = '<p class="insta-error">Instagramの投稿を読み込めませんでした。下のボタンから直接ご覧ください。</p>';
    }
  })();
}
