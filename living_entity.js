// ============================================================
// HUMANO – living_entity.js
// Az élő rendszer vezérlője
// ============================================================
// Függőség: db (Supabase kliens), showToast(), esc(), fmtDate()
// ollama_engine.js-nek ELŐBB kell betöltődnie (PROXY_BASE miatt)
// ============================================================

// ── PROXY_BASE guard – ha az ollama_engine.js még nem töltődött be ──
// FIX: runtime ReferenceError helyett értelmes hibaüzenet
if (typeof PROXY_BASE === 'undefined') {
    console.error('❌ HIBA: ollama_engine.js nincs betöltve living_entity.js előtt!');
}

// ── ÁLLAPOT ──
let livingEntityActive    = false;
let livingEntityIntervals = [];

// ── AKTIVÁLÁS ──
async function activateLivingEntity() {
    if (livingEntityActive) {
        showToast('⚡ A rendszer már él!');
        return;
    }

    // PROXY_BASE guard futásidőben
    if (typeof PROXY_BASE === 'undefined') {
        showToast('❌ ollama_engine.js nincs betöltve!');
        return;
    }

    const confirmed = confirm(
        '🔴 HUMANO ÉLŐ RENDSZER AKTIVÁLÁSA\n\n' +
        'Ez elindítja:\n' +
        '• Automatikus story-generálás (óránként)\n' +
        '• Signal queue figyelés (óránként)\n' +
        '• Alkotói portrék (óránként)\n' +
        '• Napi press release (naponta egyszer)\n\n' +
        'Az Ollama (qwen2.5:3b) fut-e lokálisan?'
    );
    if (!confirmed) return;

    const ollamaOk = await checkOllamaStatus();
    if (!ollamaOk) {
        showToast('❌ Ollama nem elérhető! Indítsd el: ollama serve');
        return;
    }

    livingEntityActive = true;

    await logLivingAction('ACTIVATION', 'Élő rendszer aktiválva', {
        model:     'qwen2.5:3b',
        cycle:     '1 óránként',
        press:     'naponta egyszer',
        timestamp: new Date().toISOString()
    });

    showToast('🔴 HUMANO ÉL – A rendszer elindult!');
    updateLivingEntityUI(true);

    // Azonnal fut egyet
    await runLivingCycle();

    // Óránkénti ciklus
    const cycleInterval = setInterval(runLivingCycle, 60 * 60 * 1000);
    livingEntityIntervals.push(cycleInterval);

    // Napi press release ütemezés
    scheduleDailyPressRelease();
}

// ── LEÁLLÍTÁS ──
async function deactivateLivingEntity() {
    livingEntityActive = false;
    // FIX: clearInterval + clearTimeout egyaránt – mindkettő működik mindkét ID-re
    livingEntityIntervals.forEach(id => {
        clearInterval(id);
        clearTimeout(id);
    });
    livingEntityIntervals = [];
    updateLivingEntityUI(false);
    showToast('⏸ Élő rendszer leállítva.');
}

