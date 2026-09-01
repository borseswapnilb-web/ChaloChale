/* =========================================================
   ChaloChale - packages.js
   Packages Page-specific dynamic functionality.
   Loads data/packages.json, renders cards, handles
   search, filters, empty state, and URL parameters.
   ========================================================= */

(() => {
    "use strict";

    // ---------- State ----------
    const state = {
        all: [],
        filtered: [],
        category: "all",
        duration: "all",
        budget: "all",
        rating: "all",
        query: ""
    };

    // ---------- DOM References ----------
    const dom = {};

    const cacheDom = () => {
        dom.searchForm = document.getElementById("packages-search");
        dom.searchInput = document.getElementById("package-search-input");
        dom.filtersBar = document.getElementById("packages-filters");
        dom.durationSelect = document.getElementById("filter-duration");
        dom.budgetSelect = document.getElementById("filter-budget");
        dom.ratingSelect = document.getElementById("filter-rating");
        dom.clearBtn = document.getElementById("packages-clear-filters");
        dom.resultsCount = document.getElementById("packages-results-count");
        dom.grid = document.getElementById("packages-grid");
        dom.emptyState = document.getElementById("packages-empty");
        dom.emptyClearBtn = document.getElementById("packages-empty-clear-filters");
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

    const showError = (container, message = "We couldn't load packages right now. Please try again later.") => {
        if (!container) return;
        container.innerHTML = `<p class="error-state">${escapeHTML(message)}</p>`;
    };

    const showLoading = (container) => {
        if (!container) return;
        container.innerHTML = `<p class="loading">Loading packages…</p>`;
    };

    // ---------- Rendering ----------

    const renderPackages = (packages) => {
        if (!dom.grid) return;

        if (!Array.isArray(packages) || packages.length === 0) {
            dom.grid.innerHTML = "";
            return;
        }

        const cards = packages.map((pkg) => {
            const title = escapeHTML(pkg.title || "Untitled Package");
            const destination = escapeHTML(pkg.destination || "");
            const country = escapeHTML(pkg.country || "");
            const image = escapeHTML(pkg.image || "assets/images/packages/placeholder.jpg");
            const duration = escapeHTML(pkg.duration || "");
            const description = escapeHTML(pkg.description || "");
            const price = formatPrice(pkg.price);
            const rating = typeof pkg.rating === "number" ? pkg.rating : 0;
            const reviewCount = pkg.reviewCount || 0;
            const category = escapeHTML(pkg.category || "Tour");
            const id = escapeHTML(pkg.id || "");

            // Features list (only if present in JSON)
            let featuresHtml = "";
            if (Array.isArray(pkg.features) && pkg.features.length > 0) {
                const items = pkg.features
                    .slice(0, 4)
                    .map((f) => `<li>${escapeHTML(f)}</li>`)
                    .join("");
                featuresHtml = `<ul class="package-features" role="list">${items}</ul>`;
            }

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
                            <span>${destination}${country ? ", " + country : ""}</span>
                        </p>
                        <p class="card-description">${description}</p>
                        ${featuresHtml}
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
                        <a href="#${id}" class="btn btn-primary card-link">Explore Packages</a>
                    </div>
                </article>
            `;
        }).join("");

        dom.grid.innerHTML = cards;
    };

    // ---------- Duration / Budget Logic ----------

    // Days bucket from package duration string "X Days / Y Nights"
    const getDaysFromDuration = (pkg) => {
        if (typeof pkg.duration !== "string") {
            return typeof pkg.nights === "number" ? pkg.nights + 1 : 0;
        }
        const match = pkg.duration.match(/(\d+)\s*days?/i);
        if (match) return parseInt(match[1], 10);
        if (typeof pkg.nights === "number") return pkg.nights + 1;
        return 0;
    };

    const matchesDurationBucket = (pkg, bucket) => {
        if (bucket === "all") return true;
        const days = getDaysFromDuration(pkg);
        if (bucket === "short") return days >= 1 && days <= 3;
        if (bucket === "medium") return days >= 4 && days <= 6;
        if (bucket === "long") return days >= 7;
        return true;
    };

    const matchesBudgetBucket = (pkg, bucket) => {
        if (bucket === "all") return true;
        const [minStr, maxStr] = bucket.split("-");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        const price = typeof pkg.price === "number" ? pkg.price : 0;
        return price >= min && price <= max;
    };

    // ---------- Filtering ----------

    const applyFilters = () => {
        const q = state.query.trim().toLowerCase();

        state.filtered = state.all.filter((pkg) => {
            // Category filter
            if (state.category !== "all" && pkg.category !== state.category) return false;

            // Duration filter
            if (!matchesDurationBucket(pkg, state.duration)) return false;

            // Budget filter
            if (!matchesBudgetBucket(pkg, state.budget)) return false;

            // Rating filter
            if (state.rating !== "all") {
                const threshold = parseFloat(state.rating);
                if (typeof pkg.rating !== "number" || pkg.rating < threshold) return false;
            }

            // Search query
            if (q) {
                const haystack = [
                    pkg.title || "",
                    pkg.destination || "",
                    pkg.country || "",
                    pkg.description || ""
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
            dom.resultsCount.textContent = `Showing all ${total} package${total === 1 ? "" : "s"}`;
        } else {
            dom.resultsCount.textContent = `Showing ${shown} of ${total} package${total === 1 ? "" : "s"}`;
        }
    };

    // ---------- UI State (Grid / Empty) ----------

    const updateUI = () => {
        const hasResults = state.filtered.length > 0;
        if (hasResults) {
            renderPackages(state.filtered);
            dom.grid?.removeAttribute("hidden");
            dom.emptyState?.setAttribute("hidden", "");
        } else {
            renderPackages([]);
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

    // ---------- Select Filters ----------

    const setupSelectFilters = () => {
        if (dom.durationSelect) {
            dom.durationSelect.addEventListener("change", (e) => {
                state.duration = e.target.value || "all";
                applyFilters();
            });
        }
        if (dom.budgetSelect) {
            dom.budgetSelect.addEventListener("change", (e) => {
                state.budget = e.target.value || "all";
                applyFilters();
            });
        }
        if (dom.ratingSelect) {
            dom.ratingSelect.addEventListener("change", (e) => {
                state.rating = e.target.value || "all";
                applyFilters();
            });
        }
        const categorySelect = document.getElementById("filter-category");
        if (categorySelect) {
            categorySelect.addEventListener("change", (e) => {
                state.category = e.target.value || "all";
                applyFilters();
            });
        }
    };

    // ---------- Clear Filters ----------

    const clearFilters = () => {
        state.category = "all";
        state.duration = "all";
        state.budget = "all";
        state.rating = "all";
        state.query = "";

        if (dom.searchInput) dom.searchInput.value = "";
        if (dom.durationSelect) dom.durationSelect.value = "all";
        if (dom.budgetSelect) dom.budgetSelect.value = "all";
        if (dom.ratingSelect) dom.ratingSelect.value = "all";
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
                (p) => p.id === destination || (p.destination || "").toLowerCase() === destination.toLowerCase()
            );
            dom.searchInput.value = match ? match.destination : destination;
            state.query = dom.searchInput.value;
        } else if (query) {
            dom.searchInput.value = query;
            state.query = query;
        }
    };

    // ---------- Init ----------

    const initPackages = async () => {
        cacheDom();

        showLoading(dom.grid);

        const data = await ChaloChale.fetchJSON("data/packages.json");
        if (!data) {
            showError(dom.grid);
            if (dom.emptyState) {
                dom.emptyState.removeAttribute("hidden");
                dom.grid?.setAttribute("hidden", "");
            }
            return;
        }

        state.all = Array.isArray(data) ? data : [];

        readURLParams();
        setupSearch();
        setupSelectFilters();
        setupClearButtons();

        applyFilters();
    };

    // Register with main.js
    if (typeof window.ChaloChaleRegister === "function") {
        window.ChaloChaleRegister("packages", initPackages);
    }
})();