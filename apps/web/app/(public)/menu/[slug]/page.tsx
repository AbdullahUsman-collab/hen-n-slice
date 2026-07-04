'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '../../../../store/app-store';
import ItemCard from '../../../../components/ItemCard';
import type { Category, MenuItem } from '@hen-n-slice/types';

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { branchId, hasSelectedBranch, openModal } = useAppStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSelectedBranch) {
      openModal();
      router.push('/');
      return;
    }

    async function fetch() {
      try {
        const { getCategories, getMenuItems } = await import(
          '@hen-n-slice/api-client'
        ).then((m) => m.menuApi);

        const [allCategories, allItems] = await Promise.all([
          getCategories(branchId!),
          getMenuItems(branchId!),
        ]);

        const matched = allCategories.find((c) => c.slug === params.slug) ?? null;
        setCategory(matched);

        if (matched) {
          const filtered = allItems.filter(
            (item) => item.category_id === matched.id,
          );
          setItems(filtered);
        }
      } catch (err) {
        console.error('[HenNSlice] Failed to load category items:', err);
      }
      setLoading(false);
    }

    fetch();
  }, [hasSelectedBranch, branchId, params.slug, openModal, router]);

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/menu" className="text-brand-purple transition-colors hover:text-brand-purple/80">
          Menu
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{category.name}</span>
          </>
        )}
      </nav>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
          <span className="ml-3 text-sm text-text-secondary">
            Loading items...
          </span>
        </div>
      )}

      {!loading && !category && (
        <div className="py-20 text-center">
          <p className="text-lg text-text-muted">Category not found.</p>
          <Link
            href="/menu"
            className="mt-4 inline-block text-sm font-semibold text-brand-purple"
          >
            ← Back to Menu
          </Link>
        </div>
      )}

      {!loading && category && (
        <>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold">{category.name}</h1>
          </div>

          {items.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-text-muted">
                No items available in this category.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
