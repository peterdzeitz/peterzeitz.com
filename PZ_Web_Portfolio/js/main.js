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
        <img src="projects/${project.id}/${project.thumbnail}" alt="${project.title}" loading="lazy">
        <div class="project-card-overlay">
          <span class="project-card-category">${project.category}</span>
          <h3 class="project-card-title">${project.title}</h3>
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
  // Initialize
  // ========================================

  document.addEventListener('DOMContentLoaded', () => {
    renderProjectGrid();
    renderProjectPage();
    initHeaderScroll();
  });

})();
