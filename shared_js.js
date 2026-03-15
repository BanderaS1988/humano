/* ============================================================
   HUMANO – shared.js (FRISSÍTETT)
   Minden oldal betölti: index.html, dashboard.html, verify.html
   ============================================================ */


/* ─── 1. KONFIGURÁCIÓ ───────────────────────────────────────── */
const SUPA_URL = 'https://vidlijysdhbfvvytuzcg.supabase.co';
const SUPA_ANON = 'sb_publishable_JSk64VmwL-YNTgF0sFgA0w_Qb4sC_so';
const FORMSPREE_URL = 'https://formspree.io/f/xjgeqvnp';

// Stripe – kikommentelve, aktiváláshoz töltsd ki
// const STRIPE_PK = 'pk_live_XXXXXXXXXXXXXXXXXXXX';
// const STRIPE_PRICES = { student: 'price_XXXX', pro: 'price_XXXX', oneshot: 'price_XXXX' };


/* ─── 2. GLOBÁLIS ÁLLAPOT ───────────────────────────────────── */
let currentUser = null;
let allUserDocs = [];
let currentPage = 'landing';
let antiBotPassed = false;
let antiBotPending = false;
let antiBotExpectedWord = '';
let antiBotCheckCount = 0;
let myDocsAll = [];

// Editor state (globálisan elérhető) – kibővítve az új tulajdonságokkal
const E = {
    events: [],
    keys: 0,
    dels: 0,
    pauses: 0,
    focusSwitches: 0,
    warns: 0,
    repeatKeys: 0,        // ÚJ
    sessionStart: null,
    lastKey: null,
    certDocId: null,
    certTitle: null,
    certHash: null,
    pulseHistory: [],
    timerInterval: null,
    tempDocId: null,
    tlBatch: [],
    tlFlushTimer: null,
};

// ÚJ PASTE VÁLTOZÓK
let typedChars = 0;
let pastedChars = 0;
let pasteEvents = [];
let pasteAllowed = false;
let pendingPasteText = '';
let pendingPasteHtml = '';

// Social platform lista – minden oldal használhatja
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
    { id: 'copy', label: 'Link másolás', icon: '🔗' },
];

// Anti-bot szavak
const ANTIBOT_WORDS = ['HUMANO', 'ALKOTAS', 'EMBERI', 'HITELES', 'IGAZOLT', 'KULONLEGES', 'KREATIV', 'EREDETI', 'VALODI', 'SZABAD', 'GONDOLAT', 'MUNKA'];

// Piszkozat rendszer kulcsok
const DRAFT_KEY_PREFIX = 'humano_draft_';
const DRAFT_INDEX_KEY = 'humano_drafts';
let autosaveTimer = null;
let lastSavedContent = '';
let lastSavedTitle = '';

// FAQ
const FAQS = [
    { q: 'Mi az a HUMANO?', a: 'A HUMANO egy digitális szöveg-hitelesítési platform, amely biometrikus gépelési adatok, SHA-256 kriptográfia és Bitcoin blokklánc időbélyeg kombinációjával bizonyítja, hogy egy szöveg emberi kéz munkája.' },
    { q: 'Hogyan működik a biometrikus rögzítés?', a: 'A rendszer milliszekundumos pontossággal méri a billentyűleütések közti intervallumokat, a szüneteket, a javítási arányt, az ablakváltások számát. Ebből kiszámítja a gépelési ritmus változatosságát, és kategóriába sorolja: Gépies, Vegyes, Emberi vagy Intenzív alkotás.' },    { q: 'Miért van tiltva a beillesztés (paste)?', a: 'Mert a HUMANO a keletkezést hitelesíti, nem a végeredményt. Ha bemásolható lenne a szöveg, a rendszer értéktelen lenne.' },
    { q: 'Hogyan működik a QR kód mobilon?', a: 'A QR kód a https://humano.hu/verify/DOC-XXXX URL-t tartalmazza. Bármilyen okostelefonnal beolvasva azonnal megnyílik a hitelesítési oldal.' },
    { q: 'Mi az az OpenTimestamps (OTS)?', a: 'Az OpenTimestamps egy nyílt forráskódú protokoll, amely a dokumentum SHA-256 hash-ét a Bitcoin blokkláncba rögzíti. Ez matematikailag bizonyítja, hogy a hash adott időpontban már létezett.' },
    { q: 'Hogyan tölthetem le a PDF tanúsítványt?', a: 'A hitelesítés után megjelenő panelben kattints a "📄 PDF Tanúsítvány" gombra. A PDF tartalmazza a DOC ID-t, SHA-256 hash-t, biometrikus adatokat, QR kódot és a blokklánc státuszt.' },
    { q: 'Biztonságban vannak az adataim?', a: 'A szövegek EU-s Supabase szervereken tárolódnak, GDPR-kompatibilis módon. A blokkláncon rögzített hash visszavonhatatlan, de nem tartalmaz személyes adatot.' },
    { q: 'Mennyi ideig érvényes a hitelesítés?', a: 'Örökre. A Bitcoin blokklánc megmásíthatatlan – az egyszer rögzített hash-t senki nem módosíthatja.' },
];


/* ─── 3. SUPABASE INIT ──────────────────────────────────────── */
const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_ANON);


/* ─── 4. NAVIGÁCIÓ ──────────────────────────────────────────── */

const AUTH_REQUIRED = ['editor', 'dashboard', 'my-docs', 'admin', 'profile'];

function showPage(p) {
    if (AUTH_REQUIRED.includes(p) && !currentUser) {
        _showSection('auth');
        return;
    }
    _showSection(p);
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

        // Ha az editor oldal jelenik meg, ellenőrizzük a bejelentkezést
        if (hash === 'editor') {
            if (!currentUser) {
                // Ha nincs bejelentkezve, átirányítjuk az auth oldalra
                setTimeout(() => showPage('auth'), 100);
                return;
            } else {
                // Ha be van jelentkezve, megjelenítjük az editor tartalmát
                document.getElementById('editor-wrap').style.display = 'block';
            }
        }

        _onSectionActivated(hash);
    } else {
        console.warn('Nem található szekció: page-' + hash);
    }
}

function _onSectionActivated(hash) {
    if (hash === 'dashboard') loadDashboard();
    if (hash === 'admin') loadAdmin();
    if (hash === 'landing') loadPublicStats();
    if (hash === 'calibration') calInit();
    if (hash === 'faq') renderFaq();
    if (hash === 'my-docs') loadMyDocs();
    if (hash === 'profile') loadProfile();
    if (hash === 'verify-unified') loadLatestRegistryUnified();
    if (hash === 'supporters') trackEvent('Subscription_Click', {});
    if (hash === 'roadmap') loadFeatureVotes();   // ← EZT ADD HOZZÁ
    if (hash === 'editor') {
        setTimeout(() => {
            document.getElementById('doc-title-input')?.focus();
            initPulseCanvas();
            checkDraftsOnEditorOpen();
            if (typeof editorInit === 'function') editorInit();
        }, 200);
    }
}

function _loadPageFromHash() {
    const validHashes = [
        'landing', 'auth', 'editor', 'dashboard', 'my-docs', 'admin',
        'profile', 'verify-unified', 'pub-verify', 'roadmap',
        'about', 'supporters', 'faq', 'privacy', 'calibration'
    ];
    const hash = window.location.hash.replace('#', '');
    _showSection(validHashes.includes(hash) ? hash : 'landing');
}

function navigateTo(page) { showPage(page); }
function toggleNav() {
    document.getElementById('nav-links')?.classList.toggle('open');
    document.getElementById('hamburger-btn')?.classList.toggle('open');
}
function requireAuth(p) {
    if (!currentUser) { showPage('auth'); return; }
    showPage(p);
}


async function updateNavAuth(user) {
    const nu = document.getElementById('nav-user');
    const nb = document.getElementById('nav-auth-btn');
    const nl = document.getElementById('nav-logout-btn');
    const al = document.getElementById('admin-nav-link');

    if (user) {
        const name = await getProfileName(user);
        if (nu) { nu.textContent = name; nu.style.display = 'inline'; }
        if (nb) nb.style.display = 'none';
        if (nl) nl.style.display = 'inline-flex';
        checkAdminAccess();
        
        // ─── IDE JÖN ──────────────────────────
        checkCalibration();  // Ellenőrzi, hogy kell-e kalibrációs oldal
       
      checkCalibrationAge();
        // ─────────────────────────────────────
        
    } else {
        if (nu) nu.style.display = 'none';
        if (nb) nb.style.display = 'inline-flex';
        if (nl) nl.style.display = 'none';
        if (al) al.style.display = 'none';
    }
    updateHeroCta(user);
}

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

// Hero CTA auth-aware
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


