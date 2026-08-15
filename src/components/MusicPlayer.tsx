"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Trash2, X, Search, Shuffle, Repeat, Pencil, ChevronUp, ChevronDown, ListMusic,
} from "lucide-react";
import bgm from "@/assets/bgm.mp3.asset.json";

type Track = {
  id: string;
  name: string;
  src: string;      // object URL or remote URL
  size: number;     // bytes
  format: string;   // mp3, wav, ...
  duration?: number; // seconds
  isDefault?: boolean;
};

const STORAGE_KEY = "krish.music.v1";
const POS_KEY = "krish.music.pos.v1";
const ACCEPT = ".mp3,.wav,.flac,.aac,.ogg,.m4a,audio/*";

function fmtSize(b: number) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function fmtTime(s?: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function extOf(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "audio";
}
function readDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.src = src;
    a.onloadedmetadata = () => resolve(a.duration || 0);
    a.onerror = () => resolve(0);
  });
}

type SortKey = "date" | "name" | "duration" | "size";

const DEFAULT_TRACK: Track = {
  id: "default-bgm",
  name: "Krish Sense — Theme",
  src: bgm.url,
  size: bgm.size,
  format: "mp3",
  isDefault: true,
};

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([DEFAULT_TRACK]);
  const [currentId, setCurrentId] = useState<string>(DEFAULT_TRACK.id);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [uploading, setUploading] = useState<{ name: string; pct: number }[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [needsGesture, setNeedsGesture] = useState(false);
  const orderRef = useRef<Map<string, number>>(new Map([[DEFAULT_TRACK.id, Date.now()]]));

  // Load persisted prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.volume === "number") setVolume(s.volume);
        if (typeof s.muted === "boolean") setMuted(s.muted);
        if (typeof s.loop === "boolean") setLoop(s.loop);
        if (typeof s.shuffle === "boolean") setShuffle(s.shuffle);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted, loop, shuffle }));
    } catch {}
  }, [volume, muted, loop, shuffle]);

  const currentTrack = tracks.find((t) => t.id === currentId) ?? tracks[0];

  // Audio wiring
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
  }, [volume, muted, currentId]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    a.src = currentTrack.src;
    a.load();
    if (playing) {
      a.play().catch(() => setNeedsGesture(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  // Autoplay attempt on mount
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
    a.play().then(() => { setPlaying(true); setNeedsGesture(false); }).catch(() => setNeedsGesture(true));
    const gesture = () => {
      if (a.paused) a.play().then(() => { setPlaying(true); setNeedsGesture(false); }).catch(() => {});
      window.removeEventListener("pointerdown", gesture);
      window.removeEventListener("keydown", gesture);
    };
    window.addEventListener("pointerdown", gesture);
    window.addEventListener("keydown", gesture);
    return () => {
      window.removeEventListener("pointerdown", gesture);
      window.removeEventListener("keydown", gesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playPause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().then(() => setPlaying(true)).catch(() => setNeedsGesture(true)); }
    else { a.pause(); setPlaying(false); }
  }, []);

  const goto = useCallback((id: string) => {
    setCurrentId(id);
    setPlaying(true);
  }, []);

  const nextTrack = useCallback(() => {
    if (!tracks.length) return;
    if (shuffle && tracks.length > 1) {
      let idx = Math.floor(Math.random() * tracks.length);
      if (tracks[idx].id === currentId) idx = (idx + 1) % tracks.length;
      goto(tracks[idx].id);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentId);
    const next = tracks[(idx + 1) % tracks.length];
    goto(next.id);
  }, [tracks, currentId, shuffle, goto]);

  const prevTrack = useCallback(() => {
    if (!tracks.length) return;
    const idx = tracks.findIndex((t) => t.id === currentId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    goto(prev.id);
  }, [tracks, currentId, goto]);

  const onEnded = useCallback(() => {
    if (loop && tracks.length === 1) {
      const a = audioRef.current;
      if (a) { a.currentTime = 0; a.play().catch(() => {}); }
      return;
    }
    if (tracks.length > 1) nextTrack();
    else if (loop) {
      const a = audioRef.current;
      if (a) { a.currentTime = 0; a.play().catch(() => {}); }
    } else setPlaying(false);
  }, [loop, tracks.length, nextTrack]);

  // File ingestion
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(f.name));
    if (!list.length) return;
    const progresses = list.map((f) => ({ name: f.name, pct: 0 }));
    setUploading((u) => [...u, ...progresses]);
    const newTracks: Track[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      // simulate progress smoothly for UX
      for (let p = 20; p <= 90; p += 20) {
        setUploading((u) => u.map((x) => (x.name === f.name ? { ...x, pct: p } : x)));
        await new Promise((r) => setTimeout(r, 40));
      }
      // duplicate detection by name+size
      const dup = tracks.find((t) => t.name === f.name && t.size === f.size)
        || newTracks.find((t) => t.name === f.name && t.size === f.size);
      if (dup) {
        setUploading((u) => u.filter((x) => x.name !== f.name));
        continue;
      }
      const url = URL.createObjectURL(f);
      const dur = await readDuration(url);
      const t: Track = {
        id: `${f.name}-${f.size}-${Date.now()}-${i}`,
        name: f.name.replace(/\.[^.]+$/, ""),
        src: url,
        size: f.size,
        format: extOf(f.name),
        duration: dur,
      };
      orderRef.current.set(t.id, Date.now() + i);
      newTracks.push(t);
      setUploading((u) => u.map((x) => (x.name === f.name ? { ...x, pct: 100 } : x)));
      setTimeout(() => setUploading((u) => u.filter((x) => x.name !== f.name)), 400);
    }
    if (newTracks.length) {
      setTracks((prev) => [...prev, ...newTracks]);
      if (currentTrack?.isDefault) goto(newTracks[0].id);
    }
  }, [tracks, currentTrack, goto]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeTrack = (id: string) => {
    setTracks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      const gone = prev.find((t) => t.id === id);
      if (gone && !gone.isDefault && gone.src.startsWith("blob:")) URL.revokeObjectURL(gone.src);
      if (currentId === id) {
        const fallback = next[0] ?? DEFAULT_TRACK;
        setCurrentId(fallback.id);
      }
      return next.length ? next : [DEFAULT_TRACK];
    });
  };

  const clearAll = () => {
    tracks.forEach((t) => { if (!t.isDefault && t.src.startsWith("blob:")) URL.revokeObjectURL(t.src); });
    setTracks([DEFAULT_TRACK]);
    setCurrentId(DEFAULT_TRACK.id);
  };

  const move = (id: string, dir: -1 | 1) => {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  };

  const startRename = (t: Track) => { setRenameId(t.id); setRenameVal(t.name); };
  const commitRename = () => {
    if (!renameId) return;
    setTracks((prev) => prev.map((t) => t.id === renameId ? { ...t, name: renameVal.trim() || t.name } : t));
    setRenameId(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tracks.filter((t) => !q || t.name.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "duration") return (b.duration ?? 0) - (a.duration ?? 0);
      if (sortKey === "size") return b.size - a.size;
      return (orderRef.current.get(b.id) ?? 0) - (orderRef.current.get(a.id) ?? 0);
    });
    return list;
  }, [tracks, query, sortKey]);

  const [duration, setDuration] = useState(0);

  // Draggable position (persisted). Default: below navbar, left edge, safe-area aware.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p?.x === "number" && typeof p?.y === "number") setPos(p);
      }
    } catch {}
  }, []);

  const clampPos = useCallback((x: number, y: number) => {
    const el = containerRef.current;
    const w = el?.offsetWidth ?? 260;
    const h = el?.offsetHeight ?? 44;
    const pad = 8;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad, window.innerHeight - h - pad);
    return { x: Math.min(Math.max(pad, x), maxX), y: Math.min(Math.max(pad, y), maxY) };
  }, []);

  const onDragPointerDown = (e: React.PointerEvent) => {
    // ignore drags started on interactive controls
    const target = e.target as HTMLElement;
    if (target.closest("button,input,select,label,a,[role='slider']")) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragState.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const { dx, dy } = dragState.current;
    dragState.current.moved = true;
    const next = clampPos(e.clientX - dx, e.clientY - dy);
    setPos(next);
  };
  const onDragPointerUp = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const moved = dragState.current.moved;
    dragState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (moved && pos) {
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch {}
    }
  };

  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clampPos(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [clampPos]);

  const resetPos = () => {
    setPos(null);
    try { localStorage.removeItem(POS_KEY); } catch {}
  };

  const positionStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: "auto" }
    : {
        left: "max(12px, env(safe-area-inset-left))",
        top: "calc(5rem + env(safe-area-inset-top))",
      };

  return (
    <div
      ref={containerRef}
      onPointerDown={onDragPointerDown}
      onPointerMove={onDragPointerMove}
      onPointerUp={onDragPointerUp}
      onPointerCancel={onDragPointerUp}
      style={{ ...positionStyle, touchAction: "none" }}
      className="fixed z-[60] flex select-none items-start gap-2"
    >
      <audio
        ref={audioRef}
        loop={loop && tracks.length === 1}
        onEnded={onEnded}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="flex items-center gap-2">
        <label
          className="glass grid h-10 cursor-pointer place-items-center rounded-full px-3 text-xs font-medium text-foreground shadow-elegant transition hover:scale-[1.03]"
          style={{ boxShadow: "0 0 24px color-mix(in oklab, var(--primary) 30%, transparent)" }}
          title="Upload audio files"
        >
          <input
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <span className="flex items-center gap-1.5"><Upload className="h-4 w-4" /> Upload</span>
        </label>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Music player"
          aria-expanded={open}
          className="glass grid h-10 w-10 place-items-center rounded-full text-foreground shadow-elegant transition hover:scale-105"
        >
          {needsGesture ? <Play className="h-4 w-4" /> : <Music className={`h-4 w-4 ${playing && !muted ? "animate-pulse" : ""}`} />}
        </button>
      </div>

      {open && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`neo-glass relative w-[min(92vw,380px)] rounded-[2rem] p-4 border border-white/10 shadow-2xl ${dragOver ? "ring-2 ring-primary-crimson" : ""}`}
        >
          {/* Header now-playing */}
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-crimson to-bright-crimson shadow-lg shadow-primary-crimson/20">
              <ListMusic className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black uppercase tracking-tight text-moonlight-white">{currentTrack?.name ?? "—"}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-blue-gray">
                {currentTrack?.format} · {fmtSize(currentTrack?.size ?? 0)} · {fmtTime(duration)}
              </div>
            </div>
            <button onClick={resetPos} aria-label="Reset player position" title="Reset position" className="text-muted-foreground hover:text-foreground">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Reset</span>
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close" className="ml-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Seek */}
          <div className="mt-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(progress, duration || 0)}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = v;
                setProgress(v);
              }}
              className="h-1 w-full cursor-pointer accent-primary"
              aria-label="Seek"
            />
            <div className="mt-0.5 flex justify-between text-[10px] tabular-nums text-muted-foreground">
              <span>{fmtTime(progress)}</span><span>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle} className={`grid h-8 w-8 place-items-center rounded-full ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Shuffle">
                <Shuffle className="h-4 w-4" />
              </button>
              <button onClick={prevTrack} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground" title="Previous">
                <SkipBack className="h-4 w-4" />
              </button>
              <button onClick={playPause} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:brightness-110" title={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={nextTrack} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground" title="Next">
                <SkipForward className="h-4 w-4" />
              </button>
              <button onClick={() => setLoop((l) => !l)} aria-pressed={loop} className={`grid h-8 w-8 place-items-center rounded-full ${loop ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Loop">
                <Repeat className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (v > 0 && muted) setMuted(false); }}
                className="h-1 w-20 cursor-pointer accent-primary" aria-label="Volume"
              />
            </div>
          </div>

          {/* Uploads in progress */}
          {uploading.length > 0 && (
            <div className="mt-3 space-y-1">
              {uploading.map((u) => (
                <div key={u.name} className="rounded-md bg-secondary/40 p-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">{u.name}</span><span>{u.pct}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded bg-secondary">
                    <div className="h-full bg-primary transition-all" style={{ width: `${u.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search + sort */}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search library"
                className="w-full rounded-full border border-border/60 bg-background/60 py-1.5 pl-7 pr-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-full border border-border/60 bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-primary"
              aria-label="Sort"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="duration">Duration</option>
              <option value="size">Size</option>
            </select>
            {tracks.length > 1 && (
              <button
                onClick={clearAll}
                title="Clear all uploaded"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Track list */}
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <div className="rounded-md border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
                No matches. Drop audio files here or press Upload.
              </div>
            )}
            {filtered.map((t) => {
              const isActive = t.id === currentId;
              return (
                <div key={t.id} className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${isActive ? "bg-primary/15" : "hover:bg-secondary/50"}`}>
                  <button onClick={() => goto(t.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/70 text-foreground">
                    {isActive && playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    {renameId === t.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenameId(null); }}
                        className="w-full rounded bg-background/60 px-1 py-0.5 text-xs outline-none"
                      />
                    ) : (
                      <div className="truncate font-medium">{t.name}{t.isDefault && <span className="ml-1 text-[9px] uppercase text-muted-foreground">default</span>}</div>
                    )}
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {t.format} · {fmtTime(t.duration)} · {fmtSize(t.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => move(t.id, -1)} title="Move up" className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground"><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(t.id, 1)} title="Move down" className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground"><ChevronDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => startRename(t)} title="Rename" className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    {!t.isDefault && (
                      <button onClick={() => removeTrack(t.id)} title="Remove" className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            Drop MP3 · WAV · FLAC · AAC · OGG · M4A anywhere on this panel
          </div>
        </div>
      )}
    </div>
  );
}
