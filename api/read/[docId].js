const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    const { docId } = req.query;
    const db = createClient(
        process.env.SUPA_URL,
        process.env.SUPA_ANON
    );

    const { data: doc } = await db
        .from('documents')
        .select('doc_id, title, author_name, content, process_data, published_url')
        .eq('doc_id', docId?.toUpperCase())
        .eq('is_published', true)
        .single();

    if (!doc) {
        res.status(404).send('Nem található');
        return;
    }

    const pd      = doc.process_data || {};
    const title   = doc.title || 'HUMANO Publikáció';
    const author  = doc.author_name || 'Névtelen';
    const hi      = pd.humanIndex || 0;
    const preview = (doc.content || '').replace(/<[^>]+>/g, '').substring(0, 200) + '…';
    const url     = `https://humano-hu.vercel.app/read/${doc.doc_id}`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8"/>
  <title>${title} – HUMANO</title>
  <meta name="description" content="${preview}"/>
  <meta property="og:title" content="${title} – HUMANO"/>
  <meta property="og:description" content="${author} · ${hi}% Human Score · Hitelesített emberi tartalom"/>
  <meta property="og:image" content="https://humano-hu.vercel.app/og-image.png"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:type" content="article"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title} – HUMANO"/>
  <meta name="twitter:description" content="${author} · ${hi}% Human Score"/>
  <meta name="twitter:image" content="https://humano-hu.vercel.app/og-image.png"/>
  <meta http-equiv="refresh" content="0;url=${url}"/>
  <script>window.location.href='${url}'</script>
</head>
<body></body>
</html>`);
};
