/* =========================================================
   ChaloChale - common.js
   Shared utilities and components used across all pages.
   ========================================================= */

const ChaloChale = (() => {
    "use strict";

    /* ---------- Helpers ---------- */

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const onReady = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    };

    /* ---------- Navigation ---------- */

    const NAV_ITEMS = [
        { label: "Home", href: "index.html", key: "home" },
        { label: "Destinations", href: "destinations.html", key: "destinations" },
        { label: "Packages", href: "packages.html", key: "packages" },
        { label: "About", href: "about.html", key: "about" },
        { label: "Contact", href: "contact.html", key: "contact" }
    ];

    const buildNavbar = (activeKey) => {
        const header = $("#site-header");
        if (!header) return;

        const linksHtml = NAV_ITEMS
            .map((item) => {
                const activeClass = item.key === activeKey ? " active" : "";
                return `<li><a href="${item.href}" class="navbar-link${activeClass}">${item.label}</a></li>`;
            })
            .join("");

        header.innerHTML = `
            <nav class="navbar" aria-label="Primary navigation">
                <a href="index.html" class="navbar-logo">
                    <img src="assets/logo/logo.png" alt="ChaloChale logo" onerror="this.style.display='none'">
                    <span>ChaloChale</span>
                </a>
                <button class="navbar-toggle" id="navbar-toggle" aria-expanded="false" aria-controls="navbar-menu" aria-label="Toggle navigation menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="navbar-menu" id="navbar-menu">
                    <ul class="navbar-links" role="list">
                        ${linksHtml}
                    </ul>
                    <div class="navbar-actions">
                        <a href="contact.html" class="btn btn-primary">Book Now</a>
                    </div>
                </div>
            </nav>
        `;
    };

    const initMobileMenu = () => {
        const toggle = $("#navbar-toggle");
        const menu = $("#navbar-menu");

        if (!toggle || !menu) return;

        toggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("open");
            toggle.classList.toggle("open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        $$(".navbar-menu .navbar-link").forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.remove("open");
                toggle.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", (event) => {
            if (!menu.classList.contains("open")) return;
            if (event.target.closest("#navbar-menu") || event.target.closest("#navbar-toggle")) return;
            menu.classList.remove("open");
            toggle.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    };

    /* ---------- Footer ---------- */

    const buildFooter = () => {
        const footer = $("#site-footer");
        if (!footer) return;

        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-grid">
                    <div class="footer-column footer-about">
                        <div class="footer-logo">
                            <img src="assets/logo/logo.png" alt="ChaloChale logo" onerror="this.style.display='none'">
                            <span>ChaloChale</span>
                        </div>
                        <p>Discover unforgettable journeys across breathtaking destinations. We craft personalized travel adventures that inspire and delight.</p>
                        <div class="footer-social">
                            <a href="#" aria-label="Visit our Facebook page"><img src="assets/icons/facebook.svg" alt=""></a>
                            <a href="#" aria-label="Visit our Instagram page"><img src="assets/icons/instagram.svg" alt=""></a>
                            <a href="#" aria-label="Visit our Twitter page"><img src="assets/icons/twitter.svg" alt=""></a>
                            <a href="#" aria-label="Visit our YouTube channel"><img src="assets/icons/youtube.svg" alt=""></a>
                        </div>
                    </div>
                    <div class="footer-column">
                        <h4>Quick Links</h4>
                        <ul class="footer-links" role="list">
                            <li><a href="index.html">Home</a></li>
                            <li><a href="destinations.html">Destinations</a></li>
                            <li><a href="packages.html">Packages</a></li>
                            <li><a href="about.html">About Us</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Support</h4>
                        <ul class="footer-links" role="list">
                            <li><a href="contact.html">Help Center</a></li>
                            <li><a href="contact.html">FAQs</a></li>
                            <li><a href="contact.html">Cancellation Policy</a></li>
                            <li><a href="contact.html">Privacy Policy</a></li>
                            <li><a href="contact.html">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Contact</h4>
                        <div class="footer-contact">
                            <div class="footer-contact-item">
                                <img src="assets/icons/location.svg" alt="" aria-hidden="true">
                                <span>123 Travel Street, Mumbai, India</span>
                            </div>
                            <div class="footer-contact-item">
                                <img src="assets/icons/phone.svg" alt="" aria-hidden="true">
                                <span>+91 98765 43210</span>
                            </div>
                            <div class="footer-contact-item">
                                <img src="assets/icons/email.svg" alt="" aria-hidden="true">
                                <span>hello@chalo chale.com</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>&copy; ${new Date().getFullYear()} ChaloChale. All rights reserved.</span>
                    <div class="footer-bottom-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>
        `;
    };

    /* ---------- Fetch Helper ---------- */

    const fetchJSON = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url} (${response.status})`);
            }
            return await response.json();
        } catch (error) {
            console.error("[ChaloChale] Fetch error:", error);
            return null;
        }
    };

    /* ---------- Public API ---------- */

    return {
        $,
        $$,
        onReady,
        buildNavbar,
        buildFooter,
        initMobileMenu,
        fetchJSON,
        init(activeKey = "home") {
            onReady(() => {
                buildNavbar(activeKey);
                buildFooter();
                initMobileMenu();
            });
        }
    };
})();