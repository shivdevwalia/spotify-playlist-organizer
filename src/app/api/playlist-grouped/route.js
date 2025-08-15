import { NextResponse } from "next/server";

export async function POST(request) {
  const { playlistId, splitBy, accessToken, originalPlaylistName, selectedArtistName } =
    await request.json();

  if (!playlistId || !splitBy || !accessToken || !originalPlaylistName) {
    return NextResponse.json(
      { error: "Missing required params" },
      { status: 400 }
    );
  }

  // Fetch all tracks from playlist
  async function fetchAllTracks() {
    let allTracks = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      allTracks = allTracks.concat(data.items);
      if (offset + limit >= data.total) break;
      offset += limit;
    }
    return allTracks;
  }

  // Fetch artist details for genre info
  async function fetchArtists(artistIds) {
    const chunks = [];
    const chunkSize = 50;
    for (let i = 0; i < artistIds.length; i += chunkSize) {
      chunks.push(artistIds.slice(i, i + chunkSize));
    }

    let artists = [];
    for (const chunk of chunks) {
      const res = await fetch(
        `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      artists = artists.concat(data.artists);
    }
    return artists;
  }

  // Create a new playlist
  async function createPlaylist(name) {
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    const createRes = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: `Split playlist by ${splitBy}: ${name}`,
          public: false,
        }),
      }
    );

    return await createRes.json();
  }

  // Add tracks to a playlist in chunks of 100
  async function addTracks(playlistId, uris) {
    for (let i = 0; i < uris.length; i += 100) {
      const chunk = uris.slice(i, i + 100);
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: chunk }),
      });
    }
  }

  const tracks = await fetchAllTracks();
  const groups = {};

  if (splitBy === "artist") {
    // Group by first artist name
    for (const item of tracks) {
      const track = item.track;
      const firstArtist = track.artists[0].name;
      if (!groups[firstArtist]) groups[firstArtist] = [];
      groups[firstArtist].push(track.uri);
    }
  } else if (splitBy === "genre") {
    // Get first artist IDs only
    const artistIds = Array.from(new Set(tracks.map(item => item.track.artists[0].id)));
    const artists = await fetchArtists(artistIds);

    const artistGenreMap = {};
    artists.forEach(artist => {
      // Take only the first genre, fallback "Unknown"
      artistGenreMap[artist.id] = artist.genres.length ? artist.genres[0] : "Unknown";
    });

    for (const item of tracks) {
      const track = item.track;
      const firstArtistId = track.artists[0].id;
      const genre = artistGenreMap[firstArtistId] || "Unknown";

      if (!groups[genre]) groups[genre] = [];
      groups[genre].push(track.uri);
    }
  } else if (splitBy === "singleArtist") {
    if (!selectedArtistName) {
      return NextResponse.json({ error: "No artist selected for singleArtist option" }, { status: 400 });
    }

    const filteredTracks = tracks.filter(
      item => item.track.artists[0].name === selectedArtistName
    );

    const newPlaylist = await createPlaylist(`${originalPlaylistName} (${selectedArtistName})`);
    await addTracks(newPlaylist.id, filteredTracks.map(t => t.track.uri));
    return NextResponse.json({ createdPlaylists: [newPlaylist] });
  } else {
    return NextResponse.json({ error: "Invalid splitBy value" }, { status: 400 });
  }

  // Create playlists for grouped tracks
  const createdPlaylists = [];
  for (const groupName in groups) {
    const newPlaylistName = `${originalPlaylistName} (${groupName})`;
    const newPlaylist = await createPlaylist(newPlaylistName);
    await addTracks(newPlaylist.id, groups[groupName]);
    createdPlaylists.push(newPlaylist);
  }

  return NextResponse.json({ createdPlaylists });
}
