/* =========================================================
   ChaloChale - main.js
   Lightweight entry point. Coordinates shared initialization
   and dispatches page-specific modules.
   ========================================================= */

(() => {
    "use strict";

    // Map of page identifiers to page-specific init functions.
    // Each page-specific file (e.g. home.js) registers its init here.
    const pageInitializers = new Map();

    // Identify the current page based on the filename.
    const getCurrentPage = () => {
        const path = window.location.pathname.split("/").pop() || "index.html";
        if (path === "" || path === "index.html") return "home";
        return path.replace(".html", "");
    };

    // Register a page-specific initializer.
    const registerPage = (pageName, initFn) => {
        pageInitializers.set(pageName, initFn);
    };

    // Run when DOM is ready.
    document.addEventListener("DOMContentLoaded", () => {
        const currentPage = getCurrentPage();

        // Initialize shared layout (navbar + footer) using common.js.
        if (typeof ChaloChale !== "undefined" && ChaloChale.init) {
            ChaloChale.init(currentPage);
        }

        // Run the matching page-specific initializer if registered.
        const pageInit = pageInitializers.get(currentPage);
        if (typeof pageInit === "function") {
            pageInit();
        }
    });

    // Expose the registration helper so page-specific files can hook in.
    window.ChaloChaleRegister = registerPage;
})();