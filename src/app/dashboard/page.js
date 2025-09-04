"use client";
import { Autocomplete, TextField } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [playlists, setPlaylists] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loadingSplit, setLoadingSplit] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [splitBy, setSplitBy] = useState("artist");
  const [singleArtist, setSingleArtist] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserPlaylists(session.accessToken);
    }
  }, [status, session]);

  async function handleDeletePlaylist(playlistId) {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (res.ok) {
        alert("Playlist deleted successfully!");
        fetchUserPlaylists(session.accessToken); // refresh playlists
      } else {
        const data = await res.json();
        alert(data.error?.message || "Failed to delete playlist.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting the playlist.");
    }
  }

  async function fetchUserPlaylists(token) {
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();
    const userId = userData.id;

    const res = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const myPlaylists = (data.items || []).filter(
      (playlist) => playlist.owner.id === userId
    );

    setPlaylists(myPlaylists);
  }

  async function openSplitModal(playlist) {
    setSelectedPlaylist(playlist);
    setError(null);

    // Fetch playlist tracks to get first artists
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );
    const data = await res.json();
    const tracks = data.items.map((item) => item.track).filter(Boolean);
    setPlaylistTracks(tracks);

    // Get unique first artists
    const firstArtists = new Set();
    tracks.forEach((track) => {
      if (track.artists && track.artists.length > 0) {
        firstArtists.add(track.artists[0].name);
      }
    });
    setArtistOptions(Array.from(firstArtists));

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
    setLoadingSplit(false);
    setError(null);
    setSplitBy("artist");
    setSingleArtist("");
  }

  async function handleSplit() {
    if (!selectedPlaylist) return;
    // if (splitBy === "singleArtist" && !singleArtist) {
    //   alert("Please select an artist");
    //   return;
    // }
    if (splitBy === "singleArtist" && singleArtist.trim() === "") {
      alert("Please select an artist");
      return;
    }

    setLoadingSplit(true);
    setError(null);

    try {
      const res = await fetch("/api/playlist-grouped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: selectedPlaylist.id,
          splitBy,
          selectedArtistName: splitBy === "singleArtist" ? singleArtist : null, // ← changed to selectedArtistName
          accessToken: session.accessToken,
          originalPlaylistName: selectedPlaylist.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        alert(`Created ${data.createdPlaylists.length} new playlists!`);
        fetchUserPlaylists(session.accessToken);
        closeModal();
      }
    } catch (e) {
      setError("Failed to split playlist. Try again.");
      setLoadingSplit(false);
    }
  }

  if (status === "loading") return <p style={{ color: "#fff" }}>Loading...</p>;
  if (status === "unauthenticated")
    return <p style={{ color: "#fff" }}>Please login to continue.</p>;

  return (
    <>
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
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{ fontWeight: "bold", fontSize: 28, letterSpacing: "0.1em" }}
          >
            Your Spotify Playlists
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              backgroundColor: "#1DB954",
              border: "none",
              borderRadius: 20,
              color: "#121212",
              fontWeight: "bold",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </header>

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderRadius: 8,
                padding: 12,
                backgroundColor: "#181818",
              }}
            >
              <Link
                href={`/playlist/${playlist.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textDecoration: "none",
                  color: "inherit",
                  flexGrow: 1,
                }}
              >
                <img
                  src={playlist.images[0]?.url || "/playlist-placeholder.png"}
                  alt={playlist.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
                <div>
                  <h3>{playlist.name}</h3>
                  <p style={{ fontSize: 14, color: "#b3b3b3" }}>
                    {playlist.owner.display_name}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => openSplitModal(playlist)}
                style={{
                  backgroundColor: "#1DB954",
                  border: "none",
                  borderRadius: 6,
                  color: "#121212",
                  fontWeight: "bold",
                  padding: "8px 14px",
                }}
              >
                Organize
              </button>
              <button
                onClick={() => handleDeletePlaylist(playlist.id)}
                style={{
                  backgroundColor: "tomato",
                  border: "none",
                  borderRadius: 6,
                  color: "white",
                  fontWeight: "bold",
                  padding: "8px 14px",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </section>
      </main>

      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#181818",
              padding: 24,
              borderRadius: 12,
              width: 340,
              color: "white",
            }}
          >
            <h2 style={{ marginBottom: 20 }}>Split Playlist</h2>
            {error && <p style={{ color: "tomato" }}>{error}</p>}

            <div style={{ marginBottom: 12 }}>
              <label>
                <input
                  type="radio"
                  value="artist"
                  checked={splitBy === "artist"}
                  onChange={(e) => setSplitBy(e.target.value)}
                />{" "}
                By First Artist
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                <input
                  type="radio"
                  value="genre"
                  checked={splitBy === "genre"}
                  onChange={(e) => setSplitBy(e.target.value)}
                />{" "}
                By First Artist's Genre
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                <input
                  type="radio"
                  value="singleArtist"
                  checked={splitBy === "singleArtist"}
                  onChange={(e) => setSplitBy(e.target.value)}
                />{" "}
                Extract Single Artist
              </label>
            </div>

            {/* {splitBy === "singleArtist" && (
              <Autocomplete
                options={artistOptions} // array of artist names
                value={singleArtist || null}
                onChange={(event, newValue) => {
                  setSingleArtist(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select an artist"
                    variant="outlined"
                    size="small"
                  />
                )}
                sx={{ marginBottom: 2 }}
              />
            )} */}
            {splitBy === "singleArtist" && (
              <Autocomplete
                options={artistOptions}
                value={singleArtist || ""} // ensure non-null value
                onChange={(event, newValue) => {
                  setSingleArtist(newValue || ""); // always store a string
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select an artist"
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1,
                      input: { color: "#121212" }, // text color
                      label: { color: "#121212" }, // label color
                    }}
                    InputLabelProps={{
                      style: { color: "#121212" },
                    }}
                  />
                )}
                sx={{ marginBottom: 2 }}
              />
            )}

            <button
              onClick={handleSplit}
              style={{
                width: "100%",
                padding: "10px 0",
                backgroundColor: "#1DB954",
                border: "none",
                borderRadius: 6,
                color: "#121212",
                fontWeight: "bold",
              }}
            >
              Confirm
            </button>

            <button
              onClick={closeModal}
              style={{
                marginTop: 12,
                backgroundColor: "transparent",
                border: "none",
                color: "#bbb",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
