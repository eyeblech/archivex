"use client";
import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    const t = setTimeout(() => onSearch(value), 400);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  return (
    <div style={{ position: "relative" }}>
      <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search titles..."
        style={{
          width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "8px 36px", fontSize: 14, color: "var(--text)",
          outline: "none", transition: "all 0.2s", fontFamily: "inherit",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      />
      {value && (
        <button onClick={() => setValue("")}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}>
          x
        </button>
      )}
    </div>
  );
}
