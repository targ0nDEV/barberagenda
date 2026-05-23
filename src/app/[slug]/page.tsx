import { notFound } from "next/navigation";
import { PublicBookingPage } from "@/components/booking/PublicBookingPage";
import { bookings, businessHours, professional, professionals, services } from "@/lib/mock-data";

type PublicSchedulePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicSchedulePage({ params }: PublicSchedulePageProps) {
  const { slug } = await params;

  if (slug !== professional.slug) {
    notFound();
  }

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
