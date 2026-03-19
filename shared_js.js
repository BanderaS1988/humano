/* ============================================================
   HUMANO – shared.js (STRUKTURÁLT VERZIÓ)
   Mesterverzió 2026 – Minden egy helyen, áttekinthetően, hibátlanul
   ============================================================ */

/* ─── 1. KONFIGURÁCIÓ ÉS KONSTANSONK ────────────────────────────────── */
// Supabase, Stripe, globális konstansok, limit táblák

const SUPA_URL = 'https://vidlijysdhbfvvytuzcg.supabase.co';
const SUPA_ANON = 'sb_publishable_JSk64VmwL-YNTgF0sFgA0w_Qb4sC_so';

const STRIPE_PK = 'pk_live_51T7IZtQTawA03pKbix0qSdaZlqZe3Qv6OHaLPzDhb1mOCFLzXBw3nOmFZE25BK2gPJIxosVa5gVQdDDhMQ5ZEzIW00KukLGF5R';
const STRIPE_PRICES = {
    lite: 'price_1TBzrUQTawA03pKbwUvQ2LMR',
    pro: 'price_1TBzs6QTawA03pKbCcdLuyBR',
    institution: 'price_1TBzsfQTawA03pKbf0lJQuYk'
};

const PLAN_LIMITS = {
    free: 5,
    lite: 15,
    student: 15,
    pro: 50,
    premium: 50,
    institution: Infinity
};

const PLAN_LABELS = {
    free: 'Ingyenes',
    lite: 'Lite',
    student: 'Lite',
    pro: 'Alkotó / Pro',
    premium: 'Alkotó / Pro',
    institution: 'Intézményi'
};

const SOCIAL_PLATFORMS = [
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { id: 'twitter', label: 'X / Twitter', icon: '𝕏' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'reddit', label: 'Reddit', icon: '🤖' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'telegram', label: 'Telegram', icon: '✈️' },
    { id: 'pinterest', label: 'Pinterest', icon: '📌' },
    { id: 'mastodon', label: 'Mastodon', icon: '🐘' },
    { id: 'threads', label: 'Threads', icon: '🧵' },
    { id: 'copy', label: 'Link másolás', icon: '🔗' }
];

const ANTIBOT_WORDS = ['HUMANO', 'ALKOTAS', 'EMBERI', 'HITELES', 'IGAZOLT', 'KULONLEGES', 'KREATIV', 'EREDETI', 'VALODI', 'SZABAD', 'GONDOLAT', 'MUNKA'];

const FAQS = [
    { q: 'Mi az a HUMANO?', a: 'A HUMANO egy digitális szöveg-hitelesítési platform, amely biometrikus gépelési adatok, SHA-256 kriptográfia és Bitcoin blokklánc időbélyeg kombinációjával bizonyítja, hogy egy szöveg emberi kéz munkája.' },
    { q: 'Hogyan működik a biometrikus rögzítés?', a: 'A rendszer milliszekundumos pontossággal méri a billentyűleütések közti intervallumokat, a szüneteket, a javítási arányt, az ablakváltások számát.' },
    { q: 'Miért van tiltva a beillesztés (paste)?', a: 'Mert a HUMANO a keletkezést hitelesíti, nem a végeredményt.' },
    { q: 'Hogyan működik a QR kód mobilon?', a: 'A QR kód a https://humano-hu.vercel.app/verify/DOC-XXXX URL-t tartalmazza.' },
    { q: 'Mi az az OpenTimestamps (OTS)?', a: 'Az OpenTimestamps egy nyílt forráskódú protokoll, amely a dokumentum SHA-256 hash-ét a Bitcoin blokkláncba rögzíti.' },
    { q: 'Hogyan tölthetem le a PDF tanúsítványt?', a: 'A hitelesítés után megjelenő panelben kattints a "📄 PDF Tanúsítvány" gombra.' },
    { q: 'Biztonságban vannak az adataim?', a: 'A szövegek EU-s Supabase szervereken tárolódnak, GDPR-kompatibilis módon.' },
    { q: 'Mennyi ideig érvényes a hitelesítés?', a: 'Örökre. A Bitcoin blokklánc megmásíthatatlan.' }
];

const DRAFT_KEY_PREFIX = 'humano_draft_';
const DRAFT_INDEX_KEY = 'humano_drafts';

const FEATURE_LIST = [
    { id: 'mobile_app', label: '📱 Mobilalkalmazás (iOS / Android)', desc: 'Natív app a hitelesítéshez és ellenőrzéshez.' },
    { id: 'word_plugin', label: '📝 Microsoft Word / Google Docs plugin', desc: 'Közvetlenül a szövegszerkesztőből hitelesíts.' },
    { id: 'team_workspace', label: '👥 Csapat munkaterület', desc: 'Közös felület szerkesztőknek, tanároknak, céges csapatoknak.' },
    { id: 'ai_compare', label: '🤖 AI-összehasonlító mód', desc: 'Mutassa meg, mennyire különbözik a te ritmusod az AI-étól.' },
    { id: 'multilang', label: '🌍 Teljes angol / német felület', desc: 'Nemzetközi használathoz.' },
    { id: 'version_diff', label: '🔀 Verzió-összehasonlító (diff nézet)', desc: 'Két verzió közötti különbségek vizualizálva.' },
    { id: 'plagiarism_check', label: '🔍 Plágiumellenőrző integráció', desc: 'Automatikus ellenőrzés hitelesítés előtt.' },
    { id: 'school_panel', label: '🏫 Iskolai / intézményi panel', desc: 'Tanároknak: diákok beadott munkáinak áttekintése.' },
    { id: 'api_webhook', label: '🔗 Webhook / API értesítések', desc: 'Értesítés hitelesítéskor saját rendszeredbe.' },
    { id: 'dark_light', label: '☀️ Világos téma opció', desc: 'Váltható sötét / világos megjelenés.' }
];

/* ─── 2. SEGÉDFÜGGVÉNYEK (PURE UTILS) ────────────────────────────────── */
// formázás, idő, másolás, toast, esc, stb. – semmi DOM vagy async

function getPlanLabel(plan) {
    return PLAN_LABELS[plan] || 'Ingyenes';
}

function getPlanMonthlyLimit(plan) {
    return PLAN_LIMITS[plan] ?? 5;
}

function isPlanUnlimited(plan) {
    return plan === 'pro' || plan === 'institution' || plan === 'premium';
}

function fmtDate(iso) {
    if (!iso) return '–';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '–';
        return d.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '–';
    }
}

