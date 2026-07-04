'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../store/app-store';
import type { Category } from '@hen-n-slice/types';

export default function MenuPage() {
  const router = useRouter();
  const { branchId, hasSelectedBranch, openModal } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSelectedBranch) {
      openModal();
      router.push('/');
      return;
    }

    async function fetch() {
      try {
        const { getCategories } = await import('@hen-n-slice/api-client').then(
          (m) => m.menuApi,
        );
        const data = await getCategories(branchId!);
        setCategories(data);
      } catch (err) {
        console.error('[HenNSlice] Failed to load categories:', err);
      }
      setLoading(false);
    }

    fetch();
  }, [hasSelectedBranch, branchId, openModal, router]);

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Our Menu</h1>
        <p className="mt-1 text-text-secondary">
          Browse categories to find your favorite crispy chicken
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
          <span className="ml-3 text-sm text-text-secondary">Loading menu...</span>
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg text-text-muted">No categories available.</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/menu/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-md border border-border-light bg-surface-card p-6 text-center shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-purple/5 transition-colors group-hover:bg-brand-purple/10">
                {cat.icon_url ? (
                  <img
                    src={cat.icon_url}
                    alt={cat.name}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <span className="text-3xl">🍗</span>
                )}
              </div>
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                {cat.name}
              </h2>
              <span className="text-sm font-medium text-brand-purple transition-colors group-hover:text-brand-purple/80">
                Browse Menu →
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
