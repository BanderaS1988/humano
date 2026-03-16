// ============================================================
// HUMANO – api/verify/[docId].js
// ============================================================

const { createClient } = require('@supabase/supabase-js');

let _db = null;
function getDb() {
    if (_db) return _db;
    const url  = process.env.SUPA_URL;
    const anon = process.env.SUPA_ANON;
    if (!url || !anon) {
        throw new Error('Hiányzó env változók: SUPA_URL és/vagy SUPA_ANON');
    }
    _db = createClient(url, anon);
    return _db;
}

function getTrustLevel(humanIndex) {
    if (humanIndex >= 90) return { level: 'platinum', label: 'Platinum – Exceptional Human Authorship' };
    if (humanIndex >= 70) return { level: 'gold',     label: 'Gold – Strong Human Authorship' };
    if (humanIndex >= 50) return { level: 'silver',   label: 'Silver – Human Authorship Detected' };
    return                       { level: 'bronze',   label: 'Bronze – Basic Human Authorship' };
}

module.exports = async function handler(req, res) {
    const { docId } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    if (!docId) {
        return res.status(400).json({ error: 'Missing docId' });
    }

    let db;
    try {
        db = getDb();
    } catch (err) {
        console.error('DB init hiba:', err.message);
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const { data: doc, error } = await db
        .from('documents')
        .select('doc_id, title, hash, created_at, ots_receipt, ots_pending, process_data, author_name')
        .eq('doc_id', docId.toUpperCase())
        .single();

    if (error || !doc) {
        return res.status(404).json({ error: 'Document not found' });
    }

    const pd = doc.process_data || {};

    const createdDate = new Date(doc.created_at);
    const yearStr  = createdDate.getUTCFullYear();
    const mlaDate  = createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    const author   = doc.author_name || 'Anonymous';
    const title    = doc.title || 'Untitled';
    const verifyUrl = `https://humano.hu/verify/${doc.doc_id}`;

    return res.status(200).json({
        humano_verification: {
            doc_id:      doc.doc_id,
            title,
            author,
            created_at:  doc.created_at,
            sha256_hash: doc.hash,
            verify_url:  verifyUrl,
            story_url:   `https://humano.hu/story/${doc.doc_id}`,
            blockchain: {
                protocol:  'OpenTimestamps',
                network:   'Bitcoin',
                confirmed: !!doc.ots_receipt,
                pending:   !!doc.ots_pending,
            },
            biometrics: {
                keystroke_count:     pd.keystrokeCount    || 0,
                deletion_count:      pd.deletionCount     || 0,
                pause_count:         pd.pauseCount        || 0,
                focus_switches:      pd.focusSwitches     || 0,
                human_index_pct:     pd.humanIndex        || 0,
                human_category:      pd.humanCategory     || null,
                rhythm_entropy_pct:  pd.entropyPct        || 0,
                typed_pct:           pd.typedPct          ?? 100,
                pasted_pct:          pd.pastedPct         || 0,
                session_duration_ms: pd.sessionDurationMs || 0,
                rhythm_mean_ms:      pd.rhythmMeanMs      || 0,
                rhythm_stddev_ms:    pd.rhythmStddevMs    || 0,
            },
            trust_level: getTrustLevel(pd.humanIndex || 0),
            citation_format: {
                apa: `${author}. (${yearStr}). ${title}. HUMANO. ${verifyUrl}`,
                mla: `${author}. "${title}." HUMANO, ${mlaDate}. ${verifyUrl}.`,
            }
        }
    });
};
