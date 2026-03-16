const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    const db = createClient(
        process.env.SUPA_URL,
        process.env.SUPA_ANON
    );

    const { data: docs } = await db
        .from('documents')
        .select('doc_id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(1000);

    const { data: stories } = await db
        .from('story_pages')
        .select('doc_id, created_at')
        .eq('published', true)
        .limit(1000);

    const baseUrl = 'https://humano-hu.vercel.app';

    const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' }
    ];

    const docUrls = (docs || []).map(d => ({
        url: `/verify/${d.doc_id}`,
        lastmod: d.created_at?.split('T')[0],
        priority: '0.6',
        changefreq: 'never'
    }));

    const storyUrls = (stories || []).map(s => ({
        url: `/story/${s.doc_id}`,
        lastmod: s.created_at?.split('T')[0],
        priority: '0.8',
        changefreq: 'never'
    }));

    const allPages = [...staticPages, ...docUrls, ...storyUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
};
