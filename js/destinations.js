/* =========================================================
   ChaloChale - destinations.js
   Destinations Page-specific dynamic functionality.
   Loads data/destinations.json, renders cards, handles
   search, filters, empty state, and URL parameters.
   ========================================================= */

(() => {
    "use strict";

    // ---------- State ----------
    const state = {
        all: [],
        filtered: [],
        category: "all",
        rating: "all",
        country: "all",
        duration: "all",
        query: ""
    };

    // ---------- DOM References ----------
    const dom = {};

    const cacheDom = () => {
        dom.searchForm = document.getElementById("destinations-search");
        dom.searchInput = document.getElementById("destination-search-input");
        dom.filtersBar = document.getElementById("destinations-filters");
        dom.ratingSelect = document.getElementById("filter-rating");
        dom.durationSelect = document.getElementById("filter-duration");
        dom.countrySelect = document.getElementById("filter-country");
        dom.clearBtn = document.getElementById("filter-clear");
        dom.resultsCount = document.getElementById("destinations-results-count");
        dom.grid = document.getElementById("destinations-grid");
        dom.emptyState = document.getElementById("destinations-empty");
        dom.emptyClearBtn = document.getElementById("empty-clear-filters");
    };

    // ---------- Helpers ----------

    const escapeHTML = (str = "") =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const renderStars = (rating = 0) => {
        const full = Math.floor(rating);
        const empty = 5 - full;
        return "★".repeat(full) + "☆".repeat(empty);
    };

    const showError = (container, message = "We couldn't load destinations right now. Please try again later.") => {
        if (!container) return;
        container.innerHTML = `<p class="error-state">${escapeHTML(message)}</p>`;
    };

    const showLoading = (container) => {
        if (!container) return;
        container.innerHTML = `<p class="loading">Loading destinations…</p>`;
    };

    // ---------- Rendering ----------

    const renderDestinations = (destinations) => {
        if (!dom.grid) return;

        if (!Array.isArray(destinations) || destinations.length === 0) {
            dom.grid.innerHTML = "";
            return;
        }

        const cards = destinations.map((dest) => {
            const name = escapeHTML(dest.name || "Untitled");
            const country = escapeHTML(dest.country || "");
            const location = escapeHTML(dest.location || country);
            const description = escapeHTML(dest.description || "");
            const image = escapeHTML(dest.image || "assets/images/destinations/placeholder.jpg");
            const category = escapeHTML(dest.category || "Travel");
            const rating = typeof dest.rating === "number" ? dest.rating.toFixed(1) : "—";
            const id = escapeHTML(dest.id || "");

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
                                <span class="card-price-label">Rating</span>
                                <span class="card-price-value">${rating} ★</span>
                            </div>
                            <a href="packages.html?destination=${id}" class="card-link">Explore →</a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        dom.grid.innerHTML = cards;
    };

    // ---------- Populate Country Filter ----------

    const populateCountryFilter = () => {
        if (!dom.countrySelect) return;

        const countries = Array.from(new Set(
            state.all
                .map((d) => d.country)
                .filter(Boolean)
        )).sort();

        const options = [`<option value="all">All Countries</option>`];
        countries.forEach((c) => {
            options.push(`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`);
        });
        dom.countrySelect.innerHTML = options.join("");
    };

    // ---------- Duration Logic ----------

    const matchesDurationBucket = (dest, bucket) => {
        if (bucket === "all") return true;
        const days = typeof dest.duration === "number" ? dest.duration : 0;
        if (bucket === "short") return days >= 1 && days <= 3;
        if (bucket === "medium") return days >= 4 && days <= 7;
        if (bucket === "long") return days >= 8;
        return true;
    };

    // ---------- Filtering ----------

    const applyFilters = () => {
        const q = state.query.trim().toLowerCase();

        state.filtered = state.all.filter((dest) => {
            // Category filter
            if (state.category !== "all" && dest.category !== state.category) return false;

            // Country filter
            if (state.country !== "all" && dest.country !== state.country) return false;

            // Rating filter
            if (state.rating !== "all") {
                const threshold = parseFloat(state.rating);
                if (typeof dest.rating !== "number" || dest.rating < threshold) return false;
            }

            // Duration filter
            if (!matchesDurationBucket(dest, state.duration)) return false;

            // Search query
            if (q) {
                const haystack = [
                    dest.name || "",
                    dest.country || "",
                    dest.location || ""
                ].join(" ").toLowerCase();
                if (!haystack.includes(q)) return false;
            }

            return true;
        });

        updateResultsCount();
        updateUI();
    };

    // ---------- Results Count ----------

    const updateResultsCount = () => {
        if (!dom.resultsCount) return;
        const total = state.all.length;
        const shown = state.filtered.length;
        if (total === 0) {
            dom.resultsCount.textContent = "";
            return;
        }
        if (shown === total) {
            dom.resultsCount.textContent = `Showing all ${total} destination${total === 1 ? "" : "s"}`;
        } else {
            dom.resultsCount.textContent = `Showing ${shown} of ${total} destination${total === 1 ? "" : "s"}`;
        }
    };

    // ---------- UI State (Grid / Empty) ----------

    const updateUI = () => {
        const hasResults = state.filtered.length > 0;
        if (hasResults) {
            renderDestinations(state.filtered);
            dom.grid?.removeAttribute("hidden");
            dom.emptyState?.setAttribute("hidden", "");
        } else {
            renderDestinations([]);
            dom.grid?.setAttribute("hidden", "");
            dom.emptyState?.removeAttribute("hidden");
        }
    };

    // ---------- Search Form ----------

    const setupSearch = () => {
        if (!dom.searchForm) return;
        dom.searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.query = dom.searchInput ? dom.searchInput.value : "";
            applyFilters();
        });
    };

    // ---------- Category / Rating / Country ----------

    const setupSelectFilters = () => {
        const categorySelect = document.getElementById("filter-category");
        if (categorySelect) {
            categorySelect.addEventListener("change", (e) => {
                state.category = e.target.value || "all";
                applyFilters();
            });
        }
        if (dom.ratingSelect) {
            dom.ratingSelect.addEventListener("change", (e) => {
                state.rating = e.target.value || "all";
                applyFilters();
            });
        }
        if (dom.durationSelect) {
            dom.durationSelect.addEventListener("change", (e) => {
                state.duration = e.target.value || "all";
                applyFilters();
            });
        }
        if (dom.countrySelect) {
            dom.countrySelect.addEventListener("change", (e) => {
                state.country = e.target.value || "all";
                applyFilters();
            });
        }
    };

    // ---------- Clear Filters ----------

    const clearFilters = () => {
        state.category = "all";
        state.rating = "all";
        state.country = "all";
        state.duration = "all";
        state.query = "";

        if (dom.searchInput) dom.searchInput.value = "";
        if (dom.ratingSelect) dom.ratingSelect.value = "all";
        if (dom.durationSelect) dom.durationSelect.value = "all";
        if (dom.countrySelect) dom.countrySelect.value = "all";
        const categorySelect = document.getElementById("filter-category");
        if (categorySelect) categorySelect.value = "all";

        applyFilters();
    };

    const setupClearButtons = () => {
        if (dom.clearBtn) dom.clearBtn.addEventListener("click", clearFilters);
        if (dom.emptyClearBtn) dom.emptyClearBtn.addEventListener("click", clearFilters);
    };

    // ---------- URL Params ----------

    const readURLParams = () => {
        const params = new URLSearchParams(window.location.search);
        const destination = params.get("destination");
        const query = params.get("query");

        if (destination && dom.searchInput) {
            // Map id → name for nicer UX in search field
            const match = state.all.find(
                (d) => d.id === destination || (d.name || "").toLowerCase() === destination.toLowerCase()
            );
            dom.searchInput.value = match ? match.name : destination;
            state.query = dom.searchInput.value;
        } else if (query) {
            dom.searchInput.value = query;
            state.query = query;
        }
    };

    // ---------- Init ----------

    const initDestinations = async () => {
        cacheDom();

        showLoading(dom.grid);

        const data = await ChaloChale.fetchJSON("data/destinations.json");
        if (!data) {
            showError(dom.grid);
            if (dom.emptyState) {
                dom.emptyState.removeAttribute("hidden");
                dom.grid?.setAttribute("hidden", "");
            }
            return;
        }

        state.all = Array.isArray(data) ? data : [];

        populateCountryFilter();
        readURLParams();
        setupSearch();
        setupSelectFilters();
        setupClearButtons();

        applyFilters();
    };

    // Register with main.js
    if (typeof window.ChaloChaleRegister === "function") {
        window.ChaloChaleRegister("destinations", initDestinations);
    }
})();