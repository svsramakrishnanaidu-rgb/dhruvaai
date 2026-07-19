import { Reveal } from "./Reveal";

/**
 * Cinematic image banner used on top-level routes. Renders a wide hero image
 * with an overlay eyebrow / title / description so every route feels image-first.
 */
export function HeroBanner({
  image,
  eyebrow,
  title,
  description,
  height = "h-[46vh] min-h-[280px]",
}: {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  height?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden ${height}`}>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        width={1920}
        height={900}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/30" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10 pt-24">
        <Reveal>
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary drop-shadow">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-foreground drop-shadow-lg md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base text-foreground/85 drop-shadow md:text-lg">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
