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

/** localStorage key for the per-day click counter object. */
const SH_COUNTER_KEY = "joinStakeholderRequestCounter";

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
 * Structured so n8n/Gemini can reliably extract title, description,
 * category, priority, dueDate and subtasks. No technical tokens —
 * the request is identified exclusively via the subject prefix.
 */
const SH_REQUEST_BODY = [
    "Hi Join team,",
    "",
    "I would like to submit the following request:",
    "",
    "Request title:",
    "[Please enter a short title]",
    "",
    "Request description:",
    "[Please describe your request]",
    "",
    "Expected benefit:",
    "[Please describe the expected benefit]",
    "",
    "Due date:",
    "[Please enter a date, e.g. 2026-05-20, 20.05.2026, tomorrow, next Friday]",
    "",
    "Priority:",
    "[low / medium / urgent]",
    "",
    "Suggested subtasks (optional):",
    "- [Optional subtask 1]",
    "- [Optional subtask 2]",
    "- [Optional subtask 3]",
    "",
    "Best regards",
].join("\n");

// #endregion

// #region State

/**
 * In-memory counter for the current session.
 * Populated from Firebase on page load via loadTodayEmailRequestCount().
 * @type {number}
 */
let shRequestsUsedToday = 0;

// #endregion

// #region Firebase helpers

/**
 * Counts email requests processed today based on Firebase task data.
 * Falls back to 0 if Firebase is unreachable or returns unexpected data.
 *
 * @returns {Promise<number>}
 */
async function loadTodayEmailRequestCount() {
    try {
        const tasks = await loadTasks();
        if (!Array.isArray(tasks)) return 0;
        return tasks.filter(
            (t) => t.isEmailRequest === true && isTimestampToday(t.requestReceivedAt)
        ).length;
    } catch (_) {
        return 0;
    }
}

/**
 * Returns true if a unix timestamp (ms) falls on the current calendar day.
 *
 * @param {number|null} ts
 * @returns {boolean}
 */
function isTimestampToday(ts) {
    if (!ts) return false;
    const d = new Date(ts);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
}

// #endregion

// #region localStorage counter helpers

/**
 * Returns today's date as an ISO date string "YYYY-MM-DD".
 *
 * @returns {string}
 */
function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Reads today's click count from localStorage.
 * Returns 0 when no entry exists for the current day.
 *
 * @returns {number}
 */
function getLocalDailyCount() {
    try {
        const stored = JSON.parse(localStorage.getItem(SH_COUNTER_KEY) || "{}");
        return Number(stored[getTodayKey()]) || 0;
    } catch (_) {
        return 0;
    }
}

/**
 * Increments today's click count in localStorage and returns the updated value.
 *
 * @returns {number} The new count after incrementing.
 */
function incrementLocalDailyCount() {
    try {
        const stored = JSON.parse(localStorage.getItem(SH_COUNTER_KEY) || "{}");
        const key = getTodayKey();
        stored[key] = (Number(stored[key]) || 0) + 1;
        localStorage.setItem(SH_COUNTER_KEY, JSON.stringify(stored));
        return stored[key];
    } catch (_) {
        return 0;
    }
}

// #endregion

// #region Init

/**
 * Entry point — called via <body onload>.
 * Reads the ?view query param and renders the correct screen.
 */
async function initStakeholderPage() {
    const firebaseCount = await loadTodayEmailRequestCount();
    shRequestsUsedToday = Math.max(firebaseCount, getLocalDailyCount());
    const view = getViewParam();
    switch (view) {
        case "stakeholder":
            if (shRequestsUsedToday >= SH_DAILY_LIMIT) {
                renderLimitReachedScreen();
            } else {
                renderStakeholderScreen();
            }
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
 * Reloads today's count from Firebase and redirects to limit-reached
 * if the quota is already exhausted.
 */
async function showStakeholderScreen() {
    const firebaseCount = await loadTodayEmailRequestCount();
    shRequestsUsedToday = Math.max(firebaseCount, getLocalDailyCount());
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
 * Activates the stakeholder request screen and updates the counter badge.
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
 * Increments the localStorage counter immediately, updates the UI,
 * then opens the user's email client. Blocks the action when the
 * daily limit has already been reached.
 */
function submitEmailRequest() {
    const currentCount = getLocalDailyCount();
    if (currentCount >= SH_DAILY_LIMIT) {
        showLimitReachedScreen();
        return;
    }
    const newCount = incrementLocalDailyCount();
    shRequestsUsedToday = newCount;
    window.location.href = buildRequestMailtoHref();
    if (newCount >= SH_DAILY_LIMIT) {
        showLimitReachedScreen();
    } else {
        updateCounterBadge("shCounterText", newCount, SH_DAILY_LIMIT);
    }
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

/**
 * Applies or removes the visual disabled state on the CTA button.
 * Changes the button text to signal a reached limit and prevents further clicks.
 *
 * @param {number} count - Current daily click count.
 */
function applyCtaLimitState(count) {
    const btn = document.getElementById("shCtaBtn");
    if (!btn) return;
    const limitReached = count >= SH_DAILY_LIMIT;
    btn.disabled = limitReached;
    btn.classList.toggle("sh-cta-btn--disabled", limitReached);
    btn.textContent = limitReached ? "Daily limit reached" : "Create Email Request ✓";
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