// ── OLLAMA STÁTUSZ ──
async function checkOllamaStatus() {
    try {
        const res  = await fetch(`${PROXY_BASE}/status`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        return data.ok ?? false;
    } catch {
        return false;
    }
}

// ── FŐ CIKLUS (óránként) ──
async function runLivingCycle() {
    if (!livingEntityActive) return;

    const ts = new Date().toISOString();
    console.log('🔄 Élő ciklus indítása:', ts);

    const results = await Promise.allSettled([
        generateStoriesForNewDocs(),
        processSignalQueue(),
        generateCreatorPortraits(),
    ]);

    results.forEach((r, i) => {
        if (r.status === 'rejected') {
            const names = ['generateStoriesForNewDocs', 'processSignalQueue', 'generateCreatorPortraits'];
            console.error(`Ciklus hiba [${names[i]}]:`, r.reason);
        }
    });

    await logLivingAction('CYCLE_COMPLETE', 'Óránkénti ciklus befejezve', { timestamp: ts });
}

// ── 1. STORY GENERÁLÁS ──
async function generateStoriesForNewDocs() {
    const { data: docs } = await db
        .from('documents')
        .select('*, story_pages!left(doc_id)')
        .eq('is_public', true)
        .is('story_pages.doc_id', null)
        .limit(5);

    if (!docs?.length) return;

    for (const doc of docs) {
        const story_hu = await ollamaGenerateStoryFromDoc(doc);
        if (!story_hu) continue;

        const [story_en, story_de] = await Promise.all([
            ollamaTranslate(story_hu, 'en'),
            ollamaTranslate(story_hu, 'de'),
        ]);

        const seo_title       = `${doc.title || 'Alkotás'} – HUMANO Hitelesített`;
        const seo_description = story_hu.substring(0, 155) + '…';

        const { error } = await db.from('story_pages').insert({
            doc_id:          doc.doc_id,
            story_hu,
            story_en,
            story_de,
            seo_title,
            seo_description,
            published:       true,
        });

        if (error) {
            if (error.code === '23505') {
                console.warn(`story_pages: ${doc.doc_id} már létezik, kihagyva.`);
            } else {
                console.error('story_pages insert hiba:', error.message);
            }
            continue;
        }

        await logLivingAction('STORY_GENERATED', `Story generálva: ${doc.doc_id}`, {
            doc_id: doc.doc_id,
            title:  doc.title
        });

        await sleep(2000);
    }
}

// ── 2. SIGNAL QUEUE ──
async function processSignalQueue() {
    const { data: claimed } = await db
        .from('signal_queue')
        .update({ status: 'processing' })
        .eq('status', 'pending')
        .is('generated_answer', null)
        .select()
        .limit(3);

    if (!claimed?.length) return;

    for (const signal of claimed) {
        const answer = await ollamaGenerateForumAnswer(
            signal.question_text,
            signal.platform
        );

        if (!answer) {
            await db.from('signal_queue')
                .update({ status: 'pending' })
                .eq('id', signal.id);
            continue;
        }

        await db.from('signal_queue')
            .update({ generated_answer: answer, status: 'ready' })
            .eq('id', signal.id);

        await logLivingAction('ANSWER_GENERATED', `Válasz generálva: ${signal.source}`, {
            signal_id: signal.id,
            platform:  signal.platform
        });

        await sleep(3000);
    }
}

// ── 3. ALKOTÓI PORTRÉK ──
async function generateCreatorPortraits() {
    const { data: users } = await db
        .from('profiles')
        .select('id, username')
        .is('bio', null)
        .limit(3);

    if (!users?.length) return;

    for (const user of users) {
        const { data: docs } = await db
            .from('documents')
            .select('content, process_data')
            .eq('author_id', user.id)
            .limit(20);

        if (!docs || docs.length < 5) continue;

        const portrait = await ollamaGenerateCreatorPortrait(docs, user.username);
        if (!portrait) continue;

        await db.from('profiles')
            .update({ bio: portrait })
            .eq('id', user.id)
            .is('bio', null);

        await logLivingAction('PORTRAIT_GENERATED', `Portré: ${user.username}`, {
            user_id:   user.id,
            doc_count: docs.length
        });

        await sleep(2000);
    }
}

// ── 4. NAPI PRESS RELEASE ──
async function generateDailyPressRelease() {
    if (!livingEntityActive) return;

    console.log('📰 Napi press release generálás:', new Date().toISOString());

    const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
        { count: newDocs      },
        { count: newUsers     },
        { count: totalDocs    },
        { data:  hiData       },
        { count: otsCount     },
        { data:  docsForHours }
    ] = await Promise.all([
        db.from('documents').select('*', { count: 'exact', head: true }).gte('created_at', since24),
        db.from('profiles') .select('*', { count: 'exact', head: true }).gte('created_at', since24),
        db.from('documents').select('*', { count: 'exact', head: true }),
        db.from('documents').select('process_data').not('process_data', 'is', null).limit(100),
        db.from('documents').select('*', { count: 'exact', head: true }).not('ots_receipt', 'is', null),
        db.from('documents').select('content').limit(500),
    ]);

    const avgHI = hiData?.length
        ? Math.round(hiData.reduce((s, d) => s + (d.process_data?.humanIndex || 0), 0) / hiData.length)
        : 0;

    const totalChars = docsForHours?.reduce((s, d) => s + (d.content?.length || 0), 0) || 0;
    const humanHours = (totalChars / 18000).toFixed(0);

    const stats = {
        totalDocs: totalDocs || 0,
        newUsers:  newUsers  || 0,
        avgHI,
        humanHours,
        otsCount:  otsCount  || 0
    };

    const content_hu = await ollamaGeneratePressRelease(stats);
    if (!content_hu) {
        console.warn('Press release generálás sikertelen – Ollama nem válaszolt.');
        return;
    }

    const content_en = await ollamaTranslate(content_hu, 'en');
    const title = `HUMANO Napi Jelentés – ${new Date().toLocaleDateString('hu-HU')}`;

    const { error } = await db.from('press_releases').insert({
        title,
        content_hu,
        content_en,
        stats_snapshot: stats,
        published:      true,
    });

    if (error) {
        console.error('Press release insert hiba:', error.message);
        return;
    }

    await logLivingAction('PRESS_RELEASE', 'Napi sajtóanyag generálva', stats);
    showToast('📰 Napi sajtóanyag elkészítve!');
}

