import { addDays, set } from "date-fns";
import type {
  BusinessHoursRule,
  ExistingBooking,
  AppUser,
  ProfessionalPublicProfile,
  ServiceSummary
} from "@/types/booking";

const today = new Date();
const tomorrow = addDays(today, 1);

export const professionals: ProfessionalPublicProfile[] = [
  {
    id: "prof_joao",
    name: "Joao Barber",
    slug: "joao-barber",
    specialty: "Cortes classicos",
    photoUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
    whatsapp: "5516997483100",
    slotInterval: 30
  },
  {
    id: "prof_rafa",
    name: "Rafa Fade",
    slug: "rafa-fade",
    specialty: "Degrade e navalhado",
    photoUrl:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
    whatsapp: "5516997483100",
    slotInterval: 30
  },
  {
    id: "prof_diego",
    name: "Diego Studio",
    slug: "diego-studio",
    specialty: "Barba premium",
    photoUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80",
    whatsapp: "5516997483100",
    slotInterval: 30
  },
  {
    id: "prof_caio",
    name: "Caio Cortes",
    slug: "caio-cortes",
    specialty: "Cabelo cacheado",
    photoUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    whatsapp: "5516997483100",
    slotInterval: 30
  },
  {
    id: "prof_luan",
    name: "Luan Barber",
    slug: "luan-barber",
    specialty: "Corte executivo",
    photoUrl:
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=600&q=80",
    whatsapp: "5516997483100",
    slotInterval: 30
  }
];

export const professional = professionals[0];

export const users: AppUser[] = [
  {
    id: "user_admin",
    name: "Lucas",
    email: "admin@barber.app",
    role: "ADMIN",
    emailVerified: true
  },
  {
    id: "user_barber_joao",
    name: "Joao Barber",
    email: "joao@barber.app",
    role: "BARBER",
    professionalId: "prof_joao",
    emailVerified: true
  },
  {
    id: "user_cliente",
    name: "Lucas Cliente",
    email: "cliente@email.com",
    phone: "11999990000",
    role: "USER",
    emailVerified: true
  },
  {
    id: "user_maria",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "11988880000",
    role: "USER",
    emailVerified: true
  },
  {
    id: "user_carlos",
    name: "Carlos Lima",
    email: "carlos@email.com",
    phone: "11977770000",
    role: "USER",
    emailVerified: true
  }
];

export const services: ServiceSummary[] = [
  {
    id: "svc_corte",
    name: "Corte masculino",
    description: "Corte completo com finalizacao.",
    priceCents: 4500,
    durationMin: 45
  },
  {
    id: "svc_barba",
    name: "Barba",
    description: "Toalha quente, desenho e acabamento.",
    priceCents: 3500,
    durationMin: 30
  },
  {
    id: "svc_combo",
    name: "Corte + barba",
    description: "Experiencia completa em um unico horario.",
    priceCents: 7500,
    durationMin: 75
  }
];

export const businessHours: BusinessHoursRule[] = [
  { weekday: 1, opensAt: "09:00", closesAt: "19:00", isActive: true },
  { weekday: 2, opensAt: "09:00", closesAt: "19:00", isActive: true },
  { weekday: 3, opensAt: "09:00", closesAt: "19:00", isActive: true },
  { weekday: 4, opensAt: "09:00", closesAt: "19:00", isActive: true },
  { weekday: 5, opensAt: "09:00", closesAt: "19:00", isActive: true },
  { weekday: 6, opensAt: "09:00", closesAt: "14:00", isActive: true },
  { weekday: 0, opensAt: "00:00", closesAt: "00:00", isActive: false }
];

export const bookings: ExistingBooking[] = [
  {
    id: "book_1",
    professionalId: "prof_joao",
    serviceId: "svc_corte",
    customerName: "Marcos Silva",
    customerPhone: "11988887777",
    startsAt: set(today, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }),
    endsAt: set(today, { hours: 10, minutes: 45, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_ONLINE",
    paymentStatus: "PAID",
    totalAmountCents: 4500
  },
  {
    id: "book_2",
    professionalId: "prof_joao",
    serviceId: "svc_barba",
    customerName: "Bruno Costa",
    customerPhone: "11977776666",
    startsAt: set(today, { hours: 15, minutes: 30, seconds: 0, milliseconds: 0 }),
    endsAt: set(today, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_IN_PERSON",
    paymentStatus: "PENDING",
    totalAmountCents: 3500
  },
  {
    id: "book_3",
    professionalId: "prof_rafa",
    serviceId: "svc_combo",
    customerName: "Pedro Lima",
    customerPhone: "11966665555",
    startsAt: set(tomorrow, { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }),
    endsAt: set(tomorrow, { hours: 12, minutes: 15, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_ONLINE",
    paymentStatus: "PAID",
    totalAmountCents: 7500
  },
  {
    id: "book_4",
    professionalId: "prof_diego",
    serviceId: "svc_combo",
    customerName: "Henrique Melo",
    customerPhone: "11955554444",
    startsAt: set(today, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
    endsAt: set(today, { hours: 14, minutes: 15, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_IN_PERSON",
    paymentStatus: "PENDING",
    totalAmountCents: 7500
  },
  {
    id: "book_5",
    professionalId: "prof_caio",
    serviceId: "svc_corte",
    customerName: "Vitor Nunes",
    customerPhone: "11944443333",
    startsAt: set(today, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 }),
    endsAt: set(today, { hours: 17, minutes: 45, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_ONLINE",
    paymentStatus: "PAID",
    totalAmountCents: 4500
  },
  {
    id: "book_6",
    professionalId: "prof_luan",
    serviceId: "svc_barba",
    customerName: "Andre Souza",
    customerPhone: "11933332222",
    startsAt: set(tomorrow, { hours: 9, minutes: 30, seconds: 0, milliseconds: 0 }),
    endsAt: set(tomorrow, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }),
    status: "CONFIRMED",
    paymentMethod: "PAY_IN_PERSON",
    paymentStatus: "PENDING",
    totalAmountCents: 3500
  }
];
