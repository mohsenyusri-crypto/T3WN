# .well-known files

- **assetlinks.json** – Android App Links (no changes needed).
- **apple-app-site-association** – iOS Universal Links.

## Cloudflare

The project includes `_headers` and `_redirects` in `public/` so that on Cloudflare Pages:
- `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` are served with `Content-Type: application/json`.
- Requests to `/.well-known/*` are proxied (200) from `well-known/*`, so Android and iOS verification works even if the deployment skips dot-prefixed paths.

After deploy, check: `https://t3wn.albakri.technology/.well-known/assetlinks.json` should return JSON, not HTML.

## iOS: set your Apple Team ID

Before Universal Links work on iOS, replace `YOUR_APPLE_TEAM_ID` in `apple-app-site-association` with your 10-character Apple Team ID.

1. Open [Apple Developer → Membership](https://developer.apple.com/account#MembershipDetailsCard).
2. Copy your **Team ID**.
3. In `apple-app-site-association`, change:
   - `"appID": "YOUR_APPLE_TEAM_ID.com.mohsenyusrialbakri.t3wnios"`
   - to e.g. `"appID": "ABCDE12345.com.mohsenyusrialbakri.t3wnios"` (your real Team ID).

If the site is served under a path (e.g. `https://example.github.io/T3WN/`), the `paths` in the file must include that prefix (e.g. `/T3WN/arb/product/*`).
