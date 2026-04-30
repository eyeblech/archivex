"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArchiveItem } from "@/types";
import { getThumbUrl } from "@/lib/archive";

export default function MovieCard({ item }: { item: ArchiveItem }) {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);
  const year = item.date ? new Date(item.date).getFullYear() : null;

  return (
    <Link href={`/movie/${item.identifier}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 10, overflow: "hidden", background: "var(--surface)",
          border: "1px solid var(--border)", cursor: "pointer", position: "relative",
          transform: hov ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px var(--accent)" : "0 4px 20px rgba(0,0,0,0.4)",
        }}>
        {/* Thumbnail */}
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#0d0d0d", overflow: "hidden" }}>
          {!imgErr ? (
            <Image
              src={getThumbUrl(item.identifier)}
              alt={item.title}
              fill
              loading="eager"
              style={{ objectFit: "cover", transition: "transform 0.4s ease", transform: hov ? "scale(1.08)" : "scale(1)" }}
              onError={() => setImgErr(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #111 0%, #1a0a0a 100%)" }}>
              <span style={{ fontSize: 32 }}>🎬</span>
              <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>No Preview</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)", opacity: hov ? 1 : 0, transition: "opacity 0.3s" }} />
          {/* Play button */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hov ? 1 : 0, transition: "opacity 0.3s" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(229,0,0,0.6)" }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 20 20" style={{ marginLeft: 3 }}>
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Info */}
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            {year && <span style={{ fontSize: 11, color: "var(--muted)" }}>{year}</span>}
            <span style={{ fontSize: 11, color: "var(--accent)", background: "rgba(229,0,0,0.1)", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {item.mediatype}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
