"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createCategory(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create category");
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setError("");
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update category");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={createCategory}
        className="clay-tray grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          className="clay-input"
          placeholder="Category name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="clay-input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="clay-btn" disabled={saving}>
          Add
        </button>
      </form>

      {error ? (
        <p className="clay-cushion clay-cushion-warm p-3" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {initial.map((category) => (
          <li
            key={category.id}
            className="clay-cushion clay-cushion-surface p-4"
          >
            {editingId === category.id ? (
              <form onSubmit={saveEdit} className="grid gap-3 md:grid-cols-2">
                <input
                  className="clay-input"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="clay-input"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                <label className="inline-flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                  />
                  Active
                </label>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button type="submit" className="clay-btn" disabled={saving}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="clay-btn clay-btn-ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{category.name}</p>
                  <p className="text-sm text-ink-secondary">
                    {category.description || "No description"}
                  </p>
                  <p className="swiss-label mt-1 text-ink-secondary">
                    {category.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="clay-btn !min-h-10"
                    onClick={() => startEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="clay-btn clay-btn-ghost"
                    onClick={async () => {
                      if (!confirm("Delete category?")) return;
                      await fetch(`/api/admin/categories/${category.id}`, {
                        method: "DELETE",
                      });
                      router.refresh();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
