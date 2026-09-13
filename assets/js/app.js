/**
 * Minimal Application Scripts for Premium Webinar Landing Page (2026 Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoadAnimation();
  initHeaderScroll();
  initCountdown();
  initForm();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   0. PAGE LOAD ANIMATIONS
   ========================================================================== */
function initLoadAnimation() {
  setTimeout(() => {
    document.body.classList.add('is-loaded');
  }, 100);
}

/* ==========================================================================
   1. HEADER SCROLL STATE
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   2. COUNTDOWN TIMER (VERTICAL SLIDE)
   Target: September 23, 2026, 7:30 PM IST
   ========================================================================== */
function initCountdown() {
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };

  if (!els.days) return;

  const targetDate = new Date('2026-09-23T19:30:00+05:30').getTime();
  let prevValues = { days: null, hours: null, mins: null, secs: null };

  function animateDigitChange(element, newValue) {
    if (!element) return;
    
    if (prefersReducedMotion) {
      element.textContent = newValue;
      return;
    }

    const wrap = element.parentElement;
    
    // Create new element that will slide in from bottom
    const newEl = document.createElement('span');
    newEl.className = 'cd-num slide-up-in';
    newEl.textContent = newValue;
    newEl.id = element.id; // Keep ID for future updates
    
    wrap.appendChild(newEl);
    
    // Trigger layout
    void newEl.offsetWidth;
    
    // Animate old out, new in
    element.classList.remove('active');
    element.classList.add('slide-up-out');
    
    newEl.classList.remove('slide-up-in');
    newEl.classList.add('active');
    
    // Clean up old element after transition
    setTimeout(() => {
      if (element.parentNode === wrap) {
        wrap.removeChild(element);
      }
    }, 350);
  }

  function updateValue(elementId, newValue, key) {
    if (prevValues[key] !== newValue) {
      prevValues[key] = newValue;
      // Re-fetch element because we recreate it during animation
      const el = document.getElementById(elementId);
      if (el && el.textContent !== newValue) {
         // If it's the very first load, don't animate, just set
         if (el.textContent === '' || el.textContent === newValue) {
           el.textContent = newValue;
         } else {
           animateDigitChange(el, newValue);
         }
      }
    }
  }

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      ['days', 'hours', 'mins', 'secs'].forEach(k => {
        const el = document.getElementById(`cd-${k}`);
        if(el) el.textContent = '00';
      });
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    updateValue('cd-days', String(d).padStart(2, '0'), 'days');
    updateValue('cd-hours', String(h).padStart(2, '0'), 'hours');
    updateValue('cd-mins', String(m).padStart(2, '0'), 'mins');
    updateValue('cd-secs', String(s).padStart(2, '0'), 'secs');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. FORM VALIDATION & SUBMISSION
   ========================================================================== */
function initForm() {
  const form = document.getElementById('webinarForm');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !submitBtn) return;

  const inputs = form.querySelectorAll('.input-field');

  // Inline Validation on Blur/Input
  inputs.forEach(input => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('change', () => validateField(input));
  });

  function validateField(input) {
    let isValid = false;
    
    if (input.type === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = re.test(input.value.trim());
    } else if (input.type === 'tel') {
      const re = /^[\d\s\+\-\(\)]{8,15}$/;
      isValid = re.test(input.value.trim());
    } else {
      isValid = input.value.trim().length > 0;
    }

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      return true;
    } else {
      // Only show invalid if they've typed something or blurred
      if (input.value.trim().length > 0 || document.activeElement !== input) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
      }
      return false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let formIsValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        formIsValid = false;
        // Force error state if empty
        input.classList.add('is-invalid');
      }
    });

    if (!formIsValid) return;

    const span = submitBtn.querySelector('span');
    const icon = submitBtn.querySelector('i');
    
    // Visual feedback
    const originalText = span.textContent;
    span.textContent = 'RESERVING YOUR SPOT...';
    if (icon) icon.style.display = 'none';
    
    submitBtn.style.opacity = '0.8';
    submitBtn.disabled = true;
    submitBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      // Exact URL requested by user with fixed emoji encoding (%F0%9F%91%8B is 👋)
      const whatsappURL = `https://api.whatsapp.com/send/?phone=917558877660&text=Hi+Skill+Arcadia%21+%F0%9F%91%8B+I%E2%80%99ve+registered+for+the+Skill+Arcadia+%C3%97+Grant+Thornton+Live+Webinar.+Please+share+the+webinar+joining+details+with+me.+Thank+you%21&type=phone_number&app_absent=0`;
      
      window.location.href = whatsappURL;
      
      // Reset form state in case they hit back button
      setTimeout(() => {
        form.reset();
        inputs.forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });
        span.textContent = originalText;
        if (icon) icon.style.display = 'inline-block';
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        submitBtn.style.pointerEvents = 'auto';
      }, 500);

    }, 800);
  });
}