function esc(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function timeSince(timestamp) {
    const sec = Math.floor((Date.now() - timestamp) / 1000);
    if (sec < 60) return sec + ' mp';
    if (sec < 3600) return Math.floor(sec / 60) + ' perc';
    if (sec < 86400) return Math.floor(sec / 3600) + ' óra';
    return Math.floor(sec / 86400) + ' nap';
}

function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

function showToast(msg) {
    const t = document.getElementById('humano-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._to);
    t._to = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function getHumanoBadge(pct) {
    if (pct >= 90) return { label: 'Platina', color: '#a8d8ea', icon: '💎' };
    if (pct >= 70) return { label: 'Arany', color: '#c9a84c', icon: '🥇' };
    if (pct >= 50) return { label: 'Ezüst', color: '#9e9e9e', icon: '🥈' };
    return { label: 'Bronz', color: '#cd7f32', icon: '🥉' };
}

function getBadgeHtml(docId) {
    const url = `https://humano-hu.vercel.app/verify/${docId}`;
    return `<a href="${url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:8px;background:rgba(6,6,8,.95);border:1.5px solid #c9a84c;font-family:Georgia,serif;font-size:12px;color:#c9a84c;text-decoration:none;">✦ <span><strong style="display:block;font-size:11px;letter-spacing:.5px">HUMANO HITELESÍTETT</strong><span style="display:block;font-size:9px;color:#8a6a20;letter-spacing:.3px">${docId}</span></span></a>`;
}

function timelapseFmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToUint8Array(hex) {
    if (hex.length % 2 !== 0) throw new Error('Érvénytelen hex string');
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return arr;
}

function uint8ArrayToBase64(arr) {
    let bin = '';
    for (const b of arr) bin += String.fromCharCode(b);
    return btoa(bin);
}

function base64ToUint8Array(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
}

function base64ToBlob(b64, mimeType) {
    return new Blob([base64ToUint8Array(b64)], { type: mimeType });
}

function generateQR(containerId, docId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const url = `https://humano-hu.vercel.app/verify/${docId}`;
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&color=C9A84C&bgcolor=FFFFFF&margin=8&format=png`;
    img.alt = `QR kód – ${docId}`;
    img.style.cssText = 'border-radius:8px;max-width:140px;width:100%;display:block;margin:0 auto';
    img.onerror = () => {
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '/verify/' + docId)}&color=C9A84C&bgcolor=FFFFFF&margin=8`;
    };
    container.appendChild(img);
}

function trackEvent(eventType, meta = {}) {
    if (!window.db) return;
    db.from('analytics_events').insert({
        event_type: eventType,
        user_id: currentUser?.id || null,
        meta: meta,
        created_at: new Date().toISOString()
    }).catch(() => {});
}

function acceptGdpr() {
    localStorage.setItem('humano_gdpr', '1');
    const bar = document.getElementById('gdpr-bar');
    if (bar) bar.style.display = 'none';
}

function setLang(l) {
    showToast(`Nyelv: ${l.toUpperCase()} – hamarosan elérhető!`);
}

/* ─── 3. GLOBÁLIS ÁLLAPOT (E objektum + változók) ───────────────────── */
let currentUser = null;
let allUserDocs = [];
let myDocsAll = [];
let antiBotPassed = false;
let antiBotPending = false;
let antiBotExpectedWord = '';
let antiBotCheckCount = 0;

let typedChars = 0;
let pastedChars = 0;
let inactivityTimer = null;
let pasteEvents = [];
let pasteAllowed = false;
let pendingPasteText = '';
let pendingPasteHtml = '';

let autosaveTimer = null;
let lastSavedContent = '';
let lastSavedTitle = '';

let timelapseEvents = [];
let timelapseFrameIdx = 0;
let timelapsePlaying = false;
let timelapseRafId = null;
let timelapseLastRafTime = null;
let timelapseAccumMs = 0;
let timelapseTotalDurMs = 0;
const _tlTextCache = { idx: -1, text: '' };

let fvCounts = {};
let fvVoted = JSON.parse(localStorage.getItem('humano_fv_voted') || '{}');

const E = {
    // Események és számlálók
    events: [],
    keys: 0,
    dels: 0,
    pauses: 0,
    focusSwitches: 0,
    warns: 0,
    repeatKeys: 0,
    
    // Időbélyegek
    sessionStart: null,
    lastKey: null,
    
    // Dokumentum adatok
    certDocId: null,
    certTitle: null,
    certHash: null,
    tempDocId: null,
    
    // Grafikon
    pulseHistory: [],
    timerInterval: null,
    
    // Timelapse batch
    tlBatch: [],
    tlFlushTimer: null,
    
    // Triple-Lock pontszámok
    humanCategory: null,
    humanCV: 0,
    humanPct: 0,
    cfDnaScore: 0,
    boundaryPauses: 0,
    midWordPauses: 0,
    nlsCorrelation: 0,
    flowPulseScore: 0,
    microDriftIndex: 0,
    biologicalEntropy: 0,
    smdScore: 0,
    tripleLockScore: 0,
    sampleWeight: 1,
    confidence: 0,
    confidenceLabel: '',
    explanation: '',
    scoreHistory: [],
    lastScoreTime: null,
    crossValidFlag: false,
    crossValidWarning: '',
    
    // Baseline
    baselineScore: 0,
    baselineDeviation: 0,
    baselineProfiles: 0,
    
    // Entrópia
    entropyCV: 0,
    entropyPct: 0,
    
    // Anti-spoof
    antiSpoof: {
        suspiciousPatterns: 0,
        lastIntervals: [],
        roboticSequences: 0,
        tooFastCount: 0,
        suspiciousFlag: false,
        suspiciousReason: ''
    },
    
    // Session
    sessionBreaks: 0
};

/* ─── 4. SUPABASE ÉS AUTH ──────────────────────────────────────────── */
// db init, login, register, logout, profile, delete account

const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_ANON);

async function getProfileName(user) {
    if (!user) return '–';
    const { data } = await db.from('profiles').select('username').eq('id', user.id).single();
    return data?.username || user.email || '–';
}

async function checkAdminAccess() {
    if (!currentUser) return;
    const { data } = await db.from('profiles').select('is_admin').eq('id', currentUser.id).single();
    const al = document.getElementById('admin-nav-link');
    if (al) al.style.display = data?.is_admin ? 'inline' : 'none';
}

function authAlert(msg, type = 'error') {
    const el = document.getElementById('auth-alert');
    if (el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

function switchAuthTab(t) {
    const login = document.getElementById('auth-login');
    const reg = document.getElementById('auth-reg');
    const btnL = document.getElementById('tab-login-btn');
    const btnR = document.getElementById('tab-reg-btn');
    if (login) login.style.display = t === 'login' ? 'block' : 'none';
    if (reg) reg.style.display = t === 'register' ? 'block' : 'none';
    if (btnL) btnL.className = 'tab-btn' + (t === 'login' ? ' active' : '');
    if (btnR) btnR.className = 'tab-btn' + (t === 'register' ? ' active' : '');
    const al = document.getElementById('auth-alert');
    if (al) al.innerHTML = '';
}

function updateIdPreview() {
    const u = document.getElementById('r-user')?.value.trim() || '';
    const el = document.getElementById('id-preview');
    if (el) {
        el.textContent = u.length >= 2
            ? `HMN-${u.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
            : '–';
    }
}

async function doRegister() {
    if (!document.getElementById('r-consent').checked) {
        return authAlert('❌ Az adatkezelési tájékoztató elfogadása kötelező.');
    }
    
    const username = document.getElementById('r-user')?.value.trim();
    const email = document.getElementById('r-email')?.value.trim();
    const pass = document.getElementById('r-pass')?.value;
    const pass2 = document.getElementById('r-pass2')?.value;
    const teacherCode = document.getElementById('r-teacher-code')?.value.trim().toUpperCase();

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return authAlert('Felhasználónév: 3–30 karakter (betű, szám, _)');
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return authAlert('Érvényes email cím szükséges.');
    }
    if (pass.length < 8) {
        return authAlert('Jelszó minimum 8 karakter.');
    }
    if (pass !== pass2) {
        return authAlert('A két jelszó nem egyezik.');
    }

    if (teacherCode) {
        const { data: codeData, error: codeError } = await db
            .from('teacher_codes')
            .select('id')
            .eq('code', teacherCode)
            .is('used_by', null)
            .single();

        if (codeError || !codeData) {
            return authAlert('❌ Érvénytelen vagy már felhasznált tanári kód.');
        }
    }

    authAlert('⏳ Regisztráció...', 'info');

    const { data, error } = await db.auth.signUp({
        email,
        password: pass,
        options: { data: { username } }
    });

    if (error) return authAlert(error.message);

    if (data.user) {
        const ts = Date.now().toString(36).toUpperCase();
        const humanoId = `HMN-${username.substring(0, 4).toUpperCase()}-${ts}`;
        const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        let role = 'user';
        if (teacherCode) {
            role = 'teacher';
            await db
                .from('teacher_codes')
                .update({
                    used_by: data.user.id,
                    used_at: new Date().toISOString()
                })
                .eq('code', teacherCode);
        }

        await db.from('profiles').upsert({
            id: data.user.id,
            username,
            humano_id: humanoId,
            role: role,
            plan: 'free',
            monthly_credits: 10,
            used_credits: 0,
            trial_ends_at: trialEndsAt,
            created_at: new Date().toISOString()
        });

        currentUser = data.user;
    }

    authAlert('✅ Sikeres regisztráció! Átirányítás...', 'success');

    if (teacherCode) {
        setTimeout(() => { window.location.href = '/teacher'; }, 1500);
    } else {
        setTimeout(() => showPage('dashboard'), 1500);
    }
}

async function doLogin() {
    const email = document.getElementById('l-email')?.value.trim();
    const pass = document.getElementById('l-pass')?.value;
    if (!email || !pass) return authAlert('Add meg az e-mailt és a jelszót.');

    authAlert('⏳ Belépés...', 'info');
    const { data, error } = await db.auth.signInWithPassword({ email, password: pass });
    if (error) return authAlert('Hibás e-mail vagy jelszó.');

    currentUser = data.user;
    await updateNavAuth(currentUser);
    authAlert('✅ Sikeres belépés!', 'success');
    setTimeout(() => showPage('dashboard'), 800);
    await db.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', data.user.id);
}

async function doLogout() {
    await db.auth.signOut();
    currentUser = null;
    updateNavAuth(null);
    showPage('landing');
}

async function cancelSubscription() {
    if (!currentUser) return showToast('❌ Be kell jelentkezni!');
    if (!confirm('Biztosan le szeretnéd mondani az előfizetésedet? A hitelesítési előzmények megmaradnak.')) return;
    
    try {
        const { error } = await db.from('profiles').update({
            plan: 'free',
            monthly_credits: getPlanMonthlyLimit('free'),
        }).eq('id', currentUser.id);
        
        if (error) throw error;
        showToast('✅ Előfizetés lemondva – ingyenes csomagra visszaállítva.');
        if (typeof loadProfile === 'function') loadProfile();
    } catch (err) {
        showToast('❌ Hiba: ' + (err.message || 'Ismeretlen hiba'));
    }
}

async function deleteAccount() {
    if (!currentUser) return showToast('❌ Be kell jelentkezni!');
    
    const confirm1 = confirm('Biztosan törölni szeretnéd a fiókodat? Ez visszafordíthatatlan.');
    if (!confirm1) return;
    
    const confirm2 = confirm('Utolsó megerősítés: a fiók és az összes adat véglegesen törlődik.\n\n⚠️ A Bitcoin blokkláncra már rögzített hash-ek örökre megmaradnak. Folytatod?');
    if (!confirm2) return;

    try {
        const { data: { session } } = await db.auth.getSession();
        const token = session?.access_token;
        if (!token) { showToast('❌ Munkamenet lejárt, jelentkezz be újra.'); return; }

        const res = await fetch(`${SUPA_URL}/functions/v1/delete-user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ismeretlen hiba');

        await db.auth.signOut();
        showToast('✅ Fiók törölve.');
        showPage('landing');
    } catch (err) {
        showToast('❌ Hiba: ' + (err.message || 'Ismeretlen hiba'));
    }
}

async function exportMyData() {
    if (!currentUser) return showToast('❌ Be kell jelentkezni!');
    showToast('⏳ Adatok összegyűjtése...');
    
    try {
        const [
            { data: profile },
            { data: docs },
            { data: typingProfile },
            { data: apiKeys }
        ] = await Promise.all([
            db.from('profiles').select('*').eq('id', currentUser.id).single(),
            db.from('documents').select('doc_id,title,hash,created_at,process_data,is_public,ots_receipt').eq('author_id', currentUser.id),
            db.from('typing_profiles').select('*').eq('user_id', currentUser.id),
            db.from('api_keys').select('id,name,created_at,expires_at').eq('user_id', currentUser.id)
        ]);

        const exportData = {
            export_date: new Date().toISOString(),
            humano_version: '2026',
            user: {
                email: currentUser.email,
                humano_id: profile?.humano_id,
                username: profile?.username,
                plan: profile?.plan,
                created_at: profile?.created_at,
                fullname: profile?.fullname,
                website: profile?.website,
                location: profile?.location,
                occupation: profile?.occupation,
                bio: profile?.bio,
            },
            documents: (docs || []).map(d => ({
                doc_id: d.doc_id,
                title: d.title,
                hash: d.hash,
                created_at: d.created_at,
                is_public: d.is_public,
                blockchain_confirmed: !!d.ots_receipt,
                biometrics: d.process_data || {},
            })),
            typing_profile: typingProfile || [],
            api_keys: (apiKeys || []).map(k => ({
                id: k.id,
                name: k.name,
                created_at: k.created_at,
                expires_at: k.expires_at,
            })),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HUMANO-export-${profile?.humano_id || 'data'}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ Adatok exportálva!');
    } catch (err) {
        showToast('❌ Hiba: ' + (err.message || 'Ismeretlen hiba'));
    }
}

/* ─── 5. NAVIGÁCIÓ ÉS UI ALAPOK ────────────────────────────────────── */
// showPage, hash kezelés, nav frissítés, hamburger

const AUTH_REQUIRED = ['editor', 'dashboard', 'my-docs', 'admin', 'profile'];

function showPage(page) {
    if (AUTH_REQUIRED.includes(page) && !currentUser) {
        _showSection('auth');
        return;
    }
    _showSection(page);
}

function _showSection(hash) {
    document.getElementById('nav-links')?.classList.remove('open');
    document.getElementById('hamburger-btn')?.classList.remove('open');
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    
    const el = document.getElementById('page-' + hash);
    if (el) {
        el.classList.add('active');
        window.scrollTo(0, 0);
        history.replaceState(null, '', '#' + hash);

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active-page');
            if (link.getAttribute('onclick')?.includes(`'${hash}'`)) {
                link.classList.add('active-page');
            }
        });

        _onSectionActivated(hash);
    }
}

function _onSectionActivated(hash) {
    if (hash === 'dashboard') loadDashboard();
    if (hash === 'admin') { loadAdmin(); if (typeof loadLivingEntityDashboard === 'function') loadLivingEntityDashboard(); }
    if (hash === 'landing') loadPublicStats();
    if (hash === 'calibration') calInit();
    if (hash === 'faq') renderFaq();
    if (hash === 'my-docs') loadMyDocs();
    if (hash === 'profile') loadProfile();
    if (hash === 'verify-unified') loadLatestRegistryUnified();
    if (hash === 'supporters') trackEvent('Subscription_Click', {});
    if (hash === 'roadmap') loadFeatureVotes();
    if (hash === 'publikaciok') loadPublikaciok();
    if (hash === 'editor') {
        setTimeout(() => {
            initPulseCanvas();
            checkDraftsOnEditorOpen();
            // NE hívjuk meg az editorInit-et itt, mert azt a startEditorFlow hívja
        }, 200);
    }
}

function _loadPageFromHash() {
    const validHashes = [
        'landing', 'auth', 'editor', 'dashboard', 'my-docs', 'admin',
        'profile', 'verify-unified', 'pub-verify', 'roadmap',
        'about', 'supporters', 'faq', 'privacy', 'publikaciok'
    ];
    const hash = window.location.hash.replace('#', '');
    _showSection(validHashes.includes(hash) ? hash : 'landing');
}

function navigateTo(page) { showPage(page); }

function toggleNav() {
    document.getElementById('nav-links')?.classList.toggle('open');
    document.getElementById('hamburger-btn')?.classList.toggle('open');
}

function requireAuth(page) {
    if (!currentUser) { 
        showPage('auth'); 
        return; 
    }
    showPage(page);
    if (page === 'editor') {
        // Kis késleltetéssel hívjuk, hogy a DOM biztosan betöltődjön
        setTimeout(() => startEditorFlow(), 100);
    }
}

async function updateNavAuth(user) {
    const nu = document.getElementById('nav-user');
    const nb = document.getElementById('nav-auth-btn');
    const nl = document.getElementById('nav-logout-btn');
    const al = document.getElementById('admin-nav-link');
    const tl = document.getElementById('teacher-nav-link');

    if (user) {
        const name = await getProfileName(user);
        if (nu) { nu.textContent = name; nu.style.display = 'inline'; }
        if (nb) nb.style.display = 'none';
        if (nl) nl.style.display = 'inline-flex';

        const { data: profile } = await db
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'teacher' && tl) {
            tl.style.display = 'inline';
        }

        checkAdminAccess();
        if (typeof checkCalibrationAge === 'function') checkCalibrationAge();

    } else {
        if (nu) nu.style.display = 'none';
        if (nb) nb.style.display = 'inline-flex';
        if (nl) nl.style.display = 'none';
        if (al) al.style.display = 'none';
        if (tl) tl.style.display = 'none';
    }

    updateHeroCta(user);
}

function updateHeroCta(user) {
    const guest = document.getElementById('hero-actions');
    const loggedin = document.getElementById('hero-actions-loggedin');
    if (!guest || !loggedin) return;
    if (user) {
        guest.style.display = 'none';
        loggedin.style.display = 'flex';
    } else {
        guest.style.display = 'flex';
        loggedin.style.display = 'none';
    }
}

/* ─── 6. KALIBRÁCIÓ ÉS CONSENT KEZELÉS ─────────────────────────────── */
// ConsentManager, kalibrációs modal, checkAndShowCalibrationReminder

function openEntropyInfo() {
    openInfoModal(
        '⚡ Ritmus-entrópia – Mi ez?',
        `<p style="line-height:1.8;margin-bottom:1rem">A ritmus-entrópia a gépelési intervallumok <strong style="color:var(--gold)">változatosságát</strong> méri.</p>
        <ul style="line-height:2;margin-left:1.25rem;color:var(--muted);font-size:.88rem">
            <li><strong style="color:var(--text)">Alacsony entrópia</strong> – egyenletes, gépies ritmus → AI-ra utal</li>
            <li><strong style="color:var(--text)">Közepes entrópia</strong> – vegyes ritmus, emberi jellegű</li>
            <li><strong style="color:var(--text)">Magas entrópia</strong> – változatos, természetes emberi ritmus ✓</li>
        </ul>
        <p style="font-size:.82rem;color:var(--muted);margin-top:1rem">Az emberi agy gondolkodás közben természetesen változtatja a gépelési sebességet – ez mérhető és hamisíthatatlan.</p>`
    );
}

function openTripleLockInfo() {
    openInfoModal(
        '💎 Triple-Lock Kognitív Jelenlét – Mi ez?',
        `<p style="line-height:1.8;margin-bottom:1rem">Három független algoritmus méri párhuzamosan az emberi alkotás mélységét:</p>
        <ul style="line-height:2;margin-left:1.25rem;color:var(--muted);font-size:.88rem">
            <li><strong style="color:var(--gold)">🧠 CF-DNA – Gondolkodási szünetek</strong><br>
            Mondathatárokon (.!?,) természetes szüneteket tart-e az alkotó?</li>
            <li><strong style="color:var(--gold)">✍️ NLS – Alkotói hév</strong><br>
            A szókomplexitás és gépelési sebesség korrelációja – hosszabb szavaknál lassul-e?</li>
            <li><strong style="color:var(--gold)">🫀 SMD – Biológiai ritmus</strong><br>
            Mikroingadozások a billentyűleütések között – az emberi kéz természetes tremora.</li>
        </ul>
        <p style="font-size:.82rem;color:var(--muted);margin-top:1rem">A három mutató együttes értéke adja a végső Kognitív Jelenlét pontszámot.</p>`
    );
}

function openAppealDetail(appealId) {
    openInfoModal(
        '⚖️ Fellebbezés kezelése',
        `<div style="display:flex;flex-direction:column;gap:.75rem">
            <div class="form-group">
                <label class="form-label">Státusz módosítása</label>
                <select class="form-control" id="appeal-status-select">
                    <option value="pending">Folyamatban</option>
                    <option value="resolved">Megoldva</option>
                    <option value="rejected">Elutasítva</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Admin megjegyzés</label>
                <textarea class="form-control" id="appeal-admin-notes" style="min-height:80px" placeholder="Megjegyzés..."></textarea>
            </div>
            <button class="btn btn-gold" onclick="updateAppealStatus('${appealId}', document.getElementById('appeal-status-select').value, document.getElementById('appeal-admin-notes').value);closeInfoModal()">
                ✦ Mentés
            </button>
        </div>`
    );
}



const ConsentManager = {
    async hasActive(consentType = 'keystroke_dynamics') {
        if (!currentUser) return false;
        const { data, error } = await db
            .from('biometric_consents')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('consent_type', consentType)
            .is('revoked_at', null)
            .limit(1);
        return !error && data && data.length > 0;
    },

    async getCurrentVersion() {
        try {
            const { data, error } = await db
                .from('consent_versions')
                .select('version')
                .eq('is_current', true)
                .maybeSingle();
            if (error) throw error;
            return data?.version || '1.0';
        } catch {
            return '1.0';
        }
    },

    async record(consentType = 'keystroke_dynamics') {
        if (!currentUser) throw new Error('Nincs bejelentkezett felhasználó');
        const version = await this.getCurrentVersion();
        const already = await this.hasActive(consentType);
        if (already) return { already: true };

        const { data, error } = await db
            .from('biometric_consents')
            .insert({
                user_id: currentUser.id,
                consent_type: consentType,
                consent_version: version,
                granted_at: new Date().toISOString(),
                revoked_at: null,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async revoke(consentType = 'keystroke_dynamics', reason = null) {
        if (!currentUser) throw new Error('Nincs bejelentkezett felhasználó');

        const updateData = { revoked_at: new Date().toISOString() };
        if (reason !== null && reason !== undefined) {
            updateData.revoke_reason = reason;
        }

        const { error } = await db
            .from('biometric_consents')
            .update(updateData)
            .eq('user_id', currentUser.id)
            .eq('consent_type', consentType)
            .is('revoked_at', null);

        if (error) throw new Error(error.message);
        return { revoked: true };
    },

    async getAll() {
        if (!currentUser) return [];
        const { data } = await db
            .from('biometric_consents')
            .select('consent_type, consent_version, granted_at, revoked_at')
            .eq('user_id', currentUser.id)
            .order('granted_at', { ascending: false });
        return data || [];
    }
};

function showBiometricConsentModal() {
    const modal = document.getElementById('biometric-consent-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('open');
}

function hideBiometricConsentModal() {
    const modal = document.getElementById('biometric-consent-modal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

async function handleConsentDecline() {
    hideBiometricConsentModal();
    // Egyszerű alert a biztos megjelenítésért
    alert('❌ A hitelesítési funkció használatához el kell fogadnod a biometrikus adatok kezelését.');
    // Visszairányítjuk a főoldalra
    setTimeout(() => showPage('landing'), 500);
}

async function handleConsentAccept() {
    const btn = document.getElementById('consent-accept-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Rögzítés...';
    }

    try {
        await ConsentManager.record('keystroke_dynamics');
        hideBiometricConsentModal();
        alert('✅ Biometrikus beleegyezés elfogadva – most már hitelesíthetsz!');
        
        showPage('editor');
        
        const editorEl = document.getElementById('doc-content-area');
        if (editorEl && !editorEl.dataset.initialized) {
            editorInit();
            editorEl.dataset.initialized = 'true';
        }
        
        // Kalibrációs modal megjelenítése 1 másodperc után
        setTimeout(async () => {
            await checkAndShowCalibrationReminder();
        }, 1500);

    } catch (err) {
        console.error('❌ Consent rögzítési hiba:', err);
        alert('❌ Hiba: ' + err.message);
        if (btn) {
            btn.disabled = false;
            btn.textContent = '✦ Elfogadom';
        }
    }
}



async function loadConsentSettings() {
    const container = document.getElementById('consent-settings-container');
    if (!container || !currentUser) return;

    const consents = await ConsentManager.getAll();

    const labels = {
        keystroke_dynamics: 'Billentyűleütés-dinamika rögzítése',
        writing_profile: 'Kalibrációs profil',
        rhythm_analysis: 'Ritmus-variabilitás mérés',
    };

    if (consents.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:.85rem">Nincs rögzített beleegyezés.</p>';
        return;
    }

    container.innerHTML = consents.map(c => `
        <div style="display:flex;align-items:center;justify-content:space-between; padding:.75rem 1rem;background:var(--surface2); border-radius:var(--r-sm);margin-bottom:.5rem">
            <div>
                <div style="font-size:.85rem;font-weight:600;color:var(--text)">
                    ${labels[c.consent_type] || c.consent_type}
                </div>
                <div style="font-size:.72rem;color:var(--muted);font-family:var(--font-mono)">
                    ${c.revoked_at
                        ? '❌ Visszavonva: ' + new Date(c.revoked_at).toLocaleDateString('hu-HU')
                        : '✅ Aktív – ' + new Date(c.granted_at).toLocaleDateString('hu-HU') + ' óta'
                    } &nbsp;·&nbsp; Verzió: ${c.consent_version}
                </div>
            </div>
            ${!c.revoked_at ? `
                <button class="btn btn-outline btn-sm"
                        style="font-size:.72rem;border-color:rgba(224,85,85,.4);color:#e05555"
                        onclick="revokeConsent('${c.consent_type}')">
                    Visszavonás
                </button>` : `
                <button class="btn btn-outline btn-sm" style="font-size:.72rem"
                        onclick="reGrantConsent('${c.consent_type}')">
                    Újra elfogadás
                </button>`
            }
        </div>
    `).join('');

    const hasActiveKeystroke = consents.some(c => 
        c.consent_type === 'keystroke_dynamics' && !c.revoked_at
    );
    const warningEl = document.getElementById('consent-warning');
    if (warningEl) {
        warningEl.style.display = hasActiveKeystroke ? 'none' : 'block';
    }
}

async function revokeConsent(consentType) {
    const reason = prompt('Visszavonás oka (opcionális, Enter = kihagyás):');
    if (reason === null) return;

    if (!confirm(`Biztosan visszavonod a "${consentType}" beleegyezést?`)) return;

    try {
        await ConsentManager.revoke(consentType, reason || null);
        showToast('✅ Beleegyezés visszavonva');
        await loadConsentSettings();
    } catch (err) {
        showToast('❌ Hiba: ' + err.message);
    }
}

async function reGrantConsent(consentType) {
    try {
        await ConsentManager.record(consentType);
        showToast('✅ Beleegyezés újra rögzítve');
        await loadConsentSettings();
    } catch (err) {
        showToast('❌ Hiba: ' + err.message);
    }
}

// Kalibrációs változók
const CAL = {
    step1Events: [],
    step2Events: [],
    step1LastKey: null,
    step2LastKey: null,
    step1SessionStart: null,
    step2SessionStart: null,
};

function calInit() {
    const area1 = document.getElementById('cal-area-1');
    const area2 = document.getElementById('cal-area-2');
    if (!area1 || !area2) return;

    if (area1.dataset.calInited) return;
    area1.dataset.calInited = '1';

    [area1, area2].forEach(el => {
        el.addEventListener('paste', e => {
            e.preventDefault();
            showToast('📋 Kalibrációban beillesztés nem engedélyezett – kérlek gépeld be.');
        });
        el.addEventListener('drop', e => e.preventDefault());
    });

    area1.addEventListener('keydown', e => {
        if (!e.isTrusted || e.repeat) return;
        const now = Date.now();
        if (!CAL.step1SessionStart) CAL.step1SessionStart = now;
        if (e.key === 'Backspace') {
            CAL.step1Events.push({ type: 'delete', ts: now });
        } else if (e.key.length === 1) {
            const interval = CAL.step1LastKey ? now - CAL.step1LastKey : 150;
            CAL.step1Events.push({ type: 'key', ts: now, interval });
            CAL.step1LastKey = now;
        }
        calUpdate1();
    });

    area2.addEventListener('keydown', e => {
        if (!e.isTrusted || e.repeat) return;
        const now = Date.now();
        if (!CAL.step2SessionStart) CAL.step2SessionStart = now;
        if (e.key === 'Backspace') {
            CAL.step2Events.push({ type: 'delete', ts: now });
        } else if (e.key.length === 1) {
            const interval = CAL.step2LastKey ? now - CAL.step2LastKey : 150;
            CAL.step2Events.push({ type: 'key', ts: now, interval });
            CAL.step2LastKey = now;
        }
        calUpdate2();
    });
}

function calUpdate1() {
    const area = document.getElementById('cal-area-1');
    if (!area) return;
    const len = area.innerText.replace(/\n/g, '').length;
    const pct = Math.min(100, Math.round((len / 380) * 100));
    const charsEl = document.getElementById('cal-1-chars');
    const progressEl = document.getElementById('cal-1-progress');
    const btnEl = document.getElementById('cal-1-btn');
    if (charsEl) charsEl.textContent = len;
    if (progressEl) progressEl.style.width = pct + '%';
    if (btnEl) btnEl.disabled = len < 380 * 0.85;
}

function calUpdate2() {
    const area = document.getElementById('cal-area-2');
    if (!area) return;
    const words = area.innerText.trim().split(/\s+/).filter(Boolean).length;
    const wordsEl = document.getElementById('cal-2-words');
    const btnEl = document.getElementById('cal-2-btn');
    if (wordsEl) wordsEl.textContent = words;
    if (btnEl) btnEl.disabled = words < 40;
}

function calStep1Complete() {
    const ind1 = document.getElementById('cal-step-1-indicator');
    const ind2 = document.getElementById('cal-step-2-indicator');
    if (ind1) ind1.style.borderColor = 'var(--success)';
    if (ind2) {
        ind2.style.borderColor = 'var(--gold)';
        ind2.style.background = 'rgba(201,168,76,.06)';
    }
    document.getElementById('cal-step-1').style.display = 'none';
    document.getElementById('cal-step-2').style.display = 'block';
    document.getElementById('cal-area-2').focus();
    showToast('✅ Másolási minta rögzítve – most írj szabadon!');
}

function calExtractFeatures(events) {
    const keyEvents = events.filter(e => e.type === 'key');
    const deleteEvents = events.filter(e => e.type === 'delete');
    
    if (keyEvents.length < 5) {
        return { burstMean: 0, pauseVariance: 0, revisionRate: 0, rhythmEntropy: 0 };
    }
    
    const intervals = keyEvents.map(e => e.interval).filter(v => v && v > 0 && v < 10000);
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    let bursts = [], currentBurst = [];
    intervals.forEach(iv => {
        if (iv < 1500) {
            currentBurst.push(iv);
        } else {
            if (currentBurst.length > 0) {
                bursts.push(currentBurst.reduce((a, b) => a + b, 0));
                currentBurst = [];
            }
        }
    });
    if (currentBurst.length > 0) {
        bursts.push(currentBurst.reduce((a, b) => a + b, 0));
    }
    
    const burstMean = bursts.length ? bursts.reduce((a, b) => a + b, 0) / bursts.length : mean;
    const pauses = intervals.filter(v => v >= 1500);
    const pauseMean = pauses.length ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0;
    const pauseVariance = pauses.length
        ? pauses.reduce((s, v) => s + Math.pow(v - pauseMean, 2), 0) / pauses.length
        : 0;
    
    const revisionRate = deleteEvents.length / Math.max(1, keyEvents.length + deleteEvents.length);
    
    const buckets = {};
    intervals.forEach(v => {
        const b = Math.floor(v / 100) * 100;
        buckets[b] = (buckets[b] || 0) + 1;
    });
    const total = intervals.length;
    const rhythmEntropy = -Object.values(buckets).reduce((s, count) => {
        const p = count / total;
        return s + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    
    return { burstMean, pauseVariance, revisionRate, rhythmEntropy };
}

async function calStep2Complete() {
    const btn = document.getElementById('cal-2-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Mentés...'; }
    
    try {
        const transcriptionFeatures = calExtractFeatures(CAL.step1Events);
        const compositionFeatures = calExtractFeatures(CAL.step2Events);
        
        const rows = [
            {
                user_id: currentUser.id,
                profile_type: 'transcription',
                burst_mean: transcriptionFeatures.burstMean,
                pause_variance: transcriptionFeatures.pauseVariance,
                revision_rate: transcriptionFeatures.revisionRate,
                rhythm_entropy: transcriptionFeatures.rhythmEntropy,
                sample_count: CAL.step1Events.filter(e => e.type === 'key').length
            },
            {
                user_id: currentUser.id,
                profile_type: 'composition',
                burst_mean: compositionFeatures.burstMean,
                pause_variance: compositionFeatures.pauseVariance,
                revision_rate: compositionFeatures.revisionRate,
                rhythm_entropy: compositionFeatures.rhythmEntropy,
                sample_count: CAL.step2Events.filter(e => e.type === 'key').length
            }
        ];
        
        const { error } = await db.from('typing_profiles').upsert(rows, { onConflict: 'user_id,profile_type' });
        if (error) throw error;

        document.getElementById('cal-step-2').style.display = 'none';
        document.getElementById('cal-skip-wrap').style.display = 'none';
        document.getElementById('cal-result').style.display = 'block';
        
        document.getElementById('cal-result-entropy').textContent = compositionFeatures.rhythmEntropy.toFixed(2);
        document.getElementById('cal-result-burst').textContent = Math.round(compositionFeatures.burstMean) + ' ms';
        document.getElementById('cal-result-revision').textContent = (compositionFeatures.revisionRate * 100).toFixed(1) + '%';
        
        showToast('✦ Kalibrációs profil elmentve!');

        CAL.step1Events = [];
        CAL.step2Events = [];
        CAL.step1LastKey = null;
        CAL.step2LastKey = null;
        CAL.step1SessionStart = null;
        CAL.step2SessionStart = null;

    } catch (err) {
        console.error('Kalibráció mentési hiba:', err);
        if (btn) { btn.disabled = false; btn.textContent = '✦ Kalibráció befejezése'; }
        showToast('❌ Hiba a mentés közben – próbáld újra.');
    }
}

function calSkip() {
    showToast('👌 Kihagyva – bármikor elvégezheted a Dashboardon.');
    showPage('dashboard');
}

async function checkCalibrationAge() {
    if (!currentUser) return;
    const { data } = await db
        .from('typing_profiles')
        .select('created_at')
        .eq('user_id', currentUser.id)
        .limit(1);
    
    if (!data?.length) return;
    
    const ageMs = Date.now() - new Date(data[0].created_at);
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    if (ageDays > 30) {
        const go = confirm('📅 30+ napja kalibráltál – érdemes frissíteni a gépelési profilod a pontosabb tanúsítványokhoz. Elvégzed most?');
        if (go) showPage('calibration');
    }
}

async function checkAndShowCalibrationReminder() {
    const skipForever = localStorage.getItem('humano_cal_skip_forever');
    if (skipForever === '1') return;

    const lastSkip = localStorage.getItem('humano_cal_last_skip');
    if (lastSkip) {
        const elapsed = Date.now() - parseInt(lastSkip);
        if (elapsed < 2 * 60 * 1000) return; // 2 perc
    }

    if (!currentUser) return;

    const consentModal = document.getElementById('biometric-consent-modal');
    if (consentModal && (consentModal.classList.contains('open') || consentModal.style.display === 'flex')) return;

    const editorPage = document.getElementById('page-editor')?.classList.contains('active');
    if (!editorPage) return;

    try {
        const { data, error } = await db
            .from('typing_profiles')
            .select('id')
            .eq('user_id', currentUser.id)
            .limit(1);

        if (error) return;
        if (data && data.length > 0) return;

        const modal = document.getElementById('cal-reminder-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        modal.classList.add('open');
    } catch (e) {
        console.warn('checkAndShowCalibrationReminder hiba:', e);
    }
}




function goToCalibration() {
    const modal = document.getElementById('cal-reminder-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
    showToast('✦ Átirányítás a kalibrációs oldalra...');
    setTimeout(() => showPage('calibration'), 300);
}


function skipCalibrationReminder() {
    const checkbox = document.getElementById('cal-dont-show-again');
    if (checkbox && checkbox.checked) {
        localStorage.setItem('humano_cal_skip_forever', '1');
        showToast('✅ Kalibrációs emlékeztető kikapcsolva');
    } else {
        localStorage.setItem('humano_cal_last_skip', Date.now().toString());
        showToast('👌 Kihagyva – 2 perc múlva emlékeztetünk');
        // 2 perc múlva újra megmutatja
        setTimeout(() => {
            checkAndShowCalibrationReminder();
        }, 2 * 60 * 1000);
    }
    const modal = document.getElementById('cal-reminder-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
}


/* ─── 7. EDITOR ────────────────────────────────────────────────────── */
// editorInit, editorKeyDown, editorUpdateStats, timer, rhythm, humanIndex számítás

function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (E.sessionStart) {
            const modal = document.getElementById('inactivity-modal');
            if (modal) {
                modal.style.display = 'flex';
                // Számláló indítása
                let secs = 0;
                window._inactivityInterval = setInterval(() => {
                    secs++;
                    const m = Math.floor(secs / 60).toString().padStart(2, '0');
                    const s = (secs % 60).toString().padStart(2, '0');
                    const el = document.getElementById('inactivity-duration');
                    if (el) el.textContent = `${m}:${s}`;
                }, 1000);
            }
        }
    }, 2 * 60 * 1000); // 2 perc
}

function resumeFromInactivity() {
    const modal = document.getElementById('inactivity-modal');
    if (modal) modal.style.display = 'none';
    
    // Számláló leállítása
    if (window._inactivityInterval) {
        clearInterval(window._inactivityInterval);
        window._inactivityInterval = null;
    }
    
    // Ablakváltás növelése
    E.focusSwitches++;
    const sfEl = document.getElementById('s-focus');
    const sbfEl = document.getElementById('sidebar-focus');
    if (sfEl) sfEl.textContent = E.focusSwitches;
    if (sbfEl) sbfEl.textContent = E.focusSwitches;
    
    // Timer reset
    resetInactivityTimer();
    showToast('▶ Folytatás – jó írást!');
}

window.resumeFromInactivity = resumeFromInactivity;

function editorSetStatus(s) {
    const dot = document.getElementById('e-dot');
    const sdot = document.getElementById('sidebar-dot');
    const text = document.getElementById('e-status');
    
    [dot, sdot].forEach(d => {
        if (!d) return;
        d.className = 'status-dot';
        if (s === 'recording') d.classList.add('dot-recording');
        else if (s === 'saved') d.classList.add('dot-saved');
        else d.classList.add('dot-idle');
    });
    
    if (text) {
        text.textContent = s === 'recording' ? 'Rögzítés folyamatban' : s === 'saved' ? 'Hitelesítve & mentve' : 'Várakozás...';
    }
}

function editorUpdateStats() {
    const txt = document.getElementById('doc-content-area')?.innerText || '';
    const wc = txt.trim() ? txt.trim().split(/\s+/).length : 0;
    
    document.getElementById('s-chars') && (document.getElementById('s-chars').textContent = txt.length);
    document.getElementById('s-words') && (document.getElementById('s-words').textContent = wc);
    document.getElementById('s-keys') && (document.getElementById('s-keys').textContent = E.keys);
    document.getElementById('sidebar-keys') && (document.getElementById('sidebar-keys').textContent = E.keys);
    
    const secs = E.sessionStart ? (Date.now() - E.sessionStart) / 60000 : 0;
    document.getElementById('s-speed') && (document.getElementById('s-speed').textContent = secs > 0 ? Math.round(E.keys / secs) : '–');
    
    document.getElementById('s-dels') && (document.getElementById('s-dels').textContent = E.dels);
    document.getElementById('sidebar-dels') && (document.getElementById('sidebar-dels').textContent = E.dels);
    document.getElementById('s-pauses') && (document.getElementById('s-pauses').textContent = E.pauses);
    document.getElementById('sidebar-pauses') && (document.getElementById('sidebar-pauses').textContent = E.pauses);
    document.getElementById('s-focus') && (document.getElementById('s-focus').textContent = E.focusSwitches);
    document.getElementById('sidebar-focus') && (document.getElementById('sidebar-focus').textContent = E.focusSwitches);
}

function editorCheckSave() {
    const ta = (document.getElementById('doc-content-area')?.innerText || '').trim();
    const ti = (document.getElementById('doc-title-input')?.value || '').trim();
    const wc = ta.trim().split(/\s+/).filter(Boolean).length;
    
    const btn = document.getElementById('btn-save');
    if (btn) btn.disabled = !ta || !ti || E.keys < 30 || wc < 100;
    
    const warn = document.getElementById('e-word-warn');
    if (warn) {
        if (wc < 100 && ta) {
            document.getElementById('e-words-left').textContent = 100 - wc;
            warn.style.display = 'block';
        } else {
            warn.style.display = 'none';
        }
    }
}

function updateEditorTimer() {
    if (!E.sessionStart) return;
    const elapsed = Math.floor((Date.now() - E.sessionStart) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    const el = document.getElementById('sidebar-time');
    if (el) el.textContent = `${m}:${s}`;
}

function editorRhythm() {
    const recent = E.events.filter(ev => ev.type === 'key').slice(-30);
    if (recent.length < 20) return;
    
    const intervals = recent.slice(1).map((ev, i) => ev.ts - recent[i].ts).filter(v => v < 5000);
    if (!intervals.length) return;
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stddev = Math.sqrt(intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length);
    
    const rhythmVar = document.getElementById('rhythm-var');
    if (rhythmVar) rhythmVar.textContent = Math.round(stddev) + 'ms';
    
    if (stddev < 35 && mean < 150 && mean > 20) {
        E.warns++;
        if (E.warns >= 8) document.getElementById('e-rhythm-warn').style.display = 'flex';
    } else {
        E.warns = Math.max(0, E.warns - 1);
        if (E.warns < 8) document.getElementById('e-rhythm-warn').style.display = 'none';
    }
}

function getLongestPause() {
    const pauses = E.events.filter(e => e.type === 'pause');
    if (!pauses.length) return 0;
    return Math.round(Math.max(...pauses.map(p => p.duration || 0)) / 1000);
}

function updatePauseInsight() {
    const longest = getLongestPause();
    const el = document.getElementById('pause-insight');
    if (!el) return;
    if (longest >= 3) {
        el.style.display = 'block';
        el.textContent = `💭 Leghosszabb alkotói szünet: ${longest}mp — az AI soha nem gondolkodik.`;
    } else {
        el.style.display = 'none';
    }
}

function updatePasteRatio() {
    const total = typedChars + pastedChars;
    const bar = document.getElementById('paste-ratio-bar');
    if (!bar) return;

    if (total === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'block';
    const tPct = Math.round((typedChars / total) * 100);
    const pPct = 100 - tPct;

    const typedPctEl = document.getElementById('typed-pct');
    const pastedPctEl = document.getElementById('pasted-pct');
    const typedBarEl = document.getElementById('typed-bar');
    const pastedBarEl = document.getElementById('pasted-bar');

    if (typedPctEl) typedPctEl.textContent = tPct + '%';
    if (pastedPctEl) pastedPctEl.textContent = pPct + '%';
    if (typedBarEl) typedBarEl.style.width = tPct + '%';
    if (pastedBarEl) pastedBarEl.style.width = pPct + '%';
}

function updateEntropyBar() {
    const intervals = E.events
        .filter(e => e.type === 'key' && e.interval > 0)
        .slice(-80)
        .map(e => e.interval)
        .filter(v => v >= 30 && v < 5000);

    const fill = document.getElementById('entropy-fill');
    const label = document.getElementById('entropy-label');
    if (!fill || !label) return;

    if (intervals.length < 20) {
        fill.style.width = '0%';
        fill.style.background = 'var(--muted2)';
        label.textContent = intervals.length > 0 ? `– (még ${20 - intervals.length} leütés kell)` : '–';
        label.style.color = 'var(--muted)';
        return;
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stddev = Math.sqrt(intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length);
    const cv = stddev / (mean || 1);
    const pct = Math.min(100, Math.round((cv / 1.5) * 100));

    fill.style.width = pct + '%';

    if (cv < 0.25) {
        fill.style.background = '#e05555';
        label.textContent = 'Gépies – egyenletes ritmus';
        label.style.color = '#e05555';
    } else if (cv < 0.6) {
        fill.style.background = 'var(--gold)';
        label.textContent = 'Közepes – emberi ritmus';
        label.style.color = 'var(--gold)';
    } else {
        fill.style.background = 'var(--success)';
        label.textContent = 'Változatos – természetes emberi ritmus ✓';
        label.style.color = 'var(--success)';
    }

    E.entropyCV = parseFloat(cv.toFixed(3));
    E.entropyPct = pct;
}

function initPulseCanvas() {
    const canvas = document.getElementById('pulse-canvas');
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 340;
    canvas.height = 80;
    window.pulseCtx = canvas.getContext('2d');
    drawPulse();
}

function drawPulse() {
    if (!window.pulseCtx) return;
    const W = window.pulseCtx.canvas.width;
    const H = window.pulseCtx.canvas.height;
    window.pulseCtx.clearRect(0, 0, W, H);
    
    const hist = E.pulseHistory;
    if (hist.length < 5) {
        window.pulseCtx.fillStyle = 'rgba(201,168,76,0.3)';
        window.pulseCtx.font = '10px monospace';
        window.pulseCtx.textAlign = 'center';
        window.pulseCtx.fillText('Gépelj a hullámokhoz...', W / 2, H / 2);
        return;
    }

    const mean = hist.reduce((a, b) => a + b, 0) / hist.length;
    const stdDev = Math.sqrt(hist.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hist.length);
    const cv = stdDev / (mean || 1);
    const isAILike = cv < 0.15;
    const isHumanLike = cv > 0.22;
    const color = isAILike ? '#e05555' : (isHumanLike ? '#4ab870' : '#c9a84c');

    const minV = Math.min(...hist);
    const maxV = Math.max(...hist);
    const range = (maxV - minV) || 60;
    const padding = 20;

    const getPos = (v, i) => {
        const x = (i / (hist.length - 1)) * W;
        const y = H - padding - ((v - minV) / range) * (H - padding * 2);
        return { x, y };
    };

    const grad = window.pulseCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');

    window.pulseCtx.beginPath();
    window.pulseCtx.moveTo(0, H);
    for (let i = 0; i < hist.length - 1; i++) {
        const p0 = getPos(hist[i], i);
        const p1 = getPos(hist[i + 1], i + 1);
        window.pulseCtx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    }
    window.pulseCtx.lineTo(W, H);
    window.pulseCtx.fillStyle = grad;
    window.pulseCtx.fill();

    window.pulseCtx.beginPath();
    window.pulseCtx.lineWidth = 3;
    window.pulseCtx.lineCap = 'round';
    window.pulseCtx.strokeStyle = color;

    const start = getPos(hist[0], 0);
    window.pulseCtx.moveTo(start.x, start.y);

    for (let i = 0; i < hist.length - 1; i++) {
        const p0 = getPos(hist[i], i);
        const p1 = getPos(hist[i + 1], i + 1);
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        window.pulseCtx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    }
    window.pulseCtx.stroke();

    const lastP = getPos(hist[hist.length - 1], hist.length - 1);
    window.pulseCtx.shadowBlur = 15;
    window.pulseCtx.shadowColor = color;
    window.pulseCtx.beginPath();
    window.pulseCtx.arc(lastP.x, lastP.y, 4, 0, Math.PI * 2);
    window.pulseCtx.fillStyle = '#fff';
    window.pulseCtx.fill();
    window.pulseCtx.shadowBlur = 0;

    window.pulseCtx.fillStyle = '#fff';
    window.pulseCtx.font = 'bold 9px monospace';
    window.pulseCtx.fillText(isAILike ? 'BOT-LIKE' : (isHumanLike ? 'VERIFIED HUMAN' : 'ANALYZING...'), 10, 20);
}

function calcPulseVal(interval) {
    const clampedInterval = Math.min(interval, 4000);
    const normalized = Math.min(clampedInterval / 2000, 1);
    const pulseVal = Math.max(5, Math.min(95, (1 - normalized) * 90 + 5));
    const noise = (Math.random() - 0.5) * 8;
    return Math.max(3, Math.min(100, pulseVal + noise));
}

function savePulseImage() {
    const canvas = document.getElementById('pulse-canvas');
    if (!canvas || E.pulseHistory.length < 10) { showToast('⏳ Előbb írj legalább 10 leütést!'); return; }

    const hist = E.pulseHistory;
    const mean = hist.reduce((a, b) => a + b, 0) / hist.length;
    const stdDev = Math.sqrt(hist.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hist.length);
    const cv = stdDev / (mean || 1);
    const isHumanLike = cv > 0.22;
    const isAILike = cv < 0.15;

    const humanSample = [45, 62, 38, 71, 55, 48, 63, 42, 58, 67, 51];
    const aiSample = [52, 54, 53, 52, 53, 54, 52, 53, 52, 54, 53];

    const exportW = 1200;
    const exportH = 2200;

    const exp = document.createElement('canvas');
    exp.width = exportW;
    exp.height = exportH;
    const ctx = exp.getContext('2d');

    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, exportW, exportH);

    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ GÉPELÉSI SPEKTRUM ANALÍZIS ✦', exportW / 2, 70);

    const title = document.getElementById('doc-title-input')?.value || 'Névtelen szöveg';
    ctx.fillStyle = '#f0d070';
    ctx.font = '28px Georgia, serif';
    ctx.fillText(`"${title.substring(0, 50)}${title.length > 50 ? '…' : ''}"`, exportW / 2, 120);

    const chartX = 80, chartY = 160, chartW = exportW - 160, chartH = 320;

    ctx.strokeStyle = 'rgba(201,168,76,0.1)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath();
        ctx.moveTo(chartX, chartY + chartH * f);
        ctx.lineTo(chartX + chartW, chartY + chartH * f);
        ctx.stroke();
    });

    const maxVal = Math.max(...hist, 10);
    const lineColor = isAILike ? '#e05555' : isHumanLike ? '#4ab870' : '#c9a84c';

    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartH);
    hist.forEach((v, i) => {
        const x = chartX + (i / (hist.length - 1)) * chartW;
        const y = chartY + chartH - (v / maxVal) * chartH * 0.9;
        ctx.lineTo(x, y);
    });
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.closePath();
    const fg = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    fg.addColorStop(0, lineColor + '44');
    fg.addColorStop(1, lineColor + '00');
    ctx.fillStyle = fg;
    ctx.fill();

    ctx.beginPath();
    hist.forEach((v, i) => {
        const x = chartX + (i / (hist.length - 1)) * chartW;
        const y = chartY + chartH - (v / maxVal) * chartH * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    let y = chartY + chartH + 60;

    ctx.fillStyle = '#8a8090';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Összehasonlítás:', chartX, y);
    y += 50;

    ctx.fillStyle = '#4ab870';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('✓ Tipikus EMBERI minta:', chartX, y);
    y += 10;
    ctx.beginPath();
    humanSample.forEach((v, i) => {
        const x = chartX + (i / (humanSample.length - 1)) * 500;
        const py = y + 60 - (v / 100) * 50;
        i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    });
    ctx.strokeStyle = '#4ab870';
    ctx.lineWidth = 3;
    ctx.stroke();
    y += 100;

    ctx.fillStyle = '#e05555';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('⚠️ Tipikus AI minta:', chartX, y);
    y += 10;
    ctx.beginPath();
    aiSample.forEach((v, i) => {
        const x = chartX + (i / (aiSample.length - 1)) * 500;
        const py = y + 60 - (v / 100) * 50;
        i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    });
    ctx.strokeStyle = '#e05555';
    ctx.lineWidth = 3;
    ctx.stroke();
    y += 120;

    const humanLabel = E.humanCategory
        ? E.humanCategory.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim()
        : (document.getElementById('human-index')?.textContent || '–');

    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText('📊 ÉRTÉKELÉS:', chartX, y);
    y += 55;

    const stats = [
        ['Ritmus', humanLabel],
        ['Átlagos ritmus', Math.round(mean) + 'ms'],
        ['Ingadozás', Math.round(stdDev) + 'ms'],
        ['Variabilitás', (cv * 100).toFixed(1) + '%'],
    ];
    stats.forEach(([label, val]) => {
        ctx.fillStyle = '#f0d070';
        ctx.font = '24px Georgia, serif';
        ctx.fillText(label + ':', chartX + 30, y);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px monospace';
        ctx.fillText(val, chartX + 320, y);
        y += 50;
    });

    y += 30;
    ctx.fillStyle = isHumanLike ? '#4ab870' : isAILike ? '#e05555' : '#c9a84c';
    ctx.font = 'bold 34px Georgia, serif';
    const verdict = isHumanLike ? '✅ HITELES EMBERI MUNKA' : isAILike ? '⚠️ GÉPIES MINTÁZAT – AI-RA UTAL' : '⏳ NEM MEGGYŐZŐ – TÖBB MINTA KELL';
    ctx.fillText(verdict, chartX, y);
    y += 60;

    ctx.fillStyle = '#7a7090';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('🔍 Hogyan értelmezd:', chartX, y);
    y += 40;

    [
        '• Emberi kéz: hullámzó, változékony ritmus (gondolkodási szünetek, javítások)',
        '• AI írás: túl egyenletes, monoton ritmus (nincs szünet, nincs bizonytalanság)',
        '• A te mintád: ' + (isHumanLike ? 'természetes változatosság ✓' : isAILike ? 'szokatlanul szabályos ⚠️' : 'még nem egyértelmű'),
    ].forEach(line => {
        ctx.fillStyle = '#a090b0';
        ctx.font = '20px monospace';
        ctx.fillText(line, chartX + 20, y);
        y += 36;
    });

    ctx.fillStyle = '#6a5020';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`humano-hu.vercel.app · ${new Date().toLocaleString('hu-HU')} · #HumanoAnalysis`, exportW / 2, exportH - 40);

    const link = document.createElement('a');
    link.download = `HUMANO-analízis-${Date.now()}.png`;
    link.href = exp.toDataURL('image/png');
    link.click();
    showToast('📸 Analízis elmentve!');
}

function editorKeyDown(e) {
    const now = Date.now();
    
    if (!E.sessionStart) {
        E.sessionStart = now;
        editorSetStatus('recording');
        E.timerInterval = setInterval(updateEditorTimer, 1000);
        
        if (!E.tempDocId && currentUser) {
            const stored = localStorage.getItem('humano_temp_doc_id');
            E.tempDocId = stored || ('temp_' + currentUser.id.substring(0, 8) + '_' + Date.now().toString(36));
            localStorage.setItem('humano_temp_doc_id', E.tempDocId);
        }
    }
    
    if (E.lastKey && (now - E.lastKey) > 3000) {
        E.pauses++;
        E.events.push({ type: 'pause', ts: now, duration: now - E.lastKey });
        function updatePauseDisplay() {
    const sp = document.getElementById('s-pauses');
    const sbp = document.getElementById('sidebar-pauses');
    if (sp) sp.textContent = E.pauses;
    if (sbp) sbp.textContent = E.pauses;
    updatePauseInsight();
}

        updatePauseInsight();
        
        const pauseMs = now - E.lastKey;
        if (pauseMs > 30 * 60 * 1000) {
            showToast('⏸ Hosszú szünet – új munkamenetként rögzítve');
            E.sessionBreaks = (E.sessionBreaks || 0) + 1;
        } else if (pauseMs > 5 * 60 * 1000) {
            showToast('💭 5 perces szünet – folytatod az írást?');
        }
    }
    
    if (e.key === 'Backspace' || e.key === 'Delete') {
    E.dels++;
    // Arányosan vonja le - ha több beillesztett van, abból vonjon le
    if (pastedChars > 0) {
        pastedChars = Math.max(0, pastedChars - 1);
    } else {
        typedChars = Math.max(0, typedChars - 1);
    }
    updatePasteRatio();
    tlRecord('delete');
    checkTlFlush();
}
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.repeat) {
            E.warns++;
            E.repeatKeys++;
            E.events.push({ type: 'repeat', ts: now, key: e.key });
            if (E.warns >= 3) {
                const warn = document.getElementById('e-rhythm-warn');
                if (warn) {
                    warn.style.display = 'flex';
                    warn.textContent = '⚠️ Lenyomva tartott billentyű érzékelve – a rendszer ezt rögzíti a tanúsítványban.';
                }
            }
            E.lastKey = now;
            editorCheckSave();
            return;
        }
        
    E.keys++;
typedChars++;
updatePasteRatio();

const interval = E.lastKey ? now - E.lastKey : 150;
E.events.push({ type: 'key', ts: now, interval });
if (E.events.length > 2000) E.events = E.events.slice(-1000);

const pulseVal = calcPulseVal(interval);
E.pulseHistory.push(pulseVal);
if (E.pulseHistory.length > 60) E.pulseHistory.shift();

drawPulse();
editorRhythm();
editorCalcHumanIndex();
tlRecord('insert', e.key);
checkTlFlush();
}
    
    // Anti-spoof ellenőrzés
    if (!E.antiSpoof) {
        E.antiSpoof = {
            suspiciousPatterns: 0,
            lastIntervals: [],
            roboticSequences: 0,
            tooFastCount: 0,
            suspiciousFlag: false,
            suspiciousReason: ''
        };
    }
    
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const as = E.antiSpoof;
        as.lastIntervals.push(E.lastKey ? now - E.lastKey : 150);
        if (as.lastIntervals.length > 20) as.lastIntervals.shift();
        
        if (as.lastIntervals.length >= 10) {
            const tooFast = as.lastIntervals.filter(v => v < 20).length;
            if (tooFast > 3) {
                as.tooFastCount++;
                if (as.tooFastCount >= 3) {
                    as.suspiciousFlag = true;
                    as.suspiciousReason = 'Emberileg lehetetlen gépelési sebesség észlelve.';
                }
            }
            
            const roundIntervals = as.lastIntervals.map(v => Math.round(v / 10) * 10);
            const uniqueVals = new Set(roundIntervals).size;
            if (uniqueVals <= 2 && as.lastIntervals.length >= 15) {
                as.roboticSequences++;
                if (as.roboticSequences >= 3) {
                    as.suspiciousFlag = true;
                    as.suspiciousReason = 'Robotikus, ismétlődő gépelési mintázat észlelve.';
                }
            }
            
            const asMean = as.lastIntervals.reduce((a, b) => a + b, 0) / as.lastIntervals.length;
            const asStddev = Math.sqrt(as.lastIntervals.reduce((s, v) => s + Math.pow(v - asMean, 2), 0) / as.lastIntervals.length);
            if (asStddev < 5 && asMean < 200) {
                as.suspiciousPatterns++;
                if (as.suspiciousPatterns >= 5) {
                    as.suspiciousFlag = true;
                    as.suspiciousReason = 'Tökéletesen egyenletes ritmus – természetes emberi gépelésben ez nem lehetséges.';
                }
            }
            
            const asWarn = document.getElementById('anti-spoof-warn');
            const asText = document.getElementById('anti-spoof-text');
            if (asWarn && asText) {
                if (as.suspiciousFlag) {
                    asWarn.style.display = 'block';
                    asText.textContent = as.suspiciousReason;
                } else {
                    asWarn.style.display = 'none';
                }
            }
        }
    }
    
    resetInactivityTimer();
    E.lastKey = now;
    editorUpdateStats();
    editorCheckSave();
}

function editorClear() {
    if (!confirm('Biztosan törölsz mindent? A mentetlen piszkozat elvész.')) return;
    
    clearCurrentDraft();
    localStorage.removeItem('humano_temp_doc_id');
    
    document.getElementById('doc-content-area').innerHTML = '';
    document.getElementById('doc-title-input').value = '';
    document.getElementById('cert-panel').style.display = 'none';
    document.getElementById('e-rhythm-warn').style.display = 'none';
    document.getElementById('e-word-warn').style.display = 'none';
    
    clearInterval(E.timerInterval);
    
    Object.assign(E, {
        events: [], keys: 0, dels: 0, pauses: 0, focusSwitches: 0,
        warns: 0, repeatKeys: 0, sessionStart: null, lastKey: null,
        certDocId: null, certTitle: null, certHash: null, pulseHistory: [],
        tlBatch: [], tempDocId: null,
        cfDnaScore: 0, boundaryPauses: 0, midWordPauses: 0,
        nlsCorrelation: 0, flowPulseScore: 0,
        microDriftIndex: 0, biologicalEntropy: 0,
        smdScore: 0, tripleLockScore: 0
    });
    
    typedChars = 0;
    pastedChars = 0;
    pasteEvents = [];
    pasteAllowed = false;
    
    const ratioBar = document.getElementById('paste-ratio-bar');
    if (ratioBar) ratioBar.style.display = 'none';
    
    editorSetStatus('idle');
    editorUpdateStats();
    editorCheckSave();
    drawPulse();
    
    document.getElementById('human-index') && (document.getElementById('human-index').textContent = '–');
    document.getElementById('rhythm-var') && (document.getElementById('rhythm-var').textContent = '–');
    document.getElementById('human-pct-fill') && (document.getElementById('human-pct-fill').style.width = '0%');
    document.getElementById('sidebar-time') && (document.getElementById('sidebar-time').textContent = '00:00');
    
    ['s-chars', 's-words', 's-keys', 's-dels', 's-pauses', 's-focus',
     'sidebar-keys', 'sidebar-dels', 'sidebar-pauses', 'sidebar-focus'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
    
    document.getElementById('s-speed') && (document.getElementById('s-speed').textContent = '–');
    document.getElementById('s-human') && (document.getElementById('s-human').textContent = '–');
    
    const entropyFill = document.getElementById('entropy-fill');
    const entropyLabel = document.getElementById('entropy-label');
    if (entropyFill) { entropyFill.style.width = '0%'; entropyFill.style.background = 'var(--muted2)'; }
    if (entropyLabel) { entropyLabel.textContent = '–'; entropyLabel.style.color = 'var(--muted)'; }
    
    ['triple-lock-score', 'tl-cfdna', 'tl-nls', 'tl-smd'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '–';
    });
}

function allowPaste() {
    pasteAllowed = true;
    document.getElementById('e-paste-warn').style.display = 'none';
    document.getElementById('e-paste-allowed-banner').style.display = 'flex';
    
    if (pendingPasteText) {
        document.execCommand('insertText', false, pendingPasteText);
        pendingPasteText = '';
        pendingPasteHtml = '';
    }
    showToast('📋 Beillesztés engedélyezve.');
}

function confirmPasteModal() {
    const check = document.getElementById('paste-consent-check');
    if (!check?.checked) return;
    
    document.getElementById('paste-modal').classList.remove('open');
    document.getElementById('paste-modal').style.display = 'none';
    
    pasteAllowed = true;
    document.getElementById('e-paste-warn') && (document.getElementById('e-paste-warn').style.display = 'none');
    
    // Beillesztett szöveg karaktereinek megszámlálása
    if (pendingPasteText) {
        pastedChars += pendingPasteText.length;
        updatePasteRatio();
        
        // Szöveg beillesztése az editorba
        const editor = document.getElementById('doc-content-area');
        if (editor) {
            editor.focus();
            document.execCommand('insertText', false, pendingPasteText);
        }
        
        pendingPasteText = '';
        pendingPasteHtml = '';
    }
    
    showToast('📋 Beillesztés engedélyezve – arány rögzítve.');
}

function denyPasteModal() {
    document.getElementById('paste-modal').classList.remove('open');
    document.getElementById('paste-modal').style.display = 'none';
    pendingPasteText = '';
    pendingPasteHtml = '';
    showToast('📋 Beillesztés visszautasítva.');
}

function editorInit() {
    const ta = document.getElementById('doc-content-area');
    if (!ta) return;

    if (window._editorInitDone) return;
    window._editorInitDone = true;

    ta.addEventListener('drop', e => e.preventDefault());
    
  ta.addEventListener('paste', e => {
    if (!pasteAllowed) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const html = e.clipboardData.getData('text/html');
        pendingPasteText = text;
        pendingPasteHtml = html;
        const modal = document.getElementById('paste-modal');
        if (modal) {
            const check = document.getElementById('paste-consent-check');
            if (check) check.checked = false;
            const btn = document.getElementById('paste-confirm-btn');
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '.5';
                btn.style.cursor = 'not-allowed';
            }
            modal.style.display = 'flex';
            modal.classList.add('open');
        }
        return;
    }

    const text = e.clipboardData.getData('text/plain');
    pastedChars += text.length;
    typedChars = Math.max(0, typedChars - text.length);
    updatePasteRatio();
    tlRecord('paste');
});

    ta.addEventListener('input', () => {
        editorUpdateStats();
        const cleaned = ta.innerText.replace(/[\n\r\u200B\uFEFF]/g, '').trim();
        if (!cleaned) {
            editorClear();
        }
    });

    ta.addEventListener('keydown', editorKeyDown);

    document.getElementById('doc-title-input')?.addEventListener('input', editorCheckSave);

    if (!window._visibilityListenerAdded) {
        window._visibilityListenerAdded = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && E.sessionStart) {
                E.focusSwitches++;
                const sfEl = document.getElementById('s-focus');
                const sbfEl = document.getElementById('sidebar-focus');
                if (sfEl) sfEl.textContent = E.focusSwitches;
                if (sbfEl) sbfEl.textContent = E.focusSwitches;
            }
        });
    }

    if (!window._selectionListenerAdded) {
        window._selectionListenerAdded = true;
        document.addEventListener('selectionchange', () => {
            if (document.activeElement?.id === 'doc-content-area') {
                if (typeof updateToolbarState === 'function') updateToolbarState();
            }
        });
    }

    const storedTempId = localStorage.getItem('humano_temp_doc_id');
    if (storedTempId && currentUser) {
        E.tempDocId = storedTempId;
    }

    initPulseCanvas();
    startAutosaveTimer();
    startTlFlushTimer();
   startTipRotation();
   updatePasteRatio();
}

async function startEditorFlow() {
    if (!currentUser) {
        showPage('auth');
        return;
    }

    // Megvárjuk a beleegyezés ellenőrzését
    const hasConsent = await ConsentManager.hasActive('keystroke_dynamics');

    if (!hasConsent) {
        // Biztosítjuk, hogy a modal létezik a DOM-ban
        const modal = document.getElementById('biometric-consent-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('open');
        } else {
            console.error('Biometrikus modal nem található!');
            showToast('❌ Rendszerhiba, próbáld újra!');
        }
        return;
    }

    // Ha van beleegyezés, inicializáljuk az editort
    editorInit();
    setTimeout(() => {
        checkAndShowCalibrationReminder();
    }, 1000);
}

async function editorCalcHumanIndex() {
    if (E.keys < 20) return;

    const sampleSize = E.keys;
    const minSample = 50;
    const optimalSample = 200;
    const sampleWeight = Math.min(1, sampleSize / optimalSample);

    if (!E.scoreHistory) E.scoreHistory = [];
    if (!E.lastScoreTime) E.lastScoreTime = Date.now();

    if (Date.now() - E.lastScoreTime > 30000 && E.tripleLockScore > 0) {
        E.scoreHistory.push({
            ts: Date.now(),
            tripleLock: E.tripleLockScore,
            cfDna: E.cfDnaScore,
            nls: E.flowPulseScore,
            smd: E.smdScore
        });
        if (E.scoreHistory.length > 10) E.scoreHistory.shift();
        E.lastScoreTime = Date.now();
    }

    const historyWeight = E.scoreHistory.length >= 3 ? 0.3 : 0;
    const historyAvg = E.scoreHistory.length >= 3
        ? Math.round(E.scoreHistory.slice(-3).reduce((s, h) => s + h.tripleLock, 0) / 3)
        : 0;

    const recent = E.events.filter(ev => ev.type === 'key').slice(-50);
    if (recent.length < 10) return;

    const intervals = recent.slice(1).map((ev, i) => ev.ts - recent[i].ts).filter(v => v >= 30 && v < 5000);
    if (intervals.length < 8) return;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stddev = Math.sqrt(intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length);
    const cv = stddev / (mean || 1);

    const delRatio = E.dels / Math.max(1, E.keys);
    const hasNaturalEdits = delRatio > 0.02 && delRatio < 0.6;
    const hasThinkingPauses = E.pauses >= 3;
    const isIntense = cv > 0.9 && hasThinkingPauses && hasNaturalEdits;

    let category, color, label, pct;

    if (cv < 0.25) {
        category = 'gépies';
        color = '#e05555';
        label = '🔴 Gépies ritmus';
        pct = Math.round((cv / 0.25) * 25);
    } else if (cv < 0.6) {
        category = 'közepes';
        color = 'var(--gold)';
        label = '🟡 Vegyes ritmus';
        pct = Math.round(25 + ((cv - 0.25) / 0.35) * 35);
    } else if (!isIntense) {
        category = 'emberi';
        color = 'var(--success)';
        label = '🟢 Emberi ritmus';
        pct = Math.round(60 + ((cv - 0.6) / 0.3) * 25);
    } else {
        category = 'intenzív';
        color = 'var(--gold2)';
        label = '⭐ Intenzív alkotás';
        pct = Math.min(100, Math.round(85 + ((cv - 0.9) / 0.5) * 15));
    }

    pct = Math.max(0, Math.min(100, pct));

    const idx = document.getElementById('human-index');
    const fill = document.getElementById('human-pct-fill');
    const stat = document.getElementById('s-human');

    if (idx) {
        idx.textContent = label;
        idx.style.fontSize = '.85rem';
        idx.style.color = color;
    }
    if (fill) {
        fill.style.width = pct + '%';
        fill.style.background = color;
    }
    if (stat) {
        stat.textContent = category === 'gépies' ? 'Gépies ritmus'
            : category === 'közepes' ? 'Vegyes ritmus'
            : category === 'emberi' ? 'Emberi ritmus'
            : 'Intenzív alkotás';
    }

    E.humanCategory = category;
    E.humanCV = parseFloat(cv.toFixed(3));
    E.humanPct = pct;

    let baselineScore = 0;
    let baselineDeviation = 0;

    if (currentUser && E.keys >= 50) {
        try {
            const { data: profiles } = await db
                .from('typing_profiles')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (profiles && profiles.length >= 1) {
                const avgBurstMean = profiles.reduce((s, p) => s + (p.burst_mean || 0), 0) / profiles.length;
                const avgRevisionRate = profiles.reduce((s, p) => s + (p.revision_rate || 0), 0) / profiles.length;

                const currentBurstMean = mean;
                const currentRevisionRate = E.dels / Math.max(1, E.keys);

                const burstDev = Math.abs(currentBurstMean - avgBurstMean) / Math.max(avgBurstMean, 1);
                const revDev = Math.abs(currentRevisionRate - avgRevisionRate) / Math.max(avgRevisionRate, 0.01);

                baselineDeviation = Math.round((burstDev + revDev) / 2 * 100);
                baselineScore = Math.max(0, 100 - baselineDeviation);

                E.baselineScore = baselineScore;
                E.baselineDeviation = baselineDeviation;
                E.baselineProfiles = profiles.length;
            }
        } catch (err) {
            console.warn('Baseline hiba:', err);
        }
    }

    const cfText = document.getElementById('doc-content-area')?.innerText || '';
    const cfPauses = E.events.filter(e => e.type === 'pause');
    let boundaryPauses = 0, midWordPauses = 0;
    
    cfPauses.forEach(pause => {
        const charsAtPause = E.events.filter(e => e.type === 'key' && e.ts < pause.ts).length;
        const charBefore = cfText[charsAtPause - 1] || '';
        if (/[.!?,;:\n]/.test(charBefore)) boundaryPauses++;
        else midWordPauses++;
    });
    
    const totalCfPauses = boundaryPauses + midWordPauses;
    const boundaryRatio = totalCfPauses > 0 ? boundaryPauses / totalCfPauses : 0;
    const cfDnaScore = Math.min(100, Math.round(
        (boundaryRatio * 60) + (Math.min(cfPauses.length, 10) / 10 * 40)
    ));
    
    E.cfDnaScore = cfDnaScore;
    E.boundaryPauses = boundaryPauses;
    E.midWordPauses = midWordPauses;

    const nlsWords = cfText.trim().split(/\s+/).filter(Boolean);
    const nlsKeyEvents = E.events.filter(e => e.type === 'key');
    let nlsCorrelation = 0, flowPulseScore = 0;
    
    if (nlsWords.length >= 10 && nlsKeyEvents.length >= 20) {
        const chunkSize = Math.max(1, Math.floor(nlsKeyEvents.length / nlsWords.length));
        const complexities = nlsWords.map(w => w.length);
        const speeds = nlsWords.map((_, i) => {
            const chunk = nlsKeyEvents.slice(i * chunkSize, (i + 1) * chunkSize);
            if (!chunk.length) return 200;
            const ivs = chunk.map(e => e.interval || 200).filter(v => v > 0);
            return ivs.reduce((a, b) => a + b, 0) / ivs.length;
        });
        
        const cMean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
        const sMean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        
        let num = 0, dc = 0, ds = 0;
        complexities.forEach((c, i) => {
            num += (c - cMean) * (speeds[i] - sMean);
            dc += Math.pow(c - cMean, 2);
            ds += Math.pow(speeds[i] - sMean, 2);
        });
        
        nlsCorrelation = (dc && ds) ? num / Math.sqrt(dc * ds) : 0;
        flowPulseScore = Math.min(100, Math.round(50 + (nlsCorrelation * 50)));
    }
    
    E.nlsCorrelation = parseFloat(nlsCorrelation.toFixed(3));
    E.flowPulseScore = flowPulseScore;

    const smdIntervals = E.events
        .filter(e => e.type === 'key' && e.interval > 30 && e.interval < 2000)
        .map(e => e.interval)
        .slice(-100);
    
    let microDriftIndex = 0, biologicalEntropy = 0, smdScore = 0;
    
    if (smdIntervals.length >= 20) {
        const diffs = smdIntervals.slice(1).map((v, i) => Math.abs(v - smdIntervals[i]));
        microDriftIndex = parseFloat((diffs.reduce((a, b) => a + b, 0) / diffs.length / 1000).toFixed(3));
        
        const buckets = {};
        smdIntervals.forEach(v => {
            const b = Math.floor(v / 50) * 50;
            buckets[b] = (buckets[b] || 0) + 1;
        });
        
        const total = smdIntervals.length;
        biologicalEntropy = parseFloat((-Object.values(buckets).reduce((s, count) => {
            const p = count / total;
            return s + (p > 0 ? p * Math.log2(p) : 0);
        }, 0)).toFixed(3));
        
        smdScore = Math.min(100, Math.round(
            (Math.min(microDriftIndex, 1) * 40) + (Math.min(biologicalEntropy / 5, 1) * 60)
        ));
    }
    
    E.microDriftIndex = microDriftIndex;
    E.biologicalEntropy = biologicalEntropy;
    E.smdScore = smdScore;

    const baselineWeight = baselineScore > 0 ? 0.20 : 0;
    const rawTripleLock = Math.round(
        (cfDnaScore * (0.35 - baselineWeight / 3)) +
        (flowPulseScore * (0.35 - baselineWeight / 3)) +
        (smdScore * (0.30 - baselineWeight / 3)) +
        (baselineScore * baselineWeight)
    );

    const weightedTripleLock = sampleSize < minSample
        ? Math.round(rawTripleLock * sampleWeight)
        : rawTripleLock;

    const tripleLockScore = historyWeight > 0
        ? Math.round((weightedTripleLock * (1 - historyWeight)) + (historyAvg * historyWeight))
        : weightedTripleLock;

    E.tripleLockScore = tripleLockScore;
    E.sampleWeight = parseFloat(sampleWeight.toFixed(2));

    const scores = [cfDnaScore, flowPulseScore, smdScore].filter(s => s > 0);
    const scoreMean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const scoreStddev = scores.length > 1
        ? Math.sqrt(scores.reduce((s, v) => s + Math.pow(v - scoreMean, 2), 0) / scores.length)
        : 50;

    const consistencyScore = Math.max(0, 100 - scoreStddev);
    const sampleScore = Math.min(100, Math.round((E.keys / 200) * 100));
    const confidence = Math.round((consistencyScore * 0.6) + (sampleScore * 0.4));

    let confidenceLabel, confidenceColor;
    if (confidence >= 75) {
        confidenceLabel = 'Magas megbízhatóság';
        confidenceColor = 'var(--success)';
    } else if (confidence >= 50) {
        confidenceLabel = 'Közepes megbízhatóság';
        confidenceColor = 'var(--gold)';
    } else {
        confidenceLabel = 'Alacsony – több adat kell';
        confidenceColor = '#e05555';
    }

    E.confidence = confidence;
    E.confidenceLabel = confidenceLabel;

    let crossValidFlag = false;
    let crossValidWarning = '';

    if (scores.length === 3) {
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const spread = maxScore - minScore;

        if (spread > 50) {
            crossValidFlag = true;
            crossValidWarning = 'Nagy eltérés a mutatók között – az eredmény kevésbé megbízható.';
        }
        if (cfDnaScore >= 90 && smdScore < 20) {
            crossValidFlag = true;
            crossValidWarning = 'Szokatlan mintázat – magas kognitív jelenlét de alacsony biológiai ritmus.';
        }
        if (flowPulseScore >= 90 && cfDnaScore < 20) {
            crossValidFlag = true;
            crossValidWarning = 'Szokatlan mintázat – alkotói hév magas de nincs gondolkodási szünet.';
        }
        if (cfDnaScore >= 95 && flowPulseScore >= 95 && smdScore >= 95) {
            crossValidFlag = true;
            crossValidWarning = 'Túl egyenletes eredmény – természetes emberi gépelésben mindig van variáció.';
        }
    }

    E.crossValidFlag = crossValidFlag;
    E.crossValidWarning = crossValidWarning;

    const adjustedTripleLockScore = crossValidFlag
        ? Math.round(tripleLockScore * 0.75)
        : tripleLockScore;
    E.tripleLockScore = adjustedTripleLockScore;

    let explanation = '';
    if (E.keys < 50) {
        explanation = 'Még kevés adat – írj legalább 100 leütést a pontosabb értékeléshez.';
    } else if (cfDnaScore >= 70 && flowPulseScore >= 60 && smdScore >= 50) {
        explanation = 'Minden mutató emberi alkotásra utal – természetes gondolkodási szünetek, alkotói hév és biológiai ritmus egyaránt megfigyelhető.';
    } else if (cfDnaScore >= 70 && flowPulseScore < 40) {
        explanation = 'A gondolkodási szünetek természetesek, de az alkotói hév alacsony – valószínűleg gyors, rutinszerű gépelés.';
    } else if (cfDnaScore < 40 && smdScore >= 60) {
        explanation = 'A biológiai ritmus emberi, de kevés gondolkodási szünet van mondathatárokon – esetleg folyamatos, megszakítás nélküli gépelés.';
    } else if (flowPulseScore >= 70 && cfDnaScore < 40) {
        explanation = 'Erős alkotói hév látható – a szókomplexitás és gépelési sebesség korrelációja emberi mintázatot mutat.';
    } else if (tripleLockScore < 30) {
        explanation = 'Alacsony kognitív jelenlét – lehetséges okok: beillesztett tartalom, nagyon gyors egyenletes gépelés, vagy segédeszköz használata.';
    } else {
        explanation = 'Vegyes mintázat – az emberi alkotás jelei részben megfigyelhetők. Több szöveg írásával pontosabb kép alakul ki.';
    }

    E.explanation = explanation;

    const tlScore = document.getElementById('triple-lock-score');
    const tlCfdna = document.getElementById('tl-cfdna');
    const tlNls = document.getElementById('tl-nls');
    const tlSmd = document.getElementById('tl-smd');
    const tlConfidence = document.getElementById('tl-confidence');
    const tlExplanation = document.getElementById('tl-explanation');

    if (tlScore) tlScore.textContent = adjustedTripleLockScore ? adjustedTripleLockScore + '/100' : '–';
    if (tlCfdna) tlCfdna.textContent = cfDnaScore ? cfDnaScore + '/100' : '–';
    if (tlNls) tlNls.textContent = flowPulseScore ? flowPulseScore + '/100' : '–';
    if (tlSmd) tlSmd.textContent = smdScore ? smdScore + '/100' : '–';
    
    if (tlConfidence) {
        tlConfidence.textContent = confidenceLabel;
        tlConfidence.style.color = confidenceColor;
    }

    const tlSample = document.getElementById('tl-sample');
    if (tlSample) {
        tlSample.textContent = sampleSize < minSample
            ? `${sampleSize}/${minSample} leütés`
            : sampleSize < optimalSample
            ? `${sampleSize}/${optimalSample} leütés`
            : `✓ ${sampleSize} leütés`;
        tlSample.style.color = sampleSize < minSample
            ? '#e05555'
            : sampleSize < optimalSample
            ? 'var(--gold)'
            : 'var(--success)';
    }

    if (tlExplanation) tlExplanation.textContent = explanation;

    const tlBaseline = document.getElementById('tl-baseline');
    if (tlBaseline) {
        if (baselineScore > 0) {
            tlBaseline.style.display = 'block';
            const diff = baselineScore - 50;
            const diffText = diff > 0 ? `+${diff}% a saját átlagodhoz képest` : `${diff}% a saját átlagodhoz képest`;
            tlBaseline.textContent = `Alkotói jelenlét: ${diffText} (${E.baselineProfiles} minta alapján)`;
            tlBaseline.style.color = baselineScore >= 70 ? 'var(--success)' : baselineScore >= 40 ? 'var(--gold)' : '#e05555';
        } else {
            tlBaseline.style.display = 'none';
        }
    }

    const tlCrossValid = document.getElementById('tl-crossvalid');
    const tlCrossValidText = document.getElementById('tl-crossvalid-text');
    if (tlCrossValid && tlCrossValidText) {
        if (crossValidFlag) {
            tlCrossValid.style.display = 'block';
            tlCrossValidText.textContent = crossValidWarning;
        } else {
            tlCrossValid.style.display = 'none';
        }
    }

    updateEntropyBar();
}

/* ─── 8. PISZKOZAT RENDSZER (AUTOSAVE) ─────────────────────────────── */
// draft index, mentés, betöltés, modal

function getDraftIndex() {
    try {
        return JSON.parse(localStorage.getItem(DRAFT_INDEX_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveDraftIndex(arr) {
    localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(arr));
}

function autoSaveDraft() {
    const editor = document.getElementById('doc-content-area');
    if (!editor) return;

    const content = editor.innerHTML;
    const title = document.getElementById('doc-title-input')?.value || '';

    if (!content && !title) return;
    if (content === lastSavedContent && title === lastSavedTitle) return;

    lastSavedContent = content;
    lastSavedTitle = title;

    const draftId = 'draft_' + (currentUser?.id || 'anon') + '_current';
    const draft = {
        id: draftId,
        title: title || 'Cím nélkül',
        content: content,
        plainText: editor.innerText,
        keys: E.keys,
        dels: E.dels,
        pauses: E.pauses,
        events: E.events.slice(-200),
        pulseHistory: E.pulseHistory.slice(),
        sessionStart: E.sessionStart,
        savedAt: Date.now()
    };

    try {
        localStorage.setItem(DRAFT_KEY_PREFIX + draftId, JSON.stringify(draft));

        let idx = getDraftIndex().filter(d => d.id !== draftId);
        idx.unshift({
            id: draftId,
            title: draft.title,
            savedAt: draft.savedAt,
            chars: editor.innerText.length
        });
        if (idx.length > 5) idx = idx.slice(0, 5);
        saveDraftIndex(idx);

        const snack = document.getElementById('autosave-snack');
        if (snack) {
            document.getElementById('autosave-text').textContent = 'Piszkozat mentve';
            snack.classList.add('show');
            clearTimeout(snack._hideTimer);
            snack._hideTimer = setTimeout(() => snack.classList.remove('show'), 3000);
        }
    } catch (e) {
        console.error('❌ Hiba mentéskor:', e);
    }
}

function startAutosaveTimer() {
    if (autosaveTimer) clearInterval(autosaveTimer);
    autosaveTimer = setInterval(autoSaveDraft, 10000);
}

function checkDraftsOnEditorOpen() {
    const idx = getDraftIndex();
    const myDrafts = idx.filter(d => d.id.includes(currentUser?.id || 'anon'));
    if (!myDrafts.length) return;

    const editor = document.getElementById('doc-content-area');
    if (!editor) return;

    const hasContent = editor.innerText?.trim().length > 0 || editor.innerHTML?.trim().length > 0;
    if (hasContent) return;

    renderDraftModal(myDrafts);
    document.getElementById('draft-modal').classList.add('open');
}

function renderDraftModal(drafts) {
    const list = document.getElementById('draft-list');
    if (!list) return;
    
    list.innerHTML = drafts.map(d => {
        const ago = timeSince(d.savedAt);
        return `<div class="draft-item" onclick="loadDraft('${d.id}')">
            <div>
                <div class="draft-item-title">${esc(d.title)}</div>
                <div class="draft-item-meta">${d.chars?.toLocaleString('hu-HU') || 0} karakter · ${ago} ezelőtt mentve</div>
            </div>
            <button class="btn btn-gold btn-sm" onclick="event.stopPropagation();loadDraft('${d.id}')">Betöltés →</button>
        </div>`;
    }).join('');
}

function loadDraft(draftId) {
    try {
        const raw = localStorage.getItem(DRAFT_KEY_PREFIX + draftId);
        if (!raw) { showToast('❌ Piszkozat nem található.'); return; }

        const draft = JSON.parse(raw);

        document.getElementById('doc-title-input').value = draft.title === 'Cím nélkül' ? '' : draft.title;
        const editor = document.getElementById('doc-content-area');
        if (editor) editor.innerHTML = draft.content || '';

        E.keys = draft.keys || 0;
        E.dels = draft.dels || 0;
        E.pauses = draft.pauses || 0;
        E.events = draft.events || [];
        E.pulseHistory = draft.pulseHistory || [];
        E.sessionStart = draft.sessionStart || null;

        lastSavedContent = draft.content || '';
        lastSavedTitle = draft.title || '';

        editorUpdateStats();
        editorCheckSave();

        if (E.sessionStart) {
            editorSetStatus('recording');
            if (!E.timerInterval) {
                E.timerInterval = setInterval(updateEditorTimer, 1000);
            }
        }

        drawPulse();
        closeDraftModal(false);
        showToast('📄 Piszkozat betöltve!');

    } catch (e) {
        console.error('❌ Hiba a betöltéskor:', e);
        showToast('❌ Hiba a piszkozat betöltésekor.');
    }
}

function closeDraftModal(discardAll) {
    document.getElementById('draft-modal').classList.remove('open');

    if (discardAll) {
        const idx = getDraftIndex().filter(d => d.id.includes(currentUser?.id || 'anon'));
        idx.forEach(d => localStorage.removeItem(DRAFT_KEY_PREFIX + d.id));
        saveDraftIndex(getDraftIndex().filter(d => !d.id.includes(currentUser?.id || 'anon')));
        showToast('🗑 Piszkozatok törölve.');
    }
}

function clearCurrentDraft() {
    const draftId = 'draft_' + (currentUser?.id || 'anon') + '_current';
    localStorage.removeItem(DRAFT_KEY_PREFIX + draftId);
    saveDraftIndex(getDraftIndex().filter(d => d.id !== draftId));
    lastSavedContent = '';
    lastSavedTitle = '';
}

/* ─── 9. TIMELAPSE ─────────────────────────────────────────────────── */
// tlRecord, flush, batch, timelapse lejátszás, render

async function tlRecord(type, char) {
    if (!currentUser) return;

    const { data: profile } = await db
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', currentUser.id)
        .single();

    const plan = profile?.plan || 'free';
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const isPro = plan === 'pro' || plan === 'institution' || plan === 'premium' || trialActive;

    if (!isPro) return;

    E.tlBatch.push({ type, char: char || null, ts_ms: Date.now() });
}

function startTlFlushTimer() {
    if (E.tlFlushTimer) clearInterval(E.tlFlushTimer);
    E.tlFlushTimer = setInterval(() => {
        if (E.tlBatch.length >= 1) flushTlBatch();
        const inp = document.getElementById('timelapse-doc-input');
        const id = E.tempDocId || E.certDocId;
        if (inp && id && inp.value !== id) inp.value = id;
    }, 5000);
}

function checkTlFlush() {
    if (E.tlBatch.length >= 5) flushTlBatch();
}

async function flushTlBatch(forcedDocId) {
    if (!E.tlBatch.length) return;
    if (!currentUser) return;

    if (!forcedDocId && !E.tempDocId && !E.certDocId) {
        E.tempDocId = 'temp_' + currentUser.id.substring(0, 8) + '_' + Date.now().toString(36);
        localStorage.setItem('humano_temp_doc_id', E.tempDocId);
    }

    const docId = forcedDocId || E.tempDocId || E.certDocId;
    if (!docId) return;

    const batch = E.tlBatch.splice(0, E.tlBatch.length);
    const rows = batch.map(ev => ({
        document_id: docId,
        ts_ms: ev.ts_ms,
        type: ev.type,
        char: ev.char || null,
    }));

    try {
        const { error } = await db.from('timelapse_events').insert(rows);
        if (error) throw error;
    } catch (err) {
        console.warn('Timelapse flush hiba:', err);
        E.tlBatch.unshift(...batch);
    }
}

function timelapseBuildTextAt(idx) {
    if (idx < _tlTextCache.idx) {
        _tlTextCache.idx = -1;
        _tlTextCache.text = '';
    }
    
    const start = _tlTextCache.idx + 1;
    let buf = _tlTextCache.text;
    
    for (let i = start; i <= idx; i++) {
        const ev = timelapseEvents[i];
        if (ev.type === 'insert' && ev.char) buf += ev.char;
        else if (ev.type === 'delete') buf = buf.slice(0, -1);
    }
    
    _tlTextCache.idx = idx;
    _tlTextCache.text = buf;
    return buf;
}

function timelapseComputeStats(evs) {
    let inserts = 0, deletes = 0, pauses = 0;
    
    for (let i = 0; i < evs.length; i++) {
        if (evs[i].type === 'insert') inserts++;
        else if (evs[i].type === 'delete') deletes++;
        if (i > 0 && (evs[i].ts_ms - evs[i - 1].ts_ms) > 2000) pauses++;
    }
    
    const statsDiv = document.getElementById('humTlStats');
    if (statsDiv) statsDiv.style.display = 'flex';
    
    const charsEl = document.getElementById('humTlStatChars');
    const delEl = document.getElementById('humTlStatDel');
    const durEl = document.getElementById('humTlStatDur');
    const pauseEl = document.getElementById('humTlStatPause');
    
    if (charsEl) charsEl.textContent = inserts;
    if (delEl) delEl.textContent = deletes;
    if (durEl) durEl.textContent = timelapseFmtTime(timelapseTotalDurMs);
    if (pauseEl) pauseEl.textContent = pauses;
}

function timelapseRenderFrame(idx) {
    if (!timelapseEvents.length) return;
    
    idx = Math.max(0, Math.min(idx, timelapseEvents.length - 1));
    const progress = timelapseEvents.length > 1 ? Math.round((idx / (timelapseEvents.length - 1)) * 100) : 0;
    const atEnd = idx >= timelapseEvents.length - 1;

    const insertEvents = timelapseEvents.filter(e => e.type === 'insert');
    const insertUpToIdx = timelapseEvents.slice(0, idx + 1).filter(e => e.type === 'insert').length;
    const endI = Math.min(insertUpToIdx, insertEvents.length) - 1;
    const startI = Math.max(0, endI - 29);

    const rhythmData = [];
    const rawDelays = [];
    
    for (let i = startI; i <= endI; i++) {
        if (i > 0 && insertEvents[i] && insertEvents[i - 1]) {
            const dt = insertEvents[i].ts_ms - insertEvents[i - 1].ts_ms;
            rawDelays.push(dt);
            rhythmData.push(Math.min(80, Math.max(20, 80 - Math.log1p(dt) * 8)));
        } else {
            rhythmData.push(40);
            rawDelays.push(200);
        }
    }
    
    while (rhythmData.length < 30) { rhythmData.unshift(40); rawDelays.unshift(200); }

    const sessionStartMs = timelapseEvents[0]?.ts_ms ?? 0;
    const nowMs = timelapseEvents[idx]?.ts_ms ?? 0;
    const elapsedMin = Math.max(nowMs / 60000, 1 / 60);
    const wpm = Math.round((insertUpToIdx / 5) / elapsedMin);
    const deleteCount = timelapseEvents.slice(0, idx + 1).filter(e => e.type === 'delete').length;

    const PAUSE_THRESHOLD_MS = 2000;
    let pauseCount = 0, totalPauseMs = 0;
    
    for (let i = startI + 1; i <= endI; i++) {
        if (!insertEvents[i] || !insertEvents[i - 1]) continue;
        const dt = insertEvents[i].ts_ms - insertEvents[i - 1].ts_ms;
        if (dt >= PAUSE_THRESHOLD_MS) { pauseCount++; totalPauseMs += dt; }
    }
    
    const avgPauseSec = pauseCount > 0 ? (totalPauseMs / pauseCount / 1000).toFixed(1) : '—';

    const sessionDate = new Date(Date.now() - timelapseTotalDurMs + nowMs)
        .toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const sessionDurMin = Math.floor(timelapseTotalDurMs / 60000);
    const sessionDurSec = Math.floor((timelapseTotalDurMs % 60000) / 1000);
    const sessionDurFmt = `${sessionDurMin}p ${sessionDurSec}s`;

    const avgDelay = rawDelays.length ? Math.round(rawDelays.reduce((a, b) => a + b, 0) / rawDelays.length) : 0;
    const minDelay = rawDelays.length ? Math.min(...rawDelays) : 0;
    const maxDelay = rawDelays.length ? Math.max(...rawDelays) : 0;

    const BAR_W = 8, GAP = 2, SVG_H = 100;
    const bars = rhythmData.map((h, i) => {
        const x = i * (BAR_W + GAP);
        const y = SVG_H - h;
        const color = h > 65 ? '#7c6af7' : h > 40 ? '#c9a84c' : '#4a3fa0';
        const isLast = i === rhythmData.length - 1;
        const opacity = isLast ? 1 : (0.55 + (i / rhythmData.length) * 0.45).toFixed(2);
        
        return `<rect x="${x}" y="${y}" width="${BAR_W}" height="${h}" fill="${color}" rx="3" opacity="${opacity}">
            ${isLast ? `<animate attributeName="height" values="${h};${Math.max(20, h - 6)};${h}" dur="1s" repeatCount="indefinite"/>` : ''}
        </rect>`;
    }).join('');
    
    const baseline = `<line x1="0" y1="${SVG_H}" x2="300" y2="${SVG_H}" stroke="#333" stroke-width="1"/>`;

    const display = document.getElementById('humTlDisplay');
    if (display) {
        display.innerHTML = `
            <div style="text-align:center;padding:20px;background:linear-gradient(145deg,#0a0a0a,#1a1a1a);border-radius:12px;border:1px solid #333;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:12px;color:#7c6af7;background:rgba(124,106,247,.1);padding:4px 10px;border-radius:20px;">🔒 PRIVÁT</span>
                        <span style="font-size:12px;color:#888;">${insertUpToIdx} leütés</span>
                    </div>
                    <div style="font-size:11px;color:#c9a84c;">${sessionDate}</div>
                </div>
                <svg width="100%" height="120" viewBox="0 0 300 110" preserveAspectRatio="xMidYMid meet"
                     style="margin:10px 0;background:#0f0f0f;border-radius:8px;padding:5px;">
                    ${baseline}${bars}
                </svg>
                <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;font-size:11px;">
                    <span style="color:#7c6af7;">⬤ Gyors (${minDelay}ms)</span>
                    <span style="color:#c9a84c;">⬤ Normál (${avgDelay}ms)</span>
                    <span style="color:#4a3fa0;">⬤ Lassú (${maxDelay}ms)</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:15px 0;padding:10px;background:#0f0f0f;border-radius:8px;">
                    <div><div style="font-size:10px;color:#666;">Írásspeed</div><div style="font-size:18px;font-weight:bold;color:#7c6af7;">${wpm}</div><div style="font-size:9px;color:#888;">szó/perc</div></div>
                    <div><div style="font-size:10px;color:#666;">Javítások</div><div style="font-size:18px;font-weight:bold;color:#c9a84c;">${deleteCount}</div><div style="font-size:9px;color:#888;">törlés</div></div>
                    <div><div style="font-size:10px;color:#666;">Szünetek</div><div style="font-size:18px;font-weight:bold;color:#e05555;">${pauseCount}</div><div style="font-size:9px;color:#888;">${avgPauseSec}s átlag</div></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;margin-top:5px;padding:5px 0;border-top:1px solid #222;">
                    <span>⏱️ ${sessionDurFmt}</span>
                    <span>📊 ${insertUpToIdx} leütés</span>
                </div>
                <div style="width:100%;background:#333;height:4px;border-radius:2px;margin-top:10px;">
                    <div style="width:${progress}%;background:linear-gradient(90deg,#7c6af7,#c9a84c);height:4px;border-radius:2px;transition:width .1s;"></div>
                </div>
                <div style="margin-top:8px;font-size:12px;color:#888;display:flex;justify-content:space-between;">
                    <span>⏮ 0:00</span>
                    <span>${progress}%</span>
                    <span>${timelapseFmtTime(timelapseTotalDurMs)} ⏭</span>
                </div>
            </div>`;
    }

    const slider = document.getElementById('humTlSlider');
    if (slider) slider.value = idx;
    
    const timeLbl = document.getElementById('humTlTimeLbl');
    if (timeLbl) timeLbl.textContent = timelapseFmtTime(timelapseEvents[idx]?.ts_ms ?? 0) + ' / ' + timelapseFmtTime(timelapseTotalDurMs);

    if (atEnd) timelapseStopPlay();
}

function timelapseTick(now) {
    if (!timelapsePlaying) return;

    if (timelapseLastRafTime !== null) {
        const speed = parseFloat(document.getElementById('humTlSpeed')?.value ?? 1);
        const delta = (now - timelapseLastRafTime) * speed;
        timelapseAccumMs += delta;

        let maxIterations = 1000;
        while (timelapseFrameIdx < timelapseEvents.length - 1 &&
               timelapseEvents[timelapseFrameIdx + 1].ts_ms <= timelapseAccumMs &&
               maxIterations-- > 0) {
            timelapseFrameIdx++;
            timelapseRenderFrame(timelapseFrameIdx);
            if (timelapseFrameIdx >= timelapseEvents.length - 1) {
                timelapseStopPlay();
                return;
            }
        }
    }

    timelapseLastRafTime = now;
    timelapseRafId = requestAnimationFrame(timelapseTick);
}

function timelapseStartPlay() {
    if (timelapsePlaying) return;

    if (timelapseFrameIdx >= timelapseEvents.length - 1) {
        timelapseFrameIdx = 0;
        _tlTextCache.idx = -1;
        _tlTextCache.text = '';
    }

    timelapseAccumMs = timelapseEvents[timelapseFrameIdx]?.ts_ms ?? 0;
    timelapsePlaying = true;
    timelapseLastRafTime = null;

    const btn = document.getElementById('humTlBtnPlay');
    if (btn) { btn.textContent = '⏸ Szünet'; btn.classList.add('active'); }

    timelapseRafId = requestAnimationFrame(timelapseTick);
}

function timelapseStopPlay() {
    timelapsePlaying = false;
    cancelAnimationFrame(timelapseRafId);
    timelapseLastRafTime = null;

    const btn = document.getElementById('humTlBtnPlay');
    if (btn) { btn.textContent = '▶ Lejátszás'; btn.classList.remove('active'); }
}

async function loadTimelapseFromInput() {
    const docId = (document.getElementById('timelapse-doc-input')?.value || '').trim().toUpperCase();
    if (!docId) { alert('❌ Adj meg egy DOC ID-t!'); return; }
    await loadTimelapse(docId);
    const url = new URL(window.location);
    url.searchParams.set('doc', docId);
    window.history.pushState({}, '', url);
}

async function loadTimelapse(docId) {
    const msgEl = document.getElementById('humTlMsg');
    if (!docId) { if (msgEl) msgEl.textContent = 'Nincs megadva dokumentum azonosító.'; return; }
    if (msgEl) msgEl.textContent = '⏳ Betöltés...';

    _tlTextCache.idx = -1;
    _tlTextCache.text = '';

    const { data: doc } = await db.from('documents').select('title').eq('doc_id', docId).single();
    const titleEl = document.getElementById('humTlDocTitle');
    if (titleEl && doc) titleEl.textContent = doc.title;

    const { data, error } = await db
        .from('timelapse_events')
        .select('ts_ms, type, char, text')
        .eq('document_id', docId)
        .order('ts_ms', { ascending: true });

    if (error || !data || !data.length) {
        if (msgEl) msgEl.textContent = error ? 'Hiba: ' + error.message : 'Nincs timelapse adat ehhez a dokumentumhoz.';
        return;
    }

    const t0 = data[0].ts_ms;
    timelapseEvents = data.map(e => ({ ...e, ts_ms: e.ts_ms - t0 }));
    timelapseTotalDurMs = timelapseEvents[timelapseEvents.length - 1].ts_ms;
    timelapseFrameIdx = 0;
    timelapseAccumMs = 0;
    timelapsePlaying = false;

    const slider = document.getElementById('humTlSlider');
    if (slider) { slider.max = timelapseEvents.length - 1; slider.value = 0; }

    const display = document.getElementById('humTlDisplay');
    if (display) display.innerHTML = '<span class="hum-tl-cursor"></span>';

    if (msgEl) msgEl.innerHTML = '';

    const timeline = document.getElementById('humTlTimeline');
    if (timeline) timeline.style.display = 'flex';

    timelapseComputeStats(timelapseEvents);
    timelapseRenderFrame(0);
}

function openUnifiedTimelapse() {
    const btn = document.getElementById('v-tl-btn-unified');
    const docId = btn?.dataset?.docId;
    if (!docId) { showToast('❌ Nincs dokumentum kiválasztva!'); return; }
    document.getElementById('timelapse-doc-input').value = docId;
    document.getElementById('tl-modal').classList.add('open');
    loadTimelapse(docId);
}

function openPubTimelapse() {
    const btn = document.getElementById('pub-tl-btn');
    const docId = btn?.dataset?.docId;
    if (!docId) { showToast('❌ Nincs dokumentum azonosító!'); return; }
    document.getElementById('timelapse-doc-input').value = docId;
    document.getElementById('tl-modal').classList.add('open');
    loadTimelapse(docId);
}

/* ─── 10. DASHBOARD ÉS MY DOCS ─────────────────────────────────────── */
// loadDashboard, renderDocs, filter, delete, publikálás

async function loadDashboard() {
    if (!currentUser) return;
    
    const { data: profile } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
    const { data: docs } = await db.from('documents').select('*').eq('author_id', currentUser.id).order('saved_at', { ascending: false });
    
    allUserDocs = docs || [];

    document.getElementById('d-username').textContent = profile?.username || currentUser.email;
    document.getElementById('d-humano-id').textContent = `HUMANO ID: ${profile?.humano_id || '–'}`;

    const plan = profile?.plan || 'free';
    const used = profile?.used_credits || 0;
    const limit = profile?.monthly_credits ?? getPlanMonthlyLimit(plan);
    const unlimited = isPlanUnlimited(plan);
    const pct = unlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100);
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const trialDaysLeft = trialActive
        ? Math.ceil((new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    document.getElementById('d-stats').innerHTML = [
        { label: 'Hitelesített szövegek', val: allUserDocs.length, sub: 'összesen' },
        { label: 'Felhasznált kredit', val: used, sub: `/ ${unlimited ? '∞' : limit}` },
        { label: 'Csomag', val: getPlanLabel(plan), sub: trialActive ? `🎁 Próba: még ${trialDaysLeft} nap` : '' },
        { label: 'Regisztrált', val: (fmtDate(profile?.created_at || '') || '–').split(' ')[0] || '–', sub: '' },
    ].map(s =>
        `<div class="card stat-card"><div class="s-label">${s.label}</div><div class="s-val gt">${s.val}</div>${s.sub ? `<div class="s-sub">${s.sub}</div>` : ''}</div>`
    ).join('');

    document.getElementById('d-credit-bar').style.width = `${pct}%`;
    document.getElementById('d-credit-label').textContent = unlimited
        ? `${getPlanLabel(plan)} – Korlátlan`
        : `${used} / ${limit} felhasználva`;

    const psnip = document.getElementById('d-profile-snippet');
    if (psnip && profile) {
        psnip.innerHTML = `
            <div style="font-family:var(--font-mono);font-size:.8rem;color:var(--muted)">${esc(profile.humano_id || '–')}</div>
            <div style="font-size:.85rem;color:var(--text);margin-top:4px">${esc(profile.bio || 'Még nincs bio.')}</div>`;
    }
    
    renderDocs(allUserDocs);
    if (typeof loadApiKeys === 'function') loadApiKeys();
}

function renderDocs(docs) {
    const el = document.getElementById('d-doc-list');
    if (!docs.length) {
        el.innerHTML = `<div style="text-align:center;padding:4rem 2rem;color:var(--muted)">
            <div style="font-size:3rem;margin-bottom:1rem">📝</div>
            <p style="margin-bottom:1.5rem">Még nincs hitelesített szöveged.</p>
            <button class="btn btn-gold" onclick="showPage('editor')">✦ Írás megkezdése</button>
        </div>`;
        return;
    }
    
    el.innerHTML = docs.map(d => {
        const badge = getHumanoBadge(d.process_data?.humanIndex || 0);
        return `
            <div class="doc-row">
                <div style="flex:1;min-width:0">
                    <div class="doc-title-cell">${esc(d.title || 'Cím nélkül')}</div>
                    <div class="doc-meta-cell">${d.doc_id} · v${d.version || 1} · ${fmtDate(d.saved_at)} · ${d.process_data?.keystrokeCount ?? 0} leütés · ${d.process_data?.humanIndex ? d.process_data.humanIndex + '% emberi ·' : ''} ${d.ots_receipt ? '⛓️ OTS ✓' : d.ots_pending ? '⏳ OTS' : '–'}</div>
                </div>
                <div style="display:flex;gap:.5rem;align-items:center;flex-shrink:0;flex-wrap:wrap">
                    <span style="padding:.2rem .65rem;border-radius:20px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.2);font-size:.72rem;font-weight:700;color:${badge.color}">${badge.icon} ${badge.label}</span>
                    <button class="btn btn-outline btn-sm" onclick="verifyDoc('${esc(d.doc_id)}')">🔍</button>
                    <button class="btn btn-outline btn-sm" onclick="newVersion('${esc(d.doc_id)}')">📝</button>
                    ${d.ots_receipt ? `<button class="btn btn-outline btn-sm" onclick="downloadOtsFile('${esc(d.doc_id)}')" title=".ots letöltés">⛓️</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteDoc('${esc(d.doc_id)}')">🗑</button>
                </div>
            </div>`;
    }).join('');
}

function filterDocs() {
    const q = document.getElementById('d-search').value.toLowerCase();
    renderDocs(q ? allUserDocs.filter(d => (d.title || '').toLowerCase().includes(q) || d.doc_id.toLowerCase().includes(q)) : allUserDocs);
}

function verifyDoc(id) {
    document.getElementById('v-input-unified').value = id;
    showPage('verify-unified');
    doVerifyUnified();
}

async function newVersion(parentDocId) {
    const { data: doc } = await db.from('documents').select('*').eq('doc_id', parentDocId).single();
    if (!doc) return;
    
    showPage('editor');
    setTimeout(() => {
        document.getElementById('doc-content-area').innerHTML = '';
        document.getElementById('doc-title-input').value = '';
        document.getElementById('cert-panel').style.display = 'none';
        document.getElementById('e-rhythm-warn').style.display = 'none';
        document.getElementById('e-word-warn').style.display = 'none';
        
        clearInterval(E.timerInterval);
        Object.assign(E, { events: [], keys: 0, dels: 0, pauses: 0, focusSwitches: 0, warns: 0, sessionStart: null, lastKey: null, certDocId: null, certTitle: null, certHash: null, pulseHistory: [] });
        
        editorSetStatus('idle');
        editorUpdateStats();
        editorCheckSave();
        drawPulse();
        
        const nv = (doc.version || 1) + 1;
        document.getElementById('doc-title-input').value = doc.title.replace(/\s*\(v\d+\)$/, '') + ` (v${nv})`;
        document.getElementById('doc-content-area').dataset.parentDocId = parentDocId;
        
        initPulseCanvas();
        showToast('📝 Új verzió – szerkeszd és hitelesítsd!');
    }, 300);
}

async function deleteDoc(id) {
    if (!confirm('Biztosan törlöd ezt a dokumentumot?')) return;
    
    const { data: doc } = await db.from('documents').select('doc_id,title,author_id,author_name,hash,ots_receipt').eq('doc_id', id).single();
    
    if (doc?.hash) {
        await db.from('deleted_docs').insert({
            doc_id: doc.doc_id,
            title: doc.title,
            author_id: doc.author_id,
            author_name: doc.author_name,
            hash: doc.hash,
            ots_receipt: doc.ots_receipt || null,
            deleted_at: new Date().toISOString()
        }).catch(() => {});
    }
    
    await db.from('documents').delete().eq('doc_id', id).eq('author_id', currentUser.id);
    allUserDocs = allUserDocs.filter(d => d.doc_id !== id);
    renderDocs(allUserDocs);
    showToast('🗑 Dokumentum törölve.');
}

async function loadMyDocs() {
    if (!currentUser) {
        showPage('auth');
        return;
    }
    
    document.getElementById('my-docs-list').innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)">⏳ Betöltés...</div>';
    
    const { data, error } = await db.from('documents')
        .select('doc_id,title,content,hash,created_at,process_data,is_public,is_published,ots_receipt,ots_pending')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
    
    if (error || !data) {
        document.getElementById('my-docs-list').innerHTML = '<div class="alert alert-error">Hiba a dokumentumok betöltésekor.</div>';
        return;
    }
    
    myDocsAll = data;
    calcFlexStats(data);
    renderMyDocs(data);
}

function calcFlexStats(docs) {
    const totalChars = docs.reduce((s, d) => s + (d.content?.length || 0), 0);
    const humanHours = (totalChars / 18000).toFixed(1);
    const avgHI = docs.length
        ? Math.round(docs.reduce((s, d) => s + (d.process_data?.humanIndex || 0), 0) / docs.length)
        : 0;
    
    document.getElementById('flex-total-chars').textContent = totalChars.toLocaleString('hu-HU');
    document.getElementById('flex-human-hours').textContent = `= ${humanHours} óra tiszta emberi munka`;
    document.getElementById('flex-doc-count').textContent = `${docs.length} hitelesített dokumentum`;
    document.getElementById('flex-avg-human-index').textContent = avgHI + '%';
    document.getElementById('flex-avg-fill').style.width = avgHI + '%';
    
    window._flexStats = { totalChars, humanHours, docCount: docs.length, avgHI };
}

function filterMyDocs() {
    const q = (document.getElementById('my-docs-search')?.value || '').toLowerCase();
    const sort = document.getElementById('my-docs-sort')?.value || 'newest';
    
    let filtered = myDocsAll.filter(d => (d.title || '').toLowerCase().includes(q));
    
    if (sort === 'oldest') filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sort === 'human_index') filtered.sort((a, b) => (b.process_data?.humanIndex || 0) - (a.process_data?.humanIndex || 0));
    else if (sort === 'chars') filtered.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
    else filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    document.getElementById('my-docs-count-label').textContent = `${filtered.length} dokumentum`;
    renderMyDocs(filtered);
}

function renderMyDocs(docs) {
    const el = document.getElementById('my-docs-list');
    if (!docs.length) {
        el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)">Még nincs hitelesített dokumentumod.</div>';
        return;
    }
    
    el.innerHTML = docs.map(d => {
        const pd = d.process_data || {};
        const chars = d.content?.length || 0;
        const mins = pd.sessionDurationMs ? Math.round(pd.sessionDurationMs / 60000) : 0;
        const hi = pd.humanIndex || 0;
        const charsPerMin = mins > 0 ? Math.round(chars / mins) : 0;
        const speedPct = Math.min(100, charsPerMin / 12);
        const speedColor = charsPerMin > 800 ? 'var(--danger)' : charsPerMin > 300 ? 'var(--gold)' : 'var(--success)';
        const otsHtml = d.ots_receipt
            ? '<span class="badge badge-success" style="font-size:.65rem">⛓️ BTC</span>'
            : d.ots_pending ? '<span class="badge badge-muted" style="font-size:.65rem">⏳ OTS</span>' : '';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://humano-hu.vercel.app/verify/' + d.doc_id)}&color=C9A84C&bgcolor=FFFFFF&margin=6&format=png`;
        
        return `<div class="doc-card">
            <div class="doc-card-header">
                <div>
                    <div class="doc-card-title" onclick="openPubVerify('${esc(d.doc_id)}')">${esc(d.title || 'Cím nélkül')}</div>
                    <div class="doc-card-meta">${esc(d.doc_id)} · ${fmtDate(d.created_at)} ${d.is_public ? '· 🌐 Nyilvános' : '· 🔒 Privát'}</div>
                    <div style="margin-top:.4rem;display:flex;gap:.4rem;flex-wrap:wrap">${otsHtml}<span class="badge" style="font-size:.65rem;background:rgba(201,168,76,.1);color:var(--gold);border-color:var(--gold4)">EI: ${hi}%</span></div>
                </div>
                <div class="doc-card-qr"><img src="${qrUrl}" alt="QR" loading="lazy"/></div>
            </div>
            <div class="doc-card-body">
                <div>
                    <div class="doc-card-stats">
                        <div class="doc-stat"><div class="doc-stat-val">${chars.toLocaleString('hu-HU')}</div><div class="doc-stat-label">Karakter</div></div>
                        <div class="doc-stat"><div class="doc-stat-val">${pd.keystrokeCount || 0}</div><div class="doc-stat-label">Leütés</div></div>
                        <div class="doc-stat"><div class="doc-stat-val">${pd.deletionCount || 0}</div><div class="doc-stat-label">Javítás</div></div>
                        <div class="doc-stat"><div class="doc-stat-val">${mins}</div><div class="doc-stat-label">Perc</div></div>
                    </div>
                    <div style="margin-top:.75rem;font-size:.72rem;color:var(--muted);font-family:var(--font-mono)">Gépelési sebesség: ${charsPerMin} kar/perc</div>
                    <div class="speed-bar"><div class="speed-fill" style="width:${speedPct}%;background:${speedColor}"></div></div>
                </div>
                <div class="doc-card-actions">
                    <button class="btn btn-gold btn-sm" onclick="openPubVerify('${esc(d.doc_id)}')">🔍 Megtekint</button>
                    <button class="btn btn-outline btn-sm" onclick="downloadMyDocPdf('${esc(d.doc_id)}')">📄 PDF</button>
                    <button class="btn btn-outline btn-sm" onclick="copyToClipboard('${esc(d.doc_id)}');showToast('DOC ID másolva!')">📋 ID</button>
                    <button class="btn btn-outline btn-sm" id="pub-toggle-${esc(d.doc_id)}" onclick="toggleDocPublic('${esc(d.doc_id)}',${d.is_public})" title="${d.is_public ? 'Nyilvánosság visszavonása' : 'Nyilvánosra állítás'}">${d.is_public ? '🌐 Nyilvános' : '🔒 Privát'}</button>
                    <button class="btn btn-outline btn-sm" id="publish-toggle-${esc(d.doc_id)}" onclick="toggleDocPublished('${esc(d.doc_id)}',${d.is_published || false})" title="${d.is_published ? 'Publikálás visszavonása' : 'Publikálás'}">${d.is_published ? '📢 Publikált' : '📄 Publikálás'}</button>
                </div>
            </div>
        </div>`;
    }).join('');
    
    document.getElementById('my-docs-count-label').textContent = `${docs.length} dokumentum`;
}

async function toggleDocPublic(docId, currentlyPublic) {
    const newState = !currentlyPublic;
    const { error } = await db.from('documents')
        .update({ is_public: newState })
        .eq('doc_id', docId)
        .eq('author_id', currentUser.id);

    if (error) { showToast('❌ Hiba: ' + error.message); return; }

    const doc = myDocsAll.find(d => d.doc_id === docId);
    if (doc) doc.is_public = newState;

    renderMyDocs(myDocsAll);
    showToast(newState ? '🌐 Dokumentum nyilvánosra állítva.' : '🔒 Dokumentum privátba visszavonva.');
}

async function toggleDocPublished(docId, currentState) {
    const newState = !currentState;
    const { error } = await db.from('documents')
        .update({ is_published: newState })
        .eq('doc_id', docId)
        .eq('author_id', currentUser.id);

    if (error) {
        showToast('❌ Hiba: ' + error.message);
        return;
    }

    const doc = myDocsAll.find(d => d.doc_id === docId);
    if (doc) doc.is_published = newState;

    const btn = document.getElementById(`publish-toggle-${docId}`);
    if (btn) {
        btn.textContent = newState ? '📢 Publikált' : '📄 Publikálás';
        btn.title = newState ? 'Publikálás visszavonása' : 'Publikálás';
    }

    showToast(newState ? '📢 Publikálva – megjelenik a Publikációk oldalon!' : '🔒 Publikálás visszavonva.');
}

async function downloadMyDocPdf(docId) {
    trackEvent('PDF_Generated', { doc_id: docId, source: 'my_docs' });
    
    const { data: doc } = await db.from('documents').select('*').eq('doc_id', docId).single();
    if (!doc) { showToast('❌ Dokumentum nem található.'); return; }
    
    const pd = doc.process_data || {};
    await generatePdfCert(
        doc.doc_id,
        doc.title,
        doc.author_name,
        doc.hash,
        doc.created_at,
        doc.ots_receipt ? 'confirmed' : (doc.ots_pending ? 'pending' : 'none'),
        pd
    );
}

function flexCopyText() {
    const s = window._flexStats || {};
    const text = `${(s.totalChars || 0).toLocaleString('hu-HU')} karakter – ${s.humanHours || 0} óra tiszta emberi munka – ${s.docCount || 0} hitelesített dokumentum. Átlag Humán Index: ${s.avgHI || 0}%. humano-hu.vercel.app #HumanoVerified`;
    copyToClipboard(text);
    showToast('📋 Szöveg másolva!');
}

/* ─── 11. ADMIN FELÜLET ───────────────────────────────────────────── */
// loadAdmin, loadLivingEntityDashboard, loadAppeals, fellebbezés kezelés

async function loadAdmin() {
    if (!currentUser) return;
    
    const { data: profile } = await db.from('profiles').select('is_admin').eq('id', currentUser.id).single();
    if (!profile?.is_admin) { showPage('landing'); return; }
    
    const { data: users } = await db.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: docs } = await db.from('documents').select('*').order('saved_at', { ascending: false });
    
    const u = users || [], d = docs || [];

    document.getElementById('admin-stats').innerHTML = [
        { label: 'Összes felhasználó', val: u.length },
        { label: 'Összes dokumentum', val: d.length },
        { label: 'OTS rögzített', val: d.filter(x => x.ots_receipt).length },
        { label: 'OTS folyamatban', val: d.filter(x => x.ots_pending && !x.ots_receipt).length },
    ].map(s => `<div class="card stat-card"><div class="s-label">${s.label}</div><div class="s-val gt">${s.val}</div></div>`).join('');

    document.getElementById('admin-users-body').innerHTML = u.length ? u.map(p => `
        <tr>
            <td style="font-family:var(--font-mono);font-size:.72rem">${esc(p.humano_id || '–')}</td>
            <td>${esc(p.username || '–')}</td>
            <td><span class="badge ${p.plan === 'premium' ? 'badge-gold' : 'badge-muted'}">${esc(p.plan || 'free')}</span></td>
            <td style="font-family:var(--font-mono);font-size:.72rem">${fmtDate(p.created_at)}</td>
            <td>${p.used_credits || 0}/${p.monthly_credits || 1}</td>
        </tr>`).join('') : '<tr><td colspan="5" style="color:var(--muted);text-align:center;padding:2rem">Nincs adat</td></tr>';

    document.getElementById('admin-docs-body').innerHTML = d.length ? d.map(doc => `
        <tr>
            <td style="font-family:var(--font-mono);font-size:.72rem">${esc(doc.doc_id)}</td>
            <td>${esc(doc.title || '–')}</td>
            <td>${esc(doc.author_name || '–')}</td>
            <td style="font-family:var(--font-mono);font-size:.72rem">${fmtDate(doc.saved_at)}</td>
            <td style="font-family:var(--font-mono);font-size:.68rem">${(doc.hash || '').substring(0, 16)}…</td>
            <td>${doc.ots_receipt ? '<span class="badge badge-success">⛓️ ✓</span>' : doc.ots_pending ? '<span class="badge badge-muted">⏳</span>' : '–'}</td>
        </tr>`).join('') : '<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:2rem">Nincs adat</td></tr>';

    if (typeof loadLivingEntityDashboard === 'function') loadLivingEntityDashboard();
    loadAppeals();
}

async function loadAppeals() {
    const tbody = document.getElementById('appeals-tbody');
    if (!tbody) return;

    const { data, error } = await db
        .from('appeals')
        .select('*, profiles(username, humano_id), documents(title)')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        tbody.innerHTML = '<tr><td colspan="6">Hiba</td></tr>';
        return;
    }

    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted)">Nincs fellebbezés</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(a => `
        <tr>
            <td style="font-family:var(--font-mono);font-size:.75rem">${a.id.slice(0, 8)}...</td>
            <td>${a.profiles?.username || '–'}</td>
            <td style="font-size:.8rem">${a.documents?.title || a.doc_id || '–'}</td>
            <td style="font-size:.8rem">${a.reason.slice(0, 60)}${a.reason.length > 60 ? '…' : ''}</td>
            <td>
                <span class="badge ${a.status === 'pending' ? 'badge-warn' : a.status === 'resolved' ? 'badge-success' : 'badge-muted'}">
                    ${a.status}
                </span>
            </td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="openAppealDetail('${a.id}')">
                    Kezelés
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateAppealStatus(appealId, status, notes) {
    const { error } = await db
        .from('appeals')
        .update({
            status,
            admin_notes: notes,
            admin_id: currentUser.id,
            resolved_at: ['resolved', 'rejected'].includes(status) ? new Date().toISOString() : null,
        })
        .eq('id', appealId);

    if (error) {
        showToast('❌ Hiba: ' + error.message);
        return;
    }

    showToast('✅ Fellebbezés frissítve');
    loadAppeals();
}

async function submitAppeal() {
    const reason = document.getElementById('appeal-reason')?.value?.trim();
    const docId = document.getElementById('v-input-unified')?.value?.trim();

    if (!reason) {
        showToast('❌ Kérjük, írd le a fellebbezés okát!');
        return;
    }

    const btn = document.getElementById('appeal-submit-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Küldés...';
    }

    try {
        const { data, error } = await db
            .from('appeals')
            .insert({
                doc_id: docId || null,
                reason: reason,
                user_id: currentUser?.id || null,
                description: document.getElementById('appeal-description')?.value?.trim() || null,
            })
            .select('id')
            .single();

        if (error) throw new Error(error.message);

        try {
            await db.functions.invoke('appeal-notify', {
                body: { appeal_id: data.id }
            });
        } catch (notifyErr) {
            console.warn('Appeal értesítés sikertelen:', notifyErr);
        }

        showToast('✅ Fellebbezés benyújtva – 5 munkanapon belül válaszolunk!');
        document.getElementById('appeal-reason').value = '';
        if (document.getElementById('appeal-description'))
            document.getElementById('appeal-description').value = '';

    } catch (err) {
        showToast('❌ Hiba a beküldéskor: ' + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📨 Fellebbezés benyújtása';
        }
    }
}

/* ─── 12. VERIFY ÉS PUBLIKUS OLDALAK ──────────────────────────────── */
// unified verify, pub verify, loadLatestRegistry, search

async function doVerifyUnified() {
    const id = (document.getElementById('v-input-unified')?.value || '').trim().toUpperCase();
    const resultDiv = document.getElementById('v-result-unified');
    resultDiv.style.display = 'none';
    
    if (!id) { showToast('❌ Adj meg egy dokumentum azonosítót!'); return; }

    const { data: doc, error } = await db.from('documents').select('*').eq('doc_id', id).single();
    if (error || !doc) { showToast('❌ Nem található ilyen azonosítójú dokumentum.'); return; }
    
    renderVerifyResultUnified(doc);
}

async function verifyByTextUnified() {
    const text = (document.getElementById('v-text-unified')?.value || '').trim();
    if (!text) { showToast('❌ Illessz be szöveget!'); return; }

    showToast('🔍 Hash kiszámítása...');
    const hash = await sha256(text);

    const { data } = await db.from('documents').select('*').eq('hash', hash).limit(1);
    if (!data || !data.length) { showToast('❌ Nem található egyező dokumentum.'); return; }
    
    renderVerifyResultUnified(data[0]);
}

function renderVerifyResultUnified(doc) {
    const pd = doc.process_data || {};
    const rhythmOk = (pd.rhythmWarnings || 0) < 5;
    const humanLabel = pd.humanCategory || (pd.humanIndex ? pd.humanIndex + '%' : '–');
    const badge = getHumanoBadge(pd.humanIndex || 0);

    document.getElementById('v-icon-unified').textContent = rhythmOk ? '✅' : '⚠️';
    document.getElementById('v-title-unified').textContent = doc.title || 'Cím nélkül';
    document.getElementById('v-verdict-unified').innerHTML = rhythmOk
        ? `<span style="color:var(--success)">✅ Rögzített munkamenet – emberi dinamika – Ritmus: <strong>${humanLabel}</strong></span>
           <span style="display:inline-flex;align-items:center;gap:.35rem;margin-left:.75rem;padding:.25rem .7rem;border-radius:20px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);font-size:.78rem;font-weight:700;color:${badge.color}">${badge.icon} ${badge.label}</span>`
        : `<span style="color:var(--danger)">⚠️ Szokatlan gépelési ritmus (${pd.rhythmWarnings} figyelmeztetés)</span>`;

    document.getElementById('v-hash-unified').textContent = doc.hash || '–';

    const meta = [
        ['Dokumentum ID', doc.doc_id],
        ['Szerző', doc.author_name || '–'],
        ['Létrehozva', fmtDate(doc.created_at)],
        ['Leütések', pd.keystrokeCount ?? '–'],
        ['Törlések', pd.deletionCount ?? '–'],
        ['Szünetek', pd.pauseCount ?? '–'],
        ['Ritmus', humanLabel],
        ['Bizalmi szint', `${badge.icon} ${badge.label}`],
        ['💎 Kognitív Jelenlét', pd.tripleLockScore ? pd.tripleLockScore + '/100' : '–'],
        ['🧠 Gondolkodási szünetek', pd.cfDnaScore ? pd.cfDnaScore + '/100' : '–'],
        ['✍️ Alkotói hév', pd.flowPulseScore ? pd.flowPulseScore + '/100' : '–'],
        ['🫀 Biológiai ritmus', pd.smdScore ? pd.smdScore + '/100' : '–'],
    ];
    
    document.getElementById('v-meta-unified').innerHTML = meta
        .map(([l, v]) => `<div class="meta-item"><label>${l}</label><span>${v}</span></div>`)
        .join('');

    const hasOts = !!doc.ots_receipt;
    document.getElementById('v-ots-section-unified').innerHTML = hasOts ? `
        <div style="background:rgba(74,184,112,.06);border:1px solid rgba(74,184,112,.25);border-radius:10px;padding:1.1rem 1.25rem;margin-bottom:.5rem">
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
                <span style="font-size:1.6rem">⛓️</span>
                <div>
                    <div style="font-weight:700;color:#4ab870;font-size:.95rem">Bitcoin blokkláncon rögzítve ✓</div>
                    <div style="font-size:.78rem;color:var(--muted);margin-top:2px">Az OpenTimestamps protokoll beégette ezt a dokumentumot a Bitcoin hálózatba</div>
                </div>
            </div>
            <div style="font-size:.82rem;color:var(--muted);line-height:1.8;margin-bottom:.9rem">
                Ez azt jelenti, hogy <strong style="color:var(--text)">matematikailag bizonyított</strong>, hogy ez a dokumentum 
                <strong style="color:var(--gold)">legkésőbb ezen a napon már létezett</strong> – és senki nem tudja megváltoztatni vagy meghamisítani.
            </div>
            <div style="background:rgba(0,0,0,.3);border-radius:8px;padding:.75rem 1rem;margin-bottom:.9rem">
                <div style="font-size:.7rem;color:var(--muted);margin-bottom:.3rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.5px">SHA-256 hash (a blokkláncon rögzített lenyomat)</div>
                <div style="font-family:var(--font-mono);font-size:.72rem;color:#a6d6ff;word-break:break-all">${doc.hash || '–'}</div>
            </div>
            <div style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem">
                🔍 <strong style="color:var(--text)">Független ellenőrzés:</strong> Az alábbi gombra kattintva az opentimestamps.org oldalon 
                közvetlenül a Bitcoin hálózaton ellenőrizheted – a HUMANO-tól teljesen függetlenül.
            </div>
            <a href="https://opentimestamps.org" target="_blank" rel="noopener"
               style="display:inline-flex;align-items:center;gap:.5rem;padding:.55rem 1.1rem;background:rgba(74,184,112,.12);border:1px solid rgba(74,184,112,.3);border-radius:8px;color:#4ab870;font-size:.82rem;font-weight:600;text-decoration:none;transition:all .2s"
               onmouseover="this.style.background='rgba(74,184,112,.22)'" 
               onmouseout="this.style.background='rgba(74,184,112,.12)'">
                ⛓️ Ellenőrzés a Bitcoin hálózaton →
            </a>
        </div>`
        : doc.ots_pending ? `
        <div style="background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:1rem 1.25rem">
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem">
                <span style="font-size:1.4rem">⏳</span>
                <div>
                    <div style="font-weight:700;color:var(--gold2);font-size:.9rem">Bitcoin megerősítés folyamatban</div>
                    <div style="font-size:.75rem;color:var(--muted);margin-top:2px">Általában 1–2 óra szükséges</div>
                </div>
            </div>
            <div style="font-size:.8rem;color:var(--muted);line-height:1.75">
                A dokumentum SHA-256 hash-e már elküldve az OpenTimestamps calendar szervereknek. 
                A Bitcoin hálózat a következő blokk kibányászásakor rögzíti véglegesen.
            </div>
        </div>`
        : `<span class="badge badge-muted">OTS – nincs adat</span>`;

    if (hasOts) document.getElementById('v-ots-dl-btn-unified').style.display = 'inline-flex';

    generateQR('v-qr-container-unified', doc.doc_id);
    
    const tlBtn = document.getElementById('v-tl-btn-unified');
    if (tlBtn) {
        tlBtn.style.display = 'inline-flex';
        tlBtn.dataset.docId = doc.doc_id;
    }

    const vExpl = document.getElementById('v-score-explanation');
    const vExplText = document.getElementById('v-score-explanation-text');
    if (vExpl && vExplText) {
        vExpl.style.display = 'block';
        const pct = pd.humanIndex || 0;
        if (pct >= 85) {
            vExplText.innerHTML = `<span style="color:var(--success)">✅ Magas kognitív jelenlét</span> – A gépelési ritmus nagyon változatos és természetes emberi mintázatot mutat.`;
        } else if (pct >= 60) {
            vExplText.innerHTML = `<span style="color:var(--gold)">🟡 Közepes kognitív jelenlét</span> – A gépelési ritmus emberi jellegű. <strong style="color:var(--text)">Ez NEM jelenti azt hogy AI írta a szöveget</strong> – csak azt hogy a gépelési mintázat kevésbé változatos.`;
        } else if (pct >= 40) {
            vExplText.innerHTML = `<span style="color:var(--gold3)">🟠 Vegyes mintázat</span> – <strong style="color:var(--text)">Ez NEM jelenti azt hogy csalt vagy AI írta</strong> – a HUMANO nem ítélkezik, tényeket közöl.`;
        } else {
            vExplText.innerHTML = `<span style="color:#e05555">🔴 Alacsony változatosság</span> – <strong style="color:var(--text)">Ez NEM egyenlő azzal hogy AI írta a szöveget.</strong> A rendszer a gépelési ritmus változatosságát méri – nem a szöveg tartalmát.`;
        }
    }
    
    document.getElementById('v-result-unified').style.display = 'block';
    document.dispatchEvent(new Event('humano:verify-result'));
    document.getElementById('v-result-unified').scrollIntoView({ behavior: 'smooth' });
}

async function searchRegistryUnified() {
    const q = (document.getElementById('reg-search-unified')?.value || '').trim();
    const resultsDiv = document.getElementById('reg-results-unified');
    const statsDiv = document.getElementById('reg-stats-unified');

    if (!q) { loadLatestRegistryUnified(); return; }
    resultsDiv.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">🔍 Keresés...</div>';

    const { data } = await db.from('documents')
        .select('doc_id, created_at, ots_receipt, ots_pending')
        .eq('is_public', true)
        .ilike('doc_id', `%${q}%`)
        .limit(20);

    if (statsDiv) {
        statsDiv.style.display = 'block';
        statsDiv.textContent = `${data?.length || 0} találat: "${q}"`;
    }

    if (!data || !data.length) {
        resultsDiv.innerHTML = '<div class="alert alert-info">Nincs találat.</div>';
        return;
    }

    resultsDiv.innerHTML = data.map(d => `
        <div class="registry-result"
             onclick="document.getElementById('v-input-unified').value='${esc(d.doc_id)}'; doVerifyUnified()">
            <div>
                <div class="reg-doc-id">${esc(d.doc_id)}</div>
                <div class="reg-meta">${fmtDate(d.created_at)}</div>
            </div>
            <span class="badge ${d.ots_receipt ? 'badge-success' : 'badge-muted'}">
                ${d.ots_receipt ? '⛓️ BTC' : d.ots_pending ? '⏳ OTS' : '–'}
            </span>
        </div>
    `).join('');
}

async function loadLatestRegistryUnified() {
    const resultsDiv = document.getElementById('reg-results-unified');
    const statsDiv = document.getElementById('reg-stats-unified');

    resultsDiv.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">⏳ Betöltés...</div>';

    const { data } = await db.from('documents')
        .select('doc_id, created_at, ots_receipt, ots_pending')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

    if (statsDiv) {
        statsDiv.style.display = 'block';
        statsDiv.textContent = `Legfrissebb ${data?.length || 0} nyilvános dokumentum`;
    }

    if (!data || !data.length) {
        resultsDiv.innerHTML = '<div class="alert alert-info">Még nincs nyilvános dokumentum.</div>';
        return;
    }

    resultsDiv.innerHTML = data.map(d => `
        <div class="registry-result"
             onclick="document.getElementById('v-input-unified').value='${esc(d.doc_id)}'; doVerifyUnified()">
            <div>
                <div class="reg-doc-id">${esc(d.doc_id)}</div>
                <div class="reg-meta">${fmtDate(d.created_at)}</div>
            </div>
            <span class="badge ${d.ots_receipt ? 'badge-success' : 'badge-muted'}">
                ${d.ots_receipt ? '⛓️ BTC' : d.ots_pending ? '⏳ OTS' : '–'}
            </span>
        </div>
    `).join('');
}

async function downloadUnifiedPdf() {
    const docId = document.getElementById('v-input-unified')?.value || '';
    if (!docId) { showToast('❌ Nincs dokumentum kiválasztva!'); return; }

    const { data: doc } = await db.from('documents').select('*').eq('doc_id', docId).single();
    if (!doc) { showToast('❌ Dokumentum nem található.'); return; }

    trackEvent('PDF_Generated', { doc_id: docId, source: 'unified_verify' });
    await generatePdfCert(
        doc.doc_id,
        doc.title,
        doc.author_name,
        doc.hash,
        doc.created_at,
        doc.ots_receipt ? 'confirmed' : (doc.ots_pending ? 'pending' : 'none'),
        doc.process_data || {}
    );
}

function copyUnifiedLink() {
    const docId = document.getElementById('v-input-unified')?.value || '';
    if (!docId) { showToast('❌ Nincs dokumentum kiválasztva!'); return; }
    copyToClipboard(`https://humano-hu.vercel.app/verify/${docId}`);
    showToast('🔗 Megosztási link másolva!');
}

async function openPubVerify(docId) {
    const { data: doc } = await db.from('documents').select('*').eq('doc_id', docId).single();
    if (!doc) { showToast('❌ Dokumentum nem található.'); return; }
    renderPubVerify(doc);
    showPage('pub-verify');
}

function renderPubVerify(doc) {
    const pd = doc.process_data || {};
    const hi = pd.humanIndex || 0;
    const rhythmOk = (pd.rhythmWarnings || 0) < 5;

    document.getElementById('pub-v-title').textContent = doc.title || 'Cím nélkül';
    document.getElementById('pub-v-subtitle').textContent = `Hitelesítési tanúsítvány · DOC ID: ${doc.doc_id}`;
    document.getElementById('pub-v-docid').textContent = doc.doc_id;
    document.getElementById('pub-v-date').textContent = fmtDate(doc.created_at);
    document.getElementById('pub-v-author').textContent = doc.author_name || '–';
    document.getElementById('pub-v-human-index').textContent = hi + '%';
    document.getElementById('pub-v-hash').textContent = doc.hash || '–';

    const vbox = document.getElementById('pub-verdict-box');
    if (rhythmOk && hi >= 40) {
        vbox.className = 'pub-verdict-box pub-verdict-ok';
        document.getElementById('pub-verdict-icon').textContent = '✅';
        document.getElementById('pub-verdict-text').style.color = 'var(--success)';
        document.getElementById('pub-verdict-text').textContent = 'Rögzített munkamenet – emberi dinamika igazolva';
        document.getElementById('pub-verdict-sub').textContent = 'A keletkezési folyamat rendben – emberi gépelési ritmus igazolva';
    } else {
        vbox.className = 'pub-verdict-box pub-verdict-warn';
        document.getElementById('pub-verdict-icon').textContent = '⚠️';
        document.getElementById('pub-verdict-text').style.color = 'var(--danger)';
        document.getElementById('pub-verdict-text').textContent = 'Szokatlan dinamika – az értékelés a befogadóé';
        document.getElementById('pub-verdict-sub').textContent = 'A biometrikus elemzés szabálytalan ritmust talált';
    }

    const chars = doc.content?.length || 0;
    const mins = pd.sessionDurationMs ? Math.round(pd.sessionDurationMs / 60000) : 0;
    const charsPerMin = mins > 0 ? Math.round(chars / mins) : 0;
    
    document.getElementById('pub-tp-chars').textContent = chars.toLocaleString('hu-HU');
    document.getElementById('pub-tp-mins').textContent = mins || '–';
    
    let tpVerdict = '–', tpDesc = '–', tpColor = 'var(--muted)';
    if (mins > 0 && chars > 0) {
        if (charsPerMin < 100) {
            tpVerdict = '✅ Hiteles';
            tpColor = 'var(--success)';
            tpDesc = `${charsPerMin} karakter/perc – természetes, gondolkodó írási sebesség.`;
        } else if (charsPerMin < 600) {
            tpVerdict = '✅ Normál';
            tpColor = 'var(--gold)';
            tpDesc = `${charsPerMin} karakter/perc – megfelel az emberi gépelési normának.`;
        } else {
            tpVerdict = '⚠️ Gyors';
            tpColor = 'var(--danger)';
            tpDesc = `${charsPerMin} karakter/perc – szokatlanul magas sebesség, ellenőrzés javasolt.`;
        }
    }
    
    document.getElementById('pub-tp-verdict').textContent = tpVerdict;
    document.getElementById('pub-tp-verdict').style.color = tpColor;
    document.getElementById('pub-tp-desc').textContent = tpDesc;

    const bioData = [
        ['Leütések', pd.keystrokeCount ?? '–'],
        ['Javítások', pd.deletionCount ?? '–'],
        ['Szünetek', pd.pauseCount ?? '–'],
        ['Ablakváltás', pd.focusSwitches ?? '–'],
        ['Ritmus std.dev.', pd.rhythmStddevMs ? pd.rhythmStddevMs + 'ms' : '–'],
        ['Ritmus átlag', pd.rhythmMeanMs ? pd.rhythmMeanMs + 'ms' : '–'],
    ];
    
    document.getElementById('pub-v-biometric-table').innerHTML = bioData.map(([l, v]) =>
        `<div style="background:var(--surface2);border-radius:6px;padding:.5rem .75rem"><div style="font-size:.65rem;color:var(--muted);font-family:var(--font-mono)">${l}</div><div style="font-weight:700;color:var(--gold2)">${v}</div></div>`
    ).join('');

    const otsHtml = doc.ots_receipt
        ? '<span class="badge badge-success">⛓️ Bitcoin blokkláncon rögzítve ✓</span>'
        : doc.ots_pending ? '<span class="badge badge-muted">⏳ Blokklánc megerősítés folyamatban...</span>'
            : '<span class="badge badge-muted">OTS – nincs adat</span>';
    
    document.getElementById('pub-v-ots-badge').innerHTML = otsHtml;

    drawPubSpectrum(pd);

    const pubTlBtn = document.getElementById('pub-tl-btn');
    if (pubTlBtn) {
        pubTlBtn.style.display = 'block';
        pubTlBtn.dataset.docId = doc.doc_id;
    }
}

function drawPubSpectrum(pd) {
    const canvas = document.getElementById('pub-spectrum-canvas');
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth || 700;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = 100;
    
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(0, 0, W, H);
    
    const data = (pd.pulseDataPoints && pd.pulseDataPoints.length > 1)
        ? pd.pulseDataPoints
        : null;
        
    if (!data) return;
    
    const maxVal = Math.max(...data);
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(201,168,76,0.3)');
    grad.addColorStop(0.5, 'rgba(240,208,112,0.8)');
    grad.addColorStop(1, 'rgba(201,168,76,0.3)');
    
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - (v / maxVal) * (H - 10);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, 'rgba(201,168,76,0.15)');
    fillGrad.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
}

/* ─── 13. PDF, KÉP, QR ÉS MEGOSZTÁS ───────────────────────────────── */
// generatePdfCert, generateSealCanvas, generateSmartImage, QR, share, social

function openSocialModal() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const title = E.certTitle || '–';
    const link = `https://humano-hu.vercel.app/verify/${docId}`;
    const text = `Épp hitelesítettem ezt a szöveget a HUMANO platformon – Bitcoin blokklánccal igazolva, hogy emberi kéz írta. 🖊️✦\n\n"${title}"\n\n${link}\n\n#HumanoVerified #EmberiAlkotás #AI`;
    
    _buildSocialGrid(link, text);
    document.getElementById('social-modal')?.classList.add('open');
}

function openFlexSocialModal() {
    const s = window._flexStats || {};
    const text = `Eddig ${(s.totalChars || 0).toLocaleString('hu-HU')} karaktert írtam a HUMANO platformon – ez ${s.humanHours || 0} óra tiszta emberi munka, Bitcoin blokklánccal igazolva. 🖊️✦ #HumanoVerified #EmberiAlkotás #AI\n\nhttps://humano-hu.vercel.app`;
    
    _buildSocialGrid('https://humano-hu.vercel.app', text);
    document.getElementById('social-modal')?.classList.add('open');
}

function _buildSocialGrid(link, text) {
    const grid = document.getElementById('social-btn-grid');
    if (!grid) return;
    
    const encLink = encodeURIComponent(link);
    const encText = encodeURIComponent(text);
    
    grid.innerHTML = SOCIAL_PLATFORMS.map(p => `
        <button class="social-btn" onclick="shareToSocial('${p.id}','${encLink}','${encText.replace(/'/g, "&#39;")}')">
            <span class="s-icon">${p.icon}</span>
            <span>${p.label}</span>
        </button>`).join('');
}

function closeSocialModal() {
    document.getElementById('social-modal')?.classList.remove('open');
}

function shareToSocial(platform, encLink, encText) {
    const link = decodeURIComponent(encLink);
    const text = decodeURIComponent(encText);
    
    const urls = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encLink}&summary=${encText}`,
        twitter: `https://twitter.com/intent/tweet?text=${encText}&url=${encLink}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encLink}&quote=${encText}`,
        reddit: `https://reddit.com/submit?url=${encLink}&title=${encText}`,
        whatsapp: `https://wa.me/?text=${encText}%20${encLink}`,
        telegram: `https://t.me/share/url?url=${encLink}&text=${encText}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encLink}&description=${encText}`,
        mastodon: `https://mastodon.social/share?text=${encText}%20${encLink}`,
        threads: `https://www.threads.net/intent/post?text=${encText}%20${encLink}`,
    };
    
    if (platform === 'copy') {
        copyToClipboard(link);
        showToast('🔗 Link másolva!');
        closeSocialModal();
        return;
    }
    
    if (platform === 'instagram') {
        copyToClipboard(text + '\n\n' + link);
        showToast('📸 Szöveg másolva – illeszd be az Instagram sztoridba!');
        closeSocialModal();
        return;
    }
    
    if (platform === 'tiktok') {
        copyToClipboard(text + '\n\n' + link);
        showToast('🎵 Szöveg másolva – illeszd be a TikTok bio-dba!');
        closeSocialModal();
        return;
    }
    
    const url = urls[platform];
    if (url) { window.open(url, '_blank', 'width=600,height=500'); closeSocialModal(); }
}

