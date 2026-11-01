const { yt, song, fail, onlyPlayable } = require('../lib/yt');

module.exports = async (req, res) => {
  try {
    let q = String(req.query.q || '').trim().toLowerCase().slice(0, 80);
    if (q.length < 2) return res.status(400).json({ error: 'Type at least 2 characters' });
    if (!/tamil/.test(q)) q += ' tamil song';
    const j = await yt('/search', {
      part: 'snippet', type: 'video', videoCategoryId: '10',
      videoEmbeddable: 'true', videoSyndicated: 'true',
      regionCode: 'IN', relevanceLanguage: 'ta', safeSearch: 'moderate',
      maxResults: '25', q
    });
    const found = (j.items || []).filter(i => i.id && i.id.videoId);
    const ok = await onlyPlayable(found.map(i => i.id.videoId));   // drop videos that cannot be embedded here
    const items = found.filter(i => ok.has(i.id.videoId)).map(i => song(i.id.videoId, i.snippet)).slice(0, 20);
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({ items });
  } catch (e) { fail(res, e); }
};
