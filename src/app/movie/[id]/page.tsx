"use client";

import { useState, useEffect } from "react";
import { fetchItemMetadata, getBestVideoFile, getWatchUrl, getThumbUrl, getEmbedUrl } from "@/lib/archive";
import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [meta, setMeta] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetchItemMetadata(id)
      .then(data => { setMeta(data.metadata); setFiles(data.files); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--muted)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <p>Loading...</p>
      </div>
    </div>
  );

  if (error || !meta) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 24, marginBottom: 16, color: "var(--text)" }}>Could not load this item</p>
        <Link href="/" style={{ color: "var(--accent)" }}>Back to collection</Link>
      </div>
    </div>
  );

  const videoUrl = getBestVideoFile(files, id) ?? "";
  const subtitles = files
    .filter(f => f.name.endsWith(".srt") || f.name.endsWith(".vtt"))
    .map(f => ({
      name: f.name,
      url: `https://archive.org/download/${id}/${encodeURIComponent(f.name)}`,
      label: f.name.replace(/\.(srt|vtt)$/i, "").replace(/_/g, " "),
    }));

  const subjects = Array.isArray(meta.subject) ? meta.subject : meta.subject ? [meta.subject] : [];
  const year = meta.date ? new Date(meta.date).getFullYear() : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <style>{`
        .back-link { color: var(--muted); text-decoration: none; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .back-link:hover { color: var(--text); }
        .action-btn { display: block; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; text-align: center; transition: all 0.2s; font-family: inherit; cursor: pointer; }
        .action-btn-secondary { background: var(--surface); border: 1px solid var(--border); color: var(--text); }
        .action-btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
        .action-btn-primary { background: rgba(229,0,0,0.1); border: 1px solid rgba(229,0,0,0.3); color: var(--accent); }
        .action-btn-primary:hover { background: rgba(229,0,0,0.2); }
      `}</style>

      <div style={{ padding: "20px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" className="back-link">← Back to collection</Link>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 80px" }}>
        <VideoPlayer
          videoUrl={videoUrl}
          embedUrl={getEmbedUrl(id)}
          poster={getThumbUrl(id)}
          title={meta.title}
          subtitles={subtitles}
        />

        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,48px)", letterSpacing: 2, lineHeight: 1.1, marginBottom: 12 }}>
              {meta.title}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
              {year && <span style={{ color: "var(--muted)", fontSize: 13 }}>{year}</span>}
              {meta.creator && meta.creator !== "Anonymous" && (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>by {meta.creator}</span>
              )}
              {subjects.slice(0, 4).map((s: string) => (
                <span key={s} style={{ fontSize: 11, background: "var(--surface2)", color: "var(--muted)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>{s}</span>
              ))}
              {subtitles.length > 0 && (
                <span style={{ fontSize: 11, background: "rgba(229,0,0,0.1)", color: "var(--accent)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(229,0,0,0.3)" }}>
                  {subtitles.length} subtitle{subtitles.length > 1 ? "s" : ""} available
                </span>
              )}
            </div>
            {meta.description && (
              <p style={{ color: "rgba(240,240,240,0.65)", lineHeight: 1.7, fontSize: 14, maxWidth: 680 }}>
                {String(meta.description).slice(0, 600)}{String(meta.description).length > 600 ? "..." : ""}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 160 }}>
            <a href={getWatchUrl(id)} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-secondary">
              View on Archive.org
            </a>
            <a href={`https://archive.org/download/${id}`} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-primary">
              Download Files
            </a>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Keyboard Shortcuts</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {[
              ["Space / K", "Play / Pause"],
              ["← / →", "Seek -10s / +10s"],
              ["↑ / ↓", "Volume up / down"],
              ["M", "Mute toggle"],
              ["F", "Fullscreen"],
              ["< / >", "Speed down / up"],
              ["0–9", "Jump to 0%–90%"],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <kbd style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 7px", fontSize: 11, color: "var(--text)", fontFamily: "monospace", flexShrink: 0 }}>{key}</kbd>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
