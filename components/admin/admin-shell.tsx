"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/promos", label: "Promo codes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell bg-ground">
      <aside className="border-r-[length:var(--dp-border-rule)] border-ink p-5">
        <p className="swiss-index">
          <span className="swiss-mark" aria-hidden="true" />
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Clay Market</h1>
        <p className="mt-1 text-sm text-ink-secondary">Signed in as {adminName}</p>
        <nav className="admin-nav mt-6" aria-label="Admin">
          {links.map((link, i) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} data-active={active}>
                <span className="swiss-label mr-2 text-ink-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className="clay-btn mt-6 w-full" onClick={logout}>
          Log out
        </button>
        <Link href="/" className="clay-btn clay-btn-ghost mt-3 inline-flex">
          View storefront
        </Link>
      </aside>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
