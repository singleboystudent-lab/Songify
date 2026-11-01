const { yt, song, fail, playable, onlyPlayable } = require('../lib/yt');

module.exports = async (req, res) => {
  try {
    // 1 quota unit: India's most popular music videos, Tamil only, embeddable only.
    const j = await yt('/videos', {
      part: 'snippet,status,contentDetails', chart: 'mostPopular', videoCategoryId: '10', regionCode: 'IN', maxResults: '50'
    });
    let items = (j.items || [])
      .filter(v => playable(v) && /^ta/i.test(v.snippet.defaultAudioLanguage || v.snippet.defaultLanguage || ''))
      .map(v => song(v.id, v.snippet));

    // Not enough Tamil entries in the chart: top up with recent popular Tamil songs (100 units, cached 1 hour).
    if (items.length < 10) {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const s = await yt('/search', {
        part: 'snippet', type: 'video', videoCategoryId: '10', videoEmbeddable: 'true', videoSyndicated: 'true',
        regionCode: 'IN', relevanceLanguage: 'ta', order: 'viewCount', publishedAfter: since,
        maxResults: '25', q: 'new tamil songs'
      });
      const found = (s.items || []).filter(i => i.id && i.id.videoId);
      const ok = await onlyPlayable(found.map(i => i.id.videoId));
      const seen = new Set(items.map(i => i.id));
      found.forEach(i => { if (ok.has(i.id.videoId) && !seen.has(i.id.videoId)) items.push(song(i.id.videoId, i.snippet)); });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=14400');
    res.status(200).json({ items: items.slice(0, 24) });
  } catch (e) { fail(res, e); }
};