function shareCopyClipboard() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const hash = E.certHash || document.getElementById('cert-hash-val')?.textContent;
    const title = E.certTitle || document.getElementById('doc-title-input')?.value || '–';
    const link = `https://humano-hu.vercel.app/verify/${docId}`;
    const text = `HUMANO Hitelesített Szöveg\n${'─'.repeat(36)}\nCím: ${title}\nDOC ID: ${docId}\nSHA-256: ${hash}\nEllenőrző link: ${link}\n${'─'.repeat(36)}\nHitelesítve: humano-hu.vercel.app · Bitcoin blokklánc`;
    
    copyToClipboard(text);
    showToast('📋 Vágólapra másolva!');
}

function copyVerifyLink(docId) {
    const id = docId || E.certDocId || document.getElementById('cert-id-val')?.textContent;
    if (!id || id === '–') { showToast('Nincs dokumentum azonosító!'); return; }
    copyToClipboard(`https://humano-hu.vercel.app/verify/${id}`);
    showToast('🔗 Link másolva!');
}

function copyId() {
    const id = document.getElementById('cert-id-val')?.textContent;
    copyToClipboard(id);
    showToast('📋 ID másolva!');
}

function openReadPage() {
    if (!E.certDocId) return;
    window.open(`/read/${E.certDocId}`, '_blank');
}

