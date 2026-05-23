"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Banknote, CalendarDays, Check, Clock, CreditCard, Scissors, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addBooking, getBookings, savePendingCheckout } from "@/lib/booking-store";
import { buildWhatsAppConfirmationMessage, getAvailableSlots } from "@/lib/slots";
import { cn, formatCurrencyBRL, onlyDigits } from "@/lib/utils";
import type {
  BusinessHoursRule,
  ExistingBooking,
  ProfessionalPublicProfile,
  ServiceSummary
} from "@/types/booking";

type PublicBookingPageProps = {
  professional: ProfessionalPublicProfile;
  professionals: ProfessionalPublicProfile[];
  services: ServiceSummary[];
  businessHours: BusinessHoursRule[];
  bookings: ExistingBooking[];
};

export function PublicBookingPage({
  professional,
  professionals,
  services,
  businessHours,
  bookings
}: PublicBookingPageProps) {
  const router = useRouter();
  const days = useMemo(() => Array.from({ length: 10 }, (_, index) => addDays(new Date(), index)), []);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(professional.id);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSlotIso, setSelectedSlotIso] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PAY_ONLINE" | "PAY_IN_PERSON">("PAY_IN_PERSON");
  const [bookingFinished, setBookingFinished] = useState(false);
  const [currentBookings, setCurrentBookings] = useState(bookings);

  useEffect(() => {
    setCurrentBookings(getBookings(bookings));
  }, [bookings]);

  const selectedProfessional =
    professionals.find((barber) => barber.id === selectedProfessionalId) ?? professional;
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const selectedProfessionalBookings = useMemo(
    () => currentBookings.filter((booking) => booking.professionalId === selectedProfessional.id),
    [currentBookings, selectedProfessional.id]
  );

  const availableSlots = useMemo(() => {
    if (!selectedService) {
      return [];
    }

    return getAvailableSlots({
      date: selectedDay,
      serviceDurationMin: selectedService.durationMin,
      slotIntervalMin: selectedProfessional.slotInterval,
      businessHours,
      bookings: selectedProfessionalBookings
    });
  }, [
    businessHours,
    selectedDay,
    selectedProfessional.slotInterval,
    selectedProfessionalBookings,
    selectedService
  ]);

  const selectedSlot = availableSlots.find((slot) => slot.startsAt.toISOString() === selectedSlotIso);
  const canConfirm =
    Boolean(selectedService && selectedSlot && customerName.trim().length >= 2) &&
    onlyDigits(customerPhone).length >= 10;

  function handleConfirm() {
    if (!selectedService || !selectedSlot || !canConfirm) {
      return;
    }

    const message = buildWhatsAppConfirmationMessage({
      professionalName: selectedProfessional.name,
      serviceName: selectedService.name,
      customerName: customerName.trim(),
      startsAt: selectedSlot.startsAt,
      paymentMethod
    });
    window.localStorage.setItem(
      "agende-last-whatsapp-notification",
      JSON.stringify({
        to: selectedProfessional.whatsapp,
        message,
        createdAt: new Date().toISOString()
      })
    );

    const bookingToCreate: ExistingBooking = {
      id: `book_${Date.now()}`,
      professionalId: selectedProfessional.id,
      serviceId: selectedService.id,
      customerName: customerName.trim(),
      customerPhone: onlyDigits(customerPhone),
      startsAt: selectedSlot.startsAt,
      endsAt: selectedSlot.endsAt,
      status: "CONFIRMED",
      paymentMethod,
      paymentStatus: paymentMethod === "PAY_ONLINE" ? "PAID" : "PENDING",
      totalAmountCents: selectedService.priceCents
    };

    if (paymentMethod === "PAY_ONLINE") {
      savePendingCheckout(bookingToCreate);
      router.push("/checkout");
      return;
    }

    const nextBookings = addBooking(bookings, bookingToCreate);

    setCurrentBookings(nextBookings);
    setBookingFinished(true);
    setTimeout(() => router.push("/"), 1400);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      {selectedProfessional.photoUrl ? (
        <Image
          src={selectedProfessional.photoUrl}
          alt={selectedProfessional.name}
          fill
          priority
          className="fixed inset-0 z-0 object-cover opacity-45"
          sizes="100vw"
        />
      ) : null}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/50 to-zinc-950/80" />

      <section className="relative z-10">
        <div className="mx-auto max-w-md px-5 pb-5 pt-10 text-white">
          <p className="text-sm font-medium text-emerald-100">{selectedProfessional.specialty}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{selectedProfessional.name}</h1>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-md px-5 pb-28 pt-2">
        <div className="space-y-7">
          <StepHeader icon={<UserRound className="h-4 w-4" />} title="Escolha o barbeiro" />
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {professionals.map((barber) => {
              const selected = barber.id === selectedProfessional.id;

              return (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setSelectedProfessionalId(barber.id);
                    setSelectedSlotIso("");
                    setBookingFinished(false);
                  }}
                  className={cn(
                    "w-28 shrink-0 rounded-md border bg-white p-2 text-left shadow-sm transition",
                    selected ? "border-primary ring-2 ring-primary/15" : "border-border"
                  )}
                >
                  <span className="relative block h-20 overflow-hidden rounded-md bg-zinc-200">
                    {barber.photoUrl ? (
                      <Image
                        src={barber.photoUrl}
                        alt={barber.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : null}
                    {selected ? (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primaryForeground">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block truncate text-sm font-semibold">{barber.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-600">{barber.specialty}</span>
                </button>
              );
            })}
          </div>

          <StepHeader icon={<Scissors className="h-4 w-4" />} title="Escolha o servico" />
          <div className="grid gap-3">
            {services.map((service) => {
              const selected = service.id === selectedServiceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setSelectedSlotIso("");
                    setBookingFinished(false);
                  }}
                  className={cn(
                    "rounded-md border bg-white p-4 text-left shadow-sm transition",
                    selected ? "border-primary ring-2 ring-primary/15" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="mt-1 text-sm leading-5 text-zinc-600">{service.description}</p>
                    </div>
                    {selected ? (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primaryForeground">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-zinc-700">
                    <span>{formatCurrencyBRL(service.priceCents)}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{service.durationMin} min</span>
                  </div>
                </button>
              );
            })}
          </div>

          <StepHeader icon={<CalendarDays className="h-4 w-4" />} title="Escolha o dia" />
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {days.map((day) => {
              const selected = isSameDay(day, selectedDay);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedSlotIso("");
                    setBookingFinished(false);
                  }}
                  className={cn(
                    "h-20 w-16 shrink-0 rounded-md border text-center shadow-sm transition",
                    selected ? "border-primary bg-primary text-primaryForeground" : "border-border bg-white"
                  )}
                >
                  <span className="block text-xs capitalize">
                    {format(day, "EEE", { locale: ptBR })}
                  </span>
                  <span className="mt-1 block text-2xl font-bold">{format(day, "dd")}</span>
                  <span className="block text-xs capitalize">{format(day, "MMM", { locale: ptBR })}</span>
                </button>
              );
            })}
          </div>

          <StepHeader icon={<Clock className="h-4 w-4" />} title="Escolha o horario" />
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const selected = slot.startsAt.toISOString() === selectedSlotIso;

                return (
                  <button
                    key={slot.startsAt.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedSlotIso(slot.startsAt.toISOString());
                      setBookingFinished(false);
                    }}
                    className={cn(
                      "h-11 rounded-md border text-sm font-semibold shadow-sm transition",
                      selected
                        ? "border-primary bg-primary text-primaryForeground"
                        : "border-border bg-white text-foreground"
                    )}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-white p-4 text-sm text-zinc-600">
              Nao ha horarios livres para este dia. Escolha outra data.
            </div>
          )}

          <div className="space-y-3">
            <Input
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
                setBookingFinished(false);
              }}
              placeholder="Seu nome"
              autoComplete="name"
            />
            <Input
              value={customerPhone}
              onChange={(event) => {
                setCustomerPhone(event.target.value);
                setBookingFinished(false);
              }}
              placeholder="WhatsApp com DDD"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <StepHeader icon={<CreditCard className="h-4 w-4" />} title="Pagamento" />
          <div className="grid grid-cols-2 gap-3">
            <PaymentOption
              active={paymentMethod === "PAY_IN_PERSON"}
              icon={<Banknote className="h-5 w-5" />}
              title="Presencial"
              subtitle="Pague no local"
              onClick={() => {
                setPaymentMethod("PAY_IN_PERSON");
                setBookingFinished(false);
              }}
            />
            <PaymentOption
              active={paymentMethod === "PAY_ONLINE"}
              icon={<CreditCard className="h-5 w-5" />}
              title="Antecipado"
              subtitle="Simular checkout"
              onClick={() => {
                setPaymentMethod("PAY_ONLINE");
                setBookingFinished(false);
              }}
            />
          </div>

          {bookingFinished ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-950">Agendamento Finalizado</p>
              <p className="mt-2 text-sm leading-5 text-emerald-900">
                Seu horario está confirmado caso haja algum imprevisto nos avise, em caso de desistência e/ou atraso nos informar com antecedência.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {selectedService ? `${selectedService.name} com ${selectedProfessional.name}` : "Selecione um servico"}
            </p>
            <p className="truncate text-xs text-zinc-600">
              {selectedSlot
                ? `${format(selectedSlot.startsAt, "dd/MM")} as ${format(selectedSlot.startsAt, "HH:mm")} - ${
                    paymentMethod === "PAY_ONLINE" ? "antecipado" : "presencial"
                  }`
                : "Escolha um horario livre"}
            </p>
          </div>
          <Button className="w-36" disabled={!canConfirm} onClick={handleConfirm}>
            {paymentMethod === "PAY_ONLINE" ? "Pagar" : "Confirmar"}
          </Button>
        </div>
      </footer>
    </main>
  );
}

function PaymentOption({
  active,
  icon,
  title,
  subtitle,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border bg-white p-4 text-left shadow-sm transition",
        active ? "border-primary ring-2 ring-primary/15" : "border-border"
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-zinc-950 text-white">{icon}</span>
        {active ? <Check className="h-5 w-5 text-primary" /> : null}
      </span>
      <span className="mt-3 block text-sm font-bold">{title}</span>
      <span className="mt-0.5 block text-xs text-zinc-600">{subtitle}</span>
    </button>
  );
}

function StepHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-zinc-950">{icon}</span>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
  );
}
