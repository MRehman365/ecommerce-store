export function AnnouncementBar({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  if (!enabled || !text) return null;
  return (
    <div className="border-b-[length:var(--dp-border-rule)] border-ink bg-surface px-[var(--dp-spacing-gutter)] py-2 text-center">
      <p className="swiss-label text-ink">
        <span className="swiss-mark" aria-hidden="true" />
        {text}
      </p>
    </div>
  );
}
