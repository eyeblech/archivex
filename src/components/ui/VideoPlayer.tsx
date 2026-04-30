"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface SubtitleTrack { name: string; url: string; label: string; }
interface PlayerProps {
  videoUrl: string | null;
  embedUrl: string;
  poster: string;
  title: string;
  subtitles: SubtitleTrack[];
}

function fmtTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${m}:${String(sec).padStart(2,"0")}`;
}

export default function VideoPlayer({ videoUrl, embedUrl, poster, title, subtitles }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSeekingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [shortcutMsg, setShortcutMsg] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const flash = (msg: string) => {
    setShortcutMsg(msg);
    if (shortcutTimer.current) clearTimeout(shortcutTimer.current);
    shortcutTimer.current = setTimeout(() => setShortcutMsg(""), 700);
  };

  const showCtrl = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || videoError) return;
    if (v.paused) {
      v.play().then(() => flash("▶")).catch(() => {});
    } else {
      v.pause();
      flash("⏸");
    }
  }, [videoError]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => { if (!isSeekingRef.current) setCurrentTime(v.currentTime); };
    const onDur = () => { if (isFinite(v.duration)) setDuration(v.duration); };
    const onPlay = () => setPlaying(true);
    const onPause = () => { setPlaying(false); setShowControls(true); };
    const onProgress = () => {
      if (v.buffered.length > 0 && isFinite(v.duration) && v.duration > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    const onCanPlay = () => setLoaded(true);
    const onError = () => { setVideoError(true); setLoaded(true); };
    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("durationchange", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("progress", onProgress);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("durationchange", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v || videoError) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); flash("+10s"); break;
        case "ArrowLeft": e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); flash("-10s"); break;
        case "ArrowUp": e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); flash(`Vol ${Math.round(v.volume*100)}%`); break;
        case "ArrowDown": e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); flash(`Vol ${Math.round(v.volume*100)}%`); break;
        case "m": v.muted = !v.muted; setMuted(v.muted); flash(v.muted ? "🔇 Muted" : "🔊 Unmuted"); break;
        case "f":
          if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
          else document.exitFullscreen();
          break;
        case ">": { const s = Math.min(2, speed + 0.25); v.playbackRate = s; setSpeed(s); flash(`${s}x`); break; }
        case "<": { const s = Math.max(0.25, speed - 0.25); v.playbackRate = s; setSpeed(s); flash(`${s}x`); break; }
        default:
          if ("0123456789".includes(e.key) && isFinite(v.duration) && v.duration > 0) {
            v.currentTime = (parseInt(e.key) / 10) * v.duration;
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speed, videoError, togglePlay]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !isFinite(duration) || duration === 0) return;
    const rect = progressRef.current!.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  const setVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; }
    setMuted(val === 0);
  };

  const setPlaySpeed = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const applySub = (url: string | null) => {
    setActiveSub(url);
    setShowSubMenu(false);
    const v = videoRef.current;
    if (!v) return;
    Array.from(v.textTracks).forEach(t => { t.mode = t.id === url ? "showing" : "disabled"; });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // No direct video URL or video errored → use embed
  const useEmbed = !videoUrl || videoError;

  const btn: React.CSSProperties = {
    background: "none", border: "none", color: "white", cursor: "pointer",
    padding: "6px 8px", borderRadius: 6, display: "flex", alignItems: "center",
    justifyContent: "center", transition: "background 0.15s", flexShrink: 0,
  };

  return (
    <div ref={containerRef}
      onMouseMove={showCtrl}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
      style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>

      {useEmbed ? (
        <iframe
          src={embedUrl}
          allowFullScreen
          title={title}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            poster={poster}
            onClick={togglePlay}
            preload="metadata"
            style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", cursor: "pointer" }}
          >
            <source src={videoUrl} />
            {activeSub && subtitles.filter(s => s.url === activeSub).map(s => (
              <track key={s.url} kind="subtitles" src={s.url} label={s.label} default />
            ))}
          </video>

          {/* Shortcut flash */}
          {shortcutMsg && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(0,0,0,0.75)", color: "white", padding: "10px 22px", borderRadius: 10, fontSize: 20, fontWeight: 700, pointerEvents: "none", backdropFilter: "blur(4px)", zIndex: 10 }}>
              {shortcutMsg}
            </div>
          )}

          {/* Controls */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end",
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
            opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
            pointerEvents: showControls ? "all" : "none", zIndex: 5,
          }}>
            {/* Title */}
            <div style={{ padding: "0 16px 6px", fontSize: 12, color: "rgba(255,255,255,0.6)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {title}
            </div>

            {/* Progress */}
            <div ref={progressRef} onClick={seek}
              style={{ height: 4, background: "rgba(255,255,255,0.15)", margin: "0 16px 10px", borderRadius: 2, cursor: "pointer", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${buffered}%`, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2 }}>
                <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", boxShadow: "0 0 8px rgba(229,0,0,0.9)" }} />
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 8px 10px", gap: 2 }}>
              {/* Play/Pause */}
              <button onClick={togglePlay} style={btn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                {playing
                  ? <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* -10s */}
              <button onClick={() => { const v = videoRef.current; if(v) v.currentTime = Math.max(0, v.currentTime - 10); flash("-10s"); }} style={btn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"} title="-10s">
                <svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12.5 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V7l-4-4 4-4v3.05c.17.01.33.04.5.05z"/><text x="7.5" y="15.5" fontSize="6" fill="white" fontWeight="bold" textAnchor="middle">10</text></svg>
              </button>

              {/* +10s */}
              <button onClick={() => { const v = videoRef.current; if(v && isFinite(v.duration)) v.currentTime = Math.min(v.duration, v.currentTime + 10); flash("+10s"); }} style={btn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"} title="+10s">
                <svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M11.5 3a9 9 0 1 1-9 9h2a7 7 0 1 0 7-7V7l4-4-4-4v3.05c-.17.01-.33.04-.5.05z"/><text x="16.5" y="15.5" fontSize="6" fill="white" fontWeight="bold" textAnchor="middle">10</text></svg>
              </button>

              {/* Mute */}
              <button onClick={() => { const v = videoRef.current; if(!v) return; v.muted = !v.muted; setMuted(v.muted); }} style={btn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                {muted || volume === 0
                  ? <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>
                  : <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                }
              </button>

              {/* Volume slider */}
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={setVol}
                style={{ width: 65, accentColor: "var(--accent)", cursor: "pointer" }} />

              {/* Time */}
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginLeft: 6, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {fmtTime(currentTime)} / {fmtTime(duration)}
              </span>

              <div style={{ flex: 1 }} />

              {/* Speed */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowSpeedMenu(p => !p); setShowSubMenu(false); }}
                  style={{ ...btn, fontSize: 12, fontWeight: 700, minWidth: 38 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  {speed}x
                </button>
                {showSpeedMenu && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "rgba(14,14,14,0.97)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", minWidth: 80, backdropFilter: "blur(12px)", zIndex: 20 }}>
                    {speeds.map(s => (
                      <button key={s} onClick={() => setPlaySpeed(s)}
                        style={{ display: "block", width: "100%", padding: "8px 16px", background: speed === s ? "rgba(229,0,0,0.25)" : "none", border: "none", color: speed === s ? "var(--accent)" : "white", fontSize: 13, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}
                        onMouseEnter={e => { if(speed!==s) e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = speed===s ? "rgba(229,0,0,0.25)" : "none"; }}>
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitles */}
              {subtitles.length > 0 && (
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setShowSubMenu(p => !p); setShowSpeedMenu(false); }}
                    style={{ ...btn, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, border: `1px solid ${activeSub ? "var(--accent)" : "transparent"}`, color: activeSub ? "var(--accent)" : "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"} title="Subtitles">
                    CC
                  </button>
                  {showSubMenu && (
                    <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "rgba(14,14,14,0.97)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", minWidth: 170, backdropFilter: "blur(12px)", zIndex: 20 }}>
                      <button onClick={() => applySub(null)}
                        style={{ display: "block", width: "100%", padding: "9px 16px", background: !activeSub ? "rgba(229,0,0,0.25)" : "none", border: "none", color: !activeSub ? "var(--accent)" : "white", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                        Off
                      </button>
                      {subtitles.map(s => (
                        <button key={s.url} onClick={() => applySub(s.url)}
                          style={{ display: "block", width: "100%", padding: "9px 16px", background: activeSub===s.url ? "rgba(229,0,0,0.25)" : "none", border: "none", color: activeSub===s.url ? "var(--accent)" : "white", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} style={btn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"} title="Fullscreen (F)">
                {fullscreen
                  ? <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                  : <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Hint */}
          {showControls && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.4)", pointerEvents: "none", backdropFilter: "blur(4px)" }}>
              Space · F · M · ← →
            </div>
          )}
        </>
      )}
    </div>
  );
}
