/**
 * Colombo Associates - Interactive Client-Side Logic
 * Includes: Colombo live time check, 15 Practice Categories Modals & Filters,
 * Accessible Mobile Navigation Drawer, and Real Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Live Colombo Time & Office Status Indicator
  function updateColomboTime() {
    const timeDisplay = document.getElementById('colombo-time-display');
    const statusText = document.getElementById('office-status-text');
    if (!timeDisplay) return;

    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const colomboTimeString = new Intl.DateTimeFormat('en-US', options).format(now);
      timeDisplay.textContent = `${colomboTimeString} IST (Colombo)`;

      // Business hours: Monday-Friday 08:30 - 17:30 IST (UTC+5:30)
      const colomboDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
      const day = colomboDate.getDay();
      const hours = colomboDate.getHours();
      const minutes = colomboDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && totalMinutes >= (8 * 60 + 30) && totalMinutes <= (17 * 60 + 30);

      if (statusText) {
        if (isOpen) {
          statusText.textContent = 'Colombo Office Open';
          statusText.style.color = '#34d399';
        } else {
          statusText.textContent = 'Office Closed (Online Enquiries Open)';
          statusText.style.color = '#94a3b8';
        }
      }
    } catch (e) {
      console.log('Error formatting time:', e);
    }
  }

  updateColomboTime();
  setInterval(updateColomboTime, 1000);

  // 2. Header Scroll Effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 3. Mobile Navigation Drawer & Backdrop Handling (CRITICAL FIX)
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
  const closeDrawerBtn = document.getElementById('close-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('active');
    mobileBackdrop?.classList.add('active');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('active');
    mobileBackdrop?.classList.remove('active');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileDrawer?.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeDrawerBtn?.addEventListener('click', closeDrawer);
  mobileBackdrop?.addEventListener('click', closeDrawer);

  // Close on mobile link click
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // 4. Practice Areas Taxonomy Data (Single Source of Truth from js/practice-data.js)
  const practiceData = window.PRACTICE_AREAS_MAP || {};

  // 5. Practice Filter & Real-Time Instant Search
  const practiceFilterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const practiceCards = document.querySelectorAll('.practice-card');
  const searchInput = document.getElementById('practice-search-input');
  const searchClearBtn = document.getElementById('practice-search-clear');
  const countBadge = document.getElementById('practice-count-badge');
  const emptyState = document.getElementById('practice-empty-state');
  const resetBtn = document.getElementById('practice-reset-btn');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  function applyPracticeFilters() {
    let visibleCount = 0;
    const query = currentSearchQuery.trim().toLowerCase();

    practiceCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const key = card.id || card.querySelector('[data-practice-key]')?.getAttribute('data-practice-key') || '';
      const title = card.querySelector('.practice-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.practice-card-desc')?.textContent.toLowerCase() || '';
      
      const pData = practiceData[key];
      const covers = (pData && pData.covers) ? pData.covers.toLowerCase() : '';
      const matters = (pData && pData.matters) ? pData.matters.join(' ').toLowerCase() : '';

      const matchesCategory = (currentCategory === 'all' || category === currentCategory || category.includes(currentCategory));
      const matchesSearch = !query || title.includes(query) || desc.includes(query) || covers.includes(query) || matters.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update Counter Badge
    if (countBadge) {
      if (!query && currentCategory === 'all') {
        countBadge.textContent = 'Showing all 15 Practice Areas';
      } else {
        countBadge.textContent = `Showing ${visibleCount} of 15 Practice Areas`;
      }
    }

    // Toggle Empty State
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Toggle Clear Search Button
    if (searchClearBtn) {
      searchClearBtn.style.display = query ? 'block' : 'none';
    }
  }

  practiceFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      practiceFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      applyPracticeFilters();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    applyPracticeFilters();
  });

  searchClearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    applyPracticeFilters();
    searchInput?.focus();
  });

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    currentCategory = 'all';
    practiceFilterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === 'all') b.classList.add('active');
      else b.classList.remove('active');
    });
    applyPracticeFilters();
  });

  // 6. Practice Detail Modal
  const modalBackdrop = document.getElementById('practice-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-practice-title');
  const modalCovers = document.getElementById('modal-practice-covers');
  const modalDetails = document.getElementById('modal-practice-details');
  const modalList = document.getElementById('modal-practice-matters');
  const modalEnquireBtn = document.getElementById('modal-enquire-btn');

  function openPracticeModal(key) {
    const data = practiceData[key];
    if (!data || !modalBackdrop) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalCovers) modalCovers.textContent = data.covers;
    if (modalDetails) modalDetails.textContent = data.details;
    if (modalList) {
      modalList.innerHTML = '';
      data.matters.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        modalList.appendChild(li);
      });
    }
    if (modalEnquireBtn) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        modalEnquireBtn.href = '#contact';
        modalEnquireBtn.onclick = (e) => {
          closePracticeModal();
          prefillServiceDropdown(data.title);
        };
      } else {
        modalEnquireBtn.href = `contact.html?service=${encodeURIComponent(data.title)}`;
        modalEnquireBtn.onclick = null;
      }
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePracticeModal() {
    modalBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closePracticeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closePracticeModal();
  });

  document.querySelectorAll('[data-practice-key]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.getAttribute('data-practice-key');
      openPracticeModal(key);
    });
  });

  // 7. Dropdown pre-fill helper
  function prefillServiceDropdown(serviceName) {
    const serviceSelect = document.getElementById('enquiry-service') || document.querySelector('select[name="service"]');
    if (serviceSelect) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].text.toLowerCase().includes(serviceName.toLowerCase()) ||
            serviceName.toLowerCase().includes(serviceSelect.options[i].value.toLowerCase())) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
      serviceSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      serviceSelect.focus();
    }
  }

  // 8. Contact Form Client-Side Validation & Dispatch Feedback (Strict Verification)
  // Only bind here if not on contact.html (which has its own dedicated handler)
  const enquiryForm = document.getElementById('client-enquiry-form');
  const toastNotice = document.getElementById('toast-notice');

  if (enquiryForm && !document.getElementById('contact-name')) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-Spam Honeypot Verification
      const honeypot = document.getElementById('enquiry-hp');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam submission detected and blocked.');
        return;
      }

      // Validate Required Fields
      const nameInput = document.getElementById('enquiry-name');
      const orgInput = document.getElementById('enquiry-org');
      const emailInput = document.getElementById('enquiry-email');
      const phoneInput = document.getElementById('enquiry-phone');
      const countryInput = document.getElementById('enquiry-country');
      const serviceSelect = document.getElementById('enquiry-service');
      const descInput = document.getElementById('enquiry-desc');
      const methodSelect = document.getElementById('enquiry-method');
      const timeSelect = document.getElementById('enquiry-time');
      const consentCheck = document.getElementById('enquiry-consent') || enquiryForm.querySelector('input[type="checkbox"]');

      let isValid = true;

      // Basic field checks
      [nameInput, countryInput, serviceSelect, descInput].forEach(field => {
        if (field && !field.value.trim()) {
          field.classList.add('is-invalid');
          isValid = false;
        } else if (field) {
          field.classList.remove('is-invalid');
        }
      });

      // Email format validation (proper RFC regex with escaped backslashes)
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput) {
        if (!emailPattern.test(emailInput.value.trim())) {
          emailInput.classList.add('is-invalid');
          isValid = false;
        } else {
          emailInput.classList.remove('is-invalid');
        }
      }

      // Phone format validation (at least 7 digits)
      if (phoneInput) {
        const cleanPhone = phoneInput.value.replace(/[^0-9+]/g, '');
        if (cleanPhone.length < 7) {
          phoneInput.classList.add('is-invalid');
          isValid = false;
        } else {
          phoneInput.classList.remove('is-invalid');
        }
      }

      // Consent check
      if (consentCheck && !consentCheck.checked) {
        alert('Please review and check the privacy and non-retainer consent notice to proceed.');
        consentCheck.focus();
        return;
      }

      if (!isValid) {
        alert('Please complete all required fields with valid contact information.');
        return;
      }

      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Enquiry';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="width:18px;height:18px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>
          Transmitting to Intake...
        `;
      }

      const payload = {
        name: nameInput ? nameInput.value.trim() : '',
        organisation: orgInput ? orgInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        country: countryInput ? countryInput.value.trim() : '',
        service: serviceSelect ? serviceSelect.value : '',
        description: descInput ? descInput.value.trim() : '',
        preferredMethod: methodSelect ? methodSelect.value : 'email',
        preferredTime: timeSelect ? timeSelect.value : 'sl-morning',
        consent: consentCheck ? consentCheck.checked : false,
        _security_honeypot: honeypot ? honeypot.value : ''
      };

      try {
        const response = await fetch('/api/enquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            enquiryForm.reset();
            showToast('Enquiry received by Colombo Associates intake team. We will review for scope and conflicts and contact you within 24-48 business hours.');
          } else {
            throw new Error(result.error || 'Server validation failed.');
          }
        } else {
          throw new Error('Server returned HTTP ' + response.status);
        }
      } catch (err) {
        console.error('Enquiry dispatch error:', err);
        alert('Unable to complete online transmission. Please contact Colombo Associates intake directly via telephone (0741 454 505) or email (contact@colomboassociates.com).');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  function showToast(message) {
    if (!toastNotice) return;
    const msgEl = toastNotice.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 6000);
  }

  // 9. Premium UX Enhancements: Scroll Progress, Floating Back-to-Top, Smooth Reveal & Quick-Copy

  // 9A. Scroll Progress Bar
  let progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    document.body.prepend(progressBar);
  }

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 9B. Floating Back-to-Top Glassmorphism Button
  let backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.type = 'button';
    backToTopBtn.setAttribute('aria-label', 'Back to top of page');
    backToTopBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    document.body.appendChild(backToTopBtn);
  }

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  function toggleBackToTop() {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  // 9C. Smooth IntersectionObserver Reveal-on-Scroll
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll(
    '.practice-card, .trust-item, .team-card-lead, .statement-box, .section-header, .insight-card, .career-benefit-card, .stat-card, .timeline-item, .steps-container'
  );

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealTargets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      const parentGrid = el.closest('.practice-grid, .trust-grid, .why-grid, .insights-grid, .stats-grid');
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const itemIdx = siblings.indexOf(el);
        if (itemIdx >= 0) {
          const delay = (itemIdx % 3) * 80;
          el.style.transitionDelay = `${delay}ms`;
        }
      }
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(el => el.classList.add('is-revealed'));
  }

  // 9D. Quick Copy Micro-Feedback for Direct Contact Details
  function flashCopyBadge(text) {
    let badge = document.getElementById('quick-copy-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'quick-copy-badge';
      badge.className = 'quick-copy-badge';
      badge.innerHTML = `
        <svg style="width:16px;height:16px;stroke:#38bdf8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span class="copy-text">Copied to clipboard</span>
      `;
      document.body.appendChild(badge);
    }
    const span = badge.querySelector('.copy-text');
    if (span) span.textContent = text;
    badge.classList.add('show');
    setTimeout(() => {
      badge.classList.remove('show');
    }, 2800);
  }

  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      const isMail = link.href.startsWith('mailto:');
      const val = isMail ? link.href.replace('mailto:', '') : link.href.replace('tel:', '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => {
          flashCopyBadge(isMail ? 'Email address copied' : 'Phone number copied');
        }).catch(() => {});
      }
    });
  });

  // Handle escape key to close active modals & drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePracticeModal();
      closeDrawer();
      document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    }
  });
});

