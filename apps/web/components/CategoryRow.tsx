import type { Category } from '@hen-n-slice/types';

export default function CategoryRow({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-container px-4">
        <h2 className="mb-6 text-center font-heading text-2xl font-bold">
          What are you craving?
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/menu/${cat.slug}`}
              className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-purple/5 shadow-sm">
                {cat.icon_url ? (
                  <img
                    src={cat.icon_url}
                    alt={cat.name}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl">🍗</span>
                )}
              </div>
              <span className="text-sm font-medium text-text-primary">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