function copyBadgeCode() {
    const code = document.getElementById('badge-html-code')?.textContent;
    if (code && code !== '–') { copyToClipboard(code); showToast('🏷️ Badge kód másolva!'); }
}

function copyVerifyBadgeCode() {
    const code = document.getElementById('v-badge-code')?.textContent;
    if (code && code !== '–') { copyToClipboard(code); showToast('🏷️ Badge kód másolva!'); }
}

function updateShareButtons(docId, title) {
    const readUrl = `https://humano-hu.vercel.app/share/${docId}`;
    const shareText = encodeURIComponent(`${title} – Hitelesített emberi tartalom\n${readUrl}`);
    const urlEnc = encodeURIComponent(readUrl);

    const fb = document.getElementById('share-fb');
    const tw = document.getElementById('share-tw');
    const wa = document.getElementById('share-wa');
    const tg = document.getElementById('share-tg');
    const li = document.getElementById('share-li');
    const rd = document.getElementById('share-rd');

    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`;
    if (tw) tw.href = `https://twitter.com/intent/tweet?text=${shareText}`;
    if (wa) wa.href = `https://wa.me/?text=${shareText}`;
    if (tg) tg.href = `https://t.me/share/url?url=${urlEnc}&text=${encodeURIComponent(title)}`;
    if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}`;
    if (rd) rd.href = `https://reddit.com/submit?url=${urlEnc}&title=${encodeURIComponent(title)}`;
}

