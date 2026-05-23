import { PublicBookingPage } from "@/components/booking/PublicBookingPage";
import { bookings, businessHours, professional, professionals, services } from "@/lib/mock-data";

export default function BookingRoutePage() {
  return (
    <PublicBookingPage
      professional={professional}
      professionals={professionals}
      services={services}
      businessHours={businessHours}
      bookings={bookings}
    />
  );
}
