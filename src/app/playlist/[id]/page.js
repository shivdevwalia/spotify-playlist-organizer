"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PlaylistPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlaylistTracks(id);
    }
  }, [status, id]);

  async function fetchPlaylistTracks(playlistId) {
    let allTracks = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      const data = await res.json();

      allTracks = allTracks.concat(data.items);

      if (offset + limit >= data.total) {
        break;
      }
      offset += limit;
    }

    setTracks(allTracks);
  }

  if (status === "loading") return <p style={{ color: "#fff" }}>Loading...</p>;

  if (status === "unauthenticated")
    return <p style={{ color: "#fff" }}>Please login to continue.</p>;

  return (
    <main
      style={{
        padding: 24,
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "white",
        fontFamily:
          "'Spotify Circular', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <button
        onClick={() => history.back()}
        style={{
          backgroundColor: "#1DB954",
          border: "none",
          borderRadius: 20,
          color: "#121212",
          fontWeight: "bold",
          padding: "10px 20px",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontWeight: "bold", fontSize: 28, marginBottom: 24 }}>
        Playlist Tracks
      </h1>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          maxHeight: 600,
          overflowY: "auto",
          borderRadius: 12,
          backgroundColor: "#181818",
          boxShadow: "0 0 10px rgba(29, 185, 84, 0.7)",
        }}
      >
        {tracks.map(({ track }, index) => (
          <li
            key={track.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderBottom: "1px solid #282828",
              gap: 16,
            }}
          >
            <img
              src={track.album.images[2]?.url || track.album.images[0]?.url}
              alt={track.name}
              style={{ width: 50, height: 50, borderRadius: 4, flexShrink: 0 }}
              loading="lazy"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={track.name}
              >
                {index + 1}. {track.name}
              </p>
              <p
                style={{
                  color: "#b3b3b3",
                  fontSize: 14,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={track.artists.map((a) => a.name).join(", ")}
              >
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#b3b3b3",
                minWidth: 40,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.floor(track.duration_ms / 60000)}:
              {Math.floor((track.duration_ms % 60000) / 1000)
                .toString()
                .padStart(2, "0")}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
