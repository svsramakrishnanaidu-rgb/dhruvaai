import { createFileRoute } from "@tanstack/react-router";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Music2 } from "lucide-react";

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Music Studio — Krish Sense" },
      { name: "description", content: "Upload, curate, and play your farm-field soundtrack. Cinematic music studio for Krish Sense." },
      { property: "og:title", content: "Music Studio — Krish Sense" },
      { property: "og:description", content: "Upload tracks and play your ambient field soundtrack in a cinematic studio." },
    ],
  }),
  component: MusicPage,
});

function MusicPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-24 pb-32 sm:px-6">
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Studio
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
          <span className="text-foreground">Music </span>
          <span className="text-gradient">Studio</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Upload your own ambient tracks, curate a playlist, and let the field score follow you across Krish Sense.
          Playback state persists — the floating player lives here now, not on the home screen.
        </p>
      </header>

      <div className="card-elegant relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{
          background: "radial-gradient(600px 300px at 20% 0%, color-mix(in oklab, var(--accent) 25%, transparent), transparent 60%)"
        }} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/60 to-accent/60 shadow-elegant">
            <Music2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Your soundtrack</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop <code className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px]">.mp3 .wav .flac .aac .ogg .m4a</code> files
              into the player. Files stay on this device.
            </p>
          </div>
        </div>

        <div className="relative mt-10 min-h-[420px] rounded-2xl border border-dashed border-border/60 bg-background/40 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Player · draggable
          </p>
          <MusicPlayer />
        </div>
      </div>
    </section>
  );
}
