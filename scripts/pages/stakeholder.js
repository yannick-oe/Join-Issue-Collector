// ─────────────────────────────────────────────────────────────────
// Stakeholder landing page — stakeholder.js
//
// State machine with three screens:
//   "welcome"       → #screenWelcome
//   "stakeholder"   → #screenStakeholder
//   "limit-reached" → #screenLimitReached
//
// The active screen is driven by the URL query param  ?view=<name>
// so the state survives refresh and is bookmarkable.
// ─────────────────────────────────────────────────────────────────

// #region Constants

/** Maximum number of automated requests allowed per day. */
const SH_DAILY_LIMIT = 10;

/**
 * Contact email address for all stakeholder email requests.
 */
const SH_TEAM_EMAIL = "oetelshoven.dev@gmail.com";

/**
 * Subject line shared by all stakeholder request emails.
 * The [JOIN-ISSUE-COLLECTOR] prefix is the stable n8n filter token.
 */
const SH_REQUEST_SUBJECT = "[JOIN-ISSUE-COLLECTOR] New Stakeholder Request";

/**
 * Pre-filled body template shown in the user's email client.
 * Machine-readable header lines let n8n identify and parse the request.
 */
const SH_REQUEST_BODY = [
    "JOIN_REQUEST_SOURCE: stakeholder-page",
    "JOIN_REQUEST_VERSION: 1",
    "",
    "Hi Join team,",
    "",
    "I would like to submit the following request:",
    "",
    "Request type:",
    "Short description:",
    "Expected benefit:",
    "Deadline, if any:",
    "",
    "Best regards",
].join("\n");

// #endregion

// #region State

/**
 * In-memory counter for the current session.
 * In production this would be loaded from Firebase / n8n.
 * @type {number}
 */
let shRequestsUsedToday = 0;

// #endregion

// #region Init

/**
 * Entry point — called via <body onload>.
 * Reads the ?view query param and renders the correct screen.
 */
function initStakeholderPage() {
    const view = getViewParam();
    switch (view) {
        case "stakeholder":
            renderStakeholderScreen();
            break;
        case "limit-reached":
            renderLimitReachedScreen();
            break;
        default:
            renderWelcomeScreen();
    }
}

// #endregion

// #region Navigation helpers

/**
 * Shows the welcome screen.
 */
function showWelcomeScreen() {
    setViewParam("welcome");
    renderWelcomeScreen();
}

/**
 * Shows the stakeholder request screen.
 * Redirects to limit-reached if the quota is already exhausted.
 */
function showStakeholderScreen() {
    if (shRequestsUsedToday >= SH_DAILY_LIMIT) {
        showLimitReachedScreen();
        return;
    }
    setViewParam("stakeholder");
    renderStakeholderScreen();
}

/**
 * Shows the limit-reached screen.
 */
function showLimitReachedScreen() {
    setViewParam("limit-reached");
    renderLimitReachedScreen();
}

/**
 * Navigates the user to the main Join member login page.
 * The "?mode=login" param tells index.html to show the login form
 * directly, skipping the stakeholder welcome redirect.
 */
function goToMemberLogin() {
    window.location.href = "../index.html?mode=login";
}

// #endregion

// #region Screen renderers

/**
 * Activates the welcome screen and hides all others.
 */
function renderWelcomeScreen() {
    setActiveScreen("screenWelcome");
}

/**
 * Activates the stakeholder request screen, updates the counter badge.
 */
function renderStakeholderScreen() {
    updateCounterBadge("shCounterText", shRequestsUsedToday, SH_DAILY_LIMIT);
    setActiveScreen("screenStakeholder");
}

/**
 * Activates the limit-reached screen.
 */
function renderLimitReachedScreen() {
    setActiveScreen("screenLimitReached");
}

// #endregion

// #region CTA handlers

/**
 * Builds a mailto: href using the centralised address, subject and body template.
 *
 * TODO: Replace mailto with n8n webhook request when direct submission is enabled.
 *
 * @returns {string} Fully encoded mailto: URL.
 */
function buildRequestMailtoHref() {
    const subject = encodeURIComponent(SH_REQUEST_SUBJECT);
    const body = encodeURIComponent(SH_REQUEST_BODY);
    return `mailto:${SH_TEAM_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Handles the "Create Email Request" CTA.
 * Opens the user's email client with the shared request template.
 * Counter increment is intentionally omitted — the real daily limit
 * is enforced by n8n after the email is received.
 */
function submitEmailRequest() {
    window.location.href = buildRequestMailtoHref();
}

/**
 * Handles the "Send an email" CTA on the limit-reached screen.
 * Uses the same centralised template as the primary CTA.
 */
function sendDirectEmail() {
    window.location.href = buildRequestMailtoHref();
}

// #endregion

// #region UI helpers

/**
 * Activates one screen by id and hides all others.
 * Uses the `.hidden` utility class from global.css.
 *
 * @param {string} activeId - The id of the screen element to show.
 */
function setActiveScreen(activeId) {
    const screens = document.querySelectorAll(".sh-screen");
    screens.forEach((screen) => {
        if (screen.id === activeId) {
            screen.classList.remove("hidden");
            screen.removeAttribute("aria-hidden");
        } else {
            screen.classList.add("hidden");
            screen.setAttribute("aria-hidden", "true");
        }
    });
    window.scrollTo({ top: 0, behavior: "instant" });
}

/**
 * Updates the text of a counter badge element.
 *
 * @param {string} elementId - ID of the <span> to update.
 * @param {number} used - Number of requests used.
 * @param {number} limit - Daily limit.
 */
function updateCounterBadge(elementId, used, limit) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = `${used} of ${limit} requests used today`;
}

// #endregion

// #region URL param helpers

/**
 * Reads the current `?view` query parameter.
 *
 * @returns {string} The view name, or empty string if absent.
 */
function getViewParam() {
    return new URLSearchParams(window.location.search).get("view") || "";
}

/**
 * Updates the `?view` query parameter in the URL without reloading.
 *
 * @param {string} view - The view name to set.
 */
function setViewParam(view) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    history.replaceState(null, "", url.toString());
}

// #endregion
