"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

interface NavbarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export default function Navbar({ onSearch, initialQuery = "" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "all 0.4s ease",
      background: scrolled ? "rgba(8,8,8,0.97)" : "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid #1a1a1a" : "none",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64, gap: 32 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, color: "var(--accent)", lineHeight: 1 }}>
            ARCHIVE<span style={{ color: "var(--text)" }}>X</span>
          </span>
        </Link>
        <div style={{ flex: 1, maxWidth: 420 }}>
          {onSearch && <SearchBar onSearch={onSearch} initialValue={initialQuery} />}
        </div>
        <a href="https://archive.org/details/@999x" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", transition: "color 0.2s", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          Archive.org
        </a>
      </div>
    </nav>
  );
}
