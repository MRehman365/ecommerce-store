export function FactCushions({
  currency,
  freeShippingThreshold,
  shippingCharge,
}: {
  currency: string;
  freeShippingThreshold: number;
  shippingCharge: number;
}) {
  const facts = [
    {
      index: "02",
      title: "Guest checkout",
      body: "No account needed — just delivery details and pay.",
    },
    {
      index: "03",
      title: "Image-first styles",
      body: "Choose the photo you want. That exact look goes in the cart.",
    },
    {
      index: "04",
      title: "Shipping math",
      body:
        freeShippingThreshold > 0
          ? `Standard ${currency} ${shippingCharge}. Free from ${currency} ${freeShippingThreshold}.`
          : `Standard shipping ${currency} ${shippingCharge}.`,
    },
  ];

  return (
    <section className="store-shell border-b-[length:var(--dp-border-rule)] border-ink py-8">
      <div className="swiss-grid mb-6">
        <div className="swiss-rail">
          <p className="swiss-index">
            <span className="swiss-mark" aria-hidden="true" />
            Facts
          </p>
        </div>
        <div className="swiss-main">
          <h2 className="swiss-section-title">How the store works</h2>
        </div>
      </div>
      <div className="fact-grid">
        {facts.map((fact) => (
          <article key={fact.title} className="bg-ground p-5">
            <p className="swiss-index text-accent">{fact.index}</p>
            <h3 className="mt-3 text-[length:var(--dp-typography-item-title)] font-bold tracking-tight">
              {fact.title}
            </h3>
            <p className="mt-2 text-[length:var(--dp-typography-metadata)] text-ink-secondary">
              {fact.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
