"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) router.replace("/admin");
      })
      .catch(() => undefined);
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="clay-tray w-full max-w-md p-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin login</h1>
        <p className="mt-2 text-ink-secondary">Secure access for store administrators only.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="clay-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="clay-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="clay-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="clay-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error ? (
          <p className="mt-4 clay-cushion clay-cushion-warm p-3" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="clay-btn mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
