/* =========================================================
   ChaloChale - about.js
   About Page-specific dynamic functionality.
   Loads data/team.json and renders team members into
   #team-grid. Handles loading, error and empty states.
   ========================================================= */

(() => {
    "use strict";

    // ---------- DOM References ----------
    const dom = {};

    const cacheDom = () => {
        dom.teamGrid = document.getElementById("team-grid");
    };

    // ---------- Helpers ----------

    const escapeHTML = (str = "") =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const isNonEmpty = (val) => typeof val === "string" && val.trim().length > 0;

    const showLoading = (container) => {
        if (!container) return;
        container.innerHTML = `<p class="loading">Loading team…</p>`;
    };

    const showError = (container, message = "We couldn't load our team right now. Please try again later.") => {
        if (!container) return;
        container.innerHTML = `<p class="error-state">${escapeHTML(message)}</p>`;
    };

    const showEmpty = (container) => {
        if (!container) return;
        container.innerHTML = `<p class="empty-state">No team members to show right now.</p>`;
    };

    // ---------- Social Links ----------

    const SOCIAL_META = {
        linkedin: { label: "LinkedIn", icon: "assets/icons/linkedin.svg" },
        twitter: { label: "Twitter", icon: "assets/icons/twitter.svg" },
        instagram: { label: "Instagram", icon: "assets/icons/instagram.svg" }
    };

    const createSocialLinks = (social = {}) => {
        const keys = Object.keys(SOCIAL_META);
        const items = keys
            .filter((key) => isNonEmpty(social[key]))
            .map((key) => {
                const meta = SOCIAL_META[key];
                const url = escapeHTML(social[key]);
                const label = `${meta.label} profile`;
                return `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label}">
                        <img src="${meta.icon}" alt="" aria-hidden="true">
                    </a>
                `;
            });

        if (items.length === 0) return "";
        return `<div class="team-social">${items.join("")}</div>`;
    };

    // ---------- Team Card ----------

    const createTeamCard = (member) => {
        const id = escapeHTML(member.id || "");
        const name = escapeHTML(member.name || "Team Member");
        const role = escapeHTML(member.role || "");
        const bio = escapeHTML(member.bio || "");
        const image = escapeHTML(member.image || "assets/images/team/placeholder.jpg");
        const socialHtml = createSocialLinks(member.social || {});

        return `
            <article class="team-card" data-team-id="${id}">
                <img src="${image}" alt="${name}, ${role}" class="team-photo" loading="lazy">
                <h3 class="team-name">${name}</h3>
                <p class="team-role">${role}</p>
                <p class="team-bio">${bio}</p>
                ${socialHtml}
            </article>
        `;
    };

    // ---------- Rendering ----------

    const renderTeam = (team) => {
        if (!dom.teamGrid) return;

        if (!Array.isArray(team) || team.length === 0) {
            showEmpty(dom.teamGrid);
            return;
        }

        const cards = team.map(createTeamCard).join("");
        dom.teamGrid.innerHTML = cards;
    };

    // ---------- Init ----------

    const initAboutPage = async () => {
        cacheDom();

        showLoading(dom.teamGrid);

        const data = await ChaloChale.fetchJSON("data/team.json");
        if (!data) {
            showError(dom.teamGrid);
            return;
        }

        renderTeam(data);
    };

    // Register with main.js
    if (typeof window.ChaloChaleRegister === "function") {
        window.ChaloChaleRegister("about", initAboutPage);
    }
})();