/* ─── 6. AUTH MŰVELETEK ─────────────────────────────────────── */
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
    if (el) el.textContent = u.length >= 2
        ? `HMN-${u.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
        : '–';
}

async function doRegister() {
    if (!document.getElementById('r-consent').checked) {
        return authAlert('❌ Az adatkezelési tájékoztató elfogadása kötelező.');
    }
    const username = document.getElementById('r-user')?.value.trim();
    const email = document.getElementById('r-email')?.value.trim();
    const pass = document.getElementById('r-pass')?.value;
    const pass2 = document.getElementById('r-pass2')?.value;
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) return authAlert('Felhasználónév: 3–30 karakter (betű, szám, _)');
    if (!email || !/\S+@\S+\.\S+/.test(email)) return authAlert('Érvényes email cím szükséges.');
    if (pass.length < 8) return authAlert('Jelszó minimum 8 karakter.');
    if (pass !== pass2) return authAlert('A két jelszó nem egyezik.');
    authAlert('⏳ Regisztráció...', 'info');
    const { data, error } = await db.auth.signUp({ email, password: pass, options: { data: { username } } });
    if (error) return authAlert(error.message);
    if (data.user) {
        const ts = Date.now().toString(36).toUpperCase();
        const humanoId = `HMN-${username.substring(0, 4).toUpperCase()}-${ts}`;
        await db.from('profiles').upsert({
            id: data.user.id,
            username,
            humano_id: humanoId,
            plan: 'free',
            monthly_credits: 1,
            used_credits: 0,
            created_at: new Date().toISOString()
        });
    }
    authAlert('✅ Sikeres regisztráció! Átirányítás...', 'success');
    setTimeout(() => showPage('dashboard'), 1500);
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
    if (!confirm('Biztosan le szeretnéd mondani az előfizetésedet? A hitelesítési előzmények és HUMANO ID megmaradnak.')) return;
    try {
        const { error } = await db.from('profiles').update({
            plan: 'free',
            monthly_credits: 1
        }).eq('id', currentUser.id);
        if (error) throw error;
        showToast('✅ Előfizetés lemondva – ingyenes csomagra visszaállítva.');
        loadProfile();
    } catch (err) {
        showToast('❌ Hiba: ' + (err.message || 'Ismeretlen hiba'));
    }
}

async function deleteAccount() {
    if (!currentUser) return showToast('❌ Be kell jelentkezni!');
    const confirm1 = confirm('Biztosan törölni szeretnéd a fiókodat? Ez visszafordíthatatlan – minden adat törlődik (a blokkláncon rögzített hash-ek kivételével).');
    if (!confirm1) return;
    const confirm2 = confirm('Utolsó megerősítés: a fiók és az összes adat véglegesen törlődik. Folytatod?');
    if (!confirm2) return;

    try {
        const { data: { session } } = await db.auth.getSession();
        const token = session?.access_token;
        if (!token) { showToast('❌ Munkamenet lejárt, jelentkezz be újra.'); return; }

        const res = await fetch('https://vidlijysdhbfvvytuzcg.supabase.co/functions/v1/delete-user', {
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


/* ─── 7. KRIPTOGRÁFIA ───────────────────────────────────────── */
async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}


/* ─── 8. OTS (OPENTIMESTAMPS) SEGÉDFÜGGVÉNYEK ──────────────── */

// OTS stamp: elküldi a hash-t az Edge Function-nek,
// ami a calendar szerverekkel kommunikál és elmenti a receipt-et.
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

// .ots fájl letöltése doc ID alapján (Supabase-ből)
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
    a.href = url; a.download = `HUMANO-${docId}.ots`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast(`✅ HUMANO-${docId}.ots letöltve!`);
}

// OTS státusz frissítés a cert panelen
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

// Byte konverziók (PDF és egyéb használja)
function hexToUint8Array(hex) {
    if (hex.length % 2 !== 0) throw new Error('Érvénytelen hex string');
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
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


/* ─── 9. QR GENERÁLÁS ───────────────────────────────────────── */
function generateQR(containerId, docId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const url = `https://humano.hu/verify/${docId}`;
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&color=C9A84C&bgcolor=FFFFFF&margin=8&format=png`;
    img.alt = `QR kód – ${docId}`;
    img.style.cssText = 'border-radius:8px;max-width:140px;width:100%;display:block;margin:0 auto';
    img.onerror = () => {
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '?verify=' + docId)}&color=C9A84C&bgcolor=FFFFFF&margin=8`;
    };
    container.appendChild(img);
}


/* ─── 10. PDF TANÚSÍTVÁNY GENERÁLÁS ─────────────────────────── */
async function generatePdfCert(docId, title, author, hash, createdAt, otsStatus, processData) {
    if (!window.jspdf) { showToast('PDF betoltes...'); setTimeout(() => generatePdfCert(docId, title, author, hash, createdAt, otsStatus, processData), 2000); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const PL = 14, PR = 14;
    const CW = W - PL - PR;

    const humanLabel = processData?.humanCategory || ((processData?.humanIndex ?? '-') + '%');
    const entropyPct = processData?.entropyPct ?? 0;
    const entropyCV = processData?.entropyCV ?? 0;
    const typedPct = processData?.typedPct ?? 100;
    const pastedPct = processData?.pastedPct ?? 0;

    // ── Háttér + keret ──
    doc.setFillColor(6, 6, 8); doc.rect(0, 0, W, H, 'F');
    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.3); doc.rect(5, 5, W - 10, H - 10);
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.6); doc.rect(8, 8, W - 16, H - 16);

    // ── Fejléc ──
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('HUMANO', W / 2, 21, { align: 'center' });
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(138, 106, 26);
    doc.text('AZ EMBERI ALKOTAS DIGITALIS HITELESITOJE', W / 2, 27, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(240, 208, 112);
    doc.text('KELETKEZÉSI NAPLÓ – TANÚSÍTVÁNY', W / 2, 33, { align: 'center' });
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
    doc.line(PL, 37, W - PR, 37);

    // ── DOC ID box ──
    let y = 40;
    doc.setFillColor(22, 22, 42); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5);
    doc.roundedRect(PL, y, CW, 14, 2, 2, 'FD');
    doc.setTextColor(138, 106, 26); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
    doc.text('DOKUMENTUM AZONOSITO', W / 2, y + 4, { align: 'center' });
    doc.setTextColor(201, 168, 76); doc.setFontSize(11); doc.setFont('courier', 'bold');
    doc.text(docId || '-', W / 2, y + 11, { align: 'center' });
    y += 17;

    // ── Ellenőrzési URL ──
    doc.setTextColor(100, 80, 30); doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
    doc.text('Ellenorzesi URL: https://humano.hu/verify/' + (docId || ''), W / 2, y, { align: 'center' });
    y += 5;

    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.2);
    doc.line(PL, y, W - PR, y);
    y += 4;

    // ── Metaadatok 2 oszlopban ──
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
        doc.setFillColor(16, 16, 26); doc.rect(x, by, bw, 15, 'F');
        doc.setTextColor(100, 80, 30); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
        doc.text(label, x + 3, by + 4);
        doc.setTextColor(232, 217, 160); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
        doc.text(String(value).substring(0, 36), x + 3, by + 11);
    });
    y += 37;

    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.2);
    doc.line(PL, y, W - PR, y);
    y += 4;

    // ── Biometrikus adatok ──
    doc.setFillColor(16, 16, 26); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
    doc.roundedRect(PL, y, CW, 22, 2, 2, 'FD');
    doc.setTextColor(201, 168, 76); doc.setFontSize(6); doc.setFont('helvetica', 'bold');
    doc.text('BIOMETRIKUS ADATOK', PL + 4, y + 5);

    const bio = [
        ['Leutes', processData?.keystrokeCount ?? '-'],
        ['Torles', processData?.deletionCount ?? '-'],
        ['Szunet', processData?.pauseCount ?? '-'],
        ['Ablakvaltas', processData?.focusSwitches ?? '-'],
        ['Ritmus', humanLabel],
        ['Iras ideje', processData?.sessionDurationMs ? Math.round(processData.sessionDurationMs / 60000) + ' perc' : '-'],
    ];
    const bColW = CW / bio.length;
    bio.forEach(([lbl, val], i) => {
        const bx = PL + i * bColW + bColW / 2;
        const fontSize = String(val).length > 6 ? 5.5 : 7;
        doc.setTextColor(240, 208, 112); doc.setFontSize(fontSize); doc.setFont('helvetica', 'bold');
        doc.text(String(val), bx, y + 13, { align: 'center' });
        doc.setTextColor(100, 80, 30); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
        doc.text(lbl, bx, y + 19, { align: 'center' });
    });
    y += 26;

    // ── Entrópia + Paste arány szekció ──
    doc.setFillColor(16, 16, 26); doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.3);
    doc.roundedRect(PL, y, CW, 18, 2, 2, 'FD');
    doc.setTextColor(201, 168, 76); doc.setFontSize(6); doc.setFont('helvetica', 'bold');
    doc.text('SZOVEG OSSZETETELE & RITMUS-ENTROPIA', PL + 4, y + 5);

    const compose = [
        ['Kezzel gepelt', typedPct + '%'],
        ['Beillesztett', pastedPct + '%'],
        ['Entropia', entropyPct + '%'],
        ['Entropia CV', entropyCV.toFixed(2)],
    ];
    const cColW = CW / compose.length;
    compose.forEach(([lbl, val], i) => {
        const cx = PL + i * cColW + cColW / 2;
        doc.setTextColor(240, 208, 112); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(String(val), cx, y + 11, { align: 'center' });
        doc.setTextColor(100, 80, 30); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
        doc.text(lbl, cx, y + 16, { align: 'center' });
    });

    // Vizuális sáv a paste arányhoz
    const barX = PL + 4, barY = y + 13, barW = CW / 2 - 8, barH = 2;
    doc.setFillColor(30, 30, 50); doc.rect(barX, barY, barW, barH, 'F');
    doc.setFillColor(74, 184, 112); doc.rect(barX, barY, barW * (typedPct / 100), barH, 'F');
    y += 22;

    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.2);
    doc.line(PL, y, W - PR, y);
    y += 4;

    // ── SHA-256 hash ──
    doc.setTextColor(100, 80, 30); doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
    doc.text('SHA-256 KRIPTOGRAFIAI LENYOMAT', PL, y + 3);
    y += 5;
    doc.setFillColor(13, 17, 23); doc.rect(PL, y, CW, 10, 'F');
    doc.setTextColor(166, 214, 255); doc.setFontSize(5.5); doc.setFont('courier', 'normal');
    const h = hash || '-';
    doc.text(h.substring(0, 64), PL + 3, y + 4);
    if (h.length > 64) doc.text(h.substring(64), PL + 3, y + 8.5);
    y += 14;

    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.2);
    doc.line(PL, y, W - PR, y);
    y += 4;

    // ── Pulzusgrafikon ──
    const pulseData = (processData?.pulseDataPoints?.length > 1) ? processData.pulseDataPoints : (E?.pulseHistory?.length > 1 ? E.pulseHistory : null);

    if (pulseData && pulseData.length > 1) {
        doc.setFillColor(16, 16, 26); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
        doc.roundedRect(PL, y, CW, 36, 2, 2, 'FD');
        doc.setTextColor(201, 168, 76); doc.setFontSize(6); doc.setFont('helvetica', 'bold');
        doc.text('GEPELESI SPEKTRUM – GONDOLKODASI GORBE', W / 2, y + 6, { align: 'center' });

        const pCvs = document.createElement('canvas');
        pCvs.width = 600; pCvs.height = 60;
        const pCtx = pCvs.getContext('2d');
        pCtx.fillStyle = '#101018'; pCtx.fillRect(0, 0, 600, 60);
        const pMax = Math.max(...pulseData, 10);
        pCtx.strokeStyle = 'rgba(201,168,76,0.1)'; pCtx.lineWidth = 1;
        [15, 30, 45].forEach(g => { pCtx.beginPath(); pCtx.moveTo(0, g); pCtx.lineTo(600, g); pCtx.stroke(); });
        pCtx.beginPath(); pCtx.moveTo(0, 60);
        pulseData.forEach((v, i) => { const x = (i / (pulseData.length - 1)) * 600; const py = 60 - (v / pMax) * 52; pCtx.lineTo(x, py); });
        pCtx.lineTo(600, 60); pCtx.closePath();
        const fg = pCtx.createLinearGradient(0, 0, 0, 60);
        fg.addColorStop(0, 'rgba(201,168,76,0.3)'); fg.addColorStop(1, 'rgba(201,168,76,0)');
        pCtx.fillStyle = fg; pCtx.fill();
        pCtx.beginPath();
        pulseData.forEach((v, i) => { const x = (i / (pulseData.length - 1)) * 600; const py = 60 - (v / pMax) * 52; i === 0 ? pCtx.moveTo(x, py) : pCtx.lineTo(x, py); });
        pCtx.strokeStyle = '#c9a84c'; pCtx.lineWidth = 2; pCtx.stroke();
        doc.addImage(pCvs.toDataURL('image/png'), 'PNG', PL + 2, y + 8, CW - 4, 17);
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
            doc.setTextColor(240, 208, 112); doc.setFontSize(fs); doc.setFont('helvetica', 'bold');
            doc.text(val, px, y + 5, { align: 'center' });
            doc.setTextColor(100, 80, 30); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
            doc.text(lbl, px, y + 10, { align: 'center' });
        });
        y += 14;
    }

    doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.2);
    doc.line(PL, y, W - PR, y);
    y += 4;

    // ── QR kód bal + összefoglaló adatok jobb ──
    const verifyUrl = 'https://humano.hu/verify/' + (docId || '');
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(verifyUrl) + '&color=C9A84C&bgcolor=1a1a2e&margin=4&format=png';
    const blockH = H - 20 - y;

    await new Promise(resolve => {
        const qrImg = new Image(); qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
            const cvs = document.createElement('canvas'); cvs.width = 120; cvs.height = 120;
            cvs.getContext('2d').drawImage(qrImg, 0, 0, 120, 120);

            const qrColW = CW * 0.38;
            doc.setFillColor(22, 22, 42); doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.3);
            doc.roundedRect(PL, y, qrColW, blockH, 2, 2, 'FD');
            doc.setTextColor(201, 168, 76); doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
            doc.text('QR KOD – MOBIL ELLENORZES', PL + qrColW / 2, y + 5, { align: 'center' });
            const qrSize = Math.min(blockH - 14, 28);
            const qrX = PL + qrColW / 2 - qrSize / 2;
            doc.addImage(cvs.toDataURL('image/png'), 'PNG', qrX, y + 7, qrSize, qrSize);
            doc.setTextColor(100, 80, 30); doc.setFontSize(4.5); doc.setFont('helvetica', 'normal');
            doc.text('Szkeneld be az azonnali ellenorzeshez', PL + qrColW / 2, y + blockH - 3, { align: 'center' });

            const rx = PL + qrColW + 3;
            const rw = CW - qrColW - 3;
            doc.setFillColor(16, 16, 26); doc.setDrawColor(100, 80, 30); doc.setLineWidth(0.3);
            doc.roundedRect(rx, y, rw, blockH, 2, 2, 'FD');
            doc.setTextColor(201, 168, 76); doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
            doc.text('ELLENORZESI ADATOK', rx + rw / 2, y + 5, { align: 'center' });
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
                doc.setTextColor(100, 80, 30); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
                doc.text(lbl + ':', rx + 3, ly);
                doc.setTextColor(200, 190, 160); doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
                doc.text(String(val), rx + 24, ly);
            });
            resolve();
        };
        qrImg.onerror = () => {
            doc.setFillColor(22, 22, 42); doc.roundedRect(PL, y, CW, blockH, 2, 2, 'FD');
            doc.setTextColor(100, 80, 30); doc.setFontSize(6);
            doc.text('QR: ' + verifyUrl, W / 2, y + blockH / 2, { align: 'center' });
            resolve();
        };
        qrImg.src = qrUrl;
    });

    // ── Lábléc ──
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
    doc.line(PL, H - 16, W - PR, H - 16);
    doc.setTextColor(100, 80, 30); doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text('Ellenorzes: humano.hu · opentimestamps.org · SHA-256 · Bitcoin blokklánc', W / 2, H - 11, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('Generalva: ' + new Date().toLocaleString('hu-HU'), W / 2, H - 6, { align: 'center' });

    doc.save('HUMANO-Tanusitvany-' + (docId || 'cert') + '.pdf');
    showToast('PDF tanusitvany letoltve!');
}   

