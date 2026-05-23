import type { ExistingBooking } from "@/types/booking";

const BOOKINGS_STORAGE_KEY = "agende-sua-consulta-bookings";
type StoredBooking = Omit<ExistingBooking, "startsAt" | "endsAt"> & {
  startsAt: string;
  endsAt: string;
};

function serializeBooking(booking: ExistingBooking): StoredBooking {
  return {
    ...booking,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString()
  };
}

function deserializeBooking(booking: StoredBooking): ExistingBooking {
  return {
    ...booking,
    startsAt: new Date(booking.startsAt),
    endsAt: new Date(booking.endsAt)
  };
}

export function getBookings(seedBookings: ExistingBooking[]) {
  if (typeof window === "undefined") {
    return seedBookings;
  }

  const storedBookings = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);

  if (!storedBookings) {
    window.localStorage.setItem(
      BOOKINGS_STORAGE_KEY,
      JSON.stringify(seedBookings.map(serializeBooking))
    );
    return seedBookings;
  }

  try {
    return (JSON.parse(storedBookings) as StoredBooking[]).map(deserializeBooking);
  } catch {
    window.localStorage.setItem(
      BOOKINGS_STORAGE_KEY,
      JSON.stringify(seedBookings.map(serializeBooking))
    );
    return seedBookings;
  }
}

export function saveBookings(bookings: ExistingBooking[]) {
  window.localStorage.setItem(
    BOOKINGS_STORAGE_KEY,
    JSON.stringify(bookings.map(serializeBooking))
  );
  window.dispatchEvent(new Event("agende-bookings-updated"));
}

export function addBooking(seedBookings: ExistingBooking[], booking: ExistingBooking) {
  const nextBookings = [...getBookings(seedBookings), booking];
  saveBookings(nextBookings);
  return nextBookings;
}
