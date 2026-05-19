const authState = {
    sessionKey: "joinSession",
};

/**
 * Function to open menu, header
*/
function openMenu() {
    let myDropdown = document.getElementById("myDropdown");
    if (!myDropdown) return;
    myDropdown.classList.toggle('d_none');
}

/**
 * Function to close menu, header
 */
function closeMenu() {
    let myDropdown = document.getElementById("myDropdown");
    if (!myDropdown) return;
    myDropdown.classList.add('d_none');
}

/**
 * Initializes auth for protected pages.
 */
function initProtectedPageAuth() {
    if (!hasActiveSession()) return redirectToLoginPage();
    applyHeaderProfileInitials();
}

/**
 * Reads the active session user.
 */
function getSessionUser() {
    const raw = localStorage.getItem(authState.sessionKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

/**
 * Stores the active session user.
 * @param {{id:string,name:string,email:string}} user
 */
function setSessionUser(user) {
    localStorage.setItem(authState.sessionKey, JSON.stringify(user || null));
}

/**
 * Clears active session storage.
 */
function clearSessionUser() {
    localStorage.removeItem(authState.sessionKey);
}

/**
 * Checks whether a valid session exists.
 */
function hasActiveSession() {
    const sessionUser = getSessionUser();
    return !!(sessionUser && sessionUser.name && sessionUser.email);
}

/**
 * Applies current user initials into header profile button.
 */
function applyHeaderProfileInitials() {
    const button = document.getElementById("myBtn");
    const sessionUser = getSessionUser();
    if (!button || !sessionUser) return;
    button.innerText = getSessionInitials(sessionUser);
}

/**
 * Resolves initials for current session user.
 * @param {{name:string,role?:string}} sessionUser
 */
function getSessionInitials(sessionUser) {
    if (sessionUser.role === "guest") return "G";
    return buildUserInitials(sessionUser.name);
}

/**
 * Builds initials from full name.
 * @param {string} name
 */
function buildUserInitials(name) {
    const parts = String(name || "").trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    const first = parts[0][0]?.toUpperCase() || "";
    const second = parts[1]?.[0]?.toUpperCase() || "";
    return (first + second).slice(0, 2) || "U";
}

/**
 * Returns the absolute URL path to the project root, regardless of
 * deployment subdirectory. Reads the real pathname at call time, so it
 * is always accurate — no hardcoded domain, no hardcoded subfolder name.
 *
 * Examples
 *   /pages/board.html                         → "/"
 *   /Join-Issue-Collector/pages/board.html    → "/Join-Issue-Collector/"
 *   /index.html                               → "/"
 *   /Join-Issue-Collector/index.html          → "/Join-Issue-Collector/"
 *
 * @returns {string} Absolute server path ending with "/".
 */
function getProjectRoot() {
    const path = window.location.pathname;
    const idx = path.lastIndexOf("/pages/");
    if (idx !== -1) return path.substring(0, idx + 1);
    return path.substring(0, path.lastIndexOf("/") + 1);
}

/**
 * Navigates to a path relative to the project root.
 * Works on Live Server (project at server root) and any deployed
 * subdirectory without hardcoding domain or folder names.
 *
 * @param {string} path Path relative to project root,
 *   e.g. "pages/stakeholder.html?view=welcome" or "index.html?mode=login"
 */
function navigateTo(path) {
    window.location.href = getProjectRoot() + path;
}

/**
 * Logs out current user and redirects to the stakeholder welcome screen.
 * @param {Event} event
 */
function logOutUser(event) {
    if (event) event.preventDefault();
    clearSessionUser();
    navigateTo("pages/stakeholder.html?view=welcome");
    return false;
}

/**
 * Redirects to the login page (used when an unauthenticated user tries
 * to access a protected page — bypasses the stakeholder screen).
 */
function redirectToLoginPage() {
    navigateTo("index.html?mode=login");
}

/**
 * Navigates one step back in browser history, with a fallback URL.
 * @param {string} fallbackUrl
 */
function goBackOrFallback(fallbackUrl) {
    if (window.history.length > 1) {
        window.history.back();
        return;
    }
    window.location.href = fallbackUrl || (getProjectRoot() + "index.html");
}