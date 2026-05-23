"use client";

import { useRouter } from "next/navigation";
import { CreditCard, Landmark, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addBooking, clearPendingCheckout, getPendingCheckout } from "@/lib/booking-store";
import { bookings, professionals, services } from "@/lib/mock-data";
import { buildWhatsAppConfirmationMessage } from "@/lib/slots";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { ExistingBooking } from "@/types/booking";

export function CheckoutPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<ExistingBooking | null>(null);
  const [paymentType, setPaymentType] = useState<"PIX" | "CARD">("PIX");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const pendingBooking = getPendingCheckout();

    if (!pendingBooking) {
      setIsReady(true);
      return;
    }

    setBooking(pendingBooking);
    setIsReady(true);
  }, [router]);

  const service = useMemo(
    () => services.find((item) => item.id === booking?.serviceId),
    [booking?.serviceId]
  );
  const professional = useMemo(
    () => professionals.find((item) => item.id === booking?.professionalId),
    [booking?.professionalId]
  );

  function finishPayment() {
    if (!booking || !service || !professional) {
      return;
    }

    setIsProcessing(true);

    const paidBooking: ExistingBooking = {
      ...booking,
      paymentStatus: "PAID"
    };
    const message = buildWhatsAppConfirmationMessage({
      professionalName: professional.name,
      serviceName: service.name,
      customerName: booking.customerName ?? "Cliente",
      startsAt: booking.startsAt,
      paymentMethod: "PAY_ONLINE"
    });

    addBooking(bookings, paidBooking);
    window.localStorage.setItem(
      "agende-last-whatsapp-notification",
      JSON.stringify({
        to: professional.whatsapp,
        message,
        paymentType,
        createdAt: new Date().toISOString()
      })
    );
    clearPendingCheckout();

    setTimeout(() => router.push("/"), 900);
  }

  if (!isReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f3ec] px-5">
        <p className="text-sm text-zinc-600">Carregando checkout...</p>
      </main>
    );
  }

  if (!booking || !service || !professional) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f3ec] px-5 text-zinc-950">
        <section className="w-full max-w-md rounded-md border border-zinc-200 bg-white p-5 text-center shadow-xl">
          <h1 className="text-2xl font-black">Checkout indisponivel</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Nenhum agendamento pendente foi encontrado. Volte para a agenda e selecione um horario com pagamento antecipado.
          </p>
          <Button className="mt-5 w-full" onClick={() => router.push("/agendamento")}>
            Voltar para agendar
          </Button>
        </section>
      </main>
    );
  }

  const canPay = paymentType === "PIX" || (cardName.trim().length >= 3 && cardNumber.trim().length >= 12);

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-zinc-950">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <p className="text-sm font-bold text-emerald-700">Checkout seguro</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Pagamento antecipado</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Escolha Pix ou cartao de credito para confirmar seu agendamento.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PaymentChoice
              active={paymentType === "PIX"}
              icon={<Landmark className="h-5 w-5" />}
              title="Pix"
              subtitle="Confirmacao imediata"
              onClick={() => setPaymentType("PIX")}
            />
            <PaymentChoice
              active={paymentType === "CARD"}
              icon={<CreditCard className="h-5 w-5" />}
              title="Cartao de credito"
              subtitle="Pagamento simulado"
              onClick={() => setPaymentType("CARD")}
            />
          </div>

          {paymentType === "PIX" ? (
            <div className="mt-5 rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="font-bold">Pix copia e cola</p>
              <p className="mt-2 break-all rounded-md bg-zinc-100 p-3 text-sm font-semibold text-zinc-700">
                00020126580014br.gov.bcb.pix0136agende-sua-consulta520400005303986540{service.priceCents}5802BR5920AGENDE SUA CONSULTA
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <Input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Nome impresso no cartao" />
              <Input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="Numero do cartao" inputMode="numeric" />
            </div>
          )}

          <Button className="mt-5 w-full gap-2" disabled={!canPay || isProcessing} onClick={finishPayment}>
            <LockKeyhole className="h-4 w-4" />
            {isProcessing ? "Processando..." : "Finalizar pagamento"}
          </Button>
        </div>

        <aside className="rounded-md border border-zinc-200 bg-white p-5 shadow-xl">
          <p className="text-sm font-bold text-zinc-500">Resumo</p>
          <h2 className="mt-2 text-2xl font-black">{service.name}</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            <p>Profissional: <strong>{professional.name}</strong></p>
            <p>Cliente: <strong>{booking.customerName}</strong></p>
            <p>Valor: <strong>{formatCurrencyBRL(service.priceCents)}</strong></p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function PaymentChoice({
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
        active ? "border-emerald-700 ring-2 ring-emerald-700/15" : "border-zinc-200"
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-md bg-zinc-950 text-white">{icon}</span>
      <span className="mt-3 block font-bold">{title}</span>
      <span className="mt-1 block text-sm text-zinc-600">{subtitle}</span>
    </button>
  );
}
