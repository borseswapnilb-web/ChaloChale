/* =========================================================
   ChaloChale - home.js
   Home Page-specific dynamic functionality.
   Loads JSON data, renders sections, handles forms.
   ========================================================= */

(() => {
    "use strict";

    // ---------- Configuration ----------
    const FEATURED_DESTINATIONS_LIMIT = 6;
    const POPULAR_PACKAGES_LIMIT = 6;
    const TESTIMONIALS_PER_VIEW_DESKTOP = 3;

    // ---------- DOM References ----------
    const dom = {};

    const cacheDom = () => {
        dom.destinationsGrid = document.getElementById("featured-destinations-grid");
        dom.packagesGrid = document.getElementById("popular-packages-grid");
        dom.testimonialsCarousel = document.getElementById("testimonials-carousel");
        dom.testimonialsControls = document.getElementById("testimonials-controls");
        dom.heroSearchForm = document.getElementById("hero-search-form");
        dom.searchDestination = document.getElementById("search-destination");
        dom.newsletterForm = document.getElementById("newsletter-form");
        dom.newsletterMessage = document.getElementById("newsletter-message");
    };

    // ---------- Helpers ----------

    const escapeHTML = (str = "") =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const formatPrice = (value) => {
        if (typeof value !== "number") return "—";
        return "₹" + value.toLocaleString("en-IN");
    };

    const renderStars = (rating = 0) => {
        const full = Math.floor(rating);
        const empty = 5 - full;
        return "★".repeat(full) + "☆".repeat(empty);
    };

    const showError = (container, message = "We couldn't load this section right now. Please try again later.") => {
        if (!container) return;
        container.innerHTML = `<p class="error-state">${escapeHTML(message)}</p>`;
    };

    const showLoading = (container) => {
        if (!container) return;
        container.innerHTML = `<p class="loading">Loading…</p>`;
    };

    // ---------- Featured Destinations ----------

    const renderFeaturedDestinations = (destinations) => {
        if (!dom.destinationsGrid) return;

        if (!Array.isArray(destinations) || destinations.length === 0) {
            dom.destinationsGrid.innerHTML = `<p class="empty-state">No destinations to show right now.</p>`;
            return;
        }

        const featured = destinations.slice(0, FEATURED_DESTINATIONS_LIMIT);

        const cards = featured.map((dest) => {
            const name = escapeHTML(dest.name || "Untitled");
            const location = escapeHTML(dest.location || dest.country || "");
            const country = escapeHTML(dest.country || "");
            const description = escapeHTML(dest.description || "");
            const image = escapeHTML(dest.image || "assets/images/destinations/placeholder.jpg");
            const category = escapeHTML(dest.category || "Travel");
            const rating = typeof dest.rating === "number" ? dest.rating.toFixed(1) : "—";

            return `
                <article class="card destination-card">
                    <div class="card-image">
                        <img src="${image}" alt="${name}, ${country}" loading="lazy">
                        <span class="card-badge">${category}</span>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${name}</h3>
                        <p class="card-location">
                            <img src="assets/icons/location.svg" alt="" aria-hidden="true">
                            <span>${location}</span>
                        </p>
                        <p class="card-description">${description}</p>
                        <div class="card-meta">
                            <div class="card-price">
                                <span class="card-price-label">Starting from</span>
                                <span class="card-price-value">${rating} ★</span>
                            </div>
                            <a href="destinations.html#${escapeHTML(dest.id || "")}" class="card-link">Explore →</a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        dom.destinationsGrid.innerHTML = cards;
    };

    const fetchDestinations = async () => {
        showLoading(dom.destinationsGrid);
        const data = await ChaloChale.fetchJSON("data/destinations.json");
        if (!data) {
            showError(dom.destinationsGrid);
            return [];
        }
        return Array.isArray(data) ? data : [];
    };

    // ---------- Popular Packages ----------

    const renderPopularPackages = (packages) => {
        if (!dom.packagesGrid) return;

        if (!Array.isArray(packages) || packages.length === 0) {
            dom.packagesGrid.innerHTML = `<p class="empty-state">No packages to show right now.</p>`;
            return;
        }

        const popular = packages.slice(0, POPULAR_PACKAGES_LIMIT);

        const cards = popular.map((pkg) => {
            const title = escapeHTML(pkg.title || "Untitled Package");
            const destination = escapeHTML(pkg.destination || "");
            const image = escapeHTML(pkg.image || "assets/images/packages/placeholder.jpg");
            const duration = escapeHTML(pkg.duration || "");
            const description = escapeHTML(pkg.description || "");
            const price = formatPrice(pkg.price);
            const rating = typeof pkg.rating === "number" ? pkg.rating : 0;
            const reviewCount = pkg.reviewCount || 0;
            const category = escapeHTML(pkg.category || "Tour");
            const id = escapeHTML(pkg.id || "");

            return `
                <article class="card package-card">
                    <div class="card-image">
                        <img src="${image}" alt="${title}" loading="lazy">
                        <span class="card-badge">${category}</span>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-location">
                            <img src="assets/icons/location.svg" alt="" aria-hidden="true">
                            <span>${destination}</span>
                        </p>
                        <p class="card-description">${description}</p>
                        <div class="card-meta">
                            <div class="card-price">
                                <span class="card-price-label">${duration}</span>
                                <span class="card-price-value">${price}</span>
                            </div>
                            <div class="card-rating" aria-label="Rating: ${rating} out of 5">
                                <span aria-hidden="true">${renderStars(rating)}</span>
                                <span class="sr-only">${rating} out of 5</span>
                                <small>(${reviewCount})</small>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="packages.html#${id}" class="btn btn-primary card-link">Explore Packages</a>
                    </div>
                </article>
            `;
        }).join("");

        dom.packagesGrid.innerHTML = cards;
    };

    const fetchPackages = async () => {
        showLoading(dom.packagesGrid);
        const data = await ChaloChale.fetchJSON("data/packages.json");
        if (!data) {
            showError(dom.packagesGrid);
            return [];
        }
        return Array.isArray(data) ? data : [];
    };

    // ---------- Testimonials Carousel ----------

    let testimonialsData = [];
    let currentSlide = 0;

    const renderTestimonials = (testimonials) => {
        if (!dom.testimonialsCarousel) return;

        if (!Array.isArray(testimonials) || testimonials.length === 0) {
            dom.testimonialsCarousel.innerHTML = `<p class="empty-state">No testimonials to show right now.</p>`;
            if (dom.testimonialsControls) dom.testimonialsControls.innerHTML = "";
            return;
        }

        testimonialsData = testimonials;

        const cards = testimonials.map((t) => {
            const name = escapeHTML(t.name || "Traveler");
            const destination = escapeHTML(t.destination || "");
            const image = escapeHTML(t.image || "assets/images/team/placeholder.jpg");
            const review = escapeHTML(t.review || "");
            const rating = typeof t.rating === "number" ? t.rating : 5;

            return `
                <article class="testimonial-card">
                    <div class="testimonial-rating" aria-label="${rating} out of 5 stars">${renderStars(rating)}</div>
                    <p class="testimonial-quote">${review}</p>
                    <div class="testimonial-author">
                        <img src="${image}" alt="${name}" class="testimonial-photo" loading="lazy">
                        <div class="testimonial-info">
                            <h4>${name}</h4>
                            <p>Traveled to ${destination}</p>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        dom.testimonialsCarousel.innerHTML = `<div class="testimonials-track">${cards}</div>`;
        buildTestimonialControls();
        updateCarouselPosition();
    };

    const buildTestimonialControls = () => {
        if (!dom.testimonialsControls) return;

        const totalSlides = testimonialsData.length;

        let html = `
            <button class="carousel-btn" id="test-prev" aria-label="Previous testimonial">‹</button>
            <div class="carousel-dots" role="tablist">
        `;

        for (let i = 0; i < totalSlides; i++) {
            html += `<button class="carousel-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`;
        }

        html += `</div><button class="carousel-btn" id="test-next" aria-label="Next testimonial">›</button>`;

        dom.testimonialsControls.innerHTML = html;

        const prev = document.getElementById("test-prev");
        const next = document.getElementById("test-next");
        if (prev) prev.addEventListener("click", () => moveSlide(-1));
        if (next) next.addEventListener("click", () => moveSlide(1));

        dom.testimonialsControls.querySelectorAll(".carousel-dot").forEach((dot) => {
            dot.addEventListener("click", (e) => {
                currentSlide = parseInt(e.currentTarget.dataset.index, 10) || 0;
                updateCarouselPosition();
            });
        });
    };

    const moveSlide = (direction) => {
        const total = testimonialsData.length;
        if (total === 0) return;
        currentSlide = (currentSlide + direction + total) % total;
        updateCarouselPosition();
    };

    const updateCarouselPosition = () => {
        const track = dom.testimonialsCarousel?.querySelector(".testimonials-track");
        if (!track) return;

        const cardWidth = track.querySelector(".testimonial-card")?.offsetWidth || 0;
        const gap = parseInt(getComputedStyle(track).gap, 10) || 24;
        const offset = currentSlide * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        dom.testimonialsControls?.querySelectorAll(".carousel-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });
    };

    const fetchTestimonials = async () => {
        showLoading(dom.testimonialsCarousel);
        const data = await ChaloChale.fetchJSON("data/testimonials.json");
        if (!data) {
            showError(dom.testimonialsCarousel);
            return [];
        }
        return Array.isArray(data) ? data : [];
    };

    // ---------- Hero Search ----------

    const populateDestinationOptions = (destinations) => {
        if (!dom.searchDestination) return;
        const current = dom.searchDestination.value;
        const options = [`<option value="">Choose a destination</option>`];
        destinations.forEach((dest) => {
            const id = escapeHTML(dest.id || "");
            const name = escapeHTML(dest.name || "");
            options.push(`<option value="${id}">${name}</option>`);
        });
        dom.searchDestination.innerHTML = options.join("");
        if (current) dom.searchDestination.value = current;
    };

    const setupHeroSearch = () => {
        if (!dom.heroSearchForm) return;

        dom.heroSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const destination = dom.searchDestination?.value || "";
            const date = dom.heroSearchForm.querySelector("[name='date']")?.value || "";
            const travelers = dom.heroSearchForm.querySelector("[name='travelers']")?.value || "";

            if (!destination) {
                dom.searchDestination?.focus();
                dom.searchDestination?.setCustomValidity("Please choose a destination.");
                dom.searchDestination?.reportValidity();
                return;
            }
            dom.searchDestination.setCustomValidity("");

            const params = new URLSearchParams();
            params.set("destination", destination);
            if (date) params.set("date", date);
            if (travelers) params.set("travelers", travelers);

            window.location.href = `destinations.html?${params.toString()}`;
        });
    };

    // ---------- Newsletter ----------

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

    const setupNewsletter = () => {
        if (!dom.newsletterForm || !dom.newsletterMessage) return;

        const emailInput = dom.newsletterForm.querySelector("input[type='email']");

        dom.newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!emailInput) return;
            const email = emailInput.value.trim();

            dom.newsletterMessage.classList.remove("success", "error");
            dom.newsletterMessage.textContent = "";

            if (!email) {
                dom.newsletterMessage.classList.add("error");
                dom.newsletterMessage.textContent = "Please enter your email address.";
                emailInput.focus();
                return;
            }

            if (!isValidEmail(email)) {
                dom.newsletterMessage.classList.add("error");
                dom.newsletterMessage.textContent = "Please enter a valid email address.";
                emailInput.focus();
                return;
            }

            dom.newsletterMessage.classList.add("success");
            dom.newsletterMessage.textContent = `Thank you for subscribing, ${email}! Check your inbox soon.`;
            emailInput.value = "";
        });
    };

    // ---------- Init ----------

    const initHome = async () => {
        cacheDom();

        // Fetch all datasets in parallel
        const [destinations, packages, testimonials] = await Promise.all([
            fetchDestinations(),
            fetchPackages(),
            fetchTestimonials()
        ]);

        renderFeaturedDestinations(destinations);
        renderPopularPackages(packages);
        renderTestimonials(testimonials);

        populateDestinationOptions(destinations);

        setupHeroSearch();
        setupNewsletter();

        window.addEventListener("resize", () => {
            clearTimeout(window._chaloResizeTimer);
            window._chaloResizeTimer = setTimeout(updateCarouselPosition, 150);
        });
    };

    // Register with main.js
    if (typeof window.ChaloChaleRegister === "function") {
        window.ChaloChaleRegister("home", initHome);
    }
})();