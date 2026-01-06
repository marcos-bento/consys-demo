'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timeout);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível fazer login.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Usuário</label>
            <input
              type="text"
              value={username}
              onFocus={() => setError("")}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border p-2"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onFocus={() => setError("")}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2"
              required
              autoComplete="current-password"
            />
          </div>
      {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            style={{ cursor: "pointer" }}
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-500 p-2 text-white disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
