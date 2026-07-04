const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v1H7a1 1 0 0 0 0 2h2v1a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
        <path d="M7 14a3 3 0 0 0 3 3h1v1a3 3 0 0 0 6 0v-1h2a1 1 0 0 0 0-2h-2v-1a3 3 0 0 0-3-3" />
      </svg>
    ),
    title: 'Crispy Perfection',
    desc: 'Double-marinated, perfectly fried chicken every time.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Family Recipes',
    desc: 'Secret spice blends passed down for generations.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Lightning Fast',
    desc: 'Order in minutes, delivered to your doorstep.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Quality First',
    desc: '100% fresh, never frozen, premium cuts only.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-brand-purple py-12 text-text-on-brand md:py-16">
      <div className="mx-auto max-w-container px-4">
        <h2 className="mb-10 text-center font-heading text-2xl font-bold">
          Why Choose Hen N Slice?
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-sm text-text-on-brand/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
