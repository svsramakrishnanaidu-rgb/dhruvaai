import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { HeroBanner } from "@/components/HeroBanner";
import { Send } from "lucide-react";
import heroImg from "@/assets/heroes/contact.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Krish Sense" },
      { name: "description", content: "Get in touch — say hello, request a district, or share feedback." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Say hello"
        title="Contact"
        description="Request a district, propose a crop, or partner on research."
      />
      <div className="mx-auto max-w-3xl px-6 py-16">


      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="card-elegant mt-10 grid gap-4 p-8"
      >
        <Field label="Name"><input required className="input" placeholder="Your name" /></Field>
        <Field label="Email"><input required type="email" className="input" placeholder="you@example.com" /></Field>
        <Field label="Message">
          <textarea required rows={5} className="input resize-none" placeholder="Tell us anything…" />
        </Field>
        <button
          type="submit"
          disabled={sent}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-70"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <Send className="h-4 w-4" /> {sent ? "Received — thanks!" : "Send message"}
        </button>
      </form>

      <style>{`
        .input {
          width: 100%; border-radius: 12px;
          border: 1px solid var(--border);
          background: color-mix(in oklab, var(--background) 60%, transparent);
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem; outline: none;
          transition: border-color 0.25s;
        }
        .input:focus { border-color: var(--primary); }
      `}</style>
    </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
