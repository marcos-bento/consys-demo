'use client';

import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">E-mail</label>
            <input type="email" className="w-full rounded border p-2" />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Senha</label>
            <input type="password" className="w-full rounded border p-2" />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 p-2 text-white"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
