export default function PromoBanner() {
  return (
    <section className="bg-brand-promo-yellow py-8 md:py-10">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-orange md:text-left">
            Limited Time
          </p>
          <h3 className="text-center font-heading text-xl font-bold text-text-primary md:text-left md:text-2xl">
            Free Delivery on Orders Above Rs 500
          </h3>
          <p className="text-center text-sm text-text-secondary md:text-left">
            Use code <span className="font-bold text-brand-orange">FREEDEL</span> at checkout
          </p>
        </div>
        <button className="shrink-0 rounded-md bg-brand-purple px-8 py-3 font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90">
          Order Now
        </button>
      </div>
    </section>
  );
}
