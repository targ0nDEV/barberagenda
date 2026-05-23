"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, LockKeyhole, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SESSION_STORAGE_KEY, getCredentials } from "@/lib/auth-mock";
import { users } from "@/lib/mock-data";

type LoginPanelProps = {
  onSuccess?: () => void;
  redirectTo?: string;
  showVisitorButton?: boolean;
};

export function LoginPanel({ onSuccess, redirectTo = "/dashboard", showVisitorButton = true }: LoginPanelProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const credential = getCredentials().find(
      (item) =>
        item.username === username.trim().toLowerCase() && item.password === password.trim()
    );
    const user = users.find((item) => item.id === credential?.userId);

    if (!user) {
      setError("Login ou senha invalido.");
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    onSuccess?.();

    if (!onSuccess) {
      router.push(redirectTo);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-zinc-950 text-white">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <p className="text-lg font-black tracking-tight">Agende sua consulta</p>
        </div>
        <p className="text-sm font-bold text-emerald-700">Acesso seguro</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Faça o Login</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Informe seu usuario e senha para continuar.
        </p>

        <form onSubmit={handleLogin} className="mt-8 rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-700 text-white">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">Faça o Login</p>
              <p className="text-sm text-zinc-600">Entre com seu usuario e senha</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              placeholder="Login"
              autoComplete="username"
            />
            <Input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Senha"
              type="password"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

          <Button type="submit" className="mt-4 w-full gap-2 shadow-lg shadow-emerald-900/10">
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </form>

        {showVisitorButton ? (
          <Button className="mt-6" variant="secondary" onClick={() => router.push("/agendamento")}>
            Continuar como visitante
          </Button>
        ) : null}
      </section>
    </main>
  );
}
