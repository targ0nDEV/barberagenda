"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  ChevronDown,
  Home,
  LogOut,
  Repeat2,
  ShieldCheck,
  UserCog,
  UserRound,
  Scissors,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBookings, saveBookings } from "@/lib/booking-store";
import { buildSlug, getProfessionals, saveProfessionals } from "@/lib/professional-store";
import {
  SESSION_STORAGE_KEY,
  changePassword,
  getRoleLabel,
  getUsernameByUserId,
  getUsers,
  saveRegisteredUsers
} from "@/lib/auth-mock";
import { bookings as initialBookings, professionals, services } from "@/lib/mock-data";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { AppUser, ExistingBooking, ProfessionalPublicProfile } from "@/types/booking";

export function RoleDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [accounts, setAccounts] = useState<AppUser[]>([]);
  const [currentProfessionals, setCurrentProfessionals] = useState<ProfessionalPublicProfile[]>(professionals);
  const [adminTab, setAdminTab] = useState<"revenue" | "accounts" | "barbers">("revenue");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityOpen, setSecurityOpen] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [barberMessage, setBarberMessage] = useState("");
  const [barberForm, setBarberForm] = useState({
    name: "",
    specialty: "",
    photoUrl: "",
    whatsapp: ""
  });

  useEffect(() => {
    const storedUser = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as AppUser;
    setUser(parsedUser);
    setDisplayName(parsedUser.name);
    setBookings(getBookings(initialBookings));
    setAccounts(getUsers());
    setCurrentProfessionals(getProfessionals());

    function handleBookingsUpdate() {
      setBookings(getBookings(initialBookings));
    }

    function handleUsersUpdate() {
      setAccounts(getUsers());
    }

    function handleProfessionalsUpdate() {
      setCurrentProfessionals(getProfessionals());
    }

    window.addEventListener("agende-bookings-updated", handleBookingsUpdate);
    window.addEventListener("agende-users-updated", handleUsersUpdate);
    window.addEventListener("agende-professionals-updated", handleProfessionalsUpdate);

    return () => {
      window.removeEventListener("agende-bookings-updated", handleBookingsUpdate);
      window.removeEventListener("agende-users-updated", handleUsersUpdate);
      window.removeEventListener("agende-professionals-updated", handleProfessionalsUpdate);
    };
  }, [router]);

  const visibleBookings = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "ADMIN") {
      return bookings.filter(
        (booking) => booking.paymentStatus !== "PAID" && booking.status !== "CANCELLED"
      );
    }

    if (user.role === "BARBER") {
      return bookings.filter((booking) => booking.professionalId === user.professionalId);
    }

    return bookings.filter(
      (booking) =>
        booking.customerUserId === user.id ||
        (Boolean(user.phone) && booking.customerPhone === user.phone)
    );
  }, [bookings, user]);

  const revenueCents = bookings
    .filter((booking) => booking.paymentStatus === "PAID")
    .reduce((total, booking) => total + (booking.totalAmountCents ?? 0), 0);
  const pendingInPersonCents = bookings
    .filter(
      (booking) =>
        booking.paymentMethod === "PAY_IN_PERSON" &&
        booking.paymentStatus !== "PAID" &&
        booking.status !== "CANCELLED"
    )
    .reduce((total, booking) => total + (booking.totalAmountCents ?? 0), 0);

  function logout() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event("micro-schedule-logout"));
    router.push("/");
  }

  function reassignBooking(bookingId: string, professionalId: string) {
    setBookings((currentBookings) => {
      const nextBookings = currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, professionalId } : booking
      );

      saveBookings(nextBookings);
      return nextBookings;
    });
  }

  function markBookingAsPaid(bookingId: string) {
    setBookings((currentBookings) => {
      const nextBookings = currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, paymentStatus: "PAID" as const } : booking
      );

      saveBookings(nextBookings);
      return nextBookings;
    });
  }

  function cancelBooking(bookingId: string) {
    setBookings((currentBookings) => {
      const nextBookings = currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "CANCELLED" as const } : booking
      );

      saveBookings(nextBookings);
      return nextBookings;
    });
  }

  function changeAccountRole(accountId: string, role: AppUser["role"]) {
    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.map((account) => {
        if (account.id !== accountId) {
          return account;
        }

        const availableProfessional = currentProfessionals.find(
          (professional) =>
            !currentAccounts.some(
              (candidate) =>
                candidate.id !== accountId && candidate.professionalId === professional.id
            )
        );

        return {
          ...account,
          role,
          professionalId:
            role === "BARBER"
              ? account.professionalId ?? availableProfessional?.id ?? currentProfessionals[0]?.id
              : undefined
        };
      });

      saveRegisteredUsers(nextAccounts);
      return nextAccounts;
    });
  }

  function deleteAccount(accountId: string) {
    if (accountId === user?.id) {
      setAccountMessage("Voce nao pode excluir a propria conta logada.");
      return;
    }

    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.filter((account) => account.id !== accountId);
      saveRegisteredUsers(nextAccounts);
      return nextAccounts;
    });
    setAccountMessage("Conta excluida com sucesso.");
  }

  function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const username = getUsernameByUserId(user.id);

    if (!username) {
      setAccountMessage("Conta sem login configurado no MVP.");
      return;
    }

    if (newPassword.trim().length < 6) {
      setAccountMessage("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    changePassword(username, newPassword.trim());
    setNewPassword("");
    setAccountMessage("Senha alterada com sucesso.");
  }

  function handleNameChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (displayName.trim().length < 2) {
      setAccountMessage("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    const updatedUser = {
      ...user,
      name: displayName.trim()
    };

    setUser(updatedUser);
    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.map((account) =>
        account.id === updatedUser.id ? updatedUser : account
      );
      saveRegisteredUsers(nextAccounts);
      return nextAccounts;
    });
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    setAccountMessage("Nome alterado com sucesso.");
  }

  function addBarber(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (barberForm.name.trim().length < 2 || barberForm.specialty.trim().length < 2) {
      setBarberMessage("Informe nome e especialidade do barbeiro.");
      return;
    }

    const slugBase = buildSlug(barberForm.name);
    const barber: ProfessionalPublicProfile = {
      id: `prof_${Date.now()}`,
      name: barberForm.name.trim(),
      slug: currentProfessionals.some((item) => item.slug === slugBase)
        ? `${slugBase}-${Date.now()}`
        : slugBase,
      specialty: barberForm.specialty.trim(),
      photoUrl: barberForm.photoUrl.trim() || undefined,
      whatsapp: barberForm.whatsapp.replace(/\D/g, "") || "5516997483100",
      slotInterval: 30,
      worksSaturday: false,
      worksSunday: false
    };
    const nextProfessionals = [...currentProfessionals, barber];

    setCurrentProfessionals(nextProfessionals);
    saveProfessionals(nextProfessionals);
    setBarberForm({ name: "", specialty: "", photoUrl: "", whatsapp: "" });
    setBarberMessage("Barbeiro cadastrado com sucesso.");
  }

  function updateWeekend(professionalId: string, field: "worksSaturday" | "worksSunday", value: boolean) {
    const nextProfessionals = currentProfessionals.map((professional) =>
      professional.id === professionalId ? { ...professional, [field]: value } : professional
    );

    setCurrentProfessionals(nextProfessionals);
    saveProfessionals(nextProfessionals);
  }

  function deleteBarber(professionalId: string) {
    if (currentProfessionals.length <= 1) {
      setBarberMessage("Mantenha pelo menos um barbeiro cadastrado.");
      return;
    }

    const hasActiveBookings = bookings.some(
      (booking) =>
        booking.professionalId === professionalId &&
        booking.status !== "CANCELLED" &&
        booking.status !== "COMPLETED"
    );

    if (hasActiveBookings) {
      setBarberMessage("Transfira ou cancele os agendamentos ativos antes de excluir este barbeiro.");
      return;
    }

    const nextProfessionals = currentProfessionals.filter(
      (professional) => professional.id !== professionalId
    );

    setCurrentProfessionals(nextProfessionals);
    saveProfessionals(nextProfessionals);

    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.map((account) =>
        account.professionalId === professionalId
          ? { ...account, role: "USER" as const, professionalId: undefined }
          : account
      );
      saveRegisteredUsers(nextAccounts);
      return nextAccounts;
    });
    setBarberMessage("Barbeiro excluido com sucesso.");
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-zinc-600">Carregando acesso...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">{getRoleLabel(user.role)}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Ola, {user.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/?inicio=1")} className="gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
            <Button variant="secondary" onClick={() => router.push("/agendamento")}>
              Novo agendamento
            </Button>
            <Button variant="ghost" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MetricCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Agendamentos visiveis"
            value={visibleBookings.length.toString()}
          />
          <MetricCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Pagos"
            value={visibleBookings.filter((booking) => booking.paymentStatus === "PAID").length.toString()}
          />
          <MetricCard
            icon={user.role === "ADMIN" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            label={user.role === "ADMIN" ? "Lucro online total" : "Perfil"}
            value={user.role === "ADMIN" ? formatCurrencyBRL(revenueCents) : getRoleLabel(user.role)}
          />
        </div>

        <section className="mt-5 rounded-md border border-border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setSecurityOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
            aria-expanded={securityOpen}
          >
            <div>
              <h2 className="font-bold">Alterar Senha/Nome</h2>
              <p className="mt-1 text-sm text-zinc-600">Atualize seus dados de acesso.</p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-zinc-500 transition",
                securityOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </button>

          {securityOpen ? (
            <div className="border-t border-border p-4">
              <div className="grid gap-3 lg:grid-cols-2">
                <form onSubmit={handleNameChange} className="flex w-full flex-col gap-2 md:flex-row">
                  <Input
                    value={displayName}
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      setAccountMessage("");
                    }}
                    placeholder="Nome"
                    autoComplete="name"
                    className="md:flex-1"
                  />
                  <Button type="submit" variant="secondary" className="md:w-36">
                    Alterar nome
                  </Button>
                </form>
                <form onSubmit={handlePasswordChange} className="flex w-full flex-col gap-2 md:flex-row">
                  <Input
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setAccountMessage("");
                    }}
                    type="password"
                    placeholder="Nova senha"
                    autoComplete="new-password"
                    className="md:flex-1"
                  />
                  <Button type="submit" className="md:w-36">
                    Trocar senha
                  </Button>
                </form>
              </div>
              {accountMessage ? (
                <p className="mt-3 text-sm font-semibold text-emerald-700">{accountMessage}</p>
              ) : null}
            </div>
          ) : null}
        </section>

        {user.role === "ADMIN" ? (
          <section className="mt-5 rounded-md border border-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {adminTab === "revenue" ? (
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                ) : adminTab === "barbers" ? (
                  <Scissors className="h-5 w-5 text-emerald-700" />
                ) : (
                  <UserCog className="h-5 w-5 text-emerald-700" />
                )}
                <h2 className="font-bold">Administracao</h2>
              </div>
              <div className="grid grid-cols-3 rounded-md bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => setAdminTab("revenue")}
                  className={cn(
                    "h-10 rounded-md px-3 text-sm font-bold transition",
                    adminTab === "revenue" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600"
                  )}
                >
                  Lucro
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("accounts")}
                  className={cn(
                    "h-10 rounded-md px-3 text-sm font-bold transition",
                    adminTab === "accounts" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600"
                  )}
                >
                  Contas
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("barbers")}
                  className={cn(
                    "h-10 rounded-md px-3 text-sm font-bold transition",
                    adminTab === "barbers" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600"
                  )}
                >
                  Barbeiros
                </button>
              </div>
            </div>

            {adminTab === "revenue" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <AdminRevenueItem label="Recebido" value={formatCurrencyBRL(revenueCents)} />
                <AdminRevenueItem
                  label="A receber presencial"
                  value={formatCurrencyBRL(pendingInPersonCents)}
                />
                <AdminRevenueItem
                  label="Ticket medio"
                  value={formatCurrencyBRL(
                    bookings.length
                      ? bookings.reduce((total, booking) => total + (booking.totalAmountCents ?? 0), 0) /
                          bookings.length
                      : 0
                  )}
                />
              </div>
            ) : adminTab === "accounts" ? (
              <AccountsAdminPanel
                accounts={accounts}
                currentUserId={user.id}
                onChangeRole={changeAccountRole}
                onDeleteAccount={deleteAccount}
              />
            ) : (
              <BarbersAdminPanel
                professionals={currentProfessionals}
                form={barberForm}
                message={barberMessage}
                onFormChange={setBarberForm}
                onAddBarber={addBarber}
                onUpdateWeekend={updateWeekend}
                onDeleteBarber={deleteBarber}
              />
            )}
          </section>
        ) : null}

        <section className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-emerald-700" />
            <h2 className="font-bold">Agendamentos</h2>
          </div>
          <div className="grid gap-3">
            {visibleBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                professionals={currentProfessionals}
                canReassign={user.role === "ADMIN" || user.role === "BARBER"}
                onReassign={reassignBooking}
                onMarkAsPaid={markBookingAsPaid}
                onCancel={cancelBooking}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function AccountsAdminPanel({
  accounts,
  currentUserId,
  onChangeRole,
  onDeleteAccount
}: {
  accounts: AppUser[];
  currentUserId: string;
  onChangeRole: (accountId: string, role: AppUser["role"]) => void;
  onDeleteAccount: (accountId: string) => void;
}) {
  return (
    <div className="mt-4 grid gap-3">
      {accounts.map((account) => (
        <article
          key={account.id}
          className="flex flex-col gap-3 rounded-md border border-border bg-zinc-50 p-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-bold">{account.name}</p>
            <p className="truncate text-sm text-zinc-600">{account.email}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{getRoleLabel(account.role)}</p>
          </div>
          <div className="grid gap-2 md:w-[460px] md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-3 gap-2">
            {(["USER", "BARBER", "ADMIN"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onChangeRole(account.id, role)}
                className={cn(
                  "h-10 rounded-md border px-2 text-xs font-bold transition",
                  account.role === role
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-border bg-white text-zinc-700"
                )}
              >
                {getRoleLabel(role)}
              </button>
            ))}
            </div>
            <button
              type="button"
              onClick={() => onDeleteAccount(account.id)}
              disabled={account.id === currentUserId}
              className="h-10 rounded-md border border-red-200 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Excluir
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function BarbersAdminPanel({
  professionals,
  form,
  message,
  onFormChange,
  onAddBarber,
  onUpdateWeekend,
  onDeleteBarber
}: {
  professionals: ProfessionalPublicProfile[];
  form: {
    name: string;
    specialty: string;
    photoUrl: string;
    whatsapp: string;
  };
  message: string;
  onFormChange: React.Dispatch<
    React.SetStateAction<{
      name: string;
      specialty: string;
      photoUrl: string;
      whatsapp: string;
    }>
  >;
  onAddBarber: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateWeekend: (
    professionalId: string,
    field: "worksSaturday" | "worksSunday",
    value: boolean
  ) => void;
  onDeleteBarber: (professionalId: string) => void;
}) {
  return (
    <div className="mt-4 grid gap-4">
      <form onSubmit={onAddBarber} className="rounded-md border border-border bg-zinc-50 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={form.name}
            onChange={(event) => onFormChange((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nome do barbeiro"
            autoComplete="name"
          />
          <Input
            value={form.specialty}
            onChange={(event) =>
              onFormChange((current) => ({ ...current, specialty: event.target.value }))
            }
            placeholder="Especialidade"
          />
          <Input
            value={form.whatsapp}
            onChange={(event) =>
              onFormChange((current) => ({ ...current, whatsapp: event.target.value }))
            }
            placeholder="WhatsApp com DDD"
            inputMode="tel"
            autoComplete="tel"
          />
          <Input
            value={form.photoUrl}
            onChange={(event) =>
              onFormChange((current) => ({ ...current, photoUrl: event.target.value }))
            }
            placeholder="URL da foto"
            type="url"
          />
        </div>
        <Button type="submit" className="mt-3 w-full md:w-auto">
          Cadastrar barbeiro
        </Button>
        {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      </form>

      <div className="grid gap-3">
        {professionals.map((professional) => (
          <article
            key={professional.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-zinc-50 p-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-bold">{professional.name}</p>
              <p className="truncate text-sm text-zinc-600">{professional.specialty}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                Intervalos de {professional.slotInterval} min
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <WeekendToggle
                label="Agenda aos sabados"
                checked={Boolean(professional.worksSaturday)}
                onChange={(value) => onUpdateWeekend(professional.id, "worksSaturday", value)}
              />
              <WeekendToggle
                label="Agenda aos domingos"
                checked={Boolean(professional.worksSunday)}
                onChange={(value) => onUpdateWeekend(professional.id, "worksSunday", value)}
              />
              <button
                type="button"
                onClick={() => onDeleteBarber(professional.id)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function WeekendToggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-white px-3 text-sm font-bold text-zinc-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-700"
      />
    </label>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-700">{icon}</div>
      <p className="mt-3 text-sm text-zinc-600">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AdminRevenueItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 p-3">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function BookingRow({
  booking,
  professionals,
  canReassign,
  onReassign,
  onMarkAsPaid,
  onCancel
}: {
  booking: ExistingBooking;
  professionals: ProfessionalPublicProfile[];
  canReassign: boolean;
  onReassign: (bookingId: string, professionalId: string) => void;
  onMarkAsPaid: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
}) {
  const professional = professionals.find((item) => item.id === booking.professionalId);
  const service = services.find((item) => item.id === booking.serviceId);

  return (
    <article className="rounded-md border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold">{service?.name ?? "Servico"}</p>
          <p className="mt-1 text-sm text-zinc-600">
            {format(booking.startsAt, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })} - {professional?.name}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {booking.customerName ?? "Cliente"} - {booking.customerPhone ?? "sem telefone"}
          </p>
        </div>
        <div className="flex flex-col gap-2 md:min-w-64">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold">
              Presencial
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-semibold",
                booking.paymentStatus === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              )}
            >
              {booking.paymentStatus === "PAID" ? "Pago" : "Pendente"}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold">
              {formatCurrencyBRL(booking.totalAmountCents ?? 0)}
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-semibold",
                booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-emerald-100 text-emerald-800"
              )}
            >
              {booking.status === "CANCELLED" ? "Cancelado" : "Ativo"}
            </span>
          </div>
          {canReassign ? (
            <>
              {booking.paymentMethod === "PAY_IN_PERSON" &&
              booking.paymentStatus !== "PAID" &&
              booking.status !== "CANCELLED" ? (
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(booking.id)}
                  className="h-11 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Marcar como Pago
                </button>
              ) : null}
              {booking.status !== "CANCELLED" ? (
                <button
                  type="button"
                  onClick={() => onCancel(booking.id)}
                  className="h-11 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  Cancelar agendamento
                </button>
              ) : null}
              <select
                value={booking.professionalId}
                onChange={(event) => onReassign(booking.id, event.target.value)}
                disabled={booking.status === "CANCELLED"}
                className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold outline-none focus:border-primary"
                aria-label="Alterar barbeiro do agendamento"
              >
                {professionals.map((item) => (
                  <option key={item.id} value={item.id}>
                    Transferir para {item.name}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
