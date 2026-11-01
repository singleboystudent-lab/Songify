# Songify

Tamil songs, endless. Search any song, real covers, trending Tamil music, and an auto queue that keeps the same feel. Phone and desktop (installable PWA), light and dark theme. Free and open source (MIT).

Songs play through the official YouTube player. Songify does not download, host or rip audio.

## Folder

- `index.html`: the whole app (no build step)
- `assets/logo.png`: your sticker logo (header). `assets/wordmark.png`: SONGIFY lettering with no background
- `assets/favicon*.png`, `icon-*.png`, `apple-touch-icon.png`: browser tab and install icons (full SONGIFY wordmark)
- `firebase-config.js`: paste your Firebase keys here to switch on login
- `api/search.js`, `api/trending.js`, `lib/yt.js`: backend (Vercel serverless functions)

## Deploy (free)

1. Google Cloud: enable *YouTube Data API v3*, create an API key, restrict it to that API.
2. Upload this folder's contents to a GitHub repo.
3. vercel.com: Add New Project, import the repo, add Environment Variable `YOUTUBE_API_KEY`, Deploy.
4. Open the Vercel URL. Phone: Add to Home Screen. Desktop: install icon in the address bar.

Never put the API key in code or chat. If a key leaks, delete it in Google Cloud and put a new one in Vercel (Settings, Environment Variables, then Redeploy).

## Run locally

```
npm i -g vercel
echo YOUTUBE_API_KEY=your_key > .env
vercel dev
```

## Quota

Default 10,000 units/day. A search costs 100, trending costs 1. Responses are cached on Vercel's CDN (search 6 h, trending 1 h) so the same query costs quota once for everyone.

## Design

Lava-orange gradient, cracked-stone texture, black outlines and sticker-style cards, taken from the logo. Colors and texture are CSS variables at the top of `index.html` (`--l1`, `--l2`, `--l3`, `--lava`, `--cracks`).

## YouTube rules

Keep the player visible, no downloads, keep the "Videos play via YouTube" note. On phones the video shows in the full-screen player. Review the current YouTube Developer Policies before a public launch.

## Login (Google and mobile number)

The Sign in button, login window, profile menu, Switch account and Sign out are already in the app. They start working once you add Firebase keys:

1. console.firebase.google.com, Add project, choose your existing Google Cloud project `songify` (or make a new one).
2. Build, Authentication, Get started. Under Sign-in method turn on **Google** and **Phone**.
3. Authentication, Settings, Authorized domains: add your Vercel domain (for example `songify-xxxx.vercel.app`).
4. Project settings, Your apps, add a **Web app**. Copy the config object into `firebase-config.js` (it is safe to publish).
5. Commit to GitHub. Vercel redeploys.

Phone OTP: Firebase gives a small free SMS quota, beyond that you need to enable billing. While testing, add test phone numbers in Authentication, Sign-in method, Phone.

Likes and recent songs are saved per account on each device. Syncing across devices needs Firestore, which is the next step.

## Next

Cloud sync of likes and playlists (Firestore), playlists, Play Store packaging with Capacitor.