/* ─── 11. MEGOSZTÁS ─────────────────────────────────────────── */
function openSocialModal() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const title = E.certTitle || '–';
    const link = `https://humano.hu/verify/${docId}`;
    const text = `Épp hitelesítettem ezt a szöveget a HUMANO platformon – Bitcoin blokklánccal igazolva, hogy emberi kéz írta. 🖊️✦\n\n"${title}"\n\n${link}\n\n#HumanoVerified #EmberiAlkotás #AI`;
    _buildSocialGrid(link, text);
    document.getElementById('social-modal')?.classList.add('open');
}

function openFlexSocialModal() {
    const s = window._flexStats || {};
    const text = `Eddig ${(s.totalChars || 0).toLocaleString('hu-HU')} karaktert írtam a HUMANO platformon – ez ${s.humanHours || 0} óra tiszta emberi munka, Bitcoin blokklánccal igazolva. 🖊️✦ #HumanoVerified #EmberiAlkotás #AI\n\nhttps://humano.hu`;
    _buildSocialGrid('https://humano.hu', text);
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
    if (platform === 'copy') { copyToClipboard(link); showToast('🔗 Link másolva!'); closeSocialModal(); return; }
    if (platform === 'instagram') { copyToClipboard(text + '\n\n' + link); showToast('📸 Szöveg másolva – illeszd be az Instagram sztoridba!'); closeSocialModal(); return; }
    if (platform === 'tiktok') { copyToClipboard(text + '\n\n' + link); showToast('🎵 Szöveg másolva – illeszd be a TikTok bio-dba!'); closeSocialModal(); return; }
    const url = urls[platform];
    if (url) { window.open(url, '_blank', 'width=600,height=500'); closeSocialModal(); }
}

function shareCopyClipboard() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const hash = E.certHash || document.getElementById('cert-hash-val')?.textContent;
    const title = E.certTitle || document.getElementById('doc-title-input')?.value || '–';
    const link = `https://humano.hu/verify/${docId}`;
    const text = `HUMANO Hitelesített Szöveg\n${'─'.repeat(36)}\nCím: ${title}\nDOC ID: ${docId}\nSHA-256: ${hash}\nEllenőrző link: ${link}\n${'─'.repeat(36)}\nHitelesítve: humano.hu · Bitcoin blokklánc`;
    copyToClipboard(text);
    showToast('📋 Vágólapra másolva!');
}

function copyVerifyLink(docId) {
    const id = docId || E.certDocId || document.getElementById('cert-id-val')?.textContent;
    if (!id || id === '–') { showToast('Nincs dokumentum azonosító!'); return; }
    copyToClipboard(`https://humano.hu/verify/${id}`);
    showToast('🔗 Link másolva!');
}

function copyId() {
    const id = document.getElementById('cert-id-val')?.textContent;
    copyToClipboard(id);
    showToast('📋 ID másolva!');
}

function copyBadgeCode() {
    const code = document.getElementById('badge-html-code')?.textContent;
    if (code && code !== '–') { copyToClipboard(code); showToast('🏷️ Badge kód másolva!'); }
}

function copyVerifyBadgeCode() {
    const code = document.getElementById('v-badge-code')?.textContent;
    if (code && code !== '–') { copyToClipboard(code); showToast('🏷️ Badge kód másolva!'); }
}

function getBadgeHtml(docId) {
    const url = `https://humano.hu/verify/${docId}`;
    return `<a href="${url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:8px;background:rgba(6,6,8,.95);border:1.5px solid #c9a84c;font-family:Georgia,serif;font-size:12px;color:#c9a84c;text-decoration:none;">✦ <span><strong style="display:block;font-size:11px;letter-spacing:.5px">HUMANO HITELESÍTETT</strong><span style="display:block;font-size:9px;color:#8a6a20;letter-spacing:.3px">${docId}</span></span></a>`;
}

// EMAIL KÜLDÉS MODAL
function openSendEmailModal() {
    const docId = E.certDocId || document.getElementById('cert-id-val')?.textContent;
    const hash = E.certHash || document.getElementById('cert-hash-val')?.textContent;
    const title = E.certTitle || document.getElementById('doc-title-input')?.value || '–';
    const link = `https://humano.hu/verify/${docId}`;

    document.getElementById('send-doc-id-hidden').value = docId;
    document.getElementById('send-verify-link-hidden').value = link;
    document.getElementById('send-hash-hidden').value = hash;
    document.getElementById('send-doc-summary').innerHTML = `
    <strong style="color:var(--gold2)">${esc(title)}</strong><br>
    <span style="font-family:var(--font-mono);font-size:.75rem">DOC ID: ${esc(docId)}</span><br>
    <span style="color:var(--muted)">Link: <a href="${link}" target="_blank" style="color:var(--gold)">${link}</a></span>`;
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

    const formData = new FormData();
    formData.append('to_email', toEmail);
    formData.append('_subject', subject || `HUMANO hitelesített szöveg – ${E.certTitle || 'Dokumentum'}`);
    formData.append('uzenet', message);
    formData.append('doc_id', docId);
    formData.append('ellenorzo_link', verifyLink);
    formData.append('sha256_hash', hash);
    formData.append('_replyto', toEmail);

    try {
        const resp = await fetch(FORMSPREE_URL, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
        });

        if (resp.ok) {
            document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-success">✅ Sikeresen elküldve!</div>';
            setTimeout(() => closeSendModal(), 2000);
        } else {
            document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-error">❌ Küldési hiba. Próbáld újra.</div>';
        }
    } catch (err) {
        document.getElementById('send-modal-alert').innerHTML = '<div class="alert alert-error">❌ Hálózati hiba.</div>';
    }
}

