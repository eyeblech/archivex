"use client";
import { useState, useEffect, useCallback } from "react";
import { ArchiveItem } from "@/types";
import { fetchUploads } from "@/lib/archive";
import Navbar from "@/components/ui/Navbar";
import MovieGrid from "@/components/ui/MovieGrid";

const ROWS = 24;

export default function HomePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetchUploads(q, p, ROWS);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(query, page); }, [query, page, load]);

  const handleSearch = useCallback((q: string) => { setQuery(q); setPage(1); }, []);
  const totalPages = Math.ceil(total / ROWS);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar onSearch={handleSearch} initialQuery={query} />
      <div style={{ height: 64 }} />

      {/* Hero */}
      <div style={{ padding: "48px 24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--accent)", textTransform: "uppercase" }}>
            Cinema Vault
          </span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 96px)", letterSpacing: 4, lineHeight: 1, color: "var(--text)" }}>
          MY <span style={{ color: "var(--accent)", WebkitTextStroke: "2px var(--accent)", WebkitTextFillColor: "transparent" }}>ARCHIVE</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12, fontWeight: 300 }}>
          {loading ? "Loading collection..." : `${total.toLocaleString()} films in the vault`}
        </p>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 80px" }}>
        {query && !loading && (
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              Results for <span style={{ color: "var(--text)", fontWeight: 600 }}>"{query}"</span>
            </span>
            <button onClick={() => handleSearch("")}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear
            </button>
          </div>
        )}
        <MovieGrid items={items} loading={loading} />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 64 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "10px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, transition: "all 0.2s", fontFamily: "inherit" }}>
              Prev
            </button>
            <span style={{ color: "var(--muted)", fontSize: 13, minWidth: 100, textAlign: "center" }}>
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "10px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, transition: "all 0.2s", fontFamily: "inherit" }}>
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
