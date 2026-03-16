module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send('<?xml version="1.0"?><urlset></urlset>');
};
