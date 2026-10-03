/* ═══════════════════════════════════════════
   CSI CLUB — Main JavaScript
   ═══════════════════════════════════════════ */

// ── PAGE NAVIGATION ──────────────────────────────────────────────
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');

function navigateTo(pageId) {
  // Hide all pages
  pages.forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Update URL hash without jumping
  history.pushState(null, '', '#' + pageId);

  // Close mobile menu if open
  closeMobileMenu();

  // Trigger scroll reveals for the new page
  setTimeout(initReveal, 100);
}

// Handle all [data-page] link clicks
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

// Initial page load from hash
(function initPage() {
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);
})();

// ── MOBILE MENU ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMobileMenu);
mobileClose.addEventListener('click', closeMobileMenu);

// Close mobile menu on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ── EVENT FILTER ─────────────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const eventCards = document.querySelectorAll('.event-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    eventCards.forEach(card => {
      if (filter === 'all' || card.dataset.type === filter) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.3s ease-out';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ── CONTACT FORM ─────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      // Shake the empty fields
      [document.getElementById('name'), document.getElementById('email'), document.getElementById('message')].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#FF4444';
          setTimeout(() => { field.style.borderColor = ''; }, 2000);
        }
      });
      return;
    }

    // Simulate form submission
    submitBtn.textContent = 'SENDING...';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      contactForm.reset();
      submitBtn.innerHTML = '<span class="btn-icon-circle"><svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span> SEND MESSAGE';
      submitBtn.disabled = false;

      setTimeout(() => {
        formSuccess.classList.remove('show');
      }, 4000);
    }, 1200);
  });
}

// ── SCROLL REVEAL ────────────────────────────────────────────────
function initReveal() {
  const revealElements = document.querySelectorAll('.page.active .highlight-cell, .page.active .event-card, .page.active .team-card, .page.active .blog-card, .page.active .gallery-item, .page.active .tl-item, .page.active .vision-card, .page.active .stat-item');

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.06}s`;
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

// Run reveal on initial load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initReveal, 200);
});

// ── NAVBAR SCROLL BEHAVIOR ───────────────────────────────────────
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.style.transform = 'translateY(-100%)';
    navbar.style.transition = 'transform 0.3s ease';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = currentScrollY;
}, { passive: true });

// ── MARQUEE DUPLICATE for seamless loop ─────────────────────────
document.querySelectorAll('.marquee-track').forEach(track => {
  const original = track.querySelector('span');
  if (original) {
    const clone = original.cloneNode(true);
    track.appendChild(clone);
  }
});

// ── ACTIVE NAV ON SCROLL (for single-page scrolling, optional) ──
// Since we use a page-based navigation, keep nav in sync
function syncNavToCurrentPage() {
  const hash = window.location.hash.replace('#', '') || 'home';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === hash);
  });
}
syncNavToCurrentPage();

// ── KEYBOARD NAVIGATION ──────────────────────────────────────────
document.querySelectorAll('.event-card, .team-card, .gallery-item, .blog-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
