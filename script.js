const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const servicesMenu = document.querySelector('.nav-services');
const servicesTrigger = document.querySelector('.mega-trigger');
const trackingForm = document.querySelector('#tracking-form');
const trackingInput = document.querySelector('#tracking-number');
const trackingResult = document.querySelector('#tracking-result');
const quoteForm = document.querySelector('#quote-form');
const quoteResult = document.querySelector('#quote-result');

if (window.lucide) {
    window.lucide.createIcons();
}

const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    mainNav.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
});

servicesTrigger.addEventListener('click', () => {
    const isOpen = servicesTrigger.getAttribute('aria-expanded') === 'true';
    servicesTrigger.setAttribute('aria-expanded', String(!isOpen));
    servicesMenu.classList.toggle('menu-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        servicesMenu.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        servicesTrigger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    });
});

document.addEventListener('click', (event) => {
    if (!servicesMenu.contains(event.target)) {
        servicesMenu.classList.remove('menu-open');
        servicesTrigger.setAttribute('aria-expanded', 'false');
    }
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
})[character]);

const demoTracking = () => {
    const trackingNumber = trackingInput.value.trim().toUpperCase();
    if (!trackingNumber) {
        trackingInput.focus();
        return;
    }

    trackingResult.hidden = false;
    trackingResult.innerHTML = `
    <div class="tracking-summary">
    <div><span>AWB number</span><b>${escapeHtml(trackingNumber)}</b></div>
      <div><span>Current location</span><b>Hyderabad Distribution Hub</b></div>
      <div><span>Expected delivery</span><b>30 Sep 2026</b></div>
      <div><span>Service / updated</span><b>Domestic Express · 11:42 AM</b></div>
    </div>
    <p class="tracking-status">Shipment reached destination hub</p>
    <div class="timeline" aria-label="Shipment progress">
      <div class="timeline-step complete">Pickup confirmed</div>
      <div class="timeline-step complete">In transit</div>
      <div class="timeline-step complete">Reached hub</div>
      <div class="timeline-step">Out for delivery</div>
      <div class="timeline-step">Delivered</div>
    </div>
    <p class="demo-disclaimer">Illustrative tracking status for the assignment demo. Live events require a carrier tracking integration.</p>`;
};

trackingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    demoTracking();
});

document.querySelector('#demo-tracking').addEventListener('click', () => {
    trackingInput.value = 'CHW123456789';
    demoTracking();
});

const serviceRates = {
    document: { base: 65, kg: 38 },
    parcel: { base: 95, kg: 52 },
    cargo: { base: 280, kg: 31 },
};
const speedMultipliers = { standard: 1, express: 1.55, priority: 2.1 };
const deliveryWindows = {
    standard: '3–5 business days',
    express: '2–3 business days',
    priority: '1–2 business days',
};

quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quoteForm);
    const actualWeight = Number(formData.get('weight'));
    const dimensions = String(formData.get('dimensions') || '').match(/[\d.]+/g)?.map(Number) || [];
    const volumetricWeight = dimensions.length >= 3
        ? (dimensions[0] * dimensions[1] * dimensions[2]) / 5000
        : 0;
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);
    const type = formData.get('type');
    const speed = formData.get('speed');
    const rawEstimate = (serviceRates[type].base + (chargeableWeight * serviceRates[type].kg)) * speedMultipliers[speed];
    const estimate = Math.ceil(rawEstimate / 5) * 5;
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(estimate);

    quoteResult.hidden = false;
    quoteResult.innerHTML = `
    <div class="result-row"><div><span>Estimated shipping cost</span><strong>${formattedPrice}</strong></div><span>${deliveryWindows[speed]}</span></div>
    <p>Indicative demo estimate for ${chargeableWeight.toFixed(1)} kg chargeable weight from ${escapeHtml(formData.get('origin'))} to ${escapeHtml(formData.get('destination'))}. Confirm route, dimensions and final pricing with Chowra.</p>`;
});

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.section-heading, .service-card, .solution-grid article, .why-grid article, .testimonial-card, .stat-item').forEach((element) => {
    element.classList.add('reveal');
    revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const suffix = counter.dataset.suffix || '';
        const started = performance.now();
        const duration = 900;
        const tick = (now) => {
            const progress = Math.min((now - started) / duration, 1);
            const eased = 1 - ((1 - progress) ** 3);
            counter.textContent = `${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(counter);
    });
}, { threshold: 0.65 });

document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeLink = document.querySelector(`.main-nav > a[href="#${entry.target.id}"]`);
        if (activeLink) {
            document.querySelectorAll('.main-nav > a').forEach((link) => link.classList.remove('active'));
            activeLink.classList.add('active');
        }
    });
}, { rootMargin: '-35% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

document.querySelector('.testimonial-prev').addEventListener('click', () => {
    document.querySelector('#testimonial-slider').scrollBy({ left: -310, behavior: 'smooth' });
});
document.querySelector('.testimonial-next').addEventListener('click', () => {
    document.querySelector('#testimonial-slider').scrollBy({ left: 310, behavior: 'smooth' });
});

document.querySelectorAll('.footer-column > button').forEach((button) => {
    button.addEventListener('click', () => {
        if (window.matchMedia('(min-width: 521px)').matches) return;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        button.parentElement.classList.toggle('collapsed', isExpanded);
    });
});
