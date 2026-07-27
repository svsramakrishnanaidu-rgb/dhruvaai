"use client";
/**
 * UI Context Engine — turns the live DOM of the current screen into a compact,
 * de-duplicated text snapshot the model can reason over.
 *
 * Deliberately cheap: one traversal, capped output, no observers running in the
 * background. It is called on demand (when the user asks something), so it adds
 * zero cost to normal browsing.
 */

const MAX_CHARS = 6000;

function clean(s: string | null | undefined) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function visible(el: Element) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const cs = window.getComputedStyle(el);
  return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05;
}

export type ScreenSnapshot = {
  path: string;
  title: string;
  headings: string[];
  text: string;
  controls: string[];
  tables: string[];
  images: string[];
  errors: string[];
};

export function captureScreen(): ScreenSnapshot {
  if (typeof document === "undefined") {
    return { path: "/", title: "", headings: [], text: "", controls: [], tables: [], images: [], errors: [] };
  }
  const main = document.getElementById("main") ?? document.body;
  const seen = new Set<string>();
  const push = (arr: string[], v: string, cap = 40) => {
    const k = v.toLowerCase();
    if (!v || v.length < 2 || seen.has(k) || arr.length >= cap) return;
    seen.add(k);
    arr.push(v);
  };

  const headings: string[] = [];
  main.querySelectorAll("h1,h2,h3").forEach((h) => visible(h) && push(headings, clean(h.textContent), 25));

  const controls: string[] = [];
  main.querySelectorAll("button,a[href],[role='button'],input,select,textarea").forEach((el) => {
    if (!visible(el)) return;
    const label =
      clean(el.getAttribute("aria-label")) ||
      clean(el.textContent) ||
      clean(el.getAttribute("placeholder")) ||
      clean(el.getAttribute("title"));
    if (!label) return;
    const kind = el.tagName === "A" ? "link" : el.tagName === "BUTTON" || el.getAttribute("role") === "button" ? "button" : "input";
    push(controls, `${kind}: ${label.slice(0, 60)}`, 45);
  });

  const tables: string[] = [];
  main.querySelectorAll("table").forEach((t) => {
    if (!visible(t)) return;
    const rows = Array.from(t.querySelectorAll("tr")).slice(0, 8);
    const txt = rows.map((r) => Array.from(r.children).map((c) => clean(c.textContent)).join(" | ")).join("\n");
    push(tables, txt.slice(0, 800), 4);
  });

  const images: string[] = [];
  main.querySelectorAll("img[alt]").forEach((i) => {
    const alt = clean(i.getAttribute("alt"));
    if (alt) push(images, alt, 12);
  });

  const errors: string[] = [];
  document.querySelectorAll("[role='alert'],[data-error],.text-destructive").forEach((e) => {
    if (visible(e)) push(errors, clean(e.textContent).slice(0, 200), 5);
  });

  // Prose pass — paragraphs, list items and stat cards.
  const chunks: string[] = [];
  main.querySelectorAll("p,li,dd,figcaption,[data-stat]").forEach((el) => {
    if (!visible(el)) return;
    const t = clean(el.textContent);
    if (t.length > 3) push(chunks, t.slice(0, 300), 120);
  });

  let text = chunks.join("\n");
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS) + " …";

  return {
    path: window.location.pathname,
    title: document.title,
    headings,
    text,
    controls,
    tables,
    images,
    errors,
  };
}

/** Flattened plain-text version used for read-aloud. */
export function screenReadout(s: ScreenSnapshot): string {
  return [s.headings.join(". "), s.text].filter(Boolean).join(". ");
}

export function snapshotToPrompt(s: ScreenSnapshot): string {
  return [
    `ROUTE: ${s.path}`,
    `TITLE: ${s.title}`,
    s.headings.length ? `HEADINGS: ${s.headings.join(" | ")}` : "",
    s.errors.length ? `VISIBLE ERRORS: ${s.errors.join(" | ")}` : "",
    s.controls.length ? `CONTROLS: ${s.controls.join(" | ")}` : "",
    s.tables.length ? `TABLES:\n${s.tables.join("\n---\n")}` : "",
    s.images.length ? `IMAGES (alt): ${s.images.join(" | ")}` : "",
    s.text ? `CONTENT:\n${s.text}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
