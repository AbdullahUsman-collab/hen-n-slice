import type { MenuItem } from '@hen-n-slice/types';
import ItemCard from './ItemCard';

export default function FeaturedGrid({ items }: { items: MenuItem[] }) {
  if (!items.length) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-container px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Featured Items</h2>
          <a
            href="/menu"
            className="text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple/80"
          >
            View Full Menu →
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
