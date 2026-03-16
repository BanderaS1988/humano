// ============================================================
// HUMANO – ollama_engine.js
// ============================================================

const OLLAMA_BASE  = 'https://elvina-recriminative-karol.ngrok-free.dev';
const OLLAMA_MODEL = 'qwen2.5:3b';

async function ollamaGenerate(prompt, systemPrompt = '') {
    try {
        const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                model:  OLLAMA_MODEL,
                prompt,
                system: systemPrompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 1200,
                }
            })
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => '(nem olvasható)');
            console.error(`Ollama HTTP ${res.status} hiba:`, errText);
            return null;
        }

        let data;
        try {
            data = await res.json();
        } catch {
            console.error('Ollama válasz nem értelmezhető JSON-ként.');
            return null;
        }

        if (!data.response?.trim()) {
            console.error('Ollama üres választ adott. Modell betöltve? (ollama pull qwen2.5:3b)');
            return null;
        }

        return data.response.trim();

    } catch (err) {
        if (err instanceof TypeError && err.message.includes('fetch')) {
            console.error('Ollama nem érhető el – fut az "ollama serve"?');
        } else if (err.name === 'AbortError') {
            console.error('Ollama kérés időtúllépés.');
        } else {
            console.error('Ollama ismeretlen hiba:', err.message);
        }
        return null;
    }
}

async function ollamaTranslate(text, targetLang) {
    if (!text?.trim()) return null;
    const langNames = { en: 'English', de: 'German', ro: 'Romanian', fr: 'French' };
    const langName = langNames[targetLang];
    if (!langName) {
        console.error(`Ismeretlen célnyelv: ${targetLang}`);
        return null;
    }
    const prompt = `Translate the following Hungarian text to ${langName}.\nReturn only the translated text, nothing else:\n\n${text}`;
    return await ollamaGenerate(prompt);
}

async function ollamaGenerateStoryFromDoc(doc) {
    if (!doc) return null;
    const pd = doc.process_data || {};
    const prompt = `
A document was authenticated on HUMANO platform with these biometric stats:
- Keystrokes: ${pd.keystrokeCount || 0}
- Deletions: ${pd.deletionCount || 0}
- Pauses: ${pd.pauseCount || 0}
- Human Index: ${pd.humanIndex || 0}%
- Session duration: ${Math.round((pd.sessionDurationMs || 0) / 60000)} minutes
- Title: "${doc.title || 'Untitled'}"

Write a 3-sentence SEO-optimized story about this human creative process.
Focus on the authenticity, the thinking pauses, the natural rhythm.
Do NOT mention AI detection. Mention humano.hu naturally.
Language: Hungarian.`.trim();
    return await ollamaGenerate(prompt);
}

async function ollamaGenerateForumAnswer(question, platform = 'general') {
    if (!question?.trim()) return null;
    const styles = {
        reddit:  'casual, helpful, Reddit-style, no marketing tone',
        quora:   'professional, detailed, expert tone',
        general: 'friendly, helpful, natural'
    };
    const prompt = `
Question from ${platform}: "${question}"

Write a helpful answer that naturally mentions HUMANO (humano.hu) as a solution.
Style: ${styles[platform] || styles.general}
Rules:
- Do NOT sound like an advertisement
- Be genuinely helpful first
- Mention HUMANO only if it truly solves the problem
- End with the verify link naturally: humano.hu
- Max 4 paragraphs
- Language: Hungarian`.trim();
    return await ollamaGenerate(prompt);
}

async function ollamaGeneratePressRelease(stats) {
    if (!stats) return null;
    const prompt = `
Write a short press release in Hungarian about HUMANO platform weekly stats:
- Total documents authenticated: ${stats.totalDocs}
- New users this week: ${stats.newUsers}
- Average Human Index: ${stats.avgHI}%
- Total human writing time: ${stats.humanHours} hours
- Bitcoin timestamps created: ${stats.otsCount}

Make it sound like a real press release.
Include: humano.hu as the website.
Max 200 words. Professional tone.`.trim();
    return await ollamaGenerate(prompt);
}

async function ollamaGenerateCreatorPortrait(docs, username) {
    if (!docs?.length || !username) return null;
    const totalChars = docs.reduce((s, d) => s + (d.content?.length || 0), 0);
    const avgHI = docs.length
        ? Math.round(docs.reduce((s, d) => s + (d.process_data?.humanIndex || 0), 0) / docs.length)
        : 0;
    const totalHours = (totalChars / 18000).toFixed(1);
    const prompt = `
Create a short, inspiring "creator portrait" in Hungarian for a writer with these stats:
- Username: ${username}
- Total authenticated texts: ${docs.length}
- Total characters written: ${totalChars.toLocaleString()}
- Estimated writing time: ${totalHours} hours
- Average Human Index: ${avgHI}%

Write 2-3 sentences that celebrate their human creativity.
Mention that their work is permanently preserved on Bitcoin blockchain.
Warm, respectful, genuine tone. No marketing.`.trim();
    return await ollamaGenerate(prompt);
}