function copyReadLink() {
    if (!E.certDocId) return;
    const url = `https://humano-hu.vercel.app/read/${E.certDocId}`;
    copyToClipboard(url);
    showToast('🔗 Link másolva!');
}

function openSendEmailModal() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const hash = E.certHash || document.getElementById('cert-hash-val')?.textContent;
    const title = E.certTitle || document.getElementById('doc-title-input')?.value || '–';
    const link = `https://humano-hu.vercel.app/verify/${docId}`;
    const readLink = `https://humano-hu.vercel.app/read/${docId}`;
    
    document.getElementById('send-doc-id-hidden').value = docId;
    document.getElementById('send-verify-link-hidden').value = link;
    document.getElementById('send-hash-hidden').value = hash;
    document.getElementById('send-doc-summary').innerHTML = `
        <strong style="color:var(--gold2)">${esc(title)}</strong><br>
        <span style="font-family:var(--font-mono);font-size:.75rem">DOC ID: ${esc(docId)}</span><br>
        <span style="color:var(--muted)">Verify link: <a href="${link}" target="_blank" style="color:var(--gold)">${link}</a></span>
        <br><span style="color:var(--muted)">Read link: <a href="${readLink}" target="_blank" style="color:var(--gold)">${readLink}</a></span>`;
    
    document.getElementById('send-subject').value = `HUMANO hitelesített szöveg: ${title}`;

    const targetEmail = document.getElementById('target-email-input')?.value?.trim();
    if (targetEmail) document.getElementById('send-to-email').value = targetEmail;

    document.getElementById('send-modal').classList.add('open');
}

