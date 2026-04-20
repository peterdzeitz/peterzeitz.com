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

      // Initialize drag-and-drop reordering (localhost only)
      initDragAndDrop(project);
    }
  }

  // ========================================
  // Drag-and-Drop Image Reordering
  // ========================================

  function initDragAndDrop(project) {
    // Only show on localhost
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') return;

    const gallery = document.querySelector('.gallery-grid');
    if (!gallery) return;

    let editMode = false;
    let draggedItem = null;

    // Create edit mode controls
    const controls = document.createElement('div');
    controls.className = 'edit-mode-controls';
    controls.innerHTML = `
      <button type="button" class="edit-toggle-btn">Edit Order</button>
      <button type="button" class="save-order-btn" style="display:none">Save Order</button>
      <button type="button" class="cancel-order-btn" style="display:none">Cancel</button>
      <span class="save-status"></span>
    `;
    document.body.appendChild(controls);

    const editBtn = controls.querySelector('.edit-toggle-btn');
    const saveBtn = controls.querySelector('.save-order-btn');
    const cancelBtn = controls.querySelector('.cancel-order-btn');
    const status = controls.querySelector('.save-status');

    function toggleEditMode(on) {
      editMode = on;
      gallery.classList.toggle('edit-mode', on);
      editBtn.style.display = on ? 'none' : '';
      saveBtn.style.display = on ? '' : 'none';
      cancelBtn.style.display = on ? '' : 'none';
      status.textContent = '';

      const items = gallery.querySelectorAll('.gallery-item');
      items.forEach(item => {
        item.draggable = on;
        if (on) {
          item.addEventListener('dragstart', handleDragStart);
          item.addEventListener('dragend', handleDragEnd);
          item.addEventListener('dragover', handleDragOver);
          item.addEventListener('dragenter', handleDragEnter);
          item.addEventListener('dragleave', handleDragLeave);
          item.addEventListener('drop', handleDrop);
        } else {
          item.draggable = false;
          item.removeEventListener('dragstart', handleDragStart);
          item.removeEventListener('dragend', handleDragEnd);
          item.removeEventListener('dragover', handleDragOver);
          item.removeEventListener('dragenter', handleDragEnter);
          item.removeEventListener('dragleave', handleDragLeave);
          item.removeEventListener('drop', handleDrop);
        }
      });
    }

    function handleDragStart(e) {
      draggedItem = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
      this.classList.remove('dragging');
      gallery.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('drag-over');
      });
      draggedItem = null;
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
      e.preventDefault();
      if (this !== draggedItem) {
        this.classList.add('drag-over');
      }
    }

    function handleDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (draggedItem && draggedItem !== this) {
        const items = [...gallery.querySelectorAll('.gallery-item')];
        const fromIndex = items.indexOf(draggedItem);
        const toIndex = items.indexOf(this);
        if (fromIndex < toIndex) {
          gallery.insertBefore(draggedItem, this.nextSibling);
        } else {
          gallery.insertBefore(draggedItem, this);
        }
      }
    }

    editBtn.addEventListener('click', () => toggleEditMode(true));
    cancelBtn.addEventListener('click', () => {
      // Reload to restore original order
      window.location.reload();
    });

    saveBtn.addEventListener('click', async () => {
      const items = gallery.querySelectorAll('.gallery-item img');
      const images = [...items].map(img => {
        const src = img.getAttribute('src');
        // Strip any path prefix, keep just filename
        return src.split('/').pop();
      });

      const payload = { projectId: project.id, images };
      console.log('Saving order:', payload);
      status.textContent = 'Saving...';
      try {
        const res = await fetch('http://localhost:3001/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        status.textContent = 'Saved!';
        status.style.color = '#2e7d32';

        // Update lightbox image array to match new order
        initLightbox(images, '');

        setTimeout(() => toggleEditMode(false), 1200);
      } catch (err) {
        console.error('Save order failed:', err);
        status.textContent = 'Error: ' + err.message;
        status.style.color = '#c62828';
      }
    });
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
      const scrollY = window.scrollY;
      document.body.classList.add('scroll-locked');
      document.body.style.top = `-${scrollY}px`;
    }

    function closeLightbox() {
      const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
      document.body.classList.remove('scroll-locked');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
      lightbox.classList.remove('active');
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
  // Page Transitions
  // ========================================

  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) return;

    // Fade overlay out after a brief delay so cursor:none has time to apply
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 100);

    // Handle browser back/forward (bfcache)
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
      }
    });

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
  });

})();
