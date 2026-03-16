// ============================================================
// HUMANO – ollama_engine.js
// Vercel frontend → ngrok proxy → lokális Ollama
// ============================================================

const PROXY_BASE = 'https://elvina-recriminative-karol.ngrok-free.dev';

// ── Proxy státusz ellenőrzés ──
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
} // ← EZ HIÁNYZOTT – most javítva

checkProxyStatus();
setInterval(checkProxyStatus, 5 * 60 * 1000);

// ── Alap kérés küldő ──
async function proxyPost(endpoint, body) {
    try {
        const res = await fetch(`${PROXY_BASE}${endpoint}`, {
            method:  'POST',
            headers: {
                'Content-Type':               'application/json',
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

// ── Publikus függvények ──
async function ollamaGenerate(prompt, systemPrompt = '') {
    return proxyPost('/generate', { prompt, system: systemPrompt });
}

async function ollamaTranslate(text, targetLang) {
    if (!text?.trim()) return null;
    return proxyPost('/translate', { text, targetLang });
}

async function ollamaGenerateStoryFromDoc(doc) {
    if (!doc) return null;
    return proxyPost('/story', { doc });
}

async function ollamaGenerateForumAnswer(question, platform = 'general') {
    if (!question?.trim()) return null;
    return proxyPost('/forum-answer', { question, platform });
}

async function ollamaGeneratePressRelease(stats) {
    if (!stats) return null;
    return proxyPost('/press-release', stats);
}

async function ollamaGenerateCreatorPortrait(docs, username) {
    if (!docs?.length || !username) return null;
    return proxyPost('/portrait', { docs, username });
}
