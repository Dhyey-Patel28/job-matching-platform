// src/components/LandingHero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function LandingHero({
  onExplore,
  onLogin,
  onCreate,
}: {
  onExplore: () => void;
  onLogin: () => void;
  onCreate: () => void;
}) {
  // Measure sticky header height so the hero exactly fills the rest of the viewport.
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(64);
  useEffect(() => {
    const measure = () => setHeaderH(headerRef.current?.offsetHeight ?? 64);
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      {/* Sticky nav (fluid sizing) */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 mx-auto flex w-screen items-center justify-between px-[4vw] py-[clamp(.8rem,1.4vw,1.2rem)]"
      >
        <div className="flex items-center gap-[0.55rem] rounded-xl border border-white/25 bg-white/10 px-[0.6rem] py-[0.35rem] backdrop-blur">
          <div className="grid h-[clamp(30px,3.2vw,40px)] w-[clamp(30px,3.2vw,40px)] place-items-center rounded-lg bg-white text-[clamp(.75rem,1vw,.9rem)] font-black text-gray-900">
            J
          </div>
          <span className="select-none text-[clamp(.72rem,1vw,.84rem)] font-medium tracking-wide text-white/90">
            Job Matching Platform
          </span>
        </div>

        <nav className="flex items-center gap-[0.6rem]">
          <button
            onClick={onExplore}
            className="rounded-lg bg-white/10 px-[clamp(12px,1vw,16px)] py-[clamp(8px,.8vw,10px)] text-[clamp(.82rem,1vw,.92rem)] text-white backdrop-blur transition hover:bg-white/20"
          >
            Explore
          </button>
          <button
            onClick={onLogin}
            className="rounded-lg bg-white px-[clamp(12px,1vw,16px)] py-[clamp(8px,.8vw,10px)] text-[clamp(.82rem,1vw,.92rem)] font-medium text-gray-900 transition hover:shadow-sm active:translate-y-px"
          >
            Login
          </button>
        </nav>
      </header>

      {/* Hero fills viewport minus the sticky header */}
      <section
        className="mx-auto grid w-screen grid-cols-1 content-center gap-[min(6vh,3rem)] px-[4vw] py-[clamp(3vh,6vh,7vh)] md:grid-cols-[55%_45%]"
        style={{ minHeight: `calc(100dvh - ${headerH}px)` }}
      >
        {/* Left column */}
        <div className="max-w-none pr-0 md:pr-[2vw]">
          {/* Balanced heading so “next” doesn’t end up alone */}
          <h1
            className="font-black tracking-tight text-white leading-[0.98] text-[clamp(2.6rem,6vw,4.4rem)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Swipe into your next opportunity.
          </h1>

          <p className="mt-[1rem] max-w-[68ch] text-white/90 leading-relaxed text-[clamp(1rem,1.4vw,1.15rem)]">
            A modern, swipe-first way to discover roles and companies. Like it?
            Swipe right. Not a fit? Swipe left. It’s that simple.
          </p>

          <div className="mt-[2rem] flex flex-wrap items-center gap-[0.8rem]">
            <button
              onClick={onExplore}
              className="rounded-xl bg-white px-[clamp(16px,1.6vw,22px)] py-[clamp(12px,1.1vw,14px)] text-[clamp(.92rem,1.1vw,1rem)] font-semibold text-gray-900 transition hover:shadow-md active:translate-y-px"
            >
              Get started
            </button>
            <button
              onClick={onCreate}
              className="rounded-xl border border-white/40 bg-white/10 px-[clamp(16px,1.6vw,22px)] py-[clamp(12px,1.1vw,14px)] text-[clamp(.92rem,1.1vw,1rem)] font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Create account
            </button>
          </div>

          {/* Social proof (more authentic) */}
          <div className="mt-[1.2rem] flex flex-wrap items-center gap-[0.9rem]">
            <AvatarRow />
            <span className="text-[clamp(.72rem,1vw,.82rem)] text-white/80">
              <strong className="text-white">5,000+ matches</strong> made by candidates like you
            </span>
          </div>

          {/* Value props — simple, readable bullets (no “glass button” look) */}
          <ul
            role="list"
            className="mt-[1.2rem] grid max-w-[70ch] grid-cols-1 gap-[0.5rem] text-white/95 text-[clamp(.95rem,1.15vw,1.05rem)] md:grid-cols-3"
          >
            {[
              { icon: "⚡", text: "Fast discovery" },
              { icon: "🎯", text: "Skill-based matches" },
              { icon: "🔒", text: "No spam" },
            ].map((it) => (
              <li key={it.text} className="flex items-center gap-2">
                <span aria-hidden className="select-none">{it.icon}</span>
                <span className="leading-snug">{it.text}</span>
              </li>
            ))}
          </ul>

          {/* Optional: quick stats that scale with width */}
          <HeroStats />
        </div>

        {/* Right column — auto-swiping preview */}
        <div className="relative mx-auto w-full">
          <DeckPreview />
        </div>
      </section>

      {/* Right-swipe animation (center → right) */}
      <style jsx>{`
        @keyframes card-swipe-right {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          30% { transform: translate(12%, -2%) rotate(4deg); opacity: 1; }
          55% { transform: translate(120%, -6%) rotate(14deg); opacity: 0.9; }
          57% { opacity: 0; }
          60% { transform: translate(-8%, 4%) rotate(-6deg); opacity: 0; }
          65% { opacity: 1; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* --------------------------- helpers --------------------------- */

/** Authentic-looking mini avatars */
function AvatarRow() {
  const palette = useMemo(
    () => [
      "from-rose-400 to-pink-500",
      "from-amber-400 to-orange-500",
      "from-emerald-400 to-teal-500",
      "from-sky-400 to-blue-500",
      "from-violet-400 to-fuchsia-500",
      "from-lime-400 to-emerald-500",
      "from-cyan-400 to-sky-500",
    ],
    []
  );

  const people = useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: 5 }, (_, i) => {
      const ch = letters[Math.floor(Math.random() * letters.length)];
      const color = palette[(i + Math.floor(Math.random() * palette.length)) % palette.length];
      return { ch, color };
    });
  }, [palette]);

  return (
    <div className="flex -space-x-2">
      {people.map((p, i) => (
        <div
          key={`${p.ch}-${i}`}
          className={`grid h-[clamp(24px,2.3vw,28px)] w-[clamp(24px,2.3vw,28px)] place-items-center rounded-full bg-gradient-to-br ${p.color} text-[clamp(10px,1vw,11px)] font-semibold text-white ring-2 ring-white/60`}
          aria-hidden
          title="Recent matcher"
        >
          {p.ch}
        </div>
      ))}
    </div>
  );
}

/** Subtle, fluid hero stats */
function HeroStats() {
  // fun little ticker
  const [matches, setMatches] = useState(5123);
  useEffect(() => {
    const id = setInterval(() => setMatches((m) => m + Math.floor(Math.random() * 3)), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-[min(2.2rem,3vh)] grid grid-cols-3 gap-[clamp(.6rem,1.2vw,1rem)] max-w-[60ch]">
      {[
        { label: "Open roles", value: "3,200+" },
        { label: "Companies", value: "850+" },
        { label: "Matches", value: Intl.NumberFormat().format(matches) },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-white/25 bg-white/10 px-[clamp(.6rem,1vw,.9rem)] py-[clamp(.6rem,1vw,.9rem)] backdrop-blur">
          <div className="text-white font-semibold text-[clamp(1rem,1.4vw,1.1rem)]">{s.value}</div>
          <div className="text-white/80 text-[clamp(.7rem,.95vw,.82rem)]">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

type DemoCard = { title: string; meta: string; chips: string[] };

/** Auto-swiping deck preview that feels like real cards */
function DeckPreview() {
  const cards: DemoCard[] = [
    { title: "Frontend Engineer", meta: "Acme • Remote", chips: ["React", "TypeScript", "Next.js"] },
    { title: "Data Engineer", meta: "Wayfinder Labs • Remote", chips: ["Python", "Airflow", "dbt"] },
    { title: "React Native Engineer", meta: "Trident Mobile • Austin, TX", chips: ["RN", "iOS", "Android"] },
  ];

  // Always swipe center → right
  const [order, setOrder] = useState<[number, number, number]>([0, 1, 2]);
  const [swipe, setSwipe] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setSwipe(true);
      const t = setTimeout(() => {
        setOrder(([a, b, c]) => [b, c, a]);
        setSwipe(false);
      }, 1500);
      return () => clearTimeout(t);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative mx-auto aspect-[4/3] w-[min(100%,46vw)] max-w-[720px]"
      style={{ perspective: 1200 }}
      aria-hidden
    >
      {/* subtle “stack shadow” to sell the illusion */}
      <div className="absolute inset-x-[6%] bottom-[2%] h-[2.2%] rounded-[999px] bg-black/10 blur-md" />

      {order.map((idx, i) => {
        const c = cards[idx];
        const isTop = i === 0;
        return (
          <div
            key={idx}
            className={[
              "absolute inset-0 rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,.12)] ring-1 ring-black/5 backdrop-blur-sm",
              "transition-transform duration-500 will-change-transform",
              // percent-based stack so it scales cleanly
              isTop ? "" : i === 1 ? "translate-y-[3%] scale-[.986]" : "translate-y-[6%] scale-[.972]",
            ].join(" ")}
            style={{
              zIndex: 100 - i,
              animation: isTop && swipe ? "card-swipe-right 1.5s ease-in-out" : undefined,
            }}
          >
            <div className="flex h-full flex-col p-[4.5%]">
              {/* header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-[clamp(34px,3vw,42px)] w-[clamp(34px,3vw,42px)] place-items-center rounded-lg bg-white text-[clamp(.65rem,.95vw,.78rem)] font-semibold shadow-sm ring-1 ring-gray-200">
                    {c.title.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="leading-tight text-gray-900 font-semibold text-[clamp(.98rem,1.25vw,1.08rem)]">
                      {c.title}
                    </p>
                    <p className="text-gray-600 text-[clamp(.68rem,.95vw,.75rem)]">{c.meta}</p>
                  </div>
                </div>
                <span className="rounded-full border border-gray-200 bg-white/85 px-2 py-1 text-[clamp(.62rem,.9vw,.7rem)] font-medium">
                  $120k–$150k
                </span>
              </div>

              {/* chips */}
              <div className="mt-[1rem] flex flex-wrap gap-2">
                {c.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-700 text-[clamp(.68rem,.95vw,.78rem)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* footer */}
              <div className="mt-auto flex items-center justify-between pt-[1.2rem]">
                <span className="text-gray-500 text-[clamp(.62rem,.9vw,.72rem)]">Posted 2d ago</span>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[clamp(.65rem,.95vw,.78rem)]">
                    ☆ Save
                  </button>
                  <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-white text-[clamp(.65rem,.95vw,.78rem)]">
                    View details
                  </button>
                </div>
              </div>
            </div>

            {/* LIKE badge only during swipe to feel “real” */}
            {isTop && swipe && (
              <div className="pointer-events-none absolute left-4 top-4 rounded-md border-2 border-emerald-500 px-2 py-0.5 text-[clamp(.6rem,.9vw,.72rem)] font-semibold tracking-widest text-emerald-600">
                LIKE
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
