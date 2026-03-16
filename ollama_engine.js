// ============================================================
// HUMANO – ollama_engine.js
// A Vercel frontend ezt a fájlt használja.
// Minden kérés a lokális ngrok-server.js proxyn keresztül megy.
// ============================================================

// ⚠️ Ezt az URL-t frissítsd minden ngrok újraindítás után!
// A szerver automatikusan olvassa a /status végpontból.
let PROXY_BASE = 'https://elvina-recriminative-karol.ngrok-free.dev';

// Automatikus URL frissítés – 5 percenként próbálja a /status-t
// Ha a proxy elérhető, megtartja az URL-t, különben jelzi a hibát
async function checkProxyStatus() {
    try {
        const res  = await fetch(`${PROXY_BASE}/status`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        if (data.ok) {
            console.log('✅ HUMANO Proxy elérhető:', PROXY_BASE);
        } else {
            console.warn('⚠️ Ollama nem fut a proxy mögött!');
        }
    } catch {
        console.warn('⚠️ Proxy nem elérhető:', PROXY_BASE);
    }
}

checkProxyStatus();
setInterval(checkProxyStatus, 5 * 60 * 1000);

// ── Alap kérés küldő ──
async function proxyPost(endpoint, body) {
    try {
        const res = await fetch(`${PROXY_BASE}${endpoint}`, {
            method:  'POST',
            headers: {
                'Content-Type':              'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            console.error(`Proxy HTTP ${res.status} hiba: ${endpoint}`);
            return null;
        }
        const data = await res.json();
        return data.response?.trim() || null;
    } catch (err) {
        console.error('Proxy hiba:', err.message);
        return null;
    }
}

// ── Publikus függvények – ezeket hívja a living_entity.js ──

async function ollamaGenerate(prompt, systemPrompt = '') {
    return await proxyPost('/generate', { prompt, system: systemPrompt });
}

async function ollamaTranslate(text, targetLang) {
    if (!text?.trim()) return null;
    return await proxyPost('/translate', { text, targetLang });
}

async function ollamaGenerateStoryFromDoc(doc) {
    if (!doc) return null;
    return await proxyPost('/story', { doc });
}

async function ollamaGenerateForumAnswer(question, platform = 'general') {
    if (!question?.trim()) return null;
    return await proxyPost('/forum-answer', { question, platform });
}

async function ollamaGeneratePressRelease(stats) {
    if (!stats) return null;
    return await proxyPost('/press-release', stats);
}

async function ollamaGenerateCreatorPortrait(docs, username) {
    if (!docs?.length || !username) return null;
    return await proxyPost('/portrait', { docs, username });
}
