"use client";

import { useState } from "react";
import Image from "next/image";
import { nanoid } from "nanoid";

export type UploadedImage = {
  id: string;
  url: string;
  publicId: string;
  alt?: string;
  isDefault?: boolean;
  sortOrder: number;
};

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({
          id: data.id || nanoid(),
          url: data.url,
          publicId: data.publicId,
          sortOrder: images.length + uploaded.length,
          isDefault: images.length + uploaded.length === 0,
        });
      }
      const next = [...images, ...uploaded].map((img, index) => ({
        ...img,
        sortOrder: index,
        isDefault: index === 0 ? true : img.isDefault && index === 0,
      }));
      if (!next.some((img) => img.isDefault) && next[0]) next[0].isDefault = true;
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div>
      <label className="clay-label">Product images (each image = selectable variation)</label>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => onFiles(e.target.files)}
      />
      {uploading ? <p className="mt-2 text-sm">Uploading…</p> : null}
      {error ? (
        <p className="mt-2 clay-cushion clay-cushion-warm p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {images.map((img, index) => (
          <li key={img.id} className="clay-cushion clay-cushion-surface p-3">
            <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl clay-well">
              <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="clay-btn !min-h-9 !px-3" onClick={() => move(index, -1)}>
                Up
              </button>
              <button type="button" className="clay-btn !min-h-9 !px-3" onClick={() => move(index, 1)}>
                Down
              </button>
              <button
                type="button"
                className="clay-btn !min-h-9 !px-3"
                onClick={() =>
                  onChange(
                    images.map((item, i) => ({
                      ...item,
                      isDefault: i === index,
                    }))
                  )
                }
              >
                {img.isDefault ? "Default" : "Set default"}
              </button>
              <button
                type="button"
                className="clay-btn clay-btn-ghost"
                onClick={() => onChange(images.filter((item) => item.id !== img.id))}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
