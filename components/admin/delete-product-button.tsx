"use client";

import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="clay-btn clay-btn-ghost"
      onClick={async () => {
        if (!confirm("Delete this product?")) return;
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}
