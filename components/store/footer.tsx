export function StoreFooter({
  settings,
}: {
  settings: {
    storeName: string;
    storeDescription: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinks: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      tiktok?: string;
    };
    policies: {
      shipping: string;
      returns: string;
      privacy: string;
      terms: string;
    };
  };
}) {
  const policyEntries = [
    ["Shipping", settings.policies.shipping],
    ["Returns", settings.policies.returns],
    ["Privacy", settings.policies.privacy],
    ["Terms", settings.policies.terms],
  ] as const;

  return (
    <footer
      id="policies"
      className="border-t-[length:var(--dp-border-rule)] border-ink bg-ground"
    >
      <div className="store-shell py-10 md:py-14">
        <div className="mb-8 max-w-2xl">
          <h2 className="swiss-section-title">{settings.storeName}</h2>
          <p className="mt-3 text-ink-secondary">{settings.storeDescription}</p>
        </div>

        <div className="grid gap-0 border-t-[length:var(--dp-border-rule)] border-l-[length:var(--dp-border-rule)] border-ink sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b-[length:var(--dp-border-rule)] border-r-[length:var(--dp-border-rule)] border-ink p-5">
            <p className="font-bold">Contact</p>
            <div className="mt-3 space-y-1 text-sm text-ink-secondary">
              <p>{settings.contactEmail}</p>
              <p>{settings.contactPhone}</p>
              <p>{settings.contactAddress}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(settings.socialLinks || {}).map(([key, value]) =>
                value ? (
                  <a
                    key={key}
                    href={value}
                    className="clay-btn !min-h-9 !px-3"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {key}
                  </a>
                ) : null
              )}
            </div>
          </div>
          {policyEntries.map(([title, body]) => (
            <article
              key={title}
              className="border-b-[length:var(--dp-border-rule)] border-r-[length:var(--dp-border-rule)] border-ink p-5"
            >
              <h3 className="font-bold">{title}</h3>
              <p className="mt-3 text-[length:var(--dp-typography-metadata)] text-ink-secondary">
                {body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-secondary">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
