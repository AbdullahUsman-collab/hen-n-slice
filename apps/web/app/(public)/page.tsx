import Hero from '../../components/Hero';
import DealsCarousel from '../../components/DealsCarousel';
import CategoryRow from '../../components/CategoryRow';
import FeaturedGrid from '../../components/FeaturedGrid';
import WhyChooseUs from '../../components/WhyChooseUs';
import PromoBanner from '../../components/PromoBanner';

async function getData() {
  try {
    const [
      { getActiveDeals },
      { getCategories },
      { getFeaturedItems },
    ] = await Promise.all([
      import('@hen-n-slice/api-client').then((m) => m.dealsApi),
      import('@hen-n-slice/api-client').then((m) => m.menuApi),
      import('@hen-n-slice/api-client').then((m) => m.menuApi),
    ]);

    const [deals, categories, featured] = await Promise.all([
      getActiveDeals().catch(() => []),
      getCategories('00000000-0000-0000-0000-000000000000').catch(() => []),
      getFeaturedItems('00000000-0000-0000-0000-000000000000').catch(() => []),
    ]);

    return { deals, categories, featured };
  } catch {
    return { deals: [], categories: [], featured: [] };
  }
}

export default async function HomePage() {
  const { deals, categories, featured } = await getData();

  return (
    <main>
      <Hero />
      <DealsCarousel deals={deals} />
      <CategoryRow categories={categories} />
      <FeaturedGrid items={featured} />
      <WhyChooseUs />
      <PromoBanner />
    </main>
  );
}
