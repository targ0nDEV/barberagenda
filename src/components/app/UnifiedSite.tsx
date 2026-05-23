"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import { useEffect, useState } from "react";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { SESSION_STORAGE_KEY } from "@/lib/auth-mock";

export function UnifiedSite() {
  const [view, setView] = useState<"public" | "login" | "dashboard">("public");

  useEffect(() => {
    if (window.localStorage.getItem(SESSION_STORAGE_KEY)) {
      setView("dashboard");
    }

    function handleLogout() {
      setView("public");
    }

    window.addEventListener("micro-schedule-logout", handleLogout);

    return () => window.removeEventListener("micro-schedule-logout", handleLogout);
  }, []);

  if (view === "dashboard") {
    return <RoleDashboard />;
  }

  if (view === "login") {
    return <LoginPanel onSuccess={() => setView("dashboard")} showVisitorButton={false} />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ec] text-zinc-950">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.16),transparent_30%)]" />

        <header className="relative z-10 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-zinc-950 text-white shadow-sm">
              <CalendarCheck className="h-5 w-5" />
            </span>
            Agende sua consulta
          </Link>
          <button
            type="button"
            onClick={() => setView("login")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white/90 px-4 text-sm font-bold shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-950"
          >
            Entrar
          </button>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.86fr]">
          <div className="pb-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Agenda online para profissionais
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
              Marque seu horario em poucos segundos.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              Escolha o profissional, selecione o servico, reserve o melhor horario e decida se quer pagar online ou presencialmente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/joao-barber"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Agendar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setView("login")}
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 bg-white/90 px-6 text-sm font-bold shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-950"
              >
                Acessar minha conta
              </button>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-semibold text-zinc-700 sm:grid-cols-3">
              <TrustItem label="Sem filas no WhatsApp" />
              <TrustItem label="Lembretes inteligentes" />
              <TrustItem label="Permissoes por perfil" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden rounded-md bg-white p-3 shadow-xl lg:block">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-100 text-emerald-800">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Barbeiro</p>
                  <p className="text-sm font-black">Joao Barber</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white/90 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-md bg-zinc-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-200">Proximo horario</p>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                    Confirmado
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black">Corte + barba</h2>
                <p className="mt-2 text-zinc-300">Hoje as 15:30 com Joao Barber</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <MiniStat label="Servico" value="75 min" />
                  <MiniStat label="Valor" value="R$ 75" />
                  <MiniStat label="Pago" value="Online" />
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <Feature icon={<CalendarCheck className="h-5 w-5" />} title="Agendamento rapido" />
                <Feature icon={<Clock className="h-5 w-5" />} title="Horarios livres em tempo real" />
                <Feature icon={<CreditCard className="h-5 w-5" />} title="Pagamento online ou presencial" />
                <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Dashboard por hierarquia" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
      <span>{label}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-3">
      <p className="text-[11px] font-semibold uppercase text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-800">
        {icon}
      </span>
      <p className="font-bold">{title}</p>
    </div>
  );
}
