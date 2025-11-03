document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.hero-track');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const prevBtn = document.querySelector('.hero-nav.prev');
  const nextBtn = document.querySelector('.hero-nav.next');
  const dotsContainer = document.querySelector('.hero-dots');
  if (!track || slides.length === 0 || !prevBtn || !nextBtn || !dotsContainer) return;

  let current = slides.findIndex(s => s.classList.contains('active'));
  if (current === -1) current = 0;
  const slideCount = slides.length;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000; // 5s

  // Create dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slideCount; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.dataset.index = i;
      if (i === current) btn.classList.add('active');
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        showSlide(idx);
        restartAutoplay();
      });
      dotsContainer.appendChild(btn);
    }
  }

  function showSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    slides.forEach((s, i) => {
      if (i === index) {
        s.classList.add('active');
        s.style.zIndex = 2;
      } else {
        s.classList.remove('active');
        s.style.zIndex = 1;
      }
    });
    const dotButtons = Array.from(dotsContainer.children);
    dotButtons.forEach((d, i) => d.classList.toggle('active', i === index));
    current = index;
  }

  function next() {
    showSlide(current + 1);
  }

  function prev() {
    showSlide(current - 1);
  }

  prevBtn.addEventListener('click', () => {
    prev();
    restartAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    next();
    restartAutoplay();
  });

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      next();
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // init
  buildDots();
  showSlide(current);
  startAutoplay();
});