// ── NAPI PRESS RELEASE ÜTEMEZÉS (minden nap 08:00) ──
function scheduleDailyPressRelease() {
    function msUntilNextRun() {
        const now  = new Date();
        const next = new Date(now);
        next.setHours(8, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next - now;
    }

    function scheduleNext() {
        // FIX: a régi timeout ID-t eltávolítjuk mielőtt újat adunk hozzá,
        // hogy a tömb ne nőjön korlátlanul hosszú futás esetén
        const t = setTimeout(async () => {
            const idx = livingEntityIntervals.indexOf(t);
            if (idx !== -1) livingEntityIntervals.splice(idx, 1);

            await generateDailyPressRelease();
            scheduleNext();
        }, msUntilNextRun());

        livingEntityIntervals.push(t);
    }

    scheduleNext();

    const nextRun = new Date(Date.now() + msUntilNextRun());
    console.log('📅 Következő napi press release:', nextRun.toLocaleString('hu-HU'));
}

// ── SIGNAL MANUÁLIS HOZZÁADÁSA ──
async function addSignalManually(questionText, source, platform) {
    const { error } = await db.from('signal_queue').insert({
        question_text:   questionText,
        source:          source   || 'manual',
        platform:        platform || 'general',
        relevance_score: 100,
        status:          'pending'
    });
    if (!error) {
        showToast('✅ Jelzés hozzáadva a sorhoz!');
        loadSignalQueue();
    } else {
        console.error('Signal insert hiba:', error.message);
        showToast('❌ Hiba a jelzés hozzáadásakor.');
    }
}

// ── JÓVÁHAGYÁS ÉS PUBLIKÁLÁS ──
async function approveAndPublish(signalId) {
    const { data: signal } = await db
        .from('signal_queue')
        .select('*')
        .eq('id', signalId)
        .single();

    if (!signal?.generated_answer) {
        showToast('❌ Nincs generált válasz!');
        return;
    }

    copyToClipboard(signal.generated_answer);

    if (signal.source_url) {
        window.open(signal.source_url, '_blank');
    }

    await db.from('signal_queue')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', signalId);

    await logLivingAction('SIGNAL_PUBLISHED', `Publikálva: ${signal.source}`, {
        signal_id: signalId
    });

    showToast('✅ Válasz vágólapra másolva + forrásoldal megnyitva!');
    loadSignalQueue();
}

// ── VÁLASZ GENERÁLÁS SIGNALHOZ ──
async function generateAnswerForSignal(signalId) {
    showToast('🤖 Ollama gondolkodik...');

    const { data: signal } = await db
        .from('signal_queue')
        .select('*')
        .eq('id', signalId)
        .single();

    if (!signal) return;

    const answer = await ollamaGenerateForumAnswer(signal.question_text, signal.platform);

    if (!answer) {
        showToast('❌ Ollama nem elérhető!');
        return;
    }

    await db.from('signal_queue')
        .update({ generated_answer: answer, status: 'ready' })
        .eq('id', signalId);

    showToast('✅ Válasz kész – jóváhagyásra vár!');
    loadSignalQueue();
}

// ── LOG HELPER ──
async function logLivingAction(actionType, description, meta = {}) {
    const { error } = await db.from('living_entity_log').insert({
        action_type: actionType,
        description,
        meta,
        result: 'success'
    });
    if (error) console.warn('Log írás sikertelen:', error.message);
}

// ── UI FRISSÍTÉS ──
function updateLivingEntityUI(active) {
    const btn    = document.getElementById('living-entity-btn');
    const dot    = document.getElementById('living-entity-dot');
    const status = document.getElementById('living-entity-status');

    if (btn) {
        btn.textContent      = active ? '⏸ Rendszer leállítása' : '🔴 ÉLŐ RENDSZER AKTIVÁLÁSA';
        btn.style.background = active ? 'rgba(224,85,85,.15)' : 'rgba(201,168,76,.15)';
        btn.onclick          = active ? deactivateLivingEntity : activateLivingEntity;
    }
    if (dot) {
        dot.style.background = active ? '#e05555' : 'var(--muted2)';
        dot.style.animation  = active ? 'pulse-dot 1s infinite' : 'none';
    }
    if (status) {
        status.textContent = active ? 'ÉL – Ciklus: óránként | Press: naponta 08:00' : 'INAKTÍV';
        status.style.color = active ? '#e05555' : 'var(--muted)';
    }
}

// ── DASHBOARD LOADER ──
async function loadLivingEntityDashboard() {
    await Promise.all([
        loadLivingLog(),
        loadSignalQueue(),
        loadStoryStats(),
        loadPressReleases(),
        db.from('signal_queue').select('*', { count: 'exact', head: true })
          .then(({ count }) => {
              const el = document.getElementById('signal-count');
              if (el) el.textContent = count ?? 0;
          }),
        db.from('press_releases').select('*', { count: 'exact', head: true })
          .then(({ count }) => {
              const el = document.getElementById('press-count');
              if (el) el.textContent = count ?? 0;
          }),
        checkOllamaStatus().then(ok => {
            const el = document.getElementById('ollama-status');
            if (!el) return;
            el.textContent = ok ? '✅ Ollama fut (qwen2.5:3b)' : '❌ Ollama nem elérhető';
            el.style.color = ok ? 'var(--success)' : '#e05555';
        })
    ]);
}

async function loadLivingLog() {
    const { data } = await db
        .from('living_entity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    const el = document.getElementById('living-log-list');
    if (!el || !data) return;

    el.innerHTML = data.map(log => `
        <div style="display:flex;align-items:flex-start;gap:.75rem;padding:.6rem .75rem;
                    background:var(--surface2);border-radius:var(--r-sm);font-size:.78rem">
            <span style="font-family:var(--font-mono);color:var(--muted2);white-space:nowrap;font-size:.65rem">
                ${fmtDate(log.created_at)}
            </span>
            <span style="flex:1;color:var(--text)">${esc(log.description)}</span>
            <span style="font-size:.65rem;padding:.15rem .5rem;border-radius:20px;
                         background:rgba(201,168,76,.1);color:var(--gold3);white-space:nowrap">
                ${esc(log.action_type)}
            </span>
        </div>
    `).join('');
}

async function loadSignalQueue() {
    const { data } = await db
        .from('signal_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const el = document.getElementById('signal-queue-list');
    if (!el || !data) return;

    if (!data.length) {
        el.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:1rem">Nincs jelzés a sorban.</div>';
        return;
    }

    el.innerHTML = data.map(signal => `
        <div style="background:var(--surface2);border:1px solid ${signal.status === 'ready' ? 'var(--gold4)' : 'var(--border)'};
                    border-radius:var(--r);padding:.9rem 1rem;margin-bottom:.5rem">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;margin-bottom:.5rem">
                <div style="flex:1">
                    <div style="font-size:.72rem;color:var(--muted);font-family:var(--font-mono);margin-bottom:.25rem">
                        ${esc(signal.source)} · ${esc(signal.platform)} · ${fmtDate(signal.created_at)}
                    </div>
                    <div style="font-size:.85rem;color:var(--text)">${esc(signal.question_text)}</div>
                </div>
                <span style="font-size:.65rem;padding:.2rem .6rem;border-radius:20px;white-space:nowrap;flex-shrink:0;
                             background:${signal.status === 'ready' ? 'rgba(201,168,76,.15)' : signal.status === 'published' ? 'rgba(74,184,112,.1)' : 'var(--surface3)'};
                             color:${signal.status === 'ready' ? 'var(--gold)' : signal.status === 'published' ? 'var(--success)' : 'var(--muted)'}">
                    ${esc(signal.status)}
                </span>
            </div>
            ${signal.generated_answer ? `
                <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);
                            padding:.65rem .85rem;font-size:.78rem;color:var(--muted);line-height:1.7;
                            max-height:100px;overflow-y:auto;margin-bottom:.5rem">
                    ${esc(signal.generated_answer)}
                </div>
            ` : ''}
            <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                ${signal.status === 'pending' ? `
                    <button class="btn btn-outline btn-sm" onclick="generateAnswerForSignal('${signal.id}')">
                        🤖 Válasz generálása
                    </button>
                ` : ''}
                ${signal.status === 'ready' ? `
                    <button class="btn btn-gold btn-sm" onclick="approveAndPublish('${signal.id}')">
                        ✅ Jóváhagyom & Publikálom
                    </button>
                ` : ''}
                ${signal.source_url ? `
                    <a href="${esc(signal.source_url)}" target="_blank" class="btn btn-outline btn-sm">
                        🔗 Forrás
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadStoryStats() {
    const { count } = await db
        .from('story_pages')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

    const el = document.getElementById('story-count');
    if (el) el.textContent = count ?? 0;
}

async function loadPressReleases() {
    const { data } = await db
        .from('press_releases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    const el = document.getElementById('press-list');
    if (!el || !data) return;

    el.innerHTML = data.map(pr => `
        <div style="background:var(--surface2);border-radius:var(--r-sm);padding:.75rem 1rem;margin-bottom:.5rem">
            <div style="font-size:.82rem;font-weight:600;color:var(--gold2);margin-bottom:.25rem">${esc(pr.title)}</div>
            <div style="font-size:.75rem;color:var(--muted);line-height:1.6;max-height:60px;overflow:hidden">
                ${esc((pr.content_hu || '').substring(0, 150) + '…')}
            </div>
            <div style="font-size:.65rem;color:var(--muted2);margin-top:.35rem;font-family:var(--font-mono)">
                ${fmtDate(pr.created_at)}
            </div>
        </div>
    `).join('');
}

// ── SEGÉD ──
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── GLOBÁLIS HOZZÁFÉRHETŐVÉ TÉTEL ──
window.activateLivingEntity    = activateLivingEntity;
window.deactivateLivingEntity  = deactivateLivingEntity;
window.runLivingCycle          = runLivingCycle;
window.addSignalManually       = addSignalManually;
window.approveAndPublish       = approveAndPublish;
window.generateAnswerForSignal = generateAnswerForSignal;
window.loadSignalQueue         = loadSignalQueue;
window.loadLivingLog           = loadLivingLog;
window.loadStoryStats          = loadStoryStats;
window.loadPressReleases       = loadPressReleases;