/* ─── 12. UI SEGÉDFÜGGVÉNYEK ────────────────────────────────── */

function getHumanoBadge(pct) {
    if (pct >= 90) return { label: 'Platina', color: '#a8d8ea', icon: '💎' };
    if (pct >= 70) return { label: 'Arany',   color: '#c9a84c', icon: '🥇' };
    if (pct >= 50) return { label: 'Ezüst',   color: '#9e9e9e', icon: '🥈' };
    return             { label: 'Bronz',   color: '#cd7f32', icon: '🥉' };
}

function fmtDate(iso) {
    if (!iso) return '–';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function esc(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg) {
    const t = document.getElementById('humano-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._to);
    t._to = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function acceptGdpr() {
    localStorage.setItem('humano_gdpr', '1');
    const bar = document.getElementById('gdpr-bar');
    if (bar) bar.style.display = 'none';
}

function setLang(l) {
    showToast(`Nyelv: ${l.toUpperCase()} – hamarosan elérhető!`);
}

function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

function timeSince(ts) {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return sec + ' mp';
    if (sec < 3600) return Math.floor(sec / 60) + ' perc';
    return Math.floor(sec / 3600) + ' óra';
}

// Árazási kapcsolatfelvétel doboz
function openPricingContact(plan) {
    const box = document.getElementById('pricing-contact-box');
    if (!box) return;
    const titles = {
        student: '🎓 Tanuló csomag – előfizetési érdeklődés',
        pro: '⭐ Alkotó / Pro csomag – előfizetési érdeklődés',
        institution: '🏢 Intézményi csomag – ajánlatkérés',
        oneshot: '💎 Egyszeri hitelesítés – érdeklődés',
        free_limit: '⬆️ Csomag frissítés – keret elérve',
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
    const data = new FormData(e.target);
    try {
        const resp = await fetch(FORMSPREE_URL, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (resp.ok) {
            if (al) al.innerHTML = '<div class="alert alert-success">✅ Üzenet elküldve! Hamarosan visszajelzünk.</div>';
            e.target.reset();
        } else {
            if (al) al.innerHTML = '<div class="alert alert-error">❌ Hiba küldéskor. Próbáld újra!</div>';
        }
    } catch (err) {
        if (al) al.innerHTML = '<div class="alert alert-error">❌ Hálózati hiba.</div>';
    }
}

// Info modal (landing oldal ⓘ ikonok)
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

// Hero canvas (landing oldal animáció)
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
            this.x += this.vx; this.y += this.vy; this.life++;
            if (this.life < 60) this.alpha = (this.life / 60) * this.maxAlpha;
            else if (this.life > this.maxLife - 80) this.alpha = ((this.maxLife - this.life) / 80) * this.maxAlpha;
            else this.alpha = this.maxAlpha;
            if (this.life >= this.maxLife) this.reset();
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,168,76,${this.alpha})`; ctx.fill();
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


/* ─── 13. ANALITIKA ─────────────────────────────────────────── */
async function trackEvent(eventType, meta = {}) {
    try {
        await db.from('analytics_events').insert({
            event_type: eventType,
            user_id: currentUser?.id || null,
            meta: meta,
            created_at: new Date().toISOString()
        });
    } catch (e) { /* silent */ }
}


/* ─── 14. PUBLIKUS STATISZTIKA ──────────────────────────────── */
async function loadPublicStats() {
    const { count: uc } = await db.from('profiles').select('*', { count: 'exact', head: true });
    const { count: dc } = await db.from('documents').select('*', { count: 'exact', head: true });
    const statDocs = document.getElementById('stat-docs');
    const statUsers = document.getElementById('stat-users');
    if (statDocs) statDocs.textContent = dc ?? '0';
    if (statUsers) statUsers.textContent = uc ?? '0';

    // Aktív felhasználók (30 nap)
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUc } = await db.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', since30);
    const el = id => document.getElementById(id);
    if (el('stat-active-users')) el('stat-active-users').textContent = activeUc ?? '0';

    // Új regisztrációk (7 nap)
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUc } = await db.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since7);
    if (el('stat-new-this-week')) el('stat-new-this-week').textContent = newUc ?? '0';

    // Mai hitelesítések
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayDc } = await db.from('documents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
    if (el('stat-docs-today')) el('stat-docs-today').textContent = todayDc ?? '0';

    // Átlag Humán Index
    const { data: hiData } = await db.from('documents')
        .select('process_data')
        .not('process_data', 'is', null)
        .limit(200);
    if (hiData && hiData.length) {
        const vals = hiData.map(d => d.process_data?.humanIndex || 0).filter(v => v > 0);
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        if (el('stat-avg-human')) el('stat-avg-human').textContent = avg + '%';
    }

    // Milestone (1000 hitelesítés)
    const GOAL = 1000;
    const current = dc ?? 0;
    const left = Math.max(0, GOAL - current);
    const pct = Math.min(100, Math.round((current / GOAL) * 100));
    if (el('stat-milestone-left')) el('stat-milestone-left').textContent = left;
    if (el('stat-milestone-bar')) el('stat-milestone-bar').style.width = pct + '%';

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
    if (!data || !data.length) { el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1rem">Még nincs adat.</div>'; return; }
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
    if (!data || !data.length) { el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1rem">Még nincs nyilvános dokumentum.</div>'; return; }
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

/* ─── 15. FAQ ───────────────────────────────────────────────── */
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
    if (!isOpen) { ans.classList.add('open'); item.classList.add('open'); }
}


/* ─── 16. API KULCSOK ───────────────────────────────────────── */
async function generateApiKey() {
    if (!currentUser) return;
    const arr = crypto.getRandomValues(new Uint8Array(16));
    const key = 'HMN_KEY_' + Array.from(arr).map(b => b.toString(36).padStart(2, '0')).join('').toUpperCase().substring(0, 24);
    const expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await db.from('api_keys').insert({ user_id: currentUser.id, key, name: 'Default', expires_at });
    if (error) { showToast('❌ Hiba: ' + error.message); return; }
    showToast('✦ API kulcs létrehozva!');
    loadApiKeys();
}

async function loadApiKeys() {
    if (!currentUser) return;
    const { data } = await db.from('api_keys').select('*').eq('user_id', currentUser.id);
    const el = document.getElementById('d-api-keys-list');
    if (!el) return;
    if (!data || !data.length) { el.innerHTML = '<div style="color:var(--muted);font-size:.85rem">Még nincs API kulcsod.</div>'; return; }
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


/* ─── 17. PROFIL ────────────────────────────────────────────── */
async function loadProfile() {
    if (!currentUser) return;

    const { data: p } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
    const { count: dc } = await db.from('documents').select('*', { count: 'exact', head: true }).eq('author_id', currentUser.id);

    if (!p) return;

    document.getElementById('p-username').value = p.username || '';
    document.getElementById('p-humano-id').value = p.humano_id || '';
    document.getElementById('p-email').value = currentUser.email || '';

    document.getElementById('p-fullname').value = p.fullname || '';
    document.getElementById('p-website').value = p.website || '';
    document.getElementById('p-location').value = p.location || '';
    document.getElementById('p-occupation').value = p.occupation || '';
    document.getElementById('p-bio').value = p.bio || '';

    document.getElementById('p-stat-docs').textContent = dc ?? '–';

    let planText = 'Ingyenes';
    if (p.plan === 'premium') planText = 'Pro';
    else if (p.plan === 'student') planText = 'Tanuló';
    else if (p.plan === 'institution') planText = 'Intézményi';
    document.getElementById('p-stat-plan').textContent = planText;

    window._originalProfile = {
        fullname: p.fullname || '',
        website: p.website || '',
        location: p.location || '',
        occupation: p.occupation || '',
        bio: p.bio || ''
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


/* ─── 18. DASHBOARD ─────────────────────────────────────────── */
async function loadDashboard() {
    if (!currentUser) return;
    const { data: profile } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
    const { data: docs } = await db.from('documents').select('*').eq('author_id', currentUser.id).order('saved_at', { ascending: false });
    allUserDocs = docs || [];

    document.getElementById('d-username').textContent = profile?.username || currentUser.email;
    document.getElementById('d-humano-id').textContent = `HUMANO ID: ${profile?.humano_id || '–'}`;

    const used = profile?.used_credits || 0;
    const limit = profile?.monthly_credits || 1;
    const plan = profile?.plan || 'free';
    const pct = plan === 'premium' ? 0 : Math.min(100, (used / limit) * 100);

    document.getElementById('d-stats').innerHTML = [
        { label: 'Hitelesített szövegek', val: allUserDocs.length, sub: 'összesen' },
        { label: 'Felhasznált kredit', val: used, sub: `/ ${plan === 'premium' ? '∞' : limit}` },
        { label: 'Csomag', val: plan === 'premium' ? 'Pro' : 'Free', sub: '' },
        { label: 'Regisztrált', val: (fmtDate(profile?.created_at || '') || '–').split(' ')[0] || '–', sub: '' },
    ].map(s => `<div class="card stat-card"><div class="s-label">${s.label}</div><div class="s-val gt">${s.val}</div>${s.sub ? `<div class="s-sub">${s.sub}</div>` : ''}</div>`).join('');

    document.getElementById('d-credit-bar').style.width = `${pct}%`;
    document.getElementById('d-credit-label').textContent = plan === 'premium' ? 'Korlátlan (Pro)' : `${used} / ${limit} felhasználva`;

    const psnip = document.getElementById('d-profile-snippet');
    if (psnip && profile) {
        psnip.innerHTML = `<div style="font-family:var(--font-mono);font-size:.8rem;color:var(--muted)">${esc(profile.humano_id || '–')}</div><div style="font-size:.85rem;color:var(--text);margin-top:4px">${esc(profile.bio || 'Még nincs bio.')}</div>`;
    }

    renderDocs(allUserDocs);
    loadApiKeys();
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
            doc_id: doc.doc_id, title: doc.title, author_id: doc.author_id,
            author_name: doc.author_name, hash: doc.hash, ots_receipt: doc.ots_receipt || null,
            deleted_at: new Date().toISOString()
        }).catch(() => { });
    }
    await db.from('documents').delete().eq('doc_id', id).eq('author_id', currentUser.id);
    allUserDocs = allUserDocs.filter(d => d.doc_id !== id);
    renderDocs(allUserDocs);
    showToast('🗑 Dokumentum törölve.');
}


/* ─── 19. ADMIN ─────────────────────────────────────────────── */
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
}


/* ─── 20. UNIFIED VERIFY ────────────────────────────────────── */
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
                A Bitcoin hálózat több ezer számítógépe őrzi ezt az időbélyeget – még ha a HUMANO megszűnne is, a bizonyíték örökre megmarad.
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
                A Bitcoin hálózat a következő blokk kibányászásakor rögzíti véglegesen – ez kb. 10 percenként történik, 
                de a megerősítés általában <strong style="color:var(--text)">1–2 órát</strong> vesz igénybe. 
                Addig is a HUMANO adatbázisában már rögzítve van a keletkezés ténye.
            </div>
        </div>`
            : `<span class="badge badge-muted">OTS – nincs adat</span>`;

    if (hasOts) document.getElementById('v-ots-dl-btn-unified').style.display = 'inline-flex';

    generateQR('v-qr-container-unified', doc.doc_id);
    document.getElementById('v-result-unified').style.display = 'block';
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
        doc.doc_id, doc.title, doc.author_name, doc.hash, doc.created_at,
        doc.ots_receipt ? 'confirmed' : (doc.ots_pending ? 'pending' : 'none'),
        doc.process_data || {}
    );
}

function copyUnifiedLink() {
    const docId = document.getElementById('v-input-unified')?.value || '';
    if (!docId) { showToast('❌ Nincs dokumentum kiválasztva!'); return; }
    copyToClipboard(`https://humano.hu/verify/${docId}`);
    showToast('🔗 Megosztási link másolva!');
}


/* ─── 21. MY DOCS ───────────────────────────────────────────── */
async function loadMyDocs() {
    if (!currentUser) {
        showPage('auth');
        return;
    }
    document.getElementById('my-docs-list').innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)">⏳ Betöltés...</div>';
    const { data, error } = await db.from('documents')
        .select('doc_id,title,content,hash,created_at,process_data,is_public,ots_receipt,ots_pending')
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
    if (!docs.length) { el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)">Még nincs hitelesített dokumentumod.</div>'; return; }
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
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://humano.hu/verify/' + d.doc_id)}&color=C9A84C&bgcolor=FFFFFF&margin=6&format=png`;
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
        </div>
      </div>
    </div>`;
    }).join('');
    document.getElementById('my-docs-count-label').textContent = `${docs.length} dokumentum`;
}

async function downloadMyDocPdf(docId) {
    trackEvent('PDF_Generated', { doc_id: docId, source: 'my_docs' });
    const { data: doc } = await db.from('documents').select('*').eq('doc_id', docId).single();
    if (!doc) { showToast('❌ Dokumentum nem található.'); return; }
    const pd = doc.process_data || {};
    await generatePdfCert(doc.doc_id, doc.title, doc.author_name, doc.hash, doc.created_at,
        doc.ots_receipt ? 'confirmed' : (doc.ots_pending ? 'pending' : 'none'), pd);
}


/* ─── 22. PUBLIKUS VERIFY ───────────────────────────────────── */
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
        if (charsPerMin < 100) { tpVerdict = '✅ Hiteles'; tpColor = 'var(--success)'; tpDesc = `${charsPerMin} karakter/perc – természetes, gondolkodó írási sebesség.`; }
        else if (charsPerMin < 600) { tpVerdict = '✅ Normál'; tpColor = 'var(--gold)'; tpDesc = `${charsPerMin} karakter/perc – megfelel az emberi gépelési normának.`; }
        else { tpVerdict = '⚠️ Gyors'; tpColor = 'var(--danger)'; tpDesc = `${charsPerMin} karakter/perc – szokatlanul magas sebesség, ellenőrzés javasolt.`; }
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
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, 'rgba(201,168,76,0.15)');
    fillGrad.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
}


/* ─── 23. TIMELAPSE – JAVÍTOTT VERZIÓ ───────────────────────── */
let timelapseEvents = [];
let timelapseFrameIdx = 0;
let timelapsePlaying = false;
let timelapseRafId = null;
let timelapseLastRafTime = null;
let timelapseAccumMs = 0;
let timelapseTotalDurMs = 0;

function timelapseFmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// O(n) inkrementális szöveg cache – nem újraépít minden frame-nél
const _tlTextCache = { idx: -1, text: '' };

function timelapseBuildTextAt(idx) {
    // Ha visszatekerünk, újrakezdjük
    if (idx < _tlTextCache.idx) {
        _tlTextCache.idx = -1;
        _tlTextCache.text = '';
    }
    // Csak az új eventeket dolgozzuk fel
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
    const g = id => document.getElementById(id);
    if (g('humTlStatChars')) g('humTlStatChars').textContent = inserts;
    if (g('humTlStatDel')) g('humTlStatDel').textContent = deletes;
    if (g('humTlStatDur')) g('humTlStatDur').textContent = timelapseFmtTime(timelapseTotalDurMs);
    if (g('humTlStatPause')) g('humTlStatPause').textContent = pauses;
}

function timelapseRenderFrame(idx) {
    if (!timelapseEvents.length) return;
    idx = Math.max(0, Math.min(idx, timelapseEvents.length - 1));

    const progress = timelapseEvents.length > 1 ? Math.round((idx / (timelapseEvents.length - 1)) * 100) : 0;
    const atEnd = idx >= timelapseEvents.length - 1;

    // Rhythm adatok – utolsó 30 insert event
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

    const sessionStartMs = timelapseEvents[0]?.ts_ms ?? 0;   // mindig 0 (normalizált)
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

    // SVG bars
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

    // Slider + időcímke frissítés
    const slider = document.getElementById('humTlSlider');
    if (slider) slider.value = idx;
    const timeLbl = document.getElementById('humTlTimeLbl');
    if (timeLbl) timeLbl.textContent =
        timelapseFmtTime(timelapseEvents[idx]?.ts_ms ?? 0) + ' / ' + timelapseFmtTime(timelapseTotalDurMs);

    // Ha végén vagyunk, megállunk
    if (atEnd) timelapseStopPlay();
}

function timelapseTick(now) {
    if (!timelapsePlaying) return;

    if (timelapseLastRafTime !== null) {
        const speed = parseFloat(document.getElementById('humTlSpeed')?.value ?? 1);
        const delta = (now - timelapseLastRafTime) * speed;
        timelapseAccumMs += delta;

        // Léptessük addig, amíg az accum el nem éri a következő event idejét
        while (
            timelapseFrameIdx < timelapseEvents.length - 1 &&
            timelapseEvents[timelapseFrameIdx + 1].ts_ms <= timelapseAccumMs
        ) {
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

    // Ha a végén állunk, visszatekerünk az elejére
    if (timelapseFrameIdx >= timelapseEvents.length - 1) {
        timelapseFrameIdx = 0;
        _tlTextCache.idx = -1;
        _tlTextCache.text = '';
    }

    // Az accum = az aktuális frame valódi ts_ms-e (már normalizált, t0=0)
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

    // Text cache reset
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

    // Normalizálás: t0 = 0
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


/* ─── 24. PISZKOZAT RENDSZER (AUTOSAVE) ─────────────────────── */
function getDraftIndex() {
    try { return JSON.parse(localStorage.getItem(DRAFT_INDEX_KEY) || '[]'); }
    catch { return []; }
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

        showAutosaveSnack('💾 Piszkozat mentve – ' + new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
        console.error('❌ Hiba mentéskor:', e);
    }
}

function showAutosaveSnack(msg) {
    const snack = document.getElementById('autosave-snack');
    if (!snack) return;
    document.getElementById('autosave-text').textContent = msg || 'Piszkozat mentve';
    snack.classList.add('show');
    clearTimeout(snack._hideTimer);
    snack._hideTimer = setTimeout(() => snack.classList.remove('show'), 3000);
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
    document.getElementById('draft-list').innerHTML = drafts.map(d => {
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


/* ─── 25. ANTI-BOT RENDSZER ─────────────────────────────────── */
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


/* ─── 26. EDITOR ALAP FUNKCIÓK ──────────────────────────────── */
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
    document.getElementById('s-chars').textContent = txt.length;
    document.getElementById('s-words').textContent = wc;
    document.getElementById('s-keys').textContent = E.keys;
    document.getElementById('sidebar-keys').textContent = E.keys;
    const secs = E.sessionStart ? (Date.now() - E.sessionStart) / 60000 : 0;
    document.getElementById('s-speed').textContent = secs > 0 ? Math.round(E.keys / secs) : '–';
    document.getElementById('s-dels').textContent = E.dels;
    document.getElementById('sidebar-dels').textContent = E.dels;
    document.getElementById('s-pauses').textContent = E.pauses;
    document.getElementById('sidebar-pauses').textContent = E.pauses;
    document.getElementById('s-focus').textContent = E.focusSwitches;
    document.getElementById('sidebar-focus').textContent = E.focusSwitches;
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

function editorCalcHumanIndex() {
    if (E.keys < 20) return;

    const recent = E.events.filter(ev => ev.type === 'key').slice(-50);
    if (recent.length < 10) return;

    const intervals = recent
        .slice(1)
        .map((ev, i) => ev.ts - recent[i].ts)
        .filter(v => v >= 30 && v < 5000); // paste utáni ugrás kiszűrve

    if (intervals.length < 8) return;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stddev = Math.sqrt(
        intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length
    );
    const cv = stddev / (mean || 1);

    // ── Kategória meghatározás ──
    // cv < 0.25              → gépies
    // cv 0.25–0.6            → közepes
    // cv 0.6–0.9             → emberi
    // cv > 0.9 + szünetek    → intenzív alkotás
    const delRatio = E.dels / Math.max(1, E.keys);
    const hasNaturalEdits = delRatio > 0.02 && delRatio < 0.6;
    const hasThinkingPauses = E.pauses >= 3;
    const isIntense = cv > 0.9 && hasThinkingPauses && hasNaturalEdits;

    let category, color, label, pct;

    if (cv < 0.25) {
        category = 'gépies';
        color = '#e05555';
        label = '🔴 Gépies ritmus';
        pct = Math.round((cv / 0.25) * 25); // 0–25%
    } else if (cv < 0.6) {
        category = 'közepes';
        color = 'var(--gold)';
        label = '🟡 Vegyes ritmus';
        pct = Math.round(25 + ((cv - 0.25) / 0.35) * 35); // 25–60%
    } else if (!isIntense) {
        category = 'emberi';
        color = 'var(--success)';
        label = '🟢 Emberi ritmus';
        pct = Math.round(60 + ((cv - 0.6) / 0.3) * 25); // 60–85%
    } else {
        category = 'intenzív';
        color = 'var(--gold2)';
        label = '⭐ Intenzív alkotás';
        pct = Math.min(100, Math.round(85 + ((cv - 0.9) / 0.5) * 15)); // 85–100%
    }

    pct = Math.max(0, Math.min(100, pct));

    // ── UI frissítés ──
    const idx = document.getElementById('human-index');
    const fill = document.getElementById('human-pct-fill');
    const stat = document.getElementById('s-human');

    // A szám helyett kategória-label – nem félrevezető %
    if (idx) {
        idx.textContent = label;
        idx.style.fontSize = '.85rem';
        idx.style.color = color;
    }
    if (fill) {
        fill.style.width = pct + '%';
        fill.style.background = color;
    }
    if (stat) stat.textContent = pct + '%';

    // processData-ba mehet a cv és kategória
    E.humanCategory = category;
    E.humanCV = parseFloat(cv.toFixed(3));
    E.humanPct = pct;

    updateEntropyBar();
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
    const W = window.pulseCtx.canvas.width, H = window.pulseCtx.canvas.height;
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

    // ── Fejléc ──
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ GÉPELÉSI SPEKTRUM ANALÍZIS ✦', exportW / 2, 70);

    const title = document.getElementById('doc-title-input')?.value || 'Névtelen szöveg';
    ctx.fillStyle = '#f0d070';
    ctx.font = '28px Georgia, serif';
    ctx.fillText(`"${title.substring(0, 50)}${title.length > 50 ? '…' : ''}"`, exportW / 2, 120);

    // ── Fő grafikon ──
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

    // Fill
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

    // Line
    ctx.beginPath();
    hist.forEach((v, i) => {
        const x = chartX + (i / (hist.length - 1)) * chartW;
        const y = chartY + chartH - (v / maxVal) * chartH * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ── Összehasonlítás ──
    let y = chartY + chartH + 60;

    ctx.fillStyle = '#8a8090';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Összehasonlítás:', chartX, y);
    y += 50;

    // Emberi minta
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

    // AI minta
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

    // ── Statisztika ──
    const humanLabel = E.humanCategory
        ? E.humanCategory.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim() // emoji nélkül canvas-ra
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

    // ── Végkövetkeztetés ──
    y += 30;
    ctx.fillStyle = isHumanLike ? '#4ab870' : isAILike ? '#e05555' : '#c9a84c';
    ctx.font = 'bold 34px Georgia, serif';
    const verdict = isHumanLike ? '✅ HITELES EMBERI MUNKA' : isAILike ? '⚠️ GÉPIES MINTÁZAT – AI-RA UTAL' : '⏳ NEM MEGGYŐZŐ – TÖBB MINTA KELL';
    ctx.fillText(verdict, chartX, y);
    y += 60;

    // ── Magyarázat ──
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

    // ── Lábléc ──
    ctx.fillStyle = '#6a5020';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`humano.hu · ${new Date().toLocaleString('hu-HU')} · #HumanoAnalysis`, exportW / 2, exportH - 40);

    const link = document.createElement('a');
    link.download = `HUMANO-analízis-${Date.now()}.png`;
    link.href = exp.toDataURL('image/png');
    link.click();
    showToast('📸 Analízis elmentve!');
}


/* ─── 27. ÚJ EDITOR FUNKCIÓK (AZ ÚJ ÍRÓFELÜLETBŐL) ─────────── */

// TIMELAPSE BATCH KEZELÉS
function tlRecord(type, char) {
    E.tlBatch.push({ type, char: char || null, ts_ms: Date.now() });
    console.log('tlRecord:', type, '| batch méret:', E.tlBatch.length, '| tempDocId:', E.tempDocId);
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

async function flushTlBatch(forcedDocId) {
    if (!E.tlBatch.length) return;
    if (!currentUser) return;

    // Prioritás: 1. explicit forced, 2. temp (még nem hitelesített), 3. cert (folytatás)
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


function checkTlFlush() { if (E.tlBatch.length >= 5) flushTlBatch(); }

// TOOLBAR FUNKCIÓK
// Formázási függvények a toolbarhoz
// TOOLBAR FUNKCIÓK - JAVÍTOTT VERZIÓ
function fmt(cmd) {
    const editor = document.getElementById('doc-content-area');
    if (!editor) return;

    editor.focus();

    // Próbáljuk meg a document.execCommand-ot, ha működik
    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(cmd, false, null);
    } catch (e) {
        console.warn('execCommand failed, using fallback', e);
    }

    // Kis késleltetéssel frissítjük az állapotot
    setTimeout(updateToolbarState, 50);
}

function updateToolbarState() {
    const btns = document.querySelectorAll('.toolbar button');
    if (!btns.length) return;

    // Töröljük az összes aktív állapotot
    btns.forEach(btn => btn.classList.remove('active'));

    // Ellenőrizzük a kijelölt szöveg stílusát
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const node = selection.getRangeAt(0).commonAncestorContainer;
    let parent = node.nodeType === 3 ? node.parentElement : node;

    // Végigmegyünk a szülőkön, hogy megtaláljuk a stílusokat
    while (parent && parent !== document.getElementById('doc-content-area')) {
        const styles = window.getComputedStyle(parent);

        // Bold (félkövér)
        if (styles.fontWeight === 'bold' || parseInt(styles.fontWeight) >= 600) {
            btns[0]?.classList.add('active'); // B gomb
        }

        // Italic (dőlt)
        if (styles.fontStyle === 'italic') {
            btns[1]?.classList.add('active'); // I gomb
        }

        // Underline (aláhúzott)
        if (styles.textDecoration.includes('underline')) {
            btns[2]?.classList.add('active'); // U gomb
        }

        parent = parent.parentElement;
    }
}

function insertLink() {
    document.getElementById('doc-content-area').focus();
    const url = prompt('Link URL-je:', 'https://');
    if (!url) return;
    const label = prompt('Link szövege:', 'link') || 'link';
    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" style="color:var(--gold)">${label}</a>`);
}

function insertImg() { openMediaModal(); }

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

// MÉDIA MODAL KEZELÉS
const mediaGallery = []; // { src, name } – munkamenet galéria
let mediaSelectedSrc = null;
let mediaAlign = 'left';
let mediaSavedRange = null; // kurzor pozíció megőrzése

function openMediaModal() {
    // Mentjük a kurzor pozíciót mielőtt a modal megnyílik
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

// Drag & Drop
function mediaDragOver(e) { e.preventDefault(); document.getElementById('media-dropzone').classList.add('over'); }
function mediaDragLeave() { document.getElementById('media-dropzone').classList.remove('over'); }
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

// URL preview
function mediaUrlPreview() {
    const url = document.getElementById('media-url-input').value.trim();
    if (!url) return;
    const wrap = document.getElementById('media-url-preview-wrap');
    const img = document.getElementById('media-url-preview');
    img.src = url;
    img.onerror = () => { showToast('❌ A kép nem tölthető be.'); wrap.style.display = 'none'; };
    img.onload = () => { wrap.style.display = 'block'; mediaSelectImage(url); };
}

// Kiválasztás
function mediaSelectImage(src) {
    mediaSelectedSrc = src;
    document.getElementById('media-selected-preview').src = src;
    document.getElementById('media-selected-wrap').style.display = 'block';
    document.getElementById('media-insert-btn').disabled = false;
    // Highlight selected
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

// Beszúrás
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

    // Kurzor visszaállítása a mentett pozícióra
    if (mediaSavedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(mediaSavedRange);
    }

    document.execCommand('insertHTML', false, html);
    closeMediaModal();
    showToast('🖼️ Kép beszúrva!');
}

// PULZUS INFO MODAL
function openPulseInfo() {
    document.getElementById('pulse-info-modal').classList.add('open');
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

/* ─── HIÁNYZÓ CERT PANEL FUNKCIÓK (pótolva) ─────────────────── */

function updateCertPanel(docId, hash, savedAt, otsReceipt, otsPending) {
    const now = fmtDate(savedAt || new Date().toISOString());
    const g = id => document.getElementById(id);
    if (g('tl-hash-time')) g('tl-hash-time').textContent = now;
    if (g('tl-db-time')) g('tl-db-time').textContent = now;
    if (otsReceipt) {
        const d = g('tl-ots-dot');
        if (d) { d.className = 'tl-dot done'; d.textContent = '✓'; }
        if (g('tl-ots-time')) g('tl-ots-time').textContent = 'Bitcoin blokkláncon rögzítve ✓';
    }
    if (g('tl-public-dot')) { g('tl-public-dot').className = 'tl-dot done'; g('tl-public-dot').textContent = '✓'; }

    // Bizalmi szint badge
    const badge = getHumanoBadge(E.humanPct || 0);
    const badgeEl = g('cert-trust-badge');
    if (badgeEl) {
        badgeEl.textContent = `${badge.icon} ${badge.label}`;
        badgeEl.style.color = badge.color;
        badgeEl.style.display = 'inline-flex';
    }

    generateQR('cert-qr-container', docId);
    const bl = g('badge-preview-link');
    const bll = g('badge-doc-id-label');
    const bc = g('badge-html-code');
    if (bl) bl.href = `https://humano.hu/verify/${docId}`;
    if (bll) bll.textContent = docId;
    if (bc) bc.textContent = getBadgeHtml(docId);
}

function downloadPdfCert() {
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
    generatePdfCert(id, title, currentUser?.email || '–', hash, new Date().toISOString(), 'pending', processData);
}


function copyId() {
    const id = document.getElementById('cert-id-val')?.textContent;
    if (id && id !== '–') navigator.clipboard?.writeText(id).then(() => showToast('📋 ID másolva!'));
}

function copyBadgeCode() {
    const code = document.getElementById('badge-html-code')?.textContent;
    if (code && code !== '–') { navigator.clipboard?.writeText(code); showToast('🏷️ Badge kód másolva!'); }
}

// EDITOR INIT (az új verzió)
function editorInit() {
    const ta = document.getElementById('doc-content-area');
    if (!ta) return;
    ta.addEventListener('drop', e => e.preventDefault());
    ta.addEventListener('input', () => {
        editorUpdateStats();
        const cleaned = ta.innerText.replace(/[\n\r\u200B\uFEFF]/g, '').trim();
        if (!cleaned) {
            E.keys = 0; E.dels = 0; E.pauses = 0; E.focusSwitches = 0; E.warns = 0;
            E.events = []; E.pulseHistory = []; E.sessionStart = null; E.lastKey = null;
            E.certDocId = null; E.certTitle = null; E.certHash = null;
            E.tlBatch = [];
            clearInterval(E.timerInterval); E.timerInterval = null;
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
            ['s-chars', 's-words', 's-keys', 's-dels', 's-pauses', 's-focus',
                'sidebar-keys', 'sidebar-dels', 'sidebar-pauses', 'sidebar-focus'
            ].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '0'; });
            ['human-index', 'rhythm-var'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '–'; });
            document.getElementById('human-pct-fill').style.width = '0%';
            document.getElementById('sidebar-time').textContent = '00:00';
            document.getElementById('s-speed').textContent = '–';
            document.getElementById('s-human').textContent = '–';
            document.getElementById('e-rhythm-warn').style.display = 'none';
            document.getElementById('e-word-warn').style.display = 'none';
            const entropyFill = document.getElementById('entropy-fill');
            const entropyLabel = document.getElementById('entropy-label');
            if (entropyFill) { entropyFill.style.width = '0%'; entropyFill.style.background = 'var(--muted2)'; }
            if (entropyLabel) { entropyLabel.textContent = '–'; entropyLabel.style.color = 'var(--muted)'; }
        }
    });
    ta.addEventListener('keydown', editorKeyDown);
    document.getElementById('doc-title-input')?.addEventListener('input', editorCheckSave);
    if (!window._visibilityListenerAdded) {
        window._visibilityListenerAdded = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && E.sessionStart) {
                E.focusSwitches++;
                document.getElementById('s-focus').textContent = E.focusSwitches;
                document.getElementById('sidebar-focus').textContent = E.focusSwitches;
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
    checkDraftsOnEditorOpen();
    if (!window._selectionListenerAdded) {
        window._selectionListenerAdded = true;
        document.addEventListener('selectionchange', function () {
            if (document.activeElement && document.activeElement.id === 'doc-content-area') {
                updateToolbarState();
            }
        });
    }
}
function editorKeyDown(e) {
    const now = Date.now();
    if (!E.sessionStart) {
        E.sessionStart = now;
        editorSetStatus('recording');
        E.timerInterval = setInterval(updateEditorTimer, 1000);
        startTipRotation();
        if (!E.tempDocId && currentUser) {
            const stored = localStorage.getItem('humano_temp_doc_id');
            E.tempDocId = stored || ('temp_' + currentUser.id.substring(0, 8) + '_' + Date.now().toString(36));
            localStorage.setItem('humano_temp_doc_id', E.tempDocId);
        }
    }
 if (E.lastKey && (now - E.lastKey) > 3000) {
    E.pauses++;
    E.events.push({ type: 'pause', ts: now, duration: now - E.lastKey });
    document.getElementById('s-pauses').textContent = E.pauses;
    document.getElementById('sidebar-pauses').textContent = E.pauses;
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
        document.getElementById('s-dels').textContent = E.dels;
        document.getElementById('sidebar-dels').textContent = E.dels;
        typedChars = Math.max(0, typedChars - 1);
        updatePasteRatio();
        tlRecord('delete');
        checkTlFlush();
    }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.repeat) {
            E.warns++;
            E.repeatKeys++;
            E.events.push({ type: 'repeat', ts: now, key: e.key });
            // tlRecord NEM hívódik repeat-re – DB constraint tiltja
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
        const clampedInterval = Math.min(interval, 4000);
        const pulseVal = Math.min(100, Math.max(3, Math.pow(clampedInterval / 400, 0.55) * 100));
        E.pulseHistory.push(pulseVal);
        if (E.pulseHistory.length > 60) E.pulseHistory.shift();
        drawPulse();
        editorRhythm();
        editorCalcHumanIndex();
        tlRecord('insert', e.key);
        checkTlFlush();
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
        const node = sel.getRangeAt(0).startContainer;
        const parent = node.nodeType === 3 ? node.parentElement : node;
        if (parent?.classList?.contains('pasted-segment')) {
            const range = sel.getRangeAt(0);
            const newText = document.createTextNode('');
            range.insertNode(newText);
            range.setStart(newText, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    E.lastKey = now;
    editorUpdateStats();
    editorCheckSave();
    checkTlFlush();
}


// Tisztítás
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
        warns: 0, repeatKeys: 0,
        sessionStart: null, lastKey: null, certDocId: null,
        certTitle: null, certHash: null, pulseHistory: [],
        tlBatch: [], tempDocId: null
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
    ['human-index', 'rhythm-var'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '–'; });
    document.getElementById('human-pct-fill').style.width = '0%';
    document.getElementById('sidebar-time').textContent = '00:00';
    ['s-chars', 's-words', 's-keys', 's-dels', 's-pauses', 's-focus', 'sidebar-keys', 'sidebar-dels', 'sidebar-pauses', 'sidebar-focus'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '0'; });
    document.getElementById('s-speed').textContent = '–';
    document.getElementById('s-human').textContent = '–';
    const entropyFill = document.getElementById('entropy-fill');
    const entropyLabel = document.getElementById('entropy-label');
    if (entropyFill) { entropyFill.style.width = '0%'; entropyFill.style.background = 'var(--muted2)'; }
    if (entropyLabel) { entropyLabel.textContent = '–'; entropyLabel.style.color = 'var(--muted)'; }
}
function updatePasteRatio() {
    const total = typedChars + pastedChars;

    // Csak akkor jelenik meg a sáv, ha volt beillesztés
    const bar = document.getElementById('paste-ratio-bar');
    if (!bar) return;

    if (pastedChars === 0 || total === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'block';
    const tPct = Math.round((typedChars / total) * 100);
    const pPct = 100 - tPct;

    const el = (id) => document.getElementById(id);
    if (el('typed-pct')) el('typed-pct').textContent = tPct + '%';
    if (el('pasted-pct')) el('pasted-pct').textContent = pPct + '%';
    if (el('typed-bar')) el('typed-bar').style.width = tPct + '%';
}


function allowPaste() {
    pasteAllowed = true;
    document.getElementById('e-paste-warn').style.display = 'none';
    document.getElementById('e-paste-allowed-banner').style.display = 'flex';
    if (pendingPasteText) {
        insertPastedContent(pendingPasteText);
        pendingPasteText = '';
        pendingPasteHtml = '';
    }
    showToast('📋 Beillesztés engedélyezve.');
}

function flexCopyText() {
    const s = window._flexStats || {};
    const text = `${(s.totalChars || 0).toLocaleString('hu-HU')} karakter – ${s.humanHours || 0} óra tiszta emberi munka – ${s.docCount || 0} hitelesített dokumentum. Átlag Humán Index: ${s.avgHI || 0}%. humano.hu #HumanoVerified`;
    copyToClipboard(text);
    showToast('📋 Szöveg másolva!');
}

function updateEntropyBar() {
    // Csak valódi gépelt intervallumok, paste utáni óriási ugrás kiszűrve
    const intervals = E.events
        .filter(e => e.type === 'key' && e.interval > 0)
        .slice(-80)
        .map(e => e.interval)
        .filter(v => v >= 30 && v < 5000); // 5000ms felett paste-gyanús ugrás

    const fill = document.getElementById('entropy-fill');
    const label = document.getElementById('entropy-label');
    if (!fill || !label) return;

    if (intervals.length < 20) {
        fill.style.width = '0%';
        fill.style.background = 'var(--muted2)';
        label.textContent = intervals.length > 0
            ? `– (még ${20 - intervals.length} leütés kell)`
            : '–';
        label.style.color = 'var(--muted)';
        return;
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stddev = Math.sqrt(
        intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length
    );
    const cv = stddev / (mean || 1);

    // Reális skála:
    // cv < 0.25  → gépies (AI, copy-paste dominál)
    // cv 0.25–0.6 → közepes emberi ritmus
    // cv > 0.6   → változatos, természetes emberi gépelés
    // cv = 1.5   → 100% (csak nagyon változatos, szünetekkel teli gépelésnél)
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



// Az editorWrap láthatóságának kezelése a bejelentkezés alapján
function showEditorWrap() {
    document.getElementById('editor-wrap').style.display = 'block';
}

function hideEditorWrap() {
    document.getElementById('editor-wrap').style.display = 'none';
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

    // EZT ADD HOZZÁ:
    renderMyDocs(myDocsAll);

    showToast(newState ? '🌐 Dokumentum nyilvánosra állítva.' : '🔒 Dokumentum privátba visszavonva.');
}

```javascript
/* ─── FUNKCIÓ SZAVAZÓ ───────────────────────────────────────── */
const FEATURE_LIST = [
    { id: 'mobile_app', label: '📱 Mobilalkalmazás (iOS / Android)', desc: 'Natív app a hitelesítéshez és ellenőrzéshez.' },
    { id: 'word_plugin', label: '📝 Microsoft Word / Google Docs plugin', desc: 'Közvetlenül a szövegszerkesztőből hitelesíts.' },
    { id: 'team_workspace', label: '👥 Csapat munkaterület', desc: 'Közös felület szerkesztőknek, tanároknak, céges csapatoknak.' },
    { id: 'ai_compare', label: '🤖 AI-összehasonlító mód', desc: 'Mutassa meg, mennyire különbözik a te ritmusod az AI-étól.' },
    { id: 'multilang', label: '🌍 Teljes angol / német felület', desc: 'Nemzetközi használathoz – nem csak magyar.' },
    { id: 'version_diff', label: '🔀 Verzió-összehasonlító (diff nézet)', desc: 'Két verzió közötti különbségek vizualizálva.' },
    { id: 'plagiarism_check', label: '🔍 Plágiumellenőrző integráció', desc: 'Automatikus ellenőrzés hitelesítés előtt.' },
    { id: 'school_panel', label: '🏫 Iskolai / intézményi panel', desc: 'Tanároknak: diákok beadott munkáinak áttekintése.' },
    { id: 'api_webhook', label: '🔗 Webhook / API értesítések', desc: 'Értesítés hitelesítéskor saját rendszeredbe.' },
    { id: 'dark_light', label: '☀️ Világos téma opció', desc: 'Váltható sötét / világos megjelenés.' },
];

let fvCounts = {};
let fvVoted = JSON.parse(localStorage.getItem('humano_fv_voted') || '{}');

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

/* ─── 27. INICIALIZÁLÁS ─────────────────────────────────────── */

async function checkCalibration() {
  if (!currentUser) return;
  const { data } = await db
    .from('typing_profiles')
    .select('id')
    .eq('user_id', currentUser.id)
    .limit(1);
  if (!data || !data.length) {
    setTimeout(() => showPage('calibration'), 800);
  }
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
    showToast('📅 30 napja kalibráltál – érdemes frissíteni a profilod');
  }
}

/* ─── PECSÉT GENERÁTOR ──────────────────────────────────────── */

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

/* ─── INICIALIZÁLÁS ─────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {

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

    if (typeof startAutosaveTimer === 'function') startAutosaveTimer();

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
        if (e.target === document.getElementById('send-modal')) closeSendModal?.();
    });
    document.getElementById('social-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('social-modal')) closeSocialModal();
    });
    document.getElementById('image-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('image-modal')) closeImageModal?.();
    });
    document.getElementById('info-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('info-modal')) closeInfoModal();
    });

    document.getElementById('humTlBtnPlay')?.addEventListener('click', () => timelapsePlaying ? timelapseStopPlay() : timelapseStartPlay());
    document.getElementById('humTlBtnRewind')?.addEventListener('click', () => { timelapseStopPlay(); timelapseFrameIdx = 0; timelapseAccumMs = 0; timelapseRenderFrame(0); });
    document.getElementById('humTlSlider')?.addEventListener('input', () => {
        timelapseStopPlay();
        timelapseFrameIdx = parseInt(document.getElementById('humTlSlider').value, 10);
        timelapseAccumMs = timelapseEvents[timelapseFrameIdx]?.ts_ms ?? 0;
        timelapseRenderFrame(timelapseFrameIdx);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeInfoModal();
            closeSendModal?.();
            closeSocialModal();
            document.getElementById('image-modal')?.classList.remove('open');
        }
    });

    window.addEventListener('resize', () => {
        if (typeof initPulseCanvas === 'function') initPulseCanvas();
    });

    /* ─── KALIBRÁCIÓ ── */

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
        [area1, area2].forEach(el => {
            el.addEventListener('paste', e => { e.preventDefault(); showToast('📋 Kalibrációban beillesztés nem engedélyezett – kérlek gépeld be.'); });
            el.addEventListener('drop', e => e.preventDefault());
        });
        area1.addEventListener('keydown', e => {
            if (!e.isTrusted || e.repeat) return;
            const now = Date.now();
            if (!CAL.step1SessionStart) CAL.step1SessionStart = now;
            if (e.key === 'Backspace') { CAL.step1Events.push({ type: 'delete', ts: now }); }
            else if (e.key.length === 1) {
                const interval = CAL.step1LastKey ? now - CAL.step1LastKey : 150;
                CAL.step1Events.push({ type: 'key', ts: now, interval });
                CAL.step1LastKey = now;
            }
            setTimeout(() => calUpdate1(), 10);
        });
        area2.addEventListener('keydown', e => {
            if (!e.isTrusted || e.repeat) return;
            const now = Date.now();
            if (!CAL.step2SessionStart) CAL.step2SessionStart = now;
            if (e.key === 'Backspace') { CAL.step2Events.push({ type: 'delete', ts: now }); }
            else if (e.key.length === 1) {
                const interval = CAL.step2LastKey ? now - CAL.step2LastKey : 150;
                CAL.step2Events.push({ type: 'key', ts: now, interval });
                CAL.step2LastKey = now;
            }
            setTimeout(() => calUpdate2(), 10);
        });
    }

    function calUpdate1() {
        const area = document.getElementById('cal-area-1'); if (!area) return;
        const len = area.innerText.replace(/\n/g, '').length;
        const pct = Math.min(100, Math.round((len / 347) * 100));
        const charsEl = document.getElementById('cal-1-chars');
        const progressEl = document.getElementById('cal-1-progress');
        const btnEl = document.getElementById('cal-1-btn');
        if (charsEl) charsEl.textContent = len;
        if (progressEl) progressEl.style.width = pct + '%';
        if (btnEl) btnEl.disabled = len < 347 * 0.85;
    }

    function calUpdate2() {
        const area = document.getElementById('cal-area-2'); if (!area) return;
        const words = area.innerText.trim().split(/\s+/).filter(Boolean).length;
        const wordsEl = document.getElementById('cal-2-words');
        const btnEl = document.getElementById('cal-2-btn');
        if (wordsEl) wordsEl.textContent = words;
        if (btnEl) btnEl.disabled = words < 30;
    }

    window.calInit = calInit;
    window.calUpdate1 = calUpdate1;
    window.calUpdate2 = calUpdate2;

    window.calStep1Complete = function() {
        const ind1 = document.getElementById('cal-step-1-indicator');
        const ind2 = document.getElementById('cal-step-2-indicator');
        if (ind1) ind1.style.borderColor = 'var(--success)';
        if (ind2) {
            ind2.style.borderColor = 'var(--gold)';
            ind2.style.background = 'rgba(201,168,76,.06)';
            ind2.querySelector('div').style.background = 'linear-gradient(135deg,#a07830,#c9a84c)';
            ind2.querySelector('div').style.color = '#0c0a04';
            ind2.querySelector('div').style.border = 'none';
            ind2.querySelectorAll('div')[1].querySelector('div').style.color = 'var(--gold2)';
        }
        document.getElementById('cal-step-1').style.display = 'none';
        document.getElementById('cal-step-2').style.display = 'block';
        document.getElementById('cal-area-2').focus();
        showToast('✅ Másolási minta rögzítve – most írj szabadon!');
    };

    window.calStep2Complete = async function() {
        const btn = document.getElementById('cal-2-btn');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Mentés...'; }
        try {
            const transcriptionFeatures = calExtractFeatures(CAL.step1Events);
            const compositionFeatures = calExtractFeatures(CAL.step2Events);
            const rows = [
                { user_id: currentUser.id, profile_type: 'transcription', burst_mean: transcriptionFeatures.burstMean, pause_variance: transcriptionFeatures.pauseVariance, revision_rate: transcriptionFeatures.revisionRate, rhythm_entropy: transcriptionFeatures.rhythmEntropy, sample_count: CAL.step1Events.filter(e => e.type === 'key').length },
                { user_id: currentUser.id, profile_type: 'composition', burst_mean: compositionFeatures.burstMean, pause_variance: compositionFeatures.pauseVariance, revision_rate: compositionFeatures.revisionRate, rhythm_entropy: compositionFeatures.rhythmEntropy, sample_count: CAL.step2Events.filter(e => e.type === 'key').length }
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
        } catch (err) {
            console.error('Kalibráció mentési hiba:', err);
            if (btn) { btn.disabled = false; btn.textContent = '✦ Kalibráció befejezése'; }
            showToast('❌ Hiba a mentés közben – próbáld újra.');
        }
    };

    window.calSkip = function() {
        showToast('👌 Kihagyva – bármikor elvégezheted a Dashboardon.');
        showPage('dashboard');
    };

    window.calExtractFeatures = function(events) {
        const keyEvents = events.filter(e => e.type === 'key');
        const deleteEvents = events.filter(e => e.type === 'delete');
        if (keyEvents.length < 5) return { burstMean: 0, pauseVariance: 0, revisionRate: 0, rhythmEntropy: 0 };
        const intervals = keyEvents.map(e => e.interval).filter(v => v && v > 0 && v < 10000);
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        let bursts = [], currentBurst = [];
        intervals.forEach(iv => {
            if (iv < 1500) { currentBurst.push(iv); }
            else { if (currentBurst.length > 0) { bursts.push(currentBurst.reduce((a, b) => a + b, 0)); currentBurst = []; } }
        });
        if (currentBurst.length > 0) bursts.push(currentBurst.reduce((a, b) => a + b, 0));
        const burstMean = bursts.length ? bursts.reduce((a, b) => a + b, 0) / bursts.length : mean;
        const pauses = intervals.filter(v => v >= 1500);
        const pauseMean = pauses.length ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0;
        const pauseVariance = pauses.length ? pauses.reduce((s, v) => s + Math.pow(v - pauseMean, 2), 0) / pauses.length : 0;
        const revisionRate = deleteEvents.length / Math.max(1, keyEvents.length + deleteEvents.length);
        const buckets = {};
        intervals.forEach(v => { const b = Math.floor(v / 100) * 100; buckets[b] = (buckets[b] || 0) + 1; });
        const total = intervals.length;
        const rhythmEntropy = -Object.values(buckets).reduce((s, count) => { const p = count / total; return s + (p > 0 ? p * Math.log2(p) : 0); }, 0);
        return { burstMean, pauseVariance, revisionRate, rhythmEntropy };
    };

    window.calProfileDistance = function(current, profile) {
        const w = { burstMean: 0.25, pauseVariance: 0.25, revisionRate: 0.25, rhythmEntropy: 0.25 };
        const normalize = (val, ref) => ref === 0 ? 0 : Math.abs(val - ref) / Math.max(ref, 0.001);
        return w.burstMean * normalize(current.burstMean, profile.burst_mean) +
               w.pauseVariance * normalize(current.pauseVariance, profile.pause_variance) +
               w.revisionRate * normalize(current.revisionRate, profile.revision_rate) +
               w.rhythmEntropy * normalize(current.rhythmEntropy, profile.rhythm_entropy);
    };

});
