# Spotify Playlist Organizer

Turn an existing Spotify playlist into smaller private playlists grouped by primary artist, artist genre, or one selected artist. Built with Next.js, React, NextAuth, and the Spotify Web API.

## How it works

Sign in with Spotify, choose an owned playlist, and select a grouping rule. The server reads its tracks, builds groups, creates private playlists, and adds the grouped tracks. The split operation leaves the source playlist intact.

- Track reads follow pagination in batches of 100.
- Genre grouping fetches artist metadata in batches of 50 and uses the primary artist's first returned genre, falling back to `Unknown`.
- Track additions are sent in batches of 100.
- The dashboard also includes an unfollow action, labelled as deletion in the interface.

Grouping is deterministic and metadata-based. Genre quality depends on the metadata returned by Spotify.

## Local setup

The application uses Next.js 15 and React 19. Use a compatible Node.js installation and npm.

```sh
git clone https://github.com/shivdevwalia/spotify-playlist-organizer.git
cd spotify-playlist-organizer
npm ci
```

Create a private `.env.local`:

```dotenv
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=
```

Register `http://127.0.0.1:3000/api/auth/callback/spotify` as the callback for local development. Spotify requires an explicit loopback address rather than `localhost`; see [redirect requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri). Keep credentials out of Git.

```sh
npm run dev -- --hostname 127.0.0.1
```

Open the configured local origin and sign in. Splitting writes new playlists to the connected account; use a small test playlist for a first run.

## Code map

| Area | Source |
| --- | --- |
| OAuth scopes and session callbacks | [NextAuth route](src/app/api/auth/[...nextauth]/route.js) |
| Selection and grouping controls | [Dashboard](src/app/dashboard/page.js) |
| Pagination, grouping, and playlist creation | [Grouping route](src/app/api/playlist-grouped/route.js) |
| Track listing | [Playlist page](src/app/playlist/[id]/page.js) |

## Current limits

The dashboard playlist list and artist selector read only their first API response page, although the split route paginates source tracks. Access-token refresh, rate-limit retries, comprehensive upstream response validation, and recovery from partially completed splits are not implemented. The grouping route accepts an access token from the request body rather than deriving it from a server-verified session. Unavailable tracks need more defensive handling.

The implementation also predates Spotify's [February 2026 development-mode changes](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide). Its playlist paths, response assumptions, and batched artist lookup need compatibility review for the application's access mode before presenting it as a working demo.

No automated tests are included. `npm run build` invokes the production build; the existing lint script needs compatibility review. These commands were not run as part of the documentation review.
