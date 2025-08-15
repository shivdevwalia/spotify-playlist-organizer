// "use client";

// import { useSession, signIn } from "next-auth/react";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "authenticated") {
//       router.push("/dashboard");
//     }
//   }, [status, router]);

//   if (status === "loading") return <p>Loading...</p>;

//   return (
//     <main style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>Spotify Playlist Organizer</h1>
//       {!session && (
//         <button
//           onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
//         >
//           Login with Spotify
//         </button>
//       )}
//     </main>
//   );
// }

"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "'Spotify Circular', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid #1DB954",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "white", fontSize: 18, fontWeight: "500" }}>
            Loading...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          "'Spotify Circular', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(29, 185, 84, 0.1) 0%, rgba(18, 18, 18, 1) 70%)",
      }}
    >
      <main style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        {/* Spotify Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#1DB954",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 8px 24px rgba(29, 185, 84, 0.3)",
          }}
        >
          <svg
            style={{ width: 48, height: 48, color: "#121212" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            marginBottom: 8,
            letterSpacing: "0.1em",
            lineHeight: 1.1,
          }}
        >
          Spotify
        </h1>
        <h2
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: "#1DB954",
            marginBottom: 24,
            letterSpacing: "0.05em",
          }}
        >
          Playlist Organizer
        </h2>

        {/* Description */}
        <p
          style={{
            color: "#b3b3b3",
            fontSize: 18,
            marginBottom: 48,
            lineHeight: 1.5,
            maxWidth: 400,
            margin: "0 auto 48px",
          }}
        >
          Organize your music, your way. Connect with Spotify to get started and
          split your playlists by artist or genre.
        </p>

        {!session && (
          <div>
            <button
              onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
              style={{
                backgroundColor: "#1DB954",
                border: "none",
                borderRadius: 50,
                color: "#121212",
                fontWeight: "bold",
                padding: "16px 48px",
                fontSize: 16,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(29, 185, 84, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "0 auto",
                minWidth: 240,
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1ed760";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(29, 185, 84, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1DB954";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(29, 185, 84, 0.3)";
              }}
            >
              <svg
                style={{ width: 20, height: 20 }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Continue with Spotify
            </button>

            <p
              style={{
                color: "#535353",
                fontSize: 12,
                marginTop: 24,
                lineHeight: 1.4,
              }}
            >
              By continuing, you agree to give us access to your Spotify account
              to organize your playlists.
            </p>
          </div>
        )}

        {/* Decorative dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 48,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                backgroundColor: "#1DB954",
                borderRadius: "50%",
                opacity: 0.6,
                animation: `pulse 2s infinite ${i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
