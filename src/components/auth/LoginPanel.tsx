"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SESSION_STORAGE_KEY,
  getCredentials,
  getUsers,
  isAllowedEmail,
  registerUser
} from "@/lib/auth-mock";

type LoginPanelProps = {
  onSuccess?: () => void;
  redirectTo?: string;
  showVisitorButton?: boolean;
};

export function LoginPanel({ onSuccess, redirectTo = "/dashboard", showVisitorButton = true }: LoginPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({
    password: "",
    fullName: "",
    nickname: "",
    phone: "",
    email: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const credential = getCredentials().find(
      (item) =>
        item.username === username.trim().toLowerCase() && item.password === password.trim()
    );
    const user = getUsers().find((item) => item.id === credential?.userId);

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

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const phoneDigits = registerForm.phone.replace(/\D/g, "");

    setError("");
    setSuccess("");

    if (
      registerForm.password.trim().length < 6 ||
      registerForm.fullName.trim().length < 3 ||
      registerForm.nickname.trim().length < 2
    ) {
      setError("Preencha senha, nome completo e apelido corretamente.");
      return;
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError("Informe um celular valido com DDD.");
      return;
    }

    if (!isAllowedEmail(registerForm.email)) {
      setError("Informe um e-mail real e valido.");
      return;
    }

    const result = registerUser({
      ...registerForm,
      phone: phoneDigits,
      email: registerForm.email.trim()
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setMode("login");
    setUsername(registerForm.email.trim().toLowerCase());
    setRegisterForm({
      password: "",
      fullName: "",
      nickname: "",
      phone: "",
      email: ""
    });
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
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          {mode === "login" ? "Faca o Login" : "Registrar-se"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {mode === "login"
            ? "Informe seu e-mail ou login e senha para continuar."
            : "Crie uma conta de usuario para realizar agendamentos."}
        </p>

        <div className="mt-8 grid grid-cols-2 rounded-md bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`h-10 rounded-md text-sm font-bold transition ${
              mode === "login" ? "bg-white shadow-sm" : "text-zinc-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`h-10 rounded-md text-sm font-bold transition ${
              mode === "register" ? "bg-white shadow-sm" : "text-zinc-600"
            }`}
          >
            Registrar-se
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-700 text-white">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">Faca o Login</p>
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
                placeholder="E-mail ou login"
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
            {success ? <p className="mt-3 text-sm font-semibold text-emerald-700">{success}</p> : null}

            <Button type="submit" className="mt-4 w-full gap-2 shadow-lg shadow-emerald-900/10">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-700 text-white">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">Criar conta</p>
                <p className="text-sm text-zinc-600">A hierarquia padrao sera Usuario</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <Input value={registerForm.password} onChange={(event) => setRegisterForm((form) => ({ ...form, password: event.target.value }))} placeholder="Senha" type="password" autoComplete="new-password" />
              <Input value={registerForm.fullName} onChange={(event) => setRegisterForm((form) => ({ ...form, fullName: event.target.value }))} placeholder="Nome completo" autoComplete="name" />
              <Input value={registerForm.nickname} onChange={(event) => setRegisterForm((form) => ({ ...form, nickname: event.target.value }))} placeholder="Apelido" />
              <Input value={registerForm.phone} onChange={(event) => setRegisterForm((form) => ({ ...form, phone: event.target.value }))} placeholder="Telefone celular com DDD" inputMode="tel" autoComplete="tel" />
              <Input value={registerForm.email} onChange={(event) => setRegisterForm((form) => ({ ...form, email: event.target.value }))} placeholder="E-mail" type="email" autoComplete="email" />
            </div>

            {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

            <Button type="submit" className="mt-4 w-full gap-2 shadow-lg shadow-emerald-900/10">
              <UserPlus className="h-4 w-4" />
              Registrar-se
            </Button>
          </form>
        )}

        {showVisitorButton ? (
          <Button className="mt-6" variant="secondary" onClick={() => router.push("/agendamento")}>
            Continuar como visitante
          </Button>
        ) : null}
      </section>
    </main>
  );
}
