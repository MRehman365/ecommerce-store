import Image from "next/image";

export function PromoBanner({
  banner,
}: {
  banner: {
    id: string;
    heading: string;
    description: string;
    ctaText: string;
    ctaHref: string;
    desktopImage?: { url?: string };
    mobileImage?: { url?: string };
  };
}) {
  const image = banner.desktopImage?.url || banner.mobileImage?.url;
  return (
    <section className="store-shell border-b-[length:var(--dp-border-rule)] border-ink py-8">
      <div className="swiss-grid">
        <div className="swiss-rail">
          <p className="swiss-index">
            <span className="swiss-mark" aria-hidden="true" />
            Promo
          </p>
        </div>
        <div className="swiss-main grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <h2 className="swiss-section-title">
              {banner.heading || "Promotion"}
            </h2>
            <p className="mt-3 max-w-xl text-ink-secondary">{banner.description}</p>
            {banner.ctaText ? (
              <a href={banner.ctaHref || "#products"} className="clay-btn mt-5">
                {banner.ctaText}
              </a>
            ) : null}
          </div>
          {image ? (
            <div className="relative min-h-[280px] aspect-[4/5] md:aspect-auto clay-well">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover swiss-img"
                sizes="(max-width:700px) 100vw, 40vw"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
