import Link from 'next/link';
import type { MenuItem } from '@hen-n-slice/types';
import { useCartStore } from '../store/cart-store';

interface ItemCardProps {
  item: MenuItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const price = item.discount_price ?? item.price;
  const hasDiscount = item.discount_price != null;
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price,
      quantity: 1,
      imageUrl: item.image_url ?? undefined,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border-light bg-surface-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/item/${item.id}`} className="relative aspect-[4/3] block bg-brand-purple/5">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            🍗
          </div>
        )}
        {item.is_popular && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-orange px-3 py-0.5 text-xs font-bold text-white">
            Popular
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
            SALE
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/item/${item.id}`}>
          <h3 className="font-heading text-base font-semibold transition-colors hover:text-brand-purple/80">
            {item.name}
          </h3>
        </Link>
        {item.description && (
          <p className="line-clamp-2 text-sm text-text-secondary">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            {hasDiscount && (
              <span className="mr-1 text-sm text-text-muted line-through">
                PKR {item.price}
              </span>
            )}
            <span className="font-heading text-lg font-bold text-brand-purple">
              PKR {price}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-md bg-brand-purple px-4 py-1.5 text-sm font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
