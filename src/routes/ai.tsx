import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { AIBackdrop } from "@/components/assistant/AIBackdrop";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Krish AI — Your Farming Co-Pilot | Krish Sense" },
      {
        name: "description",
        content:
          "Talk to Krish AI in English, Telugu or Hindi. Ask about crops, weather, mandi prices and fertilizer doses — it sees your screen and navigates the app for you.",
      },
      { property: "og:title", content: "Krish AI — Your Farming Co-Pilot" },
      {
        property: "og:description",
        content: "A voice-and-vision agricultural assistant built into Krish Sense.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  return (
    <main className="ks-ai-page">
      <AIBackdrop />

      <div className="ks-ai-page-inner">
        <nav className="ks-ai-topbar">
          <Link to="/" className="ks-ai-chip" aria-label="Back to Krish Sense">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <span className="ks-ai-chip ks-ai-chip-live">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Krish AI · Live
          </span>
        </nav>

        <section className="ks-ai-glass">
          <AssistantChat />
        </section>
      </div>
    </main>
  );
}