function closeSendModal() {
    document.getElementById('send-modal').classList.remove('open');
    document.getElementById('send-modal-alert').innerHTML = '';
}

async function submitSendEmail(e) {
    e.preventDefault();
    
    const toEmail = document.getElementById('send-to-email').value.trim();
    if (!toEmail) {
        document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-error">Add meg a fogadó email-jét!</div>';
        return;
    }

    document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-info">⏳ Küldés...</div>';

    const docId = document.getElementById('send-doc-id-hidden').value;
    const verifyLink = document.getElementById('send-verify-link-hidden').value;
    const hash = document.getElementById('send-hash-hidden').value;
    const subject = document.getElementById('send-subject').value;
    const message = document.getElementById('send-message').value;

    try {
        const { data: { session } } = await db.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(`${SUPA_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                to: toEmail,
                subject: subject || `HUMANO hitelesített szöveg`,
                type: 'certification',
                doc_id: docId,
                hash: hash,
                verify_link: verifyLink,
                message: message,
            }),
        });

        const data = await res.json();

        if (!res.ok || data.error) throw new Error(data.error || 'Küldési hiba');

        document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-success">✅ Sikeresen elküldve!</div>';
        setTimeout(() => closeSendModal(), 2000);

    } catch (err) {
        document.getElementById('send-modal-alert').innerHTML = `<div class="alert alert-error">❌ Hiba: ${err.message}</div>`;
    }
}

function updateCertPanel(docId, hash, savedAt, otsReceipt, otsPending) {
    const now = fmtDate(savedAt || new Date().toISOString());
    
    const hashTimeEl = document.getElementById('tl-hash-time');
    const dbTimeEl = document.getElementById('tl-db-time');
    
    if (hashTimeEl) hashTimeEl.textContent = now;
    if (dbTimeEl) dbTimeEl.textContent = now;
    
    if (otsReceipt) {
        const d = document.getElementById('tl-ots-dot');
        if (d) { d.className = 'tl-dot done'; d.textContent = '✓'; }
        const otsTimeEl = document.getElementById('tl-ots-time');
        if (otsTimeEl) otsTimeEl.textContent = 'Bitcoin blokkláncon rögzítve ✓';
    }
    
    const publicDot = document.getElementById('tl-public-dot');
    if (publicDot) { publicDot.className = 'tl-dot done'; publicDot.textContent = '✓'; }

    const badge = getHumanoBadge(E.humanPct || 0);
    const badgeEl = document.getElementById('cert-trust-badge');
    if (badgeEl) {
        badgeEl.textContent = `${badge.icon} ${badge.label}`;
        badgeEl.style.color = badge.color;
        badgeEl.style.display = 'inline-flex';
    }

    const explanationEl = document.getElementById('cert-score-explanation');
    const explanationText = document.getElementById('cert-score-explanation-text');
    if (explanationEl && explanationText) {
        explanationEl.style.display = 'block';
        const pct = E.humanPct || 0;
        if (pct >= 85) {
            explanationText.innerHTML = `<span style="color:var(--success)">✅ Magas kognitív jelenlét</span> – A gépelési ritmus nagyon változatos és természetes emberi mintázatot mutat.`;
        } else if (pct >= 60) {
            explanationText.innerHTML = `<span style="color:var(--gold)">🟡 Közepes kognitív jelenlét</span> – A gépelési ritmus emberi jellegű. <strong style="color:var(--text)">Ez NEM jelenti azt hogy AI írta a szöveget</strong> – csak azt hogy a gépelési mintázat kevésbé változatos.`;
        } else if (pct >= 40) {
            explanationText.innerHTML = `<span style="color:var(--gold3)">🟠 Vegyes mintázat</span> – <strong style="color:var(--text)">Ez NEM jelenti azt hogy csaltál vagy AI írta</strong> – a HUMANO nem ítélkezik, tényeket közöl.`;
        } else {
            explanationText.innerHTML = `<span style="color:#e05555">🔴 Alacsony változatosság</span> – <strong style="color:var(--text)">Ez NEM egyenlő azzal hogy AI írta a szöveget.</strong> A rendszer a gépelési ritmus változatosságát méri – nem a szöveg tartalmát.`;
        }
    }

    generateQR('cert-qr-container', docId);
    
    const bl = document.getElementById('badge-preview-link');
    const bll = document.getElementById('badge-doc-id-label');
    const bc = document.getElementById('badge-html-code');
    
    if (bl) bl.href = `https://humano-hu.vercel.app/verify/${docId}`;
    if (bll) bll.textContent = docId;
    if (bc) bc.textContent = getBadgeHtml(docId);
}

async function downloadPdfCert() {
    if (!currentUser) { showToast('❌ Be kell jelentkezni!'); return; }

    const { data: profile } = await db
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', currentUser.id)
        .single();

    const plan = profile?.plan || 'free';
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const hasPdf = plan === 'lite' || plan === 'pro' || plan === 'institution' || plan === 'premium' || trialActive;

    if (!hasPdf) {
        showToast('❌ PDF tanúsítvány Lite csomagtól elérhető!');
        showPage('supporters');
        return;
    }

    const id = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const hash = E.certHash || document.getElementById('cert-hash-val')?.textContent;
    const title = E.certTitle || document.getElementById('doc-title-input')?.value || '–';
    
    if (!id || id === '–') { showToast('Nincs hitelesített dokumentum!'); return; }
    
    const processData = {
        keystrokeCount: E.keys,
        deletionCount: E.dels,
        pauseCount: E.pauses,
        focusSwitches: E.focusSwitches,
        humanIndex: E.humanPct || 0,
        humanCategory: E.humanCategory || '–',
        humanCV: E.humanCV || 0,
        sessionDurationMs: E.sessionStart ? Date.now() - E.sessionStart : 0,
        pulseDataPoints: E.pulseHistory.slice(),
        events: E.events.slice(-100),
        typedChars,
        pastedChars,
        typedPct: Math.round((typedChars / Math.max(1, typedChars + pastedChars)) * 100),
        pastedPct: Math.round((pastedChars / Math.max(1, typedChars + pastedChars)) * 100),
        entropyCV: E.entropyCV || 0,
        entropyPct: E.entropyPct || 0,
    };
    
    await generatePdfCert(
        id,
        title,
        currentUser?.email || '–',
        hash,
        new Date().toISOString(),
        'pending',
        processData
    );
}

async function generatePdfCert(docId, title, author, hash, createdAt, otsStatus, processData, otsTxid = null, zkpProof = null) {
    if (!window.jspdf) {
        showToast('PDF betöltés...');
        setTimeout(() => generatePdfCert(docId, title, author, hash, createdAt, otsStatus, processData), 2000);
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const PL = 14, PR = 14;
    const CW = W - PL - PR;

    const humanLabel = processData?.humanCategory || ((processData?.humanIndex ?? '-') + '%');
    const entropyPct = processData?.entropyPct ?? 0;
    const entropyCV = processData?.entropyCV ?? 0;
    const typedPct = processData?.typedPct ?? 100;
    const pastedPct = processData?.pastedPct ?? 0;
    const cfDnaScore = processData?.cfDnaScore ?? 0;
    const flowPulseScore = processData?.flowPulseScore ?? 0;
    const smdScore = processData?.smdScore ?? 0;
    const tripleLockScore = processData?.tripleLockScore ?? 0;

    pdf.setFillColor(6, 6, 8);
    pdf.rect(0, 0, W, H, 'F');
    
    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.3);
    pdf.rect(5, 5, W - 10, H - 10);
    
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.6);
    pdf.rect(8, 8, W - 16, H - 16);

    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HUMANO', W / 2, 21, { align: 'center' });
    
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(138, 106, 26);
    pdf.text('AZ EMBERI ALKOTAS DIGITALIS HITELESITOJE', W / 2, 27, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(240, 208, 112);
    pdf.text('KELETKEZÉSI NAPLÓ – TANÚSÍTVÁNY', W / 2, 33, { align: 'center' });
    
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.4);
    pdf.line(PL, 37, W - PR, 37);

    let y = 40;
    
    pdf.setFillColor(22, 22, 42);
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(PL, y, CW, 14, 2, 2, 'FD');
    
    pdf.setTextColor(138, 106, 26);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DOKUMENTUM AZONOSITO', W / 2, y + 4, { align: 'center' });
    
    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(11);
    pdf.setFont('courier', 'bold');
    pdf.text(docId || '-', W / 2, y + 11, { align: 'center' });
    y += 17;

    pdf.setTextColor(100, 80, 30);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ellenorzesi URL: https://humano-hu.vercel.app/verify/' + (docId || ''), W / 2, y, { align: 'center' });
    y += 5;

    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 4;

    const meta = [
        ['SZOVEG CIME', title || '-'],
        ['SZERZO', author || '-'],
        ['HITELESITES DATUMA', fmtDate(createdAt) || createdAt || '-'],
        ['OTS STATUSZ', otsStatus === 'confirmed' ? 'Bitcoin blokklancra rogzitve' : otsStatus === 'pending' ? 'Feldolgozas folyamatban' : '-'],
    ];
    
    meta.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col === 0 ? PL : W / 2 + 1;
        const bw = CW / 2 - 1;
        const by = y + row * 17;
        
        pdf.setFillColor(16, 16, 26);
        pdf.rect(x, by, bw, 15, 'F');
        
        pdf.setTextColor(100, 80, 30);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x + 3, by + 4);
        
        pdf.setTextColor(232, 217, 160);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(value).substring(0, 36), x + 3, by + 11);
    });
    
    y += 37;

    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 4;

    pdf.setFillColor(16, 16, 26);
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(PL, y, CW, 22, 2, 2, 'FD');
    
    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BIOMETRIKUS ADATOK', PL + 4, y + 5);

    const bio = [
        ['Leutes', processData?.keystrokeCount ?? '-'],
        ['Torles', processData?.deletionCount ?? '-'],
        ['Szunet', processData?.pauseCount ?? '-'],
        ['Ablakvaltas', processData?.focusSwitches ?? '-'],
        ['Ritmus', humanLabel],
        ['Iras ideje', processData?.sessionDurationMs ? Math.round(processData.sessionDurationMs / 60000) + ' perc' : '-'],
    ];

    const tripleLock = [
        ['CF-DNA', cfDnaScore + '/100'],
        ['NLS', flowPulseScore + '/100'],
        ['SMD', smdScore + '/100'],
        ['Kognitiv', tripleLockScore + '/100'],
    ];

    const bColW = CW / bio.length;
    bio.forEach(([lbl, val], i) => {
        const bx = PL + i * bColW + bColW / 2;
        const fontSize = String(val).length > 6 ? 5.5 : 7;
        
        pdf.setTextColor(240, 208, 112);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(val), bx, y + 13, { align: 'center' });
        
        pdf.setTextColor(100, 80, 30);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(lbl, bx, y + 19, { align: 'center' });
    });
    
    y += 26;

    pdf.setFillColor(16, 16, 26);
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(PL, y, CW, 18, 2, 2, 'FD');
    
    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRIPLE-LOCK KOGNITIV JELENLÉT', W / 2, y + 5, { align: 'center' });
    
    const tColW = CW / tripleLock.length;
    tripleLock.forEach(([lbl, val], i) => {
        const tx = PL + i * tColW + tColW / 2;
        
        pdf.setTextColor(240, 208, 112);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(val), tx, y + 11, { align: 'center' });
        
        pdf.setTextColor(100, 80, 30);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(lbl, tx, y + 16, { align: 'center' });
    });
    
    y += 22;

    pdf.setFillColor(16, 16, 26);
    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(PL, y, CW, 18, 2, 2, 'FD');
    
    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SZOVEG OSSZETETELE & RITMUS-ENTROPIA', PL + 4, y + 5);

    const compose = [
        ['Kezzel gepelt', typedPct + '%'],
        ['Beillesztett', pastedPct + '%'],
        ['Entropia', entropyPct + '%'],
        ['Entropia CV', entropyCV.toFixed(2)],
    ];
    
    const cColW = CW / compose.length;
    compose.forEach(([lbl, val], i) => {
        const cx = PL + i * cColW + cColW / 2;
        
        pdf.setTextColor(240, 208, 112);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(val), cx, y + 11, { align: 'center' });
        
        pdf.setTextColor(100, 80, 30);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(lbl, cx, y + 16, { align: 'center' });
    });

    const barX = PL + 4, barY = y + 13, barW = CW / 2 - 8, barH = 2;
    
    pdf.setFillColor(30, 30, 50);
    pdf.rect(barX, barY, barW, barH, 'F');
    
    pdf.setFillColor(74, 184, 112);
    pdf.rect(barX, barY, barW * (typedPct / 100), barH, 'F');
    
    y += 22;

    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 4;

    pdf.setTextColor(100, 80, 30);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SHA-256 KRIPTOGRAFIAI LENYOMAT', PL, y + 3);
    y += 5;
    
    pdf.setFillColor(13, 17, 23);
    pdf.rect(PL, y, CW, 10, 'F');
    
    pdf.setTextColor(166, 214, 255);
    pdf.setFontSize(5.5);
    pdf.setFont('courier', 'normal');
    
    const h = hash || '-';
    pdf.text(h.substring(0, 64), PL + 3, y + 4);
    if (h.length > 64) pdf.text(h.substring(64), PL + 3, y + 8.5);
    
    y += 14;

    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 4;

    const pulseData = (processData?.pulseDataPoints?.length > 1) ? processData.pulseDataPoints : (E?.pulseHistory?.length > 1 ? E.pulseHistory : null);

    if (pulseData && pulseData.length > 1) {
        pdf.setFillColor(16, 16, 26);
        pdf.setDrawColor(201, 168, 76);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(PL, y, CW, 36, 2, 2, 'FD');
        
        pdf.setTextColor(201, 168, 76);
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text('GEPELESI SPEKTRUM – GONDOLKODASI GORBE', W / 2, y + 6, { align: 'center' });

        const pCvs = document.createElement('canvas');
        pCvs.width = 600;
        pCvs.height = 60;
        const pCtx = pCvs.getContext('2d');
        
        pCtx.fillStyle = '#101018';
        pCtx.fillRect(0, 0, 600, 60);
        
        const pMax = Math.max(...pulseData, 10);
        pCtx.strokeStyle = 'rgba(201,168,76,0.1)';
        pCtx.lineWidth = 1;
        
        [15, 30, 45].forEach(g => {
            pCtx.beginPath();
            pCtx.moveTo(0, g);
            pCtx.lineTo(600, g);
            pCtx.stroke();
        });
        
        pCtx.beginPath();
        pCtx.moveTo(0, 60);
        pulseData.forEach((v, i) => {
            const x = (i / (pulseData.length - 1)) * 600;
            const py = 60 - (v / pMax) * 52;
            pCtx.lineTo(x, py);
        });
        pCtx.lineTo(600, 60);
        pCtx.closePath();
        
        const fg = pCtx.createLinearGradient(0, 0, 0, 60);
        fg.addColorStop(0, 'rgba(201,168,76,0.3)');
        fg.addColorStop(1, 'rgba(201,168,76,0)');
        pCtx.fillStyle = fg;
        pCtx.fill();
        
        pCtx.beginPath();
        pulseData.forEach((v, i) => {
            const x = (i / (pulseData.length - 1)) * 600;
            const py = 60 - (v / pMax) * 52;
            i === 0 ? pCtx.moveTo(x, py) : pCtx.lineTo(x, py);
        });
        pCtx.strokeStyle = '#c9a84c';
        pCtx.lineWidth = 2;
        pCtx.stroke();
        
        pdf.addImage(pCvs.toDataURL('image/png'), 'PNG', PL + 2, y + 8, CW - 4, 17);
        y += 28;

        const longestPauseSec = (() => {
            const pev = (processData?.events || E?.events || []).filter(e => e.type === 'pause');
            return pev.length ? Math.round(Math.max(...pev.map(p => p.duration || 0)) / 1000) : 0;
        })();
        
        const pStats = [
            ['Leütések', String(processData?.keystrokeCount ?? E?.keys ?? '-')],
            ['Javítások', String(processData?.deletionCount ?? E?.dels ?? '-')],
            ['Szünetek', String(processData?.pauseCount ?? E?.pauses ?? '-')],
            ['Legh. szünet', longestPauseSec > 0 ? longestPauseSec + 'mp' : '-'],
            ['Ritmus', humanLabel],
            ['Entropia', entropyPct + '%'],
        ];
        
        const psW = CW / pStats.length;
        pStats.forEach(([lbl, val], i) => {
            const px = PL + i * psW + psW / 2;
            const fs = String(val).length > 6 ? 5 : 7;
            
            pdf.setTextColor(240, 208, 112);
            pdf.setFontSize(fs);
            pdf.setFont('helvetica', 'bold');
            pdf.text(val, px, y + 5, { align: 'center' });
            
            pdf.setTextColor(100, 80, 30);
            pdf.setFontSize(5);
            pdf.setFont('helvetica', 'normal');
            pdf.text(lbl, px, y + 10, { align: 'center' });
        });
        y += 14;
    }

    pdf.setDrawColor(100, 80, 30);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 4;

    const verifyUrl = 'https://humano-hu.vercel.app/verify/' + (docId || '');
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(verifyUrl) + '&color=C9A84C&bgcolor=1a1a2e&margin=4&format=png';
    const blockH = H - 20 - y;

    await new Promise(resolve => {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = 120;
            cvs.height = 120;
            cvs.getContext('2d').drawImage(qrImg, 0, 0, 120, 120);

            const qrColW = CW * 0.38;
            
            pdf.setFillColor(22, 22, 42);
            pdf.setDrawColor(100, 80, 30);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(PL, y, qrColW, blockH, 2, 2, 'FD');
            
            pdf.setTextColor(201, 168, 76);
            pdf.setFontSize(5.5);
            pdf.setFont('helvetica', 'bold');
            pdf.text('QR KOD – MOBIL ELLENORZES', PL + qrColW / 2, y + 5, { align: 'center' });
            
            const qrSize = Math.min(blockH - 14, 28);
            const qrX = PL + qrColW / 2 - qrSize / 2;
            pdf.addImage(cvs.toDataURL('image/png'), 'PNG', qrX, y + 7, qrSize, qrSize);
            
            pdf.setTextColor(100, 80, 30);
            pdf.setFontSize(4.5);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Szkeneld be az azonnali ellenorzeshez', PL + qrColW / 2, y + blockH - 3, { align: 'center' });

            const rx = PL + qrColW + 3;
            const rw = CW - qrColW - 3;
            
            pdf.setFillColor(16, 16, 26);
            pdf.setDrawColor(100, 80, 30);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(rx, y, rw, blockH, 2, 2, 'FD');
            
            pdf.setTextColor(201, 168, 76);
            pdf.setFontSize(5.5);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ELLENORZESI ADATOK', rx + rw / 2, y + 5, { align: 'center' });
            
            const lines = [
                ['DOC ID', (docId || '-').substring(0, 26)],
                ['Szerzo', (author || '-').substring(0, 26)],
                ['Datum', fmtDate(createdAt) || '-'],
                ['OTS', otsStatus === 'confirmed' ? 'Bitcoin blokklancra rogzitve' : 'Feldolgozas folyamatban'],
                ['Ritmus', humanLabel],
                ['Kezzel gepelt', typedPct + '%'],
                ['Entropia', entropyPct + '%'],
            ];
            
            lines.forEach(([lbl, val], i) => {
                const ly = y + 13 + i * 5.5;
                pdf.setTextColor(100, 80, 30);
                pdf.setFontSize(5);
                pdf.setFont('helvetica', 'normal');
                pdf.text(lbl + ':', rx + 3, ly);
                
                pdf.setTextColor(200, 190, 160);
                pdf.setFontSize(5.5);
                pdf.setFont('helvetica', 'bold');
                pdf.text(String(val), rx + 24, ly);
            });
            resolve();
        };
        qrImg.onerror = () => {
            pdf.setFillColor(22, 22, 42);
            pdf.roundedRect(PL, y, CW, blockH, 2, 2, 'FD');
            
            pdf.setTextColor(100, 80, 30);
            pdf.setFontSize(6);
            pdf.text('QR: ' + verifyUrl, W / 2, y + blockH / 2, { align: 'center' });
            resolve();
        };
        qrImg.src = qrUrl;
    });

    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.4);
    pdf.line(PL, H - 16, W - PR, H - 16);
    
    pdf.setTextColor(100, 80, 30);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ellenorzes: humano-hu.vercel.app · opentimestamps.org · SHA-256 · Bitcoin blokklánc', W / 2, H - 11, { align: 'center' });
    
    pdf.setFontSize(5.5);
    pdf.text('Generalva: ' + new Date().toLocaleString('hu-HU'), W / 2, H - 6, { align: 'center' });

    pdf.save('HUMANO-Tanusitvany-' + (docId || 'cert') + '.pdf');
    showToast('📄 PDF tanúsítvány letöltve!');
}

function generateSealCanvas(docId, author, date, otsStatus, size = 400) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;
    const R = size * 0.44;
    const r2 = R * 0.78;

    ctx.fillStyle = '#060608';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = size * 0.012;
    const teeth = 36;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const ang = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? R : R * 0.92;
        const x = cx + Math.cos(ang) * rr;
        const y = cy + Math.sin(ang) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.4;
    ctx.lineWidth = size * 0.003;
    ctx.beginPath();
    ctx.arc(cx, cy, r2 * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const topText = '✦  H U M A N O  ✦';
    ctx.font = `bold ${size * 0.052}px Georgia, serif`;
    ctx.fillStyle = '#c9a84c';
    ctx.textAlign = 'center';
    const arcR = r2 * 0.87;
    const arcStart = -Math.PI * 0.78;
    const charW = size * 0.052;
    const totalAng = (topText.length * charW) / arcR;
    
    for (let i = 0; i < topText.length; i++) {
        const ang = arcStart + (i / topText.length) * totalAng * 1.05;
        ctx.save();
        ctx.translate(cx + Math.cos(ang) * arcR, cy + Math.sin(ang) * arcR);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillText(topText[i], 0, 0);
        ctx.restore();
    }

    const botText = 'A Z   E M B E R I   A L K O T Á S   H I T E L E S Í T Ő J E';
    ctx.font = `${size * 0.028}px Georgia, serif`;
    ctx.fillStyle = '#8a6a1a';
    const botTotal = (botText.length * size * 0.028 * 0.72) / arcR;
    const botStart = Math.PI * 0.12;
    
    for (let i = 0; i < botText.length; i++) {
        const ang = botStart + (i / botText.length) * botTotal * 1.1 - botTotal * 0.55;
        ctx.save();
        ctx.translate(cx + Math.cos(ang) * arcR, cy + Math.sin(ang) * arcR);
        ctx.rotate(ang - Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(botText[i], 0, 0);
        ctx.restore();
    }

    ctx.font = `bold ${size * 0.13}px Georgia, serif`;
    ctx.fillStyle = '#c9a84c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy - size * 0.12);

    if (author) {
        ctx.font = `${size * 0.03}px Georgia, serif`;
        ctx.fillStyle = '#c9a84c';
        const shortAuthor = author.length > 20 ? author.substring(0, 18) + '…' : author;
        ctx.fillText(shortAuthor, cx, cy - size * 0.04);
    }

    ctx.font = `bold ${size * 0.042}px 'Courier New', monospace`;
    ctx.fillStyle = '#c9a84c';
    ctx.fillText((docId || 'DOC-XXXXXXXX-XXXX').substring(0, 22), cx, cy + size * 0.04);

    ctx.font = `${size * 0.032}px Georgia, serif`;
    ctx.fillStyle = '#8a6a1a';
    ctx.fillText(date || new Date().toLocaleDateString('hu-HU'), cx, cy + size * 0.14);

    ctx.font = `italic ${size * 0.028}px Georgia, serif`;
    ctx.fillText(
        otsStatus === 'confirmed' ? '⛓ Bitcoin blokklánc ✓' : 'SHA-256 hitelesített',
        cx, cy + size * 0.22
    );

    ctx.textBaseline = 'alphabetic';
    return canvas;
}

async function downloadSeal(docId) {
    if (!docId || docId === '–') { showToast('❌ Nincs dokumentum azonosító!'); return; }
    showToast('⏳ Pecsét generálása...');
    
    let author = currentUser?.email || '–';
    let otsStatus = 'pending';
    let date = new Date().toLocaleDateString('hu-HU');
    
    const { data: doc } = await db.from('documents')
        .select('author_name, created_at, ots_receipt')
        .eq('doc_id', docId).single();
    
    if (doc) {
        author = doc.author_name || author;
        otsStatus = doc.ots_receipt ? 'confirmed' : 'pending';
        date = doc.created_at ? new Date(doc.created_at).toLocaleDateString('hu-HU') : date;
    }
    
    const canvas = generateSealCanvas(docId, author, date, otsStatus, 400);
    const a = document.createElement('a');
    a.download = `HUMANO-pecsét-${docId}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('✅ Pecsét letöltve!');
}

async function generateSmartImage(docId) {
    if (!docId || docId === '–') { showToast('❌ Nincs dokumentum azonosító!'); return; }
    showToast('⏳ Kép generálása...');

    const { data: doc } = await db.from('documents')
        .select('*')
        .eq('doc_id', docId).single();
        
    if (!doc) { showToast('❌ Dokumentum nem található!'); return; }

    const pd = doc.process_data || {};
    const title = doc.title || 'Névtelen alkotás';
    const author = doc.author_name || '–';
    const date = new Date(doc.created_at).toLocaleDateString('hu-HU');
    const hi = pd.humanIndex || 0;
    const content = (doc.content || '').replace(/<[^>]+>/g, '').trim();

    const width = 1080;
    const height = 1920;
    const padding = 60;
    const lineH = 36;
    const maxW = width - padding * 2;
    const maxChars = 800;
    const contentPreview = content.substring(0, maxChars) + (content.length > maxChars ? '…' : '');

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = '24px serif';

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    const contentLines = wrapText(tempCtx, contentPreview, maxW);
    const headerH = 200;
    const titleH = 80;
    const footerH = 200;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0c0a04';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(0, 0, width, 4);

    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ HUMANO ✦', width / 2, 60);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Hitelesített emberi tartalom', width / 2, 95);

    ctx.fillStyle = hi >= 80 ? '#4ab870' : hi >= 60 ? '#c9a84c' : '#888';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`⚡ ${hi}% Human Score`, width / 2, 135);

    ctx.fillStyle = '#666';
    ctx.font = '18px monospace';
    ctx.fillText(`${author} · ${date}`, width / 2, 170);

    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, 190);
    ctx.lineTo(width - padding, 190);
    ctx.stroke();

    ctx.fillStyle = '#f5f0e8';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'left';
    
    const titleLines = wrapText(ctx, title, maxW);
    let y = headerH + 45;
    
    titleLines.forEach(line => {
        ctx.fillText(line, padding, y);
        y += 44;
    });

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y + 10);
    ctx.lineTo(width - padding, y + 10);
    ctx.stroke();
    y += 30;

    ctx.fillStyle = '#c8c0b0';
    ctx.font = '24px serif';
    const maxBodyY = height - footerH - 20;
    
    for (const line of contentLines) {
        if (y + lineH > maxBodyY) {
            ctx.fillStyle = '#c9a84c';
            ctx.font = '22px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('→ Olvasd el a teljes cikket:', width / 2, y + lineH);
            ctx.font = '20px monospace';
            ctx.fillText(`humano-hu.vercel.app/read/${docId}`, width / 2, y + lineH + 35);
            ctx.textAlign = 'left';
            break;
        }
        ctx.fillText(line, padding, y);
        y += lineH;
    }

    const footerY = height - footerH;
    
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, footerY + 10);
    ctx.lineTo(width - padding, footerY + 10);
    ctx.stroke();

    ctx.fillStyle = '#c9a84c';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(docId, width / 2, footerY + 50);

    ctx.fillStyle = '#666';
    ctx.font = '16px monospace';
    ctx.fillText(`humano-hu.vercel.app/verify/${docId}`, width / 2, footerY + 80);

    ctx.fillStyle = doc.ots_receipt ? '#4ab870' : '#c9a84c';
    ctx.font = '18px monospace';
    ctx.fillText(doc.ots_receipt ? '⛓️ Bitcoin blokkláncon rögzítve ✓' : '⏳ Blokklánc rögzítés folyamatban', width / 2, footerY + 115);

    const qrSize = 100;
    const qrX = width - padding - qrSize;
    const qrY = footerY + 20;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent('https://humano-hu.vercel.app/verify/' + docId)}&color=C9A84C&bgcolor=0c0a04&margin=4&format=png`;

    await new Promise(resolve => {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => { ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize); resolve(); };
        qrImg.onerror = () => resolve();
        qrImg.src = qrUrl;
    });

    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(0, height - 4, width, 4);

    const a = document.createElement('a');
    a.download = `HUMANO-${docId}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('✅ Kép letöltve – töltsd fel Instagramra, Facebookra!');
}

/* ─── 14. STATISZTIKA ÉS PUBLIKUS ADATOK ──────────────────────────── */
// loadPublicStats, live feed, hall of fame, milestone

async function loadPublicStats() {
    const { count: uc } = await db.from('profiles').select('*', { count: 'exact', head: true });
    const { count: dc } = await db.from('documents').select('*', { count: 'exact', head: true });
    
    const statDocs = document.getElementById('stat-docs');
    const statUsers = document.getElementById('stat-users');
    
    if (statDocs) statDocs.textContent = dc ?? '0';
    if (statUsers) statUsers.textContent = uc ?? '0';

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUc } = await db.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', since30);
    
    const activeEl = document.getElementById('stat-active-users');
    if (activeEl) activeEl.textContent = activeUc ?? '0';

    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUc } = await db.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since7);
    
    const newEl = document.getElementById('stat-new-this-week');
    if (newEl) newEl.textContent = newUc ?? '0';

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayDc } = await db.from('documents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
    
    const todayEl = document.getElementById('stat-docs-today');
    if (todayEl) todayEl.textContent = todayDc ?? '0';

    const { data: hiData } = await db.from('documents')
        .select('process_data')
        .not('process_data', 'is', null)
        .limit(200);
    
    if (hiData && hiData.length) {
        const vals = hiData.map(d => d.process_data?.humanIndex || 0).filter(v => v > 0);
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const avgEl = document.getElementById('stat-avg-human');
        if (avgEl) avgEl.textContent = avg + '%';
    }

    const GOAL = 1000;
    const current = dc ?? 0;
    const left = Math.max(0, GOAL - current);
    const pct = Math.min(100, Math.round((current / GOAL) * 100));
    
    const leftEl = document.getElementById('stat-milestone-left');
    const barEl = document.getElementById('stat-milestone-bar');
    
    if (leftEl) leftEl.textContent = left;
    if (barEl) barEl.style.width = pct + '%';

    loadLiveFeed();
    loadHallOfFame();
    setTimeout(loadPublicStats, 60000);
}

async function loadLiveFeed() {
    const el = document.getElementById('live-feed-list');
    if (!el) return;
    
    const { data } = await db.from('documents')
        .select('doc_id, created_at, process_data')
        .order('created_at', { ascending: false })
        .limit(8);
    
    if (!data || !data.length) {
        el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1rem">Még nincs adat.</div>';
        return;
    }
    
    el.innerHTML = data.map(d => {
        const ago = timeSince(new Date(d.created_at).getTime());
        const hi = d.process_data?.humanIndex || 0;
        const shortId = d.doc_id.substring(0, 18) + '…';
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem .75rem;background:var(--surface2);border-radius:var(--r-sm);cursor:pointer"
                     onclick="document.getElementById('v-input-unified').value='${esc(d.doc_id)}';showPage('verify-unified');doVerifyUnified()">
                    <div>
                        <div style="font-family:var(--font-mono);font-size:.72rem;color:var(--gold2)">${shortId}</div>
                        <div style="font-size:.68rem;color:var(--muted);margin-top:2px">${ago} ezelőtt</div>
                    </div>
                    <span class="badge badge-gold" style="font-size:.65rem">${hi}%</span>
                </div>`;
    }).join('');
}

