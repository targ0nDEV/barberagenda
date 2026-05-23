"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  LogOut,
  Repeat2,
  ShieldCheck,
  UserCog,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBookings, saveBookings } from "@/lib/booking-store";
import {
  SESSION_STORAGE_KEY,
  changePassword,
  getRoleLabel,
  getUsernameByUserId,
  getPendingEmailConfirmations,
  getUsers,
  type PendingEmailConfirmation,
  saveRegisteredUsers
} from "@/lib/auth-mock";
import { bookings as initialBookings, professionals, services } from "@/lib/mock-data";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { AppUser, ExistingBooking } from "@/types/booking";

export function RoleDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [accounts, setAccounts] = useState<AppUser[]>([]);
  const [adminTab, setAdminTab] = useState<"revenue" | "accounts">("revenue");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [pendingConfirmations, setPendingConfirmations] = useState<PendingEmailConfirmation[]>([]);

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
    setPendingConfirmations(getPendingEmailConfirmations());

    function handleBookingsUpdate() {
      setBookings(getBookings(initialBookings));
    }

    function handleUsersUpdate() {
      setAccounts(getUsers());
      setPendingConfirmations(getPendingEmailConfirmations());
    }

    window.addEventListener("agende-bookings-updated", handleBookingsUpdate);
    window.addEventListener("agende-users-updated", handleUsersUpdate);

    return () => {
      window.removeEventListener("agende-bookings-updated", handleBookingsUpdate);
      window.removeEventListener("agende-users-updated", handleUsersUpdate);
    };
  }, [router]);

  const visibleBookings = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "ADMIN") {
      return bookings;
    }

    if (user.role === "BARBER") {
      return bookings.filter((booking) => booking.professionalId === user.professionalId);
    }

    return bookings.filter((booking) => booking.customerPhone === user.phone);
  }, [bookings, user]);

  const revenueCents = bookings
    .filter((booking) => booking.paymentStatus === "PAID")
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

  function changeAccountRole(accountId: string, role: AppUser["role"]) {
    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.map((account) => {
        if (account.id !== accountId) {
          return account;
        }

        const availableProfessional = professionals.find(
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
              ? account.professionalId ?? availableProfessional?.id ?? professionals[0]?.id
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
            label="Pagos online"
            value={visibleBookings.filter((booking) => booking.paymentStatus === "PAID").length.toString()}
          />
          <MetricCard
            icon={user.role === "ADMIN" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            label={user.role === "ADMIN" ? "Lucro online total" : "Perfil"}
            value={user.role === "ADMIN" ? formatCurrencyBRL(revenueCents) : getRoleLabel(user.role)}
          />
        </div>

        <section className="mt-5 rounded-md border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-bold">Conta e seguranca</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Atualize seus dados de acesso.
              </p>
            </div>
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
          </div>
          {accountMessage ? (
            <p className="mt-3 text-sm font-semibold text-emerald-700">{accountMessage}</p>
          ) : null}
        </section>

        {user.role === "ADMIN" ? (
          <section className="mt-5 rounded-md border border-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {adminTab === "revenue" ? (
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                ) : (
                  <UserCog className="h-5 w-5 text-emerald-700" />
                )}
                <h2 className="font-bold">Administracao</h2>
              </div>
              <div className="grid grid-cols-2 rounded-md bg-zinc-100 p-1">
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
              </div>
            </div>

            {adminTab === "revenue" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <AdminRevenueItem label="Recebido online" value={formatCurrencyBRL(revenueCents)} />
                <AdminRevenueItem
                  label="A receber presencial"
                  value={formatCurrencyBRL(
                    bookings
                      .filter((booking) => booking.paymentMethod === "PAY_IN_PERSON")
                      .reduce((total, booking) => total + (booking.totalAmountCents ?? 0), 0)
                  )}
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
            ) : (
              <>
                <PendingConfirmationsPanel confirmations={pendingConfirmations} />
                <AccountsAdminPanel
                  accounts={accounts}
                  currentUserId={user.id}
                  onChangeRole={changeAccountRole}
                  onDeleteAccount={deleteAccount}
                />
              </>
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
                canReassign={user.role === "ADMIN" || user.role === "BARBER"}
                onReassign={reassignBooking}
                onMarkAsPaid={markBookingAsPaid}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PendingConfirmationsPanel({
  confirmations
}: {
  confirmations: PendingEmailConfirmation[];
}) {
  return (
    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold text-amber-950">Confirmacoes de e-mail pendentes</p>
        <p className="text-sm text-amber-800">
          Contas registradas que ainda nao confirmaram o e-mail.
        </p>
      </div>

      {confirmations.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {confirmations.map((confirmation) => (
            <div
              key={confirmation.token}
              className="rounded-md border border-amber-200 bg-white p-3 text-sm"
            >
              <p className="font-bold text-zinc-950">{confirmation.email}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Criado em {new Date(confirmation.createdAt).toLocaleString("pt-BR")}
              </p>
              <a
                href={confirmation.confirmationUrl}
                className="mt-2 inline-flex text-xs font-bold text-emerald-700"
              >
                Abrir link de confirmacao
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-amber-900">
          Nenhuma confirmacao pendente no momento.
        </p>
      )}
    </div>
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
  canReassign,
  onReassign,
  onMarkAsPaid
}: {
  booking: ExistingBooking;
  canReassign: boolean;
  onReassign: (bookingId: string, professionalId: string) => void;
  onMarkAsPaid: (bookingId: string) => void;
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
          </div>
          {canReassign ? (
            <>
              {booking.paymentMethod === "PAY_IN_PERSON" && booking.paymentStatus !== "PAID" ? (
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(booking.id)}
                  className="h-11 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Marcar como Pago
                </button>
              ) : null}
              <select
                value={booking.professionalId}
                onChange={(event) => onReassign(booking.id, event.target.value)}
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
