import Image from "next/image";

type Banner = {
  id: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  desktopImage?: { url?: string };
  mobileImage?: { url?: string };
};

export function HeroSection({
  banner,
  storeName,
}: {
  banner?: Banner | null;
  storeName: string;
}) {
  const heading = banner?.heading || storeName;
  const description =
    banner?.description ||
    "Pick the look from real product photos, fill a soft cart, and checkout as a guest.";
  const ctaText = banner?.ctaText || "Shop the drop";
  const ctaHref = banner?.ctaHref || "#products";
  const desktop = banner?.desktopImage?.url;
  const mobile = banner?.mobileImage?.url || desktop;

  return (
    <section className="store-shell border-b-[length:var(--dp-border-rule)] border-ink py-8 md:py-12">
      <div className="hero-grid">
        <div className="swiss-hero-copy">
          <p className="swiss-index mb-4 text-ink-secondary">
            <span className="swiss-mark" aria-hidden="true" />
            01 / Opening · {storeName}
          </p>
          <h1 className="swiss-display text-ink">{heading}</h1>
          <p className="mt-6 max-w-2xl text-[length:var(--dp-typography-lead)] leading-[var(--dp-typography-body-leading)] text-ink-secondary">
            {description}
          </p>
        </div>

        <div className="swiss-hero-aside flex flex-col justify-end gap-4 border-t-[length:var(--dp-border-rule)] border-ink pt-4 md:border-t-0 md:border-l-[length:var(--dp-border-rule)] md:pl-4 md:pt-0">
          <a href={ctaHref} className="clay-btn w-full">
            {ctaText}
          </a>
          <a href="#featured" className="clay-btn clay-btn-ghost w-fit">
            See featured
          </a>
          {(desktop || mobile) && (
            <div className="relative mt-2 aspect-[3/4] w-full clay-well">
              <Image
                src={desktop || mobile!}
                alt=""
                fill
                className="object-cover swiss-img"
                sizes="(max-width:700px) 100vw, 25vw"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
