// auth.js - Supabase authentication integration (vanilla JS)
// Replace placeholders with your Supabase project credentials
// const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
// const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const SUPABASE_URL = 'https://tnhfdshmaugyoaccrkgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaGZkc2htYXVneW9hY2Nya2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTgyNjEsImV4cCI6MjA3ODUzNDI2MX0.dfNFVs-3rKsYwNvMuREBG3NwRwkJBNB2MH0kUg4VxfA';

// Initialize Supabase client
let supabaseClient = null;
const IS_FILE_ORIGIN = (typeof location !== 'undefined') && location.protocol === 'file:';
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} catch (e) {
    console.error('Supabase client init failed:', e);
}

// DOM refs
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const toLoginLink = document.getElementById('to-login');
const toSignupLink = document.getElementById('to-signup');
const authErrorDiv = document.getElementById('auth-error');
const protectedContent = document.getElementById('protected-content');
const authWrapper = document.getElementById('auth-wrapper');
const logoutBtn = document.getElementById('logout-btn');

function showAuthError(msg) {
    if (!authErrorDiv) return;
    authErrorDiv.innerHTML = msg;
    authErrorDiv.style.display = 'block';
}
function clearAuthError() {
    if (!authErrorDiv) return;
    authErrorDiv.textContent = '';
    authErrorDiv.style.display = 'none';
}

function switchToLogin() {
    signupForm.style.display = 'none';
    loginForm.style.display = 'grid';
    clearAuthError();
}
function switchToSignup() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'grid';
    clearAuthError();
}

if (toLoginLink) toLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchToLogin(); });
if (toSignupLink) toSignupLink.addEventListener('click', (e) => { e.preventDefault(); switchToSignup(); });

function failedToFetchHelp(operationLabel) {
    const localhost = 'http://localhost:5500';
    const devOrigin = IS_FILE_ORIGIN ? 'file:// (local file)' : location.origin;
    return `
        ${operationLabel} failed to reach Supabase (network/CORS).<br>
        Detected origin: <code>${devOrigin}</code>.<br>
        Tips:<br>
        • Do NOT open the HTML directly from the file system. Serve it over HTTP.<br>
        &nbsp;&nbsp;- Option A (VS Code): install Live Server extension and click "Go Live".<br>
        &nbsp;&nbsp;- Option B (Python): <code>python -m http.server 5500</code> and open <a href="${localhost}" target="_blank" rel="noopener">${localhost}</a><br>
        • In Supabase Dashboard → Authentication → URL Configuration:<br>
        &nbsp;&nbsp;- Set Site URL to your local URL (e.g., ${localhost})<br>
        &nbsp;&nbsp;- Add the same to Additional Redirect URLs (e.g., ${localhost}/* and http://127.0.0.1:5500/*)<br>
        • Double-check SUPABASE_URL and SUPABASE_ANON_KEY in <code>auth.js</code> are correct.
    `;
}

async function handleSignup(evt) {
    evt.preventDefault();
    clearAuthError();
    if (!supabaseClient) return showAuthError('Supabase not initialized.');
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!email || !password) return showAuthError('Email and password required.');
    try {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        // If email confirmation is enabled, user must confirm.
        if (data.user) {
            showAuthError('Signup successful. Check your email for confirmation if required.');
            switchToLogin();
        }
    } catch (err) {
        const msg = (err && err.message) ? err.message : 'Signup failed';
        if (/failed to fetch/i.test(msg)) {
            showAuthError(failedToFetchHelp('Signup'));
        } else {
            showAuthError(msg);
        }
    }
}

async function handleLogin(evt) {
    evt.preventDefault();
    clearAuthError();
    if (!supabaseClient) return showAuthError('Supabase not initialized.');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showAuthError('Email and password required.');
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
            renderAuthedState(data.session.user);
        }
    } catch (err) {
        const msg = (err && err.message) ? err.message : 'Login failed';
        if (/failed to fetch/i.test(msg)) {
            showAuthError(failedToFetchHelp('Login'));
        } else {
            showAuthError(msg);
        }
    }
}

async function handleLogout() {
    clearAuthError();
    if (!supabaseClient) return showAuthError('Supabase not initialized.');
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        renderLoggedOutState();
    } catch (err) {
        showAuthError(err.message || 'Logout failed');
    }
}

function renderAuthedState(user) {
    if (authWrapper) authWrapper.style.display = 'none';
    if (protectedContent) protectedContent.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    clearAuthError();
    // Optionally trigger initial weather/news load for a default location
    // fetchWeather('London'); // Example: remove or customize
}

function renderLoggedOutState() {
    if (authWrapper) authWrapper.style.display = 'block';
    if (protectedContent) protectedContent.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

async function checkSessionOnLoad() {
    if (!supabaseClient) return;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            renderAuthedState(session.user);
        } else {
            renderLoggedOutState();
        }
    } catch (e) {
        console.warn('Session check failed:', e);
        renderLoggedOutState();
    }
}

// Listen to auth state changes
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            renderAuthedState(session.user);
        } else if (event === 'SIGNED_OUT') {
            renderLoggedOutState();
        }
    });
}

// Attach form handlers
if (signupForm) signupForm.addEventListener('submit', handleSignup);
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// Initialize
window.addEventListener('load', checkSessionOnLoad);
// Proactive hint if opened from the file system
if (IS_FILE_ORIGIN) {
    showAuthError(failedToFetchHelp('Notice'));
}

// Expose the supabase client globally for other modules (e.g., history in app.js)
window.supabaseClient = supabaseClient;

// Export minimal API if needed elsewhere
window.AuthAPI = {
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    session: () => supabaseClient?.auth.getSession() || null
};
