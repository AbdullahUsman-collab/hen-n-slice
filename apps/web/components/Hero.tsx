export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple to-brand-purple-deep text-text-on-brand">
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-4 py-12 md:flex-row md:py-16">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <span className="inline-block rounded-full bg-brand-gold/20 px-4 py-1 text-sm font-semibold text-brand-gold">
            NEW — Crispy & Juicy
          </span>
          <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-4xl">
            GOOD CHICKEN.
            <br />
            <span className="text-brand-gold">BETTER MOOD.</span>
          </h1>
          <p className="max-w-md text-base text-text-on-brand/80 md:text-lg">
            Experience the crunch of our signature broast chicken — made fresh,
            served hot, delivered fast.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
            <button className="rounded-md bg-brand-gold px-8 py-3 font-semibold text-text-primary transition-colors hover:bg-brand-gold/90">
              ORDER NOW
            </button>
            <div className="flex items-center gap-2 text-sm text-text-on-brand/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-gold">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              25–35 min delivery
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative mx-auto aspect-square max-w-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-gold/10">
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-semibold text-brand-gold">
                🍗 Hero Image
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
