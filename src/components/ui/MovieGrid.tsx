import { ArchiveItem } from "@/types";
import MovieCard from "./MovieCard";

function Skeleton() {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div style={{ aspectRatio: "16/9", background: "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 12, background: "#1a1a1a", borderRadius: 4, width: "80%" }} />
        <div style={{ height: 12, background: "#1a1a1a", borderRadius: 4, width: "50%" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

interface MovieGridProps { items: ArchiveItem[]; loading?: boolean; }

export default function MovieGrid({ items, loading = false }: MovieGridProps) {
  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 0", gap: 16 }}>
        <span style={{ fontSize: 56 }}>🎬</span>
        <p style={{ color: "var(--text)", fontSize: 18, fontWeight: 600 }}>No results found</p>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Try a different search term</p>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {items.map(item => <MovieCard key={item.identifier} item={item} />)}
    </div>
  );
}
