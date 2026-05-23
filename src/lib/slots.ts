import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  getDay,
  isBefore,
  parse,
  set
} from "date-fns";
import type { BusinessHoursRule, ExistingBooking } from "@/types/booking";

export type AvailableSlot = {
  label: string;
  startsAt: Date;
  endsAt: Date;
};

type GetAvailableSlotsInput = {
  date: Date;
  serviceDurationMin: number;
  slotIntervalMin?: number;
  businessHours: BusinessHoursRule[];
  bookings: ExistingBooking[];
  now?: Date;
};

const BLOCKING_STATUSES = new Set(["PENDING", "CONFIRMED", "COMPLETED"]);

function applyTimeToDate(date: Date, time: string) {
  const parsed = parse(time, "HH:mm", date);

  return set(date, {
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
    seconds: 0,
    milliseconds: 0
  });
}

export function getAvailableSlots({
  date,
  serviceDurationMin,
  slotIntervalMin = 30,
  businessHours,
  bookings,
  now = new Date()
}: GetAvailableSlotsInput): AvailableSlot[] {
  const weekday = getDay(date);
  const hoursRule = businessHours.find((rule) => rule.weekday === weekday && rule.isActive);

  if (!hoursRule) {
    return [];
  }

  const opensAt = applyTimeToDate(date, hoursRule.opensAt);
  const closesAt = applyTimeToDate(date, hoursRule.closesAt);
  const lastPossibleStart = addMinutes(closesAt, -serviceDurationMin);
  const blockingBookings = bookings.filter((booking) => BLOCKING_STATUSES.has(booking.status));
  const slots: AvailableSlot[] = [];

  for (
    let cursor = opensAt;
    !isBefore(lastPossibleStart, cursor);
    cursor = addMinutes(cursor, slotIntervalMin)
  ) {
    const candidate = {
      start: cursor,
      end: addMinutes(cursor, serviceDurationMin)
    };

    if (isBefore(candidate.start, now)) {
      continue;
    }

    const hasConflict = blockingBookings.some((booking) =>
      areIntervalsOverlapping(candidate, {
        start: booking.startsAt,
        end: booking.endsAt
      })
    );

    if (!hasConflict) {
      slots.push({
        label: format(candidate.start, "HH:mm"),
        startsAt: candidate.start,
        endsAt: candidate.end
      });
    }
  }

  return slots;
}

export function buildWhatsAppConfirmationMessage(input: {
  professionalName: string;
  serviceName: string;
  customerName: string;
  startsAt: Date;
  paymentMethod?: "PAY_ONLINE" | "PAY_IN_PERSON";
}) {
  const day = format(input.startsAt, "dd/MM/yyyy");
  const time = format(input.startsAt, "HH:mm");
  const paymentText =
    input.paymentMethod === "PAY_ONLINE"
      ? "Pagamento antecipado confirmado pelo site."
      : "Pagamento combinado para ser feito presencialmente.";

  return `Oi, ${input.customerName}! Seu agendamento com ${input.professionalName} foi confirmado: ${input.serviceName} em ${day} as ${time}. ${paymentText} Responda esta mensagem se precisar remarcar.`;
}
