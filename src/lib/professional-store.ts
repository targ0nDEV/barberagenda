import type { ProfessionalPublicProfile } from "@/types/booking";
import { professionals as defaultProfessionals } from "@/lib/mock-data";

const PROFESSIONALS_STORAGE_KEY = "agende-professionals";

export function getProfessionals() {
  if (typeof window === "undefined") {
    return defaultProfessionals;
  }

  const storedProfessionals = window.localStorage.getItem(PROFESSIONALS_STORAGE_KEY);

  if (!storedProfessionals) {
    return defaultProfessionals;
  }

  return JSON.parse(storedProfessionals) as ProfessionalPublicProfile[];
}

export function saveProfessionals(professionals: ProfessionalPublicProfile[]) {
  window.localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(professionals));
  window.dispatchEvent(new Event("agende-professionals-updated"));
}

export function buildSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
