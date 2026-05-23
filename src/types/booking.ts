export type ServiceSummary = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  durationMin: number;
};

export type ProfessionalPublicProfile = {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  photoUrl?: string;
  whatsapp?: string;
  slotInterval: number;
  worksSaturday?: boolean;
  worksSunday?: boolean;
};

export type ExistingBooking = {
  id: string;
  professionalId: string;
  serviceId?: string;
  customerName?: string;
  customerPhone?: string;
  startsAt: Date;
  endsAt: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
  paymentMethod?: "PAY_IN_PERSON";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmountCents?: number;
};

export type UserRole = "ADMIN" | "BARBER" | "USER";

export type AppUser = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  role: UserRole;
  professionalId?: string;
  emailVerified?: boolean;
};

export type BusinessHoursRule = {
  weekday: number;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
};
