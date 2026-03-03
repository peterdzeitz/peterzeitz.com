/* ========================================
   Peter Zeitz Portfolio - Main JavaScript
   ======================================== */

(function() {
  'use strict';

  // ========================================
  // Load Projects Data
  // ========================================

  // Determine page context based on URL structure
  // Project pages are now at /projects/{id}/index.html (2 levels deep)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const isProjectPage = pathParts.includes('projects') && pathParts.length >= 2;

  // Path to root from current location
  const rootPath = isProjectPage ? '../../' : '';

  // Get current project ID if on project page
  const currentProjectId = isProjectPage ? pathParts[pathParts.indexOf('projects') + 1] : null;

  async function loadProjects() {
    try {
      const response = await fetch(rootPath + 'data/projects.json');
      const data = await response.json();
      return data.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  // ========================================
  // Homepage - Render Project Grid
  // ========================================

  async function renderProjectGrid() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    const projects = await loadProjects();

    projects.forEach(project => {
      const card = document.createElement('a');
      card.href = `projects/${project.id}/`;
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-image-wrap">
          <img src="projects/${project.id}/${project.thumbnail}" alt="${project.title}" loading="lazy">
        </div>
        <div class="project-card-overlay">
          <h3 class="project-card-title">${project.title}</h3>
          <span class="project-card-category">${project.category}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ========================================
  // Project Page - Render Gallery
  // ========================================

  async function renderProjectPage() {
    const container = document.querySelector('[data-project]');
    if (!container) return;

    const projectId = container.dataset.project;
    const projects = await loadProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      console.error('Project not found:', projectId);
      return;
    }

    // Update page content
    document.title = `${project.title} - Peter Zeitz`;

    // Hero - images are in same folder, so no path prefix needed
    const hero = document.querySelector('.project-hero');
    if (hero) {
      hero.querySelector('.project-hero-image').src = project.thumbnail;
      hero.querySelector('.project-hero-image').alt = project.title;
      hero.querySelector('h1').textContent = project.title;
      hero.querySelector('.project-date').textContent = project.date;
      hero.querySelector('.project-category').textContent = project.category;
      hero.querySelector('.project-description').textContent = project.description;
    }

    // Gallery - images are in same folder
    const gallery = document.querySelector('.gallery-grid');
    if (gallery) {
      project.images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;
        item.innerHTML = `<img src="${image}" alt="${project.title} - Image ${index + 1}" loading="lazy">`;
        gallery.appendChild(item);
      });

      // Initialize lightbox - no path prefix needed
      initLightbox(project.images, '');

      // Initialize gallery reveal
      initGalleryReveal();

    }
  }

  // ========================================
  // Lightbox
  // ========================================

  function initLightbox(images, pathPrefix) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    // Create lightbox if it doesn't exist
    if (!document.querySelector('.lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-nav lightbox-prev">&lsaquo;</button>
        <button class="lightbox-nav lightbox-next">&rsaquo;</button>
        <div class="lightbox-content">
          <img src="" alt="">
        </div>
      `;
      document.body.appendChild(lightbox);
    }

    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = pathPrefix + images[currentIndex];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = pathPrefix + images[currentIndex];
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = pathPrefix + images[currentIndex];
    }

    // Event listeners
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  // ========================================
  // Gallery Parallax
  // ========================================

  function initGalleryReveal() {
    const items = document.querySelectorAll('.gallery-item');
    if (!items.length) return;

    // Set initial state via JS so images aren't hidden if JS fails
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });

    // Delay observer slightly so initial styles are applied first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach(item => observer.observe(item));
      });
    });
  }

  // ========================================
  // Header Scroll Effect
  // ========================================

  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ========================================
  // Custom Cursor
  // ========================================

  function initCustomCursor() {
    const cursor = document.createElement('img');
    cursor.src = (document.querySelector('link[rel="icon"]')?.href) || '';
    cursor.className = 'custom-cursor';
    cursor.style.cssText = 'position:fixed;top:0;left:0;width:18px;height:18px;pointer-events:none;z-index:99999;image-rendering:pixelated;opacity:0;';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Show cursor on first interaction
    function showCursor(e) {
      mouseX = e.clientX - 9;
      mouseY = e.clientY - 9;
      cursorX = mouseX;
      cursorY = mouseY;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      cursor.style.opacity = '1';
      document.removeEventListener('mousemove', showCursor);
      document.addEventListener('mousemove', trackCursor);
    }

    function trackCursor(e) {
      mouseX = e.clientX - 9;
      mouseY = e.clientY - 9;
    }

    document.addEventListener('mousemove', showCursor);

    function animate() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ========================================
  // Page Transitions
  // ========================================

  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) return;

    // Fade overlay out after a brief delay so cursor:none has time to apply
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 100);

    // Intercept internal link clicks for fade-out transition
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');

      // Skip external links, anchors, mailto, and javascript links
      if (!href ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('javascript:') ||
          link.target === '_blank' ||
          href.startsWith('http')) return;

      e.preventDefault();
      overlay.classList.remove('hidden');
      overlay.classList.add('active');

      // Hide custom cursor during transition
      const cursorEl = document.querySelector('.custom-cursor');
      if (cursorEl) cursorEl.style.opacity = '0';

      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  }

  // ========================================
  // Initialize
  // ========================================

  document.addEventListener('DOMContentLoaded', () => {
    renderProjectGrid();
    renderProjectPage();
    initHeaderScroll();
    initPageTransitions();
    initCustomCursor();
  });

})();
