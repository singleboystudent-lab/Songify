const BASE = 'https://www.googleapis.com/youtube/v3';
const dec = s => String(s || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function yt(path, params) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) { const e = new Error('Server is missing YOUTUBE_API_KEY'); e.status = 500; throw e; }
  const url = new URL(BASE + path);
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) {
    const e = new Error((j.error && j.error.message) || 'YouTube API error');
    e.status = r.status === 403 ? 429 : 502;
    throw e;
  }
  return j;
}

const song = (id, sn) => ({
  id,
  title: dec(sn.title),
  artist: dec(sn.channelTitle).replace(/ - Topic$/, ''),
  thumb: ((sn.thumbnails && (sn.thumbnails.high || sn.thumbnails.medium || sn.thumbnails.default)) || {}).url || ''
});

// A video is playable in Songify only if the owner allows embedding, it is public and it is not blocked in India.
const playable = v => {
  const rr = v.contentDetails && v.contentDetails.regionRestriction;
  const blocked = rr && ((rr.blocked || []).includes('IN') || (rr.allowed && !rr.allowed.includes('IN')));
  return !!(v.status && v.status.embeddable && v.status.privacyStatus === 'public' && !blocked);
};

// 1 quota unit for up to 50 ids.
async function onlyPlayable(ids) {
  if (!ids.length) return new Set();
  const j = await yt('/videos', { part: 'status,contentDetails', id: ids.join(','), maxResults: '50' });
  return new Set((j.items || []).filter(playable).map(v => v.id));
}

const fail = (res, e) => res.status(e.status || 500).json({ error: e.message });

module.exports = { yt, song, fail, playable, onlyPlayable };
