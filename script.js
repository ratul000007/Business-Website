// -----------------------------
// Utilities & DOM cache
// -----------------------------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-link');
const sections = document.querySelectorAll('[data-section]');
const heroHeading = document.getElementById('hero-heading');
const contactForm = document.getElementById('contactForm');
const formNotice = document.getElementById('formNotice');

// -----------------------------
// Mobile menu toggle
// -----------------------------
function toggleMobileMenu() {
  const isShown = mobileMenu.classList.toggle('show');
  menuBtn.setAttribute('aria-expanded', isShown ? 'true' : 'false');
  mobileMenu.setAttribute('aria-hidden', isShown ? 'false' : 'true');
}
menuBtn.addEventListener('click', toggleMobileMenu);
mobileLinks.forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('show');
  menuBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}));

// -----------------------------
// IntersectionObserver: scroll-spy + reveal
// -----------------------------
const observerOptions = {
  root: null,
  rootMargin: `-80px 0px -50% 0px`, // offset to account for fixed navbar
  threshold: 0
};

function ioCallback(entries) {
  entries.forEach(entry => {
    const id = entry.target.id;
    const desktopLink = document.querySelector(`.nav-links a[href="#${id}"]`);
    const mobileLink = document.querySelector(`.mobile-menu a[href="#${id}"]`);

    if (entry.isIntersecting) {
      // remove active from all, add to this
      document.querySelectorAll('.nav-link.active').forEach(n => n.classList.remove('active'));
      if (desktopLink) desktopLink.classList.add('active');
      // mobile
      document.querySelectorAll('.mobile-menu a.active').forEach(n => n.classList.remove('active'));
      if (mobileLink) mobileLink.classList.add('active');
    }
  });
}

const io = new IntersectionObserver(ioCallback, observerOptions);
sections.forEach(s => io.observe(s));

// ensure proper active on load
window.addEventListener('load', () => {
  // trigger a small scroll to init observer on some browsers
  window.scrollBy(0, 0.1);
});

// -----------------------------
// Smooth anchor clicks with offset (for keyboard users too)
// -----------------------------
function smoothScrollToHash(e) {
  if (!e) return;
  const href = this.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  const id = href.slice(1);
  const section = document.getElementById(id);
  if (!section) return;
  e.preventDefault();

  const offset = navbar.offsetHeight + 12;
  const top = section.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: 'smooth' });
}

[...navLinks, ...mobileLinks].forEach(a => a.addEventListener('click', smoothScrollToHash));

// -----------------------------
// Navbar style on scroll
// -----------------------------
function handleNavbarScroll() {
  if (window.scrollY > 20) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
}
window.addEventListener('scroll', handleNavbarScroll);
handleNavbarScroll();

// -----------------------------
// Smooth, non-stuttering hero typing (uses RAF)
// -----------------------------
if (heroHeading) {
  const phrases = [
    "We Build Websites That Convert.",
    "Modern Design. Professional Look.",
    "Grow Your Business Online."
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let mode = 'typing'; // 'typing' | 'erasing'
  let lastFrame = null;
  let pauseUntil = 0;

  const typingSpeed = 45;   // ms per char (simulated via RAF)
  const erasingSpeed = 20;
  const pauseAfterTyping = 1400;
  const pauseAfterErasing = 300;

  function tick(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const dt = timestamp - lastFrame;

    if (performance.now() < pauseUntil) {
      lastFrame = timestamp;
      requestAnimationFrame(tick);
      return;
    }

    if (mode === 'typing') {
      // accumulate time
      if (dt >= typingSpeed) {
        const current = phrases[phraseIndex];
        if (charIndex < current.length) {
          charIndex++;
          heroHeading.textContent = current.slice(0, charIndex);
          lastFrame = timestamp;
        } else {
          // done typing
          pauseUntil = performance.now() + pauseAfterTyping;
          mode = 'erasing';
        }
      }
    } else if (mode === 'erasing') {
      if (dt >= erasingSpeed) {
        if (charIndex > 0) {
          charIndex--;
          const current = phrases[phraseIndex];
          heroHeading.textContent = current.slice(0, charIndex);
          lastFrame = timestamp;
        } else {
          // move to next phrase
          phraseIndex = (phraseIndex + 1) % phrases.length;
          pauseUntil = performance.now() + pauseAfterErasing;
          mode = 'typing';
        }
      }
    }

    requestAnimationFrame(tick);
  }

  // Start
  heroHeading.textContent = '';
  requestAnimationFrame(tick);
}

// -----------------------------
// Contact Form (Formspree) async
// -----------------------------
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formNotice.classList.remove('visually-hidden');
    formNotice.textContent = 'Sending…';
    const formData = new FormData(contactForm);

    try {
      const res = await fetch(contactForm.action, {
        method: contactForm.method || 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        formNotice.textContent = 'Thanks — message sent!';
        contactForm.reset();
      } else {
        formNotice.textContent = 'Oops — something went wrong.';
      }
    } catch (err) {
      formNotice.textContent = 'Network error — try again later.';
    }

    setTimeout(() => formNotice.classList.add('visually-hidden'), 3500);
  });
}
