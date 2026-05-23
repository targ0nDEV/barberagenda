"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Sparkles,
  UserPlus
} from "lucide-react";
import { useEffect, useState } from "react";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { SESSION_STORAGE_KEY } from "@/lib/auth-mock";

const showcase = [
  {
    title: "Corte classico",
    barber: "Joao Barber",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Fade navalhado",
    barber: "Rafa Fade",
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Barba premium",
    barber: "Diego Studio",
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80"
  }
];

export function UnifiedSite() {
  const [view, setView] = useState<"public" | "login" | "dashboard">("public");
  const [activeSlide, setActiveSlide] = useState(0);

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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % showcase.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  function handleScheduleClick() {
    if (window.localStorage.getItem(SESSION_STORAGE_KEY)) {
      window.location.href = "/agendamento";
      return;
    }

    setView("login");
  }

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
            Login / Registrar-se
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
              Entre na sua conta ou registre-se para escolher barbeiro, servico, dia e horario livre.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleScheduleClick}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Agendar agora
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("login")}
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 bg-white/90 px-6 text-sm font-bold shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-950"
              >
                Login / Registrar-se
              </button>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              <Feature icon={<CalendarCheck className="h-5 w-5" />} title="Agendamento rapido" />
              <Feature icon={<Clock className="h-5 w-5" />} title="Horarios livres em tempo real" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-md border border-zinc-200 bg-white/90 p-4 shadow-2xl backdrop-blur">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-zinc-950">
                {showcase.map((item, index) => (
                  <Image
                    key={item.title}
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                      index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-sm font-bold text-emerald-200">{showcase[activeSlide].barber}</p>
                  <h2 className="mt-1 text-3xl font-black">{showcase[activeSlide].title}</h2>
                  <div className="mt-4 flex gap-2">
                    {showcase.map((item, index) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`h-2 rounded-full transition ${
                          index === activeSlide ? "w-8 bg-emerald-300" : "w-2 bg-white/50"
                        }`}
                        aria-label={`Ver ${item.title}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setView("login")}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                <UserPlus className="h-4 w-4" />
                Login / Registrar-se
              </button>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Joao", "Rafa", "Diego"].map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-10 rounded-md border text-xs font-bold transition ${
                      index === activeSlide
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
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