async function loadHallOfFame() {
    const el = document.getElementById('hall-of-fame-list');
    if (!el) return;
    
    const { data } = await db.from('documents')
        .select('doc_id, title, author_name, process_data, created_at')
        .eq('is_public', true)
        .not('process_data', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);
    
    if (!data || !data.length) {
        el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1rem">Még nincs nyilvános dokumentum.</div>';
        return;
    }
    
    const sorted = data
        .filter(d => (d.process_data?.humanIndex || 0) > 0)
        .sort((a, b) => (b.process_data?.humanIndex || 0) - (a.process_data?.humanIndex || 0))
        .slice(0, 8);
    
    const medals = ['🥇', '🥈', '🥉'];
    
    el.innerHTML = sorted.map((d, i) => {
        const hi = d.process_data?.humanIndex || 0;
        const medal = medals[i] || `${i + 1}.`;
        const title = (d.title || 'Névtelen').substring(0, 28);
        const author = (d.author_name || '–').substring(0, 16);
        
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem .75rem;background:var(--surface2);border-radius:var(--r-sm);cursor:pointer"
                     onclick="document.getElementById('v-input-unified').value='${esc(d.doc_id)}';showPage('verify-unified');doVerifyUnified()">
                    <div style="display:flex;align-items:center;gap:.6rem">
                        <span style="font-size:1.1rem">${medal}</span>
                        <div>
                            <div style="font-size:.8rem;color:var(--text);font-weight:600">${esc(title)}</div>
                            <div style="font-size:.68rem;color:var(--muted)">${esc(author)}</div>
                        </div>
                    </div>
                    <span class="badge badge-gold" style="font-size:.68rem">${hi}%</span>
                </div>`;
    }).join('');
}

async function downloadWhitePaperPdf() {
    if (!window.jspdf) {
        showToast('⏳ PDF betöltés...');
        setTimeout(downloadWhitePaperPdf, 2000);
        return;
    }

    showToast('⏳ PDF generálása...');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const PL = 18, PR = 18;
    const TW = W - PL - PR;
    let y = 22;

    function newPage() {
        pdf.addPage();
        pdf.setFillColor(6, 6, 8);
        pdf.rect(0, 0, W, H, 'F');
        pdf.setDrawColor(201, 168, 76);
        pdf.setLineWidth(0.5);
        pdf.rect(8, 8, W - 16, H - 16);
        y = 22;
    }

    function checkY(needed) {
        if (y + needed > H - 18) newPage();
    }

    function writeText(text, fontSize, color, isBold, maxWidth) {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, maxWidth || TW);
        lines.forEach(line => {
            checkY(fontSize * 0.4);
            pdf.text(line, PL, y);
            y += fontSize * 0.38;
        });
    }

    pdf.setFillColor(6, 6, 8);
    pdf.rect(0, 0, W, H, 'F');
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.5);
    pdf.rect(8, 8, W - 16, H - 16);

    pdf.setTextColor(201, 168, 76);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HUMANO White Paper', W / 2, y, { align: 'center' });
    y += 7;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(138, 106, 26);
    pdf.text('A keletkezes hitelesitese – Valtozat 1.0 · 2026. marcius 17.', W / 2, y, { align: 'center' });
    y += 5;

    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.3);
    pdf.line(PL, y, W - PR, y);
    y += 7;

    const sections = [
        {
            title: 'Absztrakt',
            body: 'A mesterseges intelligencia altal generalt szovegek elterjedese alapjaiban kerdojelezi meg a digitalis tartalmak szerzosegenek hitelességét. A hagyomanyos plagiumellenorzok es az ujabb AI-detektorok csak a vegeredmenyt elemzik, es statisztikai valoszinusegekre tamaszkodnak, amelyek egyre konyebben kijatszhatók. A HUMANO protokoll nem a kesz szoveget, hanem annak keletkezesi folyamatal hitelesiti. Harom fuggetlen technologiai reteg kombinalasakal – (1) billentyuletés-dinamika mint biometrikus azonosito, (2) SHA-256 kriptografiai hash, es (3) Bitcoin blokklánc idobelyeg – olyan matematikailag igazolhato bizonyitekot hoz letre, amely gyakorlatilag megcafolhatatlan.'
        },
        {
            title: '1. Bevezetes',
            body: 'Az LLM-ek (pl. ChatGPT) elterjedes valsagot idezett elo az oktatasban, az ujsagirasban es a szellemi tulajdon vedelmeben. A problema nem a szoveg minosege, hanem az eredete. A hagyomanyos AI-detektorok csak valoszinusegi becslest adnak es konnyen kijatszhatok. A HUMANO alapfelvetese: mig egy AI azonnal es valtozatlan ritmussal irja ki a teljes szoveget, addig egy emberi alkoto gepelesi ritmusa egyedi, valtozatos, es tele van a gondolkodas, a bizonytalansag es a javitas lenyomataival. Ez olyan viselkedeses biometrikus azonosito, amelyet szinte lehetetlen utanozni.'
        },
        {
            title: '2. Kapcsolodo kutatasok',
            body: 'A billentyuletés-dinamika tobbevtizedes multra visszatekinto biometrikus kutatasi terulet. Neuralis halozatok segitsegevel akar 82%-os pontossag erheto el szemelyek azonositasaban [1]. A vizsgalt jellemzok: billentyű lenyomva tartasanak ideje (dwell time), leütések kozotti ido (flight time), gepelesisebesseg, hibak gyakorisaga es javitasi mintazatok. Az SHA-256 az NSA altal tervezett es NIST altal szabvanyositott kriptografiai algoritmus [3]. Az OpenTimestamps protokoll a Bitcoin blokklancat hasznalja visszavonhatatlan idobelyegzesre [5].'
        },
        {
            title: '3. A HUMANO modszertana',
            body: 'A hitelesitesi folyamat lepései: (1) Valos ideju billentyuletés-rogzites – csak idobelyegek, karakterek nem. (2) Human Index szamitas a relativ szoras (CV = sigma/mu) alapjan. (3) Triple-Lock Kognitiv Jelenlét – harom algoritmus fut parhuzamosan a bongeszőben: CF-DNA (gondolkodasi szunetek pozicioja mondathatárokon), NLS (szokomplexitas es gepelesisebesseg korrelicioja), SMD (biologiai ritmusingadozasok mérése). Csak absztrakt matematikai mutatok kerulnek mentesre. (4) Beillesztett szovegreszek atlathato dokumentalasa. (5) Kalibracios profil – szemelyzhez kotott szerzoseg igazolasa. (6) SHA-256 hash – bongeszőben szamitodik. (7) Bitcoin blokklánc idobelyeg – OpenTimestamps protokollon keresztul.\n\nA Human Index kategoriai:\nCV < 0.25    Gepies ritmus     (HI: 0-25%)\n0.25 - 0.6   Vegyes ritmus     (HI: 25-60%)\n0.6 - 0.9    Emberi ritmus     (HI: 60-85%)\nCV >= 0.9    Intenziv alkotas  (HI: 85-100%)\n\nTriple-Lock kategoriai:\nCF-DNA 70+   Gondolkodasi szunetek mondathatárokon\nNLS 60+      Alkotoi hev – szokomplexitas korrelaciо\nSMD 50+      Biologiai ritmus – termeszetes ingadozas'
        },
        {
            title: '4. Adatvedelem es etika',
            body: 'GDPR-megfelelőség: EU-s szervereken (Supabase, Frankfurt), kifejezett hozzajarulassal, visszavonasi lehetoseggel. Adatminimalizalas: letott karaktereket soha nem naploz, csak idobelyegeket. EU AI Act: nem minosul magas kockazatu AI-rendszernek, statisztikai meresszamot kozol, nem hoz dontest szemelyek eletere vonatkozoan. Atlathato mukodesmodszertan: minden szamitas nyomon kovetheto, nincsenek fekete doboz algoritmusok.'
        },
        {
            title: '5. A modszer korlatai',
            body: 'Profi gepelek, akik rendkivul egyenletes, magas sebessegu ritmussal gepelnek (vakiras), a rendszer altal gepiésebbnek minosulhetnek, ami alacsonyabb Human Indexet eredmenyezhet. Kalibracios profil nelkul a rendszer azt bizonyitja hogy ember irta, nem azt hogy pontosan ki. Elmeleti AI-tamadas: emberi ritmumra tanitott AI utanozhatna a mintat, de ez jelenleg nem fenyegeto vektor a gyakorlatban.'
        },
        {
            title: '6. Osszehasonlitas mas megoldasokkal',
            body: 'HUMANO vs Turnitin: A HUMANO a keletkezest elemzi, a Turnitin a vegeredmenyt hasonlitja adatbazissal. HUMANO vs GPTZero: A HUMANO kriptografiai bizonyitekot ad, a GPTZero csak valoszinusegi becslest. HUMANO vs OriginStamp: Az OriginStamp csak blokklancot hasznal, biometrikus reteg nelkul. A HUMANO az egyetlen megoldas amely mindharom reteg – biometria, kriptografia, blokklánc – kombinaciojat alkalmazza.'
        },
        {
            title: '7. Kovetkeztetesek',
            body: 'A HUMANO paradigmavaltas kepvisel a digitalis tartalmak hitelesiteseben. A viselkedeses biometria, a kriptografia es a blokklánc kombinacioja olyan tobbreegu vedelmet nyujt, amely a jelenlegi megoldasoknal lenyegesen robusztusabb es megbizhatobb. A modszer tudomanyos alapjait tobbevtizedes kutatasok tamasztjak ala, mig technologiai implementacioja a legkorszerubb, szeles korben elfogadott szabvanyokra epul.\n\nTovabbi kutatasi iranyok: C2PA-szabvany integracio, valos ideju oktatasi platform integracio, multilingualis terjesztes.'
        },
        {
            title: '8. Irodalomjegyzek',
            body: '[1] P. Panasiuk et al., Biometric Identification Based on Keystroke Dynamics, Sensors 22(9), PMC, 2022.\n[2] NIST, FIPS 180-4: Secure Hash Standard, U.S. Dept. of Commerce, 2015.\n[3] S. Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System, 2008.\n[4] P. Wuille et al., OpenTimestamps, GitHub, 2016.\n[5] R. Joyce et al., Deep Learning for Keystroke Dynamics, IEEE Trans. on Biometrics, 2020.\n[6] E. Killourhy & R. Maxion, Comparing Anomaly Detectors for Keystroke Dynamics, DSN, 2009.'
        },
    ];

    for (const section of sections) {
        checkY(12);

        pdf.setTextColor(201, 168, 76);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, PL, y);
        y += 4;

        pdf.setDrawColor(100, 80, 30);
        pdf.setLineWidth(0.2);
        pdf.line(PL, y, W - PR, y);
        y += 4;

        pdf.setTextColor(190, 180, 160);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');

        const lines = pdf.splitTextToSize(section.body, TW);
        for (const line of lines) {
            checkY(4);
            pdf.text(line, PL, y);
            y += 4;
        }
        y += 5;
    }

    checkY(20);
    pdf.setDrawColor(201, 168, 76);
    pdf.setLineWidth(0.2);
    pdf.line(PL, y, W - PR, y);
    y += 5;

    pdf.setTextColor(138, 106, 26);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary (English)', PL, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(160, 150, 130);
    const summary = 'HUMANO is a scientifically grounded platform that combines keystroke dynamics, SHA-256 cryptography, and the Bitcoin blockchain to mathematically prove the human origin and prior existence of a text, thereby offering a solution to the authorship crisis caused by AI-generated content.';
    const sumLines = pdf.splitTextToSize(summary, TW);
    sumLines.forEach(line => {
        checkY(4);
        pdf.text(line, PL, y);
        y += 4;
    });

    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(100, 80, 30);
        pdf.setLineWidth(0.2);
        pdf.line(PL, H - 14, W - PR, H - 14);
        pdf.setTextColor(100, 80, 30);
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('HUMANO Platform · humano-hu.vercel.app · White Paper v1.0', W / 2, H - 9, { align: 'center' });
        pdf.text(`${i} / ${pageCount}`, W - PR, H - 9, { align: 'right' });
    }

    pdf.save('HUMANO-White-Paper-v1.0.pdf');
    showToast('✅ White Paper letöltve!');
}

/* ─── 15. FUNKCIÓ SZAVAZÁS ───────────────────────────────────────── */
// feature votes, castVote, loadFeatureVotes

async function loadFeatureVotes() {
    const { data } = await db.from('feature_votes').select('feature_id');
    fvCounts = {};
    (data || []).forEach(r => {
        fvCounts[r.feature_id] = (fvCounts[r.feature_id] || 0) + 1;
    });
    renderFeatureVotes();
}

function renderFeatureVotes() {
    const el = document.getElementById('fv-list');
    if (!el) return;

    const sorted = [...FEATURE_LIST].sort((a, b) =>
        (fvCounts[b.id] || 0) - (fvCounts[a.id] || 0)
    );
    const maxVotes = Math.max(1, ...Object.values(fvCounts), 1);

    el.innerHTML = sorted.map(f => {
        const votes = fvCounts[f.id] || 0;
        const voted = !!fvVoted[f.id];
        const pct = Math.round((votes / maxVotes) * 100);

        return `
            <div style="background:var(--surface2);border:1px solid ${voted ? 'var(--gold4)' : 'var(--border)'};
                        border-radius:var(--r);padding:.9rem 1.1rem;transition:border-color .2s">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:600;color:var(--text);font-size:.9rem;margin-bottom:.2rem">${f.label}</div>
                        <div style="font-size:.75rem;color:var(--muted);line-height:1.5">${f.desc}</div>
                    </div>
                    <button
                        onclick="castVote('${f.id}')"
                        style="flex-shrink:0;background:${voted ? 'rgba(201,168,76,.15)' : 'var(--surface3)'};
                               border:1.5px solid ${voted ? 'var(--gold)' : 'var(--border)'};
                               border-radius:var(--r-sm);padding:.4rem .9rem;cursor:${voted ? 'default' : 'pointer'};
                               color:${voted ? 'var(--gold)' : 'var(--muted)'};font-size:.8rem;font-weight:700;
                               display:flex;align-items:center;gap:.4rem;white-space:nowrap;min-width:72px;
                               justify-content:center;transition:all .2s"
                        ${voted ? 'disabled' : ''}>
                        ${voted ? '✓' : '＋'} <span>${votes}</span>
                    </button>
                </div>
                <div style="margin-top:.65rem;height:3px;background:var(--surface3);border-radius:2px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:${voted ? 'var(--gold)' : 'rgba(201,168,76,.35)'};
                                border-radius:2px;transition:width .4s"></div>
                </div>
            </div>`;
    }).join('');
}

async function castVote(featureId) {
    if (!currentUser) { showToast('⚠️ Szavazáshoz be kell jelentkezni!'); return; }
    if (fvVoted[featureId]) return;
    
    fvCounts[featureId] = (fvCounts[featureId] || 0) + 1;
    fvVoted[featureId] = true;
    localStorage.setItem('humano_fv_voted', JSON.stringify(fvVoted));
    renderFeatureVotes();
    
    const { error } = await db.from('feature_votes').insert({
        feature_id: featureId,
        user_id: currentUser?.id || null,
        voter_ip: null,
    });
    
    if (error) {
        if (error.code === '23505') {
            showToast('⚠️ Erre a funkcióra már szavaztál.');
        } else {
            fvCounts[featureId] = Math.max(0, (fvCounts[featureId] || 1) - 1);
            delete fvVoted[featureId];
            localStorage.setItem('humano_fv_voted', JSON.stringify(fvVoted));
            renderFeatureVotes();
            showToast('❌ Hiba: ' + error.message);
        }
        return;
    }
    
    showToast('✦ Szavazat rögzítve – köszönjük!');
}

/* ─── 16. PUBLIKÁCIÓK ────────────────────────────────────────────── */

let allPublikaciok = [];

async function loadPublikaciok() {
    const el = document.getElementById('pub-feed-list');
    if (!el) return;

    const { data: docs } = await db
        .from('documents')
        .select('doc_id, title, author_name, author_id, created_at, process_data, content')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);

    if (!docs?.length) {
        el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)">Még nincs publikált tartalom.</div>';
        return;
    }

    const docIds = docs.map(d => d.doc_id);
    
    const { data: likes } = await db
        .from('doc_likes')
        .select('doc_id')
        .in('doc_id', docIds);

    const { data: views } = await db
        .from('doc_views')
        .select('doc_id')
        .in('doc_id', docIds);

    const { data: comments } = await db
        .from('doc_comments')
        .select('doc_id')
        .in('doc_id', docIds);

    let myLikes = [];
    if (currentUser) {
        const { data: ml } = await db
            .from('doc_likes')
            .select('doc_id')
            .eq('user_id', currentUser.id)
            .in('doc_id', docIds);
        myLikes = (ml || []).map(l => l.doc_id);
    }

    const likeCounts = {};
    const viewCounts = {};
    const commentCounts = {};
    
    (likes || []).forEach(l => { likeCounts[l.doc_id] = (likeCounts[l.doc_id] || 0) + 1; });
    (views || []).forEach(v => { viewCounts[v.doc_id] = (viewCounts[v.doc_id] || 0) + 1; });
    (comments || []).forEach(c => { commentCounts[c.doc_id] = (commentCounts[c.doc_id] || 0) + 1; });
    
    allPublikaciok = docs.map(d => ({
        ...d,
        likeCount: likeCounts[d.doc_id] || 0,
        viewCount: viewCounts[d.doc_id] || 0,
        commentCount: commentCounts[d.doc_id] || 0,
        liked: myLikes.includes(d.doc_id)
    }));

    document.getElementById('pub-count-label').textContent = `${allPublikaciok.length} publikáció`;
    renderPublikaciok(allPublikaciok);
}

function filterPublikációk() {
    const search = document.getElementById('pub-search')?.value?.toLowerCase() || '';
    const sort = document.getElementById('pub-sort')?.value || 'newest';

    let filtered = allPublikaciok.filter(d =>
        (d.title || '').toLowerCase().includes(search) ||
        (d.author_name || '').toLowerCase().includes(search)
    );

    if (sort === 'popular') filtered.sort((a, b) => b.likeCount - a.likeCount);
    if (sort === 'human_index') filtered.sort((a, b) => (b.process_data?.humanIndex || 0) - (a.process_data?.humanIndex || 0));

    renderPublikaciok(filtered);
}

function renderPublikaciok(docs) {
    const el = document.getElementById('pub-feed-list');
    if (!el) return;

    el.innerHTML = docs.map(doc => {
        const pd = doc.process_data || {};
        const preview = (doc.content || '').replace(/<[^>]+>/g, '').substring(0, 200) + '…';
        const hi = pd.humanIndex || 0;
        const hiColor = hi >= 80 ? 'var(--success)' : hi >= 60 ? 'var(--gold)' : 'var(--muted)';

        return `
            <div class="card" style="margin-bottom:1.25rem;cursor:pointer" 
                 onclick="openPublikacio('${doc.doc_id}')">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:.75rem">
                    <div style="flex:1">
                        <div style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;
                                    color:var(--gold2);margin-bottom:.3rem">${esc(doc.title || 'Névtelen')}</div>
                        <div style="font-size:.75rem;color:var(--muted);font-family:var(--font-mono)">
                            ${esc(doc.author_name || '–')} · ${fmtDate(doc.created_at)}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0">
                        <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;
                                    color:${hiColor}">${hi}%</div>
                        <div style="font-size:.6rem;color:var(--muted);font-family:var(--font-mono)">Human Score</div>
                    </div>
                </div>
                <div style="font-size:.85rem;color:var(--muted);line-height:1.7;margin-bottom:1rem">
                    ${esc(preview)}
                </div>
                <div style="display:flex;align-items:center;gap:1rem;font-size:.8rem;color:var(--muted)">
                    <button onclick="event.stopPropagation();toggleLike('${doc.doc_id}')"
                            style="background:none;border:1px solid ${doc.liked ? 'var(--gold)' : 'var(--border)'};
                                   border-radius:20px;padding:.25rem .75rem;cursor:pointer;
                                   color:${doc.liked ? 'var(--gold)' : 'var(--muted)'};font-size:.8rem"
                            id="like-btn-${doc.doc_id}">
                        ❤️ <span id="like-count-${doc.doc_id}">${doc.likeCount}</span>
                    </button>
                    <span>👁️ ${doc.viewCount}</span>
                    <span>💬 ${doc.commentCount}</span>
                    <span style="margin-left:auto;font-size:.7rem;font-family:var(--font-mono);
                                 color:var(--muted2)">${esc(doc.doc_id)}</span>
                </div>
            </div>`;
    }).join('');
}

async function toggleLike(docId) {
    if (!currentUser) { showToast('⚠️ Lájkoláshoz be kell jelentkezni!'); return; }

    const doc = allPublikaciok.find(d => d.doc_id === docId);
    if (!doc) return;

    if (doc.liked) {
        await db.from('doc_likes').delete()
            .eq('doc_id', docId).eq('user_id', currentUser.id);
        doc.liked = false;
        doc.likeCount--;
    } else {
        await db.from('doc_likes').insert({ doc_id: docId, user_id: currentUser.id });
        doc.liked = true;
        doc.likeCount++;
    }

    const btn = document.getElementById(`like-btn-${docId}`);
    const count = document.getElementById(`like-count-${docId}`);
    
    if (btn) {
        btn.style.color = doc.liked ? 'var(--gold)' : 'var(--muted)';
        btn.style.borderColor = doc.liked ? 'var(--gold)' : 'var(--border)';
    }
    if (count) count.textContent = doc.likeCount;
}

async function openPublikacio(docId) {
    await db.from('doc_views').insert({ doc_id: docId });
    window.location.href = `/read/${docId}`;
}

/* ─── 17. ANTI-BOT RENDSZER ──────────────────────────────────────── */

function triggerAntiBotCheck() {
    if (antiBotPending || antiBotPassed) return;
    
    antiBotPending = true;
    antiBotExpectedWord = ANTIBOT_WORDS[Math.floor(Math.random() * ANTIBOT_WORDS.length)];
    
    document.getElementById('antibot-word').textContent = antiBotExpectedWord;
    document.getElementById('antibot-input').value = '';
    document.getElementById('antibot-result').innerHTML = '';
    document.getElementById('antibot-modal').classList.add('open');
}

function checkAntiBotInput() {
    const val = (document.getElementById('antibot-input')?.value || '').trim().toUpperCase();
    const res = document.getElementById('antibot-result');
    
    if (val === antiBotExpectedWord) {
        res.innerHTML = '<div class="alert alert-success" style="font-size:.82rem">✅ Köszönöm! Folytathatod az írást.</div>';
        antiBotPending = false;
        antiBotPassed = true;
        antiBotCheckCount++;
        setTimeout(() => {
            document.getElementById('antibot-modal').classList.remove('open');
            if (antiBotCheckCount < 2) antiBotPassed = false;
        }, 1200);
    } else if (val.length >= antiBotExpectedWord.length) {
        res.innerHTML = '<div class="alert alert-error" style="font-size:.82rem">❌ Nem egyezik. Próbáld újra!</div>';
        document.getElementById('antibot-input').value = '';
    }
}

/* ─── 18. OTS (OPENTIMESTAMPS) SEGÉDFÜGGVÉNYEK ─────────────────── */

async function tsaStamp(hashHex, docId) {
    try {
        const { data: { session } } = await db.auth.getSession();
        const token = session?.access_token;
        if (!token) return false;

        const res = await fetch(`${SUPA_URL}/functions/v1/ots-stamp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ doc_id: docId, hash: hashHex }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'OTS hiba');
        refreshOtsStatus();
        return true;
    } catch (error) {
        console.error('OTS hiba:', error);
        return false;
    }
}

async function downloadOtsFile(docId) {
    if (!docId || docId === '–') { showToast('❌ Nincs dokumentum azonosító!'); return; }
    showToast('⏳ .ots fájl előkészítése...');
    
    const { data: doc, error } = await db.from('documents')
        .select('doc_id,title,hash,ots_receipt,ots_pending')
        .eq('doc_id', docId).single();
        
    if (error || !doc) { showToast('❌ Dokumentum nem található.'); return; }
    
    if (!doc.ots_receipt) {
        showToast(doc.ots_pending
            ? '⏳ OTS bélyegzés még folyamatban. Próbáld ~1 óra múlva!'
            : '❌ Ehhez a dokumentumhoz nincs OTS adat.');
        return;
    }
    
    const bin = atob(doc.ots_receipt);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HUMANO-${docId}.ots`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✅ HUMANO-${docId}.ots letöltve!`);
}

async function refreshOtsStatus() {
    const docId = E.certDocId;
    if (!docId) return;
    
    const { data: doc } = await db.from('documents').select('ots_receipt,ots_pending').eq('doc_id', docId).single();
    if (!doc) return;
    
    if (doc.ots_receipt) {
        document.getElementById('cert-ots-badge').className = 'badge badge-success';
        document.getElementById('cert-ots-badge').textContent = '⛓️ OpenTimestamps – Bitcoin blokkláncon megerősítve ✓';
        
        const dot = document.getElementById('tl-ots-dot');
        if (dot) { dot.className = 'tl-dot done'; dot.textContent = '✓'; }
        
        document.getElementById('tl-ots-time').textContent = 'Bitcoin blokkláncon rögzítve ✓';
        document.getElementById('btn-ots-refresh').style.display = 'none';
        document.getElementById('btn-ots-download').style.display = 'inline-flex';
        document.getElementById('cert-ots-verify-box').style.display = 'flex';
        
        showToast('⛓️ Bitcoin blokklánc megerősítve!');
    } else {
        showToast('⏳ Még folyamatban – próbáld újra ~1 óra múlva.');
    }
}

/* ─── 19. API KULCSOK ───────────────────────────────────────────── */

async function generateApiKey() {
    if (!currentUser) return;

    const { data: profile } = await db
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', currentUser.id)
        .single();

    const plan = profile?.plan || 'free';
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const hasApi = plan === 'pro' || plan === 'institution' || plan === 'premium' || trialActive;

    if (!hasApi) {
        showToast('❌ API hozzáférés Pro csomagtól elérhető!');
        showPage('supporters');
        return;
    }

    const arr = crypto.getRandomValues(new Uint8Array(16));
    const key = 'HMN_KEY_' + Array.from(arr).map(b => b.toString(36).padStart(2, '0')).join('').toUpperCase().substring(0, 24);
    const expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error } = await db.from('api_keys').insert({
        user_id: currentUser.id,
        key,
        name: 'Default',
        expires_at
    });
    
    if (error) { showToast('❌ Hiba: ' + error.message); return; }
    showToast('✦ API kulcs létrehozva!');
    loadApiKeys();
}

