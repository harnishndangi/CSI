/* ═══════════════════════════════════════════
   CSI CLUB — Main JavaScript
   Enhanced with GSAP & Scroll Animations
   ═══════════════════════════════════════════ */

// ── INITIALIZE GSAP & PLUGINS ────────────────────────────────────
const hasGSAP = typeof window.gsap !== 'undefined';
if (hasGSAP && typeof window.ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── PAGE NAVIGATION ──────────────────────────────────────────────
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');

function navigateTo(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  // Update nav active states immediately
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Close mobile menu if open
  closeMobileMenu();

  if (hasGSAP) {
    // Smooth GSAP Page Transition
    const currentActive = document.querySelector('.page.active');
    if (currentActive && currentActive !== target) {
      gsap.to(currentActive, {
        opacity: 0,
        y: -10,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          currentActive.classList.remove('active');
          gsap.set(currentActive, { clearProps: 'all' });

          target.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'instant' });

          gsap.fromTo(target,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                ScrollTrigger.refresh();
                initPageAnimations(pageId);
              }
            }
          );
        }
      });
    } else {
      pages.forEach(p => p.classList.remove('active'));
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
      initPageAnimations(pageId);
    }
  } else {
    // Fallback without GSAP
    pages.forEach(p => p.classList.remove('active'));
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(initReveal, 100);
  }

  // Update URL hash without jump
  history.pushState(null, '', '#' + pageId);
}

// Handle all [data-page] link clicks (delegated)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (link) {
    e.preventDefault();
    const pageId = link.dataset.page;
    navigateTo(pageId);
  }
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);
});

// ── MOBILE MENU ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // GSAP animation for mobile links
  if (hasGSAP) {
    const links = mobileMenu.querySelectorAll('.mobile-link, .mobile-sep');
    gsap.fromTo(links,
      { opacity: 0, y: 22, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.04,
        ease: 'back.out(1.4)'
      }
    );
  }
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

if (mobileClose) {
  mobileClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileMenu();
  });
}

// Close mobile menu on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ── HERO GSAP INTRO ANIMATION ────────────────────────────────────
function initHeroAnimation() {
  if (!hasGSAP) return;

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .from('.display-heading .line', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12
    })
    .from('.hero-visual', {
      scale: 0.94,
      opacity: 0,
      duration: 0.7
    }, '-=0.5')
    .from('.hero-intro > *', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1
    }, '-=0.4');

  // Hero Card Asterisk interactive hover float
  const heroCard = document.querySelector('.hero-card');
  const bigAsterisk = document.querySelector('.big-asterisk');
  if (heroCard && bigAsterisk) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
      gsap.to(bigAsterisk, { x, y, duration: 0.4, ease: 'power2.out' });
    });
    heroCard.addEventListener('mouseleave', () => {
      gsap.to(bigAsterisk, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
    });
  }
}

// ── STATS COUNTER ANIMATION ──────────────────────────────────────
let statsAnimated = false;

function initStatsCounter() {
  const statsBand = document.querySelector('.stats-band');
  if (!statsBand) return;

  if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: statsBand,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        animateNumbers();
      }
    });
  } else {
    // IntersectionObserver fallback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateNumbers();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(statsBand);
  }

  function animateNumbers() {
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
      const numEl = item.querySelector('.stat-num');
      if (!numEl) return;

      const rawText = numEl.textContent;
      const targetVal = parseInt(rawText.replace(/\D/g, ''), 10);
      if (isNaN(targetVal)) return;

      const plusSpan = numEl.querySelector('.stat-plus');
      const hasPlus = rawText.includes('+');

      const counterObj = { val: 0 };
      if (hasGSAP) {
        gsap.to(counterObj, {
          val: targetVal,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            const current = Math.floor(counterObj.val);
            if (plusSpan) {
              numEl.innerHTML = `${current}<span class="stat-plus">+</span>`;
            } else if (hasPlus) {
              numEl.innerHTML = `${current}<span class="stat-plus">+</span>`;
            } else {
              numEl.textContent = current;
            }
          }
        });
      } else {
        // Simple interval fallback
        let cur = 0;
        const step = Math.ceil(targetVal / 30);
        const timer = setInterval(() => {
          cur = Math.min(cur + step, targetVal);
          if (plusSpan) {
            numEl.innerHTML = `${cur}<span class="stat-plus">+</span>`;
          } else {
            numEl.innerHTML = `${cur}+`;
          }
          if (cur >= targetVal) clearInterval(timer);
        }, 30);
      }
    });
  }
}

