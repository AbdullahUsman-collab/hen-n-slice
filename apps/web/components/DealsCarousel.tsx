import type { Deal } from '@hen-n-slice/types';

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div
      className="flex shrink-0 flex-col justify-end overflow-hidden rounded-md"
      style={{
        width: 280,
        height: 180,
        background: `linear-gradient(135deg, #EE861B, #FEDA83)`,
      }}
    >
      <div className="space-y-2 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
          Limited Offer
        </p>
        <h3 className="font-heading text-lg font-bold leading-tight">
          {deal.title}
        </h3>
        {deal.discount_percent && (
          <p className="text-2xl font-extrabold">{deal.discount_percent}% OFF</p>
        )}
        <button className="rounded-md bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function DealsCarousel({ deals }: { deals: Deal[] }) {
  if (!deals.length) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-container px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Hot Deals 🔥</h2>
          <a href="/deals" className="text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple/80">
            View All →
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}