async function loadApiKeys() {
    if (!currentUser) return;
    
    const { data } = await db.from('api_keys').select('*').eq('user_id', currentUser.id);
    const el = document.getElementById('d-api-keys-list');
    
    if (!el) return;
    if (!data || !data.length) {
        el.innerHTML = '<div style="color:var(--muted);font-size:.85rem">Még nincs API kulcsod.</div>';
        return;
    }
    
    el.innerHTML = data.map(k => {
        const expired = k.expires_at && new Date(k.expires_at) < new Date();
        return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border-radius:var(--r-sm);padding:.65rem 1rem;margin-bottom:.5rem;gap:1rem;flex-wrap:wrap">
            <code style="font-size:.76rem;color:var(--gold);font-family:var(--font-mono);word-break:break-all">${k.key}</code>
            <div style="display:flex;gap:.5rem;flex-shrink:0">
                <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${k.key}');showToast('Kulcs másolva!')" ${expired ? 'disabled' : ''}>📋</button>
                <button class="btn btn-danger btn-sm" onclick="deleteApiKey('${k.id}')">✕</button>
            </div>
        </div>`;
    }).join('');
}

async function deleteApiKey(id) {
    await db.from('api_keys').delete().eq('id', id);
    showToast('Kulcs törölve.');
    loadApiKeys();
}

/* ─── 20. PROFIL ────────────────────────────────────────────────── */

function setEl(id, val, prop = 'value') {
    const el = document.getElementById(id);
    if (el) el[prop] = val ?? '';
}

async function loadProfile() {
    if (!currentUser) return;
    if (!document.getElementById('p-username')) return;
    
    loadConsentSettings();
    
    const [{ data: p }, { count: dc }] = await Promise.all([
        db.from('profiles').select('*').eq('id', currentUser.id).single(),
        db.from('documents').select('*', { count: 'exact', head: true }).eq('author_id', currentUser.id),
    ]);
    
    if (!p) return;
    
    setEl('p-username', p.username);
    setEl('p-humano-id', p.humano_id);
    setEl('p-email', currentUser.email);
    setEl('p-fullname', p.fullname);
    setEl('p-website', p.website);
    setEl('p-location', p.location);
    setEl('p-occupation', p.occupation);
    setEl('p-bio', p.bio);
    setEl('p-stat-docs', dc ?? '–', 'textContent');
    setEl('p-stat-plan', getPlanLabel(p.plan), 'textContent');
    
    window._originalProfile = {
        fullname: p.fullname || '',
        website: p.website || '',
        location: p.location || '',
        occupation: p.occupation || '',
        bio: p.bio || '',
    };
    
    initProfileListeners();
}

function initProfileListeners() {
    const fields = ['fullname', 'website', 'location', 'occupation', 'bio'];
    const saveBtn = document.querySelector('#page-profile .btn-gold');

    if (!saveBtn || !window._originalProfile) return;

    function updateSaveButtonState() {
        const currentFullname = document.getElementById('p-fullname')?.value || '';
        const currentWebsite = document.getElementById('p-website')?.value || '';
        const currentLocation = document.getElementById('p-location')?.value || '';
        const currentOccupation = document.getElementById('p-occupation')?.value || '';
        const currentBio = document.getElementById('p-bio')?.value || '';

        const hasChanges =
            currentFullname !== window._originalProfile.fullname ||
            currentWebsite !== window._originalProfile.website ||
            currentLocation !== window._originalProfile.location ||
            currentOccupation !== window._originalProfile.occupation ||
            currentBio !== window._originalProfile.bio;

        saveBtn.disabled = !hasChanges;
    }

    fields.forEach(field => {
        const el = document.getElementById(`p-${field}`);
        if (el) {
            el.addEventListener('input', updateSaveButtonState);
        }
    });

    saveBtn.disabled = true;
}

async function saveProfile() {
    if (!currentUser) return;

    const saveBtn = document.querySelector('#page-profile .btn-gold');
    if (saveBtn.disabled) {
        showToast('❌ Nincs módosítás!');
        return;
    }

    const al = document.getElementById('profile-alert');
    if (al) al.innerHTML = '<div class="alert alert-info">⏳ Mentés...</div>';

    const updates = {
        fullname: document.getElementById('p-fullname')?.value?.trim() || null,
        website: document.getElementById('p-website')?.value?.trim() || null,
        location: document.getElementById('p-location')?.value?.trim() || null,
        occupation: document.getElementById('p-occupation')?.value?.trim() || null,
        bio: document.getElementById('p-bio')?.value?.trim() || null
    };

    const { error } = await db.from('profiles').update(updates).eq('id', currentUser.id);

    if (error) {
        if (al) al.innerHTML = `<div class="alert alert-error">Hiba: ${error.message}</div>`;
    } else {
        if (al) al.innerHTML = '<div class="alert alert-success">✦ Profil sikeresen mentve!</div>';
        window._originalProfile = { ...updates };
        saveBtn.disabled = true;
        showToast('✅ Profil mentve!');
    }
}

/* ─── 21. FAQ ───────────────────────────────────────────────────── */

function renderFaq() {
    const el = document.getElementById('faq-list');
    if (!el) return;
    
    el.innerHTML = FAQS.map((f, i) => `
        <div class="faq-item" id="faq-${i}">
            <button class="faq-q" onclick="toggleFaq(${i})">
                <span>${f.q}</span>
                <span class="faq-arrow">▼</span>
            </button>
            <div class="faq-a" id="faq-a-${i}">${f.a}</div>
        </div>`).join('');
}

function toggleFaq(i) {
    const item = document.getElementById(`faq-${i}`);
    const ans = document.getElementById(`faq-a-${i}`);
    const isOpen = ans.classList.contains('open');
    
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-item').forEach(it => it.classList.remove('open'));
    
    if (!isOpen) {
        ans.classList.add('open');
        item.classList.add('open');
    }
}

/* ─── 22. INFO MODAL ────────────────────────────────────────────── */

function showDetailedInfo(type) {
    const modal = document.getElementById('info-modal');
    const title = document.getElementById('info-modal-title');
    const body = document.getElementById('info-modal-body');
    if (!modal || !title || !body) return;

    const contents = {
        sha256: {
            title: '🔒 SHA-256 kriptográfia – Mi ez és miért fontos?',
            body: `<p>A SHA-256 egy kriptográfiai hash függvény. Képzeld el úgy, mint egy <strong>digitális ujjlenyomat-készítő gépet</strong>.</p>
                    <ul style="margin:1rem 0; padding-left:1.5rem;">
                        <li><strong>Bármilyen szövegből</strong> egyedi 64 karakteres kódot készít.</li>
                        <li><strong>Egyirányú utca:</strong> a kódból lehetetlen visszafejteni az eredeti szöveget.</li>
                        <li><strong>Változásérzékeny:</strong> egyetlen vesszőnyi változtatás teljesen más hash-t ad.</li>
                    </ul>`
        },
        bitcoin: {
            title: '⛓️ Bitcoin blokklánc – Az örök időbélyeg',
            body: `<p>A blokklánc olyan, mint egy <strong>digitális kőtábla, amit soha senki nem törölhet</strong>.</p>
                    <ul style="margin:1rem 0; padding-left:1.5rem;">
                        <li>A Bitcoin hálózatán számítógépek ezrei őrzik ugyanazt a nyilvántartást.</li>
                        <li>Az OpenTimestamps protokoll a hash-t a Bitcoin blokkláncba égeti.</li>
                        <li>Az időbélyeg visszavonhatatlan – senki nem hamisíthatja meg.</li>
                    </ul>`
        },
        realtime: {
            title: '⚡ Valós idejű rögzítés – A keletkezés pillanata',
            body: `<p>A HUMANO a <strong>folyamatot</strong> is rögzíti, nem csak a végeredményt.</p>
                    <ul style="margin:1rem 0; padding-left:1.5rem;">
                        <li><strong>Leütések:</strong> milliszekundumos pontossággal mérve.</li>
                        <li><strong>Szünetek:</strong> gondolkodási idő – az AI soha nem tart szünetet.</li>
                        <li><strong>Javítások:</strong> az emberi alkotás természetes része.</li>
                    </ul>`
        },
        public: {
            title: '🌐 Nyilvánosan ellenőrizhető – Bizalom, közvetítők nélkül',
            body: `<p>Bárki, bárhol ellenőrizheti a dokumentumok hitelességét.</p>
                    <ul style="margin:1rem 0; padding-left:1.5rem;">
                        <li><strong>DOC ID:</strong> minden dokumentum egyedi azonosítót kap.</li>
                        <li><strong>QR kód:</strong> azonnal megnyílik az ellenőrző oldal mobilon.</li>
                        <li><strong>Független ellenőrzés:</strong> a HUMANO-tól teljesen függetlenül is ellenőrizhető.</li>
                    </ul>`
        }
    };

    const c = contents[type];
    if (!c) return;
    
    title.innerHTML = c.title;
    body.innerHTML = c.body;
    modal.classList.add('open');
}

function closeInfoModal() {
    document.getElementById('info-modal')?.classList.remove('open');
}

function openInfoModal(title, content) {
    const modal = document.getElementById('info-modal');
    const titleEl = document.getElementById('info-modal-title');
    const bodyEl = document.getElementById('info-modal-body');
    
    if (!modal || !titleEl || !bodyEl) return;
    
    titleEl.innerHTML = title;
    bodyEl.innerHTML = content;
    modal.classList.add('open');
}

async function checkAndShowAiActDisclaimer(docId) {
    const key = 'humano_aiact_shown';
    if (localStorage.getItem(key)) return;

    openInfoModal(
        '⚖️ EU AI Act tájékoztató',
        `<p style="line-height:1.8;margin-bottom:1rem">
            A HUMANO <strong>statisztikai mérést</strong> végez, nem értékelést vagy döntéshozatalt.
        </p>
        <ul style="line-height:2;margin-left:1.25rem;color:var(--muted);font-size:.88rem">
            <li>A "Humán Index" a gépelési ritmus <strong>változatosságát</strong> mutatja</li>
            <li>Nem mér fáradtságot, érzelmet vagy személyiséget</li>
            <li>A rendszer nem hoz döntést személyekről</li>
            <li>Minden automatikus jelzés emberileg felülvizsgálható</li>
        </ul>
        <a href="javascript:void(0)"
           onclick="closeInfoModal();showPage('about')"
           style="color:var(--gold);font-size:.82rem">
            Teljes EU AI Act megfelelőségi dokumentáció →
        </a>`
    );

    localStorage.setItem(key, '1');

    if (docId) {
        await db.from('documents')
            .update({ ai_act_disclaimer_shown: true })
            .eq('doc_id', docId);
    }
}

/* ─── 23. HERO CANVAS ───────────────────────────────────────────── */

function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = H + Math.random() * 100;
            this.vx = (Math.random() - .5) * .5;
            this.vy = -(Math.random() * .7 + .2);
            this.r = Math.random() * 1.5 + .3;
            this.alpha = 0;
            this.maxAlpha = Math.random() * .4 + .1;
            this.life = 0;
            this.maxLife = Math.random() * 400 + 200;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            
            if (this.life < 60) this.alpha = (this.life / 60) * this.maxAlpha;
            else if (this.life > this.maxLife - 80) this.alpha = ((this.maxLife - this.life) / 80) * this.maxAlpha;
            else this.alpha = this.maxAlpha;
            
            if (this.life >= this.maxLife) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,168,76,${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) {
        const p = new Particle();
        p.life = Math.floor(Math.random() * p.maxLife);
        particles.push(p);
    }
    
    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }
    loop();
}

/* ─── 24. TOOLBAR FUNKCIÓK ──────────────────────────────────────── */

function fmt(cmd) {
    const editor = document.getElementById('doc-content-area');
    if (!editor) return;
    editor.focus();
    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(cmd, false, null);
    } catch (e) {
        console.warn('execCommand failed, using fallback', e);
    }
    setTimeout(updateToolbarState, 50);
}

function updateToolbarState() {
    const boldBtn = document.getElementById('btn-bold');
    const italicBtn = document.getElementById('btn-italic');
    const underlineBtn = document.getElementById('btn-underline');

    if (!boldBtn || !italicBtn || !underlineBtn) return;

    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');

    boldBtn.style.background = isBold ? 'rgba(201,168,76,.25)' : '';
    boldBtn.style.color = isBold ? 'var(--gold)' : '';
    boldBtn.style.borderColor = isBold ? 'var(--gold)' : '';

    italicBtn.style.background = isItalic ? 'rgba(201,168,76,.25)' : '';
    italicBtn.style.color = isItalic ? 'var(--gold)' : '';
    italicBtn.style.borderColor = isItalic ? 'var(--gold)' : '';

    underlineBtn.style.background = isUnderline ? 'rgba(201,168,76,.25)' : '';
    underlineBtn.style.color = isUnderline ? 'var(--gold)' : '';
    underlineBtn.style.borderColor = isUnderline ? 'var(--gold)' : '';
}

function insertLink() {
    document.getElementById('doc-content-area').focus();
    const url = prompt('Link URL-je:', 'https://');
    if (!url) return;
    const label = prompt('Link szövege:', 'link') || 'link';
    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" style="color:var(--gold)">${label}</a>`);
}

function insertImg() {
    openMediaModal();
}

function togglePreview() {
    const pp = document.getElementById('preview-panel');
    const pc = document.getElementById('preview-content');
    const ed = document.getElementById('doc-content-area');
    
    if (pp.style.display === 'none' || !pp.style.display) {
        pc.innerHTML = ed.innerHTML || '<span style="color:var(--muted)">Nincs szöveg.</span>';
        pp.style.display = 'block';
    } else {
        pp.style.display = 'none';
    }
}

function togglePublic() {
    const cb = document.getElementById('doc-is-public');
    if (cb) cb.checked = !cb.checked;
}

function togglePublish() {
    const cb = document.getElementById('doc-is-published');
    if (cb) cb.checked = !cb.checked;
}

/* ─── 25. MÉDIA MODAL ───────────────────────────────────────────── */

const mediaGallery = [];
let mediaSelectedSrc = null;
let mediaAlign = 'left';
let mediaSavedRange = null;

function openMediaModal() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) mediaSavedRange = sel.getRangeAt(0).cloneRange();
    renderGalleryGrid();
    document.getElementById('media-modal').classList.add('open');
}

function closeMediaModal() {
    document.getElementById('media-modal').classList.remove('open');
    mediaSelectedSrc = null;
    document.getElementById('media-insert-btn').disabled = true;
    document.getElementById('media-selected-wrap').style.display = 'none';
}

function switchMediaTab(tab) {
    document.querySelectorAll('.media-tab').forEach((b, i) => {
        b.classList.toggle('active', ['upload', 'url', 'gallery'][i] === tab);
    });
    document.querySelectorAll('.media-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('mtab-' + tab).classList.add('active');
}

function mediaDragOver(e) {
    e.preventDefault();
    document.getElementById('media-dropzone').classList.add('over');
}

function mediaDragLeave() {
    document.getElementById('media-dropzone').classList.remove('over');
}

function mediaDrop(e) {
    e.preventDefault();
    document.getElementById('media-dropzone').classList.remove('over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(mediaProcessFile);
}

function mediaFileSelected(e) {
    Array.from(e.target.files).forEach(mediaProcessFile);
    e.target.value = '';
}

function mediaProcessFile(file) {
    if (file.size > 5 * 1024 * 1024) { showToast('❌ Max 5MB engedélyezett!'); return; }
    
    const reader = new FileReader();
    reader.onload = ev => {
        const src = ev.target.result;
        mediaGallery.push({ src, name: file.name });
        addToUploadGrid(src, file.name);
        renderGalleryGrid();
        mediaSelectImage(src);
    };
    reader.readAsDataURL(file);
}

function addToUploadGrid(src, name) {
    const grid = document.getElementById('media-upload-grid');
    const item = document.createElement('div');
    item.className = 'media-item';
    item.innerHTML = `<img src="${src}" alt="${esc(name)}" title="${esc(name)}">
        <button class="media-item-del" onclick="event.stopPropagation();mediaDeleteFromGrid(this,'${name}')">✕</button>`;
    item.onclick = () => mediaSelectImage(src);
    grid.appendChild(item);
}

function mediaDeleteFromGrid(btn, name) {
    const item = btn.closest('.media-item');
    item.remove();
    const idx = mediaGallery.findIndex(m => m.name === name);
    if (idx > -1) mediaGallery.splice(idx, 1);
    renderGalleryGrid();
    
    if (mediaSelectedSrc === item.querySelector('img')?.src) {
        mediaSelectedSrc = null;
        document.getElementById('media-insert-btn').disabled = true;
        document.getElementById('media-selected-wrap').style.display = 'none';
    }
}

function renderGalleryGrid() {
    const grid = document.getElementById('media-gallery-grid');
    if (!mediaGallery.length) {
        grid.innerHTML = '<div style="color:var(--muted2);font-size:.78rem;grid-column:span 3">Még nincs feltöltött kép.</div>';
        return;
    }
    
    grid.innerHTML = mediaGallery.map((m, i) => `
        <div class="media-item" onclick="mediaSelectImage('${m.src}')">
            <img src="${m.src}" alt="${esc(m.name)}">
            <button class="media-item-del" onclick="event.stopPropagation();mediaGalleryDelete(${i})">✕</button>
        </div>`).join('');
}

function mediaGalleryDelete(i) {
    mediaGallery.splice(i, 1);
    renderGalleryGrid();
}

function mediaUrlPreview() {
    const url = document.getElementById('media-url-input').value.trim();
    if (!url) return;
    
    const wrap = document.getElementById('media-url-preview-wrap');
    const img = document.getElementById('media-url-preview');
    
    img.src = url;
    img.onerror = () => {
        showToast('❌ A kép nem tölthető be.');
        wrap.style.display = 'none';
    };
    img.onload = () => {
        wrap.style.display = 'block';
        mediaSelectImage(url);
    };
}

function mediaSelectImage(src) {
    mediaSelectedSrc = src;
    document.getElementById('media-selected-preview').src = src;
    document.getElementById('media-selected-wrap').style.display = 'block';
    document.getElementById('media-insert-btn').disabled = false;
    
    document.querySelectorAll('.media-item').forEach(el => {
        el.classList.toggle('selected', el.querySelector('img')?.src === src);
    });
}

function mediaUpdatePreview() {
    const w = document.getElementById('media-width-slider').value;
    const img = document.getElementById('media-selected-preview');
    img.style.maxWidth = w + '%';
    document.getElementById('media-width-val').textContent = w + '%';
}

function mediaSetAlign(align) {
    mediaAlign = align;
    document.querySelectorAll('.media-align-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.align === align);
    });
}

function mediaInsert() {
    if (!mediaSelectedSrc) return;
    
    const w = document.getElementById('media-width-slider').value;
    const alt = document.getElementById('media-alt-input').value || 'kép';
    
    const alignStyle = mediaAlign === 'center' ? 'display:block;margin:10px auto;'
        : mediaAlign === 'right' ? 'display:block;margin:10px 0 10px auto;'
        : 'display:block;margin:10px 0;';
    
    const html = `<img src="${mediaSelectedSrc}" alt="${esc(alt)}" style="${alignStyle}width:${w}%;max-width:100%;border-radius:6px;">`;

    const editor = document.getElementById('doc-content-area');
    editor.focus();

    if (mediaSavedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(mediaSavedRange);
    }

    document.execCommand('insertHTML', false, html);
    closeMediaModal();
    showToast('🖼️ Kép beszúrva!');
}

/* ─── 26. PULZUS INFO ───────────────────────────────────────────── */

function openPulseInfo() {
    document.getElementById('pulse-info-modal').classList.add('open');
}

function closePulseInfo() {
    document.getElementById('pulse-info-modal').classList.remove('open');
}

const TIPS = [
    'Írj természetesen, tarts szüneteket gondolkodás közben – ez növeli a ritmus-változatosságot.',
    'A javítások pozitívak! Az emberi szöveg természetes variabilitást mutat.',
    'Hosszabb szünet = mélyebb gondolkodás. A rendszer ezt értékeli.',
    'A ritmus egyenetlensége az emberi agy jele – ez a te digitális ujjlenyomatod.',
    'Minimum 100 szó szükséges a hitelesítéshez. Írj részletesen, szabadon.',
];

let tipIdx = 0;
let tipInterval = null;

function startTipRotation() {
    if (tipInterval) return;
    tipInterval = setInterval(() => {
        tipIdx = (tipIdx + 1) % TIPS.length;
        const el = document.getElementById('editor-tip');
        if (el) el.textContent = TIPS[tipIdx];
    }, 8000);
}

/* ─── 27. OFFLINE QUEUE ─────────────────────────────────────────── */

const offlineQueue = [];
let isOnline = navigator.onLine;

window.addEventListener('online', async () => {
    isOnline = true;
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none';
    showToast('✅ Kapcsolat visszaállítva – szinkronizálás...');
    await flushOfflineQueue();
});

window.addEventListener('offline', () => {
    isOnline = false;
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block';
    showToast('⚠️ Nincs internetkapcsolat – az adatok lokálisan mentve.');
});

async function flushOfflineQueue() {
    if (!offlineQueue.length) return;
    showToast(`⏳ ${offlineQueue.length} mentés szinkronizálása...`);
    
    while (offlineQueue.length) {
        const item = offlineQueue.shift();
        try {
            await item();
        } catch (err) {
            console.warn('Offline queue hiba:', err);
            offlineQueue.unshift(item);
            break;
        }
    }
    
    if (!offlineQueue.length) showToast('✅ Minden adat szinkronizálva!');
}

function queueOrRun(fn) {
    if (isOnline) return fn();
    offlineQueue.push(fn);
    showToast('📥 Offline – mentés sorba állítva.');
}

window.addEventListener('beforeunload', (e) => {
    if (offlineQueue.length > 0) {
        e.preventDefault();
        e.returnValue = 'Van mentetlen hitelesítésed! Ha bezárod az oldalt, elveszhet. Biztosan bezárod?';
        return e.returnValue;
    }
});

/* ─── 28. ÁRAZÁSI FUNKCIÓK ──────────────────────────────────────── */

async function openStripeCheckout(plan) {
    if (!currentUser) { showPage('auth'); return; }
    showToast('⏳ Átirányítás a fizetési oldalra...');
    
    try {
        const { data: { session } } = await db.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('Nincs aktív munkamenet');

        const res = await fetch(`${SUPA_URL}/functions/v1/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Hiba');

        window.location.href = data.url;
    } catch (err) {
        showToast('❌ Hiba: ' + err.message);
    }
}

function openPricingContact(plan) {
    const box = document.getElementById('pricing-contact-box');
    if (!box) return;
    
    const titles = {
        lite: '⚡ Lite csomag – előfizetési érdeklődés',
        pro: '⭐ Alkotó / Pro csomag – előfizetési érdeklődés',
        institution: '🏛️ Intézményi csomag – egyedi ajánlatkérés',
        free_limit: '⬆️ Csomag frissítés – havi keret elérve',
        student: '⚡ Lite csomag – előfizetési érdeklődés',
        premium: '⭐ Alkotó / Pro csomag – előfizetési érdeklődés',
        oneshot: '⭐ Alkotó / Pro csomag – érdeklődés',
    };
    
    const titleEl = document.getElementById('pricing-contact-title');
    const planEl = document.getElementById('pricing-plan-hidden');
    
    if (titleEl) titleEl.textContent = titles[plan] || 'Előfizetési érdeklődés';
    if (planEl) planEl.value = plan;
    
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth' });
}

async function submitPricingForm(e) {
    e.preventDefault();
    
    const al = document.getElementById('pricing-contact-alert');
    if (al) al.innerHTML = '<div class="alert alert-info">⏳ Küldés...</div>';
    
    const formData = new FormData(e.target);
    const nev = formData.get('nev') || '';
    const email = formData.get('email') || '';
    const uzenet = formData.get('uzenet') || '';
    const csomag = formData.get('csomag') || '';
    
    try {
        const res = await fetch('https://formspree.io/f/xjgeqvnp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                nev,
                email,
                csomag: getPlanLabel(csomag),
                uzenet,
                _subject: `HUMANO előfizetési érdeklődés – ${getPlanLabel(csomag)}`
            }),
        });
        
        if (!res.ok) throw new Error('Küldési hiba');
        
        if (al) al.innerHTML = '<div class="alert alert-success">✅ Üzenet elküldve! Hamarosan visszajelzünk.</div>';
        e.target.reset();
    } catch (err) {
        if (al) al.innerHTML = `<div class="alert alert-error">❌ Hiba: ${err.message}</div>`;
    }
}

/* ─── 29. INICIALIZÁLÁS (DOMContentLoaded) ──────────────────────── */

// Segédfüggvény a modalok megvárásához
function waitForModal(modalId, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (document.getElementById(modalId)) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.warn(`Modal ${modalId} not found after ${timeout}ms`);
                reject(new Error(`Modal ${modalId} not loaded`));
            }
        }, 100);
    });
}

// Segédfüggvény az összes modal megvárásához
async function waitForAllModals() {
    const modalIds = [
        'paste-modal',
        'biometric-consent-modal',
        'cal-reminder-modal',
        'inactivity-modal',
        'tl-modal',
        'pulse-info-modal',
        'send-modal',
        'info-modal',
        'social-modal',
        'antibot-modal',
        'draft-modal',
        'media-modal',
        'add-signal-modal'
    ];
    
    console.log('Waiting for modals to load...');
    const results = await Promise.allSettled(
        modalIds.map(id => waitForModal(id, 5000))
    );
    
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
        console.warn(`${failed} modals failed to load, but continuing...`);
    } else {
        console.log('All modals loaded successfully');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Először várjuk meg a modalokat
    await waitForAllModals();
    
    if (!navigator.onLine) {
        const banner = document.getElementById('offline-banner');
        if (banner) banner.style.display = 'block';
    }

    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        await updateNavAuth(currentUser);
        db.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', session.user.id);
    }

    db.auth.onAuthStateChange((_, session) => {
        currentUser = session?.user || null;
        updateNavAuth(currentUser);
    });

    if (!localStorage.getItem('humano_gdpr')) {
        const bar = document.getElementById('gdpr-bar');
        if (bar) bar.style.display = 'block';
    }

    _loadPageFromHash();
    loadPublicStats();
    initHeroCanvas();

    const urlParams = new URLSearchParams(window.location.search);

    const verifyId = urlParams.get('verify');
    if (verifyId) {
        const vi = document.getElementById('v-input-unified');
        if (vi) vi.value = verifyId;
        showPage('verify-unified');
        doVerifyUnified();
    }

    const pubVerifyId = urlParams.get('v');
    if (pubVerifyId) openPubVerify(pubVerifyId);

    const timelapseDocId = urlParams.get('doc');
    if (timelapseDocId) {
        const tlInput = document.getElementById('timelapse-doc-input');
        if (tlInput) {
            tlInput.value = timelapseDocId;
            loadTimelapseFromInput();
        }
    }

    document.getElementById('send-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('send-modal')) closeSendModal();
    });
    
    document.getElementById('social-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('social-modal')) closeSocialModal();
    });
    
    document.getElementById('info-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('info-modal')) closeInfoModal();
    });

    document.getElementById('pulse-info-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('pulse-info-modal')) closePulseInfo();
    });

    document.getElementById('media-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('media-modal')) closeMediaModal();
    });

    document.getElementById('tl-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('tl-modal')) {
            document.getElementById('tl-modal').classList.remove('open');
            timelapseStopPlay();
        }
    });

    document.getElementById('humTlBtnPlay')?.addEventListener('click', () =>
        timelapsePlaying ? timelapseStopPlay() : timelapseStartPlay()
    );
    
    document.getElementById('humTlBtnRewind')?.addEventListener('click', () => {
        timelapseStopPlay();
        timelapseFrameIdx = 0;
        timelapseAccumMs = 0;
        timelapseRenderFrame(0);
    });
    
    document.getElementById('humTlSlider')?.addEventListener('input', () => {
        timelapseStopPlay();
        timelapseFrameIdx = parseInt(document.getElementById('humTlSlider').value, 10);
        timelapseAccumMs = timelapseEvents[timelapseFrameIdx]?.ts_ms ?? 0;
        timelapseRenderFrame(timelapseFrameIdx);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeInfoModal();
            closeSendModal();
            closeSocialModal();
            closePulseInfo();
            closeMediaModal();
            
            const tlModal = document.getElementById('tl-modal');
            if (tlModal && tlModal.classList.contains('open')) {
                tlModal.classList.remove('open');
                timelapseStopPlay();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (document.getElementById('page-editor')?.classList.contains('active')) {
            initPulseCanvas();
        }
    });
});




/* ============================================================
   GLOBÁLIS FÜGGVÉNYEK – Window objektumra kötés
   ============================================================ */

// Auth
window.doRegister = doRegister;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.switchAuthTab = switchAuthTab;
window.updateIdPreview = updateIdPreview;
window.cancelSubscription = cancelSubscription;
window.deleteAccount = deleteAccount;
window.exportMyData = exportMyData;

// Navigáció
window.showPage = showPage;
window.navigateTo = navigateTo;
window.toggleNav = toggleNav;
window.requireAuth = requireAuth;

// Consent és kalibráció
window.ConsentManager = ConsentManager;
window.showBiometricConsentModal = showBiometricConsentModal;
window.hideBiometricConsentModal = hideBiometricConsentModal;
window.handleConsentAccept = handleConsentAccept;
window.handleConsentDecline = handleConsentDecline;
window.loadConsentSettings = loadConsentSettings;
window.revokeConsent = revokeConsent;
window.reGrantConsent = reGrantConsent;
window.goToCalibration = goToCalibration;
window.skipCalibrationReminder = skipCalibrationReminder;
window.calStep1Complete = calStep1Complete;
window.calStep2Complete = calStep2Complete;
window.openEntropyInfo = openEntropyInfo;
window.openTripleLockInfo = openTripleLockInfo;
window.openAppealDetail = openAppealDetail;

window.calSkip = calSkip;

// Editor
window.startEditorFlow = startEditorFlow;
window.editorClear = editorClear;
window.allowPaste = allowPaste;
window.confirmPasteModal = confirmPasteModal;
window.denyPasteModal = denyPasteModal;
window.savePulseImage = savePulseImage;
window.fmt = fmt;
window.insertLink = insertLink;
window.insertImg = insertImg;
window.togglePreview = togglePreview;
window.togglePublic = togglePublic;
window.togglePublish = togglePublish;

// Média
window.openMediaModal = openMediaModal;
window.closeMediaModal = closeMediaModal;
window.switchMediaTab = switchMediaTab;
window.mediaDragOver = mediaDragOver;
window.mediaDragLeave = mediaDragLeave;
window.mediaDrop = mediaDrop;
window.mediaFileSelected = mediaFileSelected;
window.mediaUrlPreview = mediaUrlPreview;
window.mediaSelectImage = mediaSelectImage;
window.mediaUpdatePreview = mediaUpdatePreview;
window.mediaSetAlign = mediaSetAlign;
window.mediaInsert = mediaInsert;

// Dashboard és dokumentumok
window.loadDashboard = loadDashboard;
window.filterDocs = filterDocs;
window.verifyDoc = verifyDoc;
window.newVersion = newVersion;
window.deleteDoc = deleteDoc;
window.loadMyDocs = loadMyDocs;
window.filterMyDocs = filterMyDocs;
window.toggleDocPublic = toggleDocPublic;
window.toggleDocPublished = toggleDocPublished;
window.downloadMyDocPdf = downloadMyDocPdf;
window.flexCopyText = flexCopyText;

// Admin
window.loadAdmin = loadAdmin;
window.submitAppeal = submitAppeal;
window.updateAppealStatus = updateAppealStatus;

// Verify
window.doVerifyUnified = doVerifyUnified;
window.verifyByTextUnified = verifyByTextUnified;
window.searchRegistryUnified = searchRegistryUnified;
window.loadLatestRegistryUnified = loadLatestRegistryUnified;
window.downloadUnifiedPdf = downloadUnifiedPdf;
window.copyUnifiedLink = copyUnifiedLink;
window.openPubVerify = openPubVerify;

// PDF, kép, megosztás
window.downloadPdfCert = downloadPdfCert;
window.downloadSeal = downloadSeal;
window.generateSmartImage = generateSmartImage;
window.openSocialModal = openSocialModal;
window.openFlexSocialModal = openFlexSocialModal;
window.closeSocialModal = closeSocialModal;
window.shareToSocial = shareToSocial;
window.shareCopyClipboard = shareCopyClipboard;
window.copyVerifyLink = copyVerifyLink;
window.copyId = copyId;
window.openReadPage = openReadPage;
window.copyBadgeCode = copyBadgeCode;
window.copyVerifyBadgeCode = copyVerifyBadgeCode;
window.openSendEmailModal = openSendEmailModal;
window.closeSendModal = closeSendModal;
window.submitSendEmail = submitSendEmail;

// OTS
window.tsaStamp = tsaStamp;
window.downloadOtsFile = downloadOtsFile;
window.refreshOtsStatus = refreshOtsStatus;

// API
window.generateApiKey = generateApiKey;
window.deleteApiKey = deleteApiKey;

// Profil
window.loadProfile = loadProfile;
window.saveProfile = saveProfile;

// FAQ
window.renderFaq = renderFaq;
window.toggleFaq = toggleFaq;

// Info modal
window.showDetailedInfo = showDetailedInfo;
window.closeInfoModal = closeInfoModal;

// Timelapse
window.openUnifiedTimelapse = openUnifiedTimelapse;
window.openPubTimelapse = openPubTimelapse;
window.loadTimelapseFromInput = loadTimelapseFromInput;

// Anti-bot
window.triggerAntiBotCheck = triggerAntiBotCheck;
window.checkAntiBotInput = checkAntiBotInput;

// Funkció szavazás
window.loadFeatureVotes = loadFeatureVotes;
window.castVote = castVote;

// Publikációk
window.loadPublikaciok = loadPublikaciok;
window.filterPublikációk = filterPublikációk;
window.toggleLike = toggleLike;
window.openPublikacio = openPublikacio;

// Árazás
window.openStripeCheckout = openStripeCheckout;
window.openPricingContact = openPricingContact;
window.submitPricingForm = submitPricingForm;

// Egyéb
window.acceptGdpr = acceptGdpr;
window.setLang = setLang;
window.copyToClipboard = copyToClipboard;
window.getBadgeHtml = getBadgeHtml;

// White Paper
window.downloadWhitePaperPdf = downloadWhitePaperPdf;

// Piszkozat
window.loadDraft = loadDraft;
window.closeDraftModal = closeDraftModal;

// Pulzus info
window.openPulseInfo = openPulseInfo;
window.closePulseInfo = closePulseInfo;

/* ============================================================ */