// ── SCROLL-TRIGGERED GSAP REVEALS ────────────────────────────────
function initScrollAnimations() {
  if (!hasGSAP || typeof ScrollTrigger === 'undefined') return;

  // Highlights Grid Cards
  const highlightCells = document.querySelectorAll('.highlight-cell');
  if (highlightCells.length > 0) {
    gsap.from(highlightCells, {
      scrollTrigger: {
        trigger: '.highlights-grid',
        start: 'top 85%'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  // CTA Banner Reveal
  const ctaBanner = document.querySelector('.cta-banner');
  if (ctaBanner) {
    gsap.from(ctaBanner.querySelectorAll('.cta-heading, .cta-para, .btn-pill-blue'), {
      scrollTrigger: {
        trigger: ctaBanner,
        start: 'top 80%'
      },
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }

  // Vision Cards
  const visionCards = document.querySelectorAll('.vision-card');
  if (visionCards.length > 0) {
    gsap.from(visionCards, {
      scrollTrigger: {
        trigger: '.vision-section',
        start: 'top 85%'
      },
      y: 35,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out'
    });
  }

  // Timeline Items
  const tlItems = document.querySelectorAll('.tl-item');
  tlItems.forEach((item, idx) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 88%'
      },
      x: idx % 2 === 0 ? -24 : 24,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  });

  // Event Cards
  const eventCardsList = document.querySelectorAll('.event-card');
  if (eventCardsList.length > 0) {
    gsap.from(eventCardsList, {
      scrollTrigger: {
        trigger: '.events-grid',
        start: 'top 85%'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  // Team Cards
  const teamCardsList = document.querySelectorAll('.team-card');
  if (teamCardsList.length > 0) {
    gsap.from(teamCardsList, {
      scrollTrigger: {
        trigger: '.team-grid',
        start: 'top 85%'
      },
      y: 30,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: 'power2.out'
    });
  }

  // Blog Cards
  const blogCardsList = document.querySelectorAll('.blog-card');
  if (blogCardsList.length > 0) {
    gsap.from(blogCardsList, {
      scrollTrigger: {
        trigger: '.blogs-grid',
        start: 'top 85%'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  // Gallery items reveal
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length > 0) {
    gsap.from(galleryItems, {
      scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 85%'
      },
      scale: 0.96,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }
}

function initPageAnimations(pageId) {
  if (pageId === 'home') {
    initHeroAnimation();
  }
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

// ── EVENT FILTER ─────────────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const eventCards = document.querySelectorAll('.event-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    eventCards.forEach(card => {
      const match = filter === 'all' || card.dataset.type === filter;
      if (match) {
        card.style.display = 'flex';
        if (hasGSAP) {
          gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        } else {
          card.style.animation = 'fadeIn 0.3s ease-out';
        }
      } else {
        card.style.display = 'none';
      }
    });

    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
});

// ── CONTACT FORM ─────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    let isValid = true;
    [name, email, message].forEach(field => {
      if (!field || !field.value.trim()) {
        isValid = false;
        if (field) {
          field.style.borderColor = '#FF3333';
          if (hasGSAP) {
            gsap.fromTo(field, { x: -6 }, { x: 6, duration: 0.08, repeat: 4, yoyo: true });
          }
          setTimeout(() => { field.style.borderColor = ''; }, 2000);
        }
      }
    });

    if (!isValid) return;

    submitBtn.textContent = 'SENDING...';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      contactForm.reset();
      submitBtn.innerHTML = '<span class="btn-icon-circle"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span> SEND MESSAGE';
      submitBtn.disabled = false;

      if (hasGSAP) {
        gsap.from(formSuccess, { y: -10, opacity: 0, duration: 0.4, ease: 'back.out(1.5)' });
      }

      setTimeout(() => {
        formSuccess.classList.remove('show');
      }, 4500);
    }, 1000);
  });
}

// ── CSS FALLBACK SCROLL REVEAL ───────────────────────────────────
function initReveal() {
  const revealElements = document.querySelectorAll('.page.active .highlight-cell, .page.active .event-card, .page.active .team-card, .page.active .blog-card, .page.active .gallery-item, .page.active .tl-item, .page.active .vision-card, .page.active .stat-item');

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 0.06}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
}

// ── NAVBAR SCROLL HIDE/SHOW ──────────────────────────────────────
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (!navbar) return;

  // Don't hide navbar if mobile menu is open
  if (mobileMenu && mobileMenu.classList.contains('open')) return;

  if (currentScrollY > lastScrollY && currentScrollY > 120) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = currentScrollY;
}, { passive: true });

// ── MARQUEE DUPLICATE ────────────────────────────────────────────
document.querySelectorAll('.marquee-track').forEach(track => {
  const original = track.querySelector('span');
  if (original) {
    const clone = original.cloneNode(true);
    track.appendChild(clone);
  }
});

// ── KEYBOARD NAVIGATION ──────────────────────────────────────────
document.querySelectorAll('.event-card, .team-card, .gallery-item, .blog-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// ── INITIAL LAUNCH ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);
  initStatsCounter();
  initScrollAnimations();
});
