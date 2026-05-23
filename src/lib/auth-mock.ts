import type { AppUser } from "@/types/booking";

export const SESSION_STORAGE_KEY = "micro-schedule-user";
export const PASSWORD_STORAGE_KEY = "micro-schedule-passwords";

export const defaultCredentials = [
  {
    username: "admin",
    password: "barber1",
    userId: "user_admin"
  },
  {
    username: "barber",
    password: "barber",
    userId: "user_barber_joao"
  },
  {
    username: "usuario",
    password: "usuario",
    userId: "user_cliente"
  }
];

export type Credential = (typeof defaultCredentials)[number];

export function getCredentials() {
  if (typeof window === "undefined") {
    return defaultCredentials;
  }

  const storedPasswords = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
  const passwordByUsername = storedPasswords
    ? (JSON.parse(storedPasswords) as Record<string, string>)
    : {};

  return defaultCredentials.map((credential) => ({
    ...credential,
    password: passwordByUsername[credential.username] ?? credential.password
  }));
}

export function changePassword(username: string, password: string) {
  const storedPasswords = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
  const passwordByUsername = storedPasswords
    ? (JSON.parse(storedPasswords) as Record<string, string>)
    : {};

  window.localStorage.setItem(
    PASSWORD_STORAGE_KEY,
    JSON.stringify({
      ...passwordByUsername,
      [username]: password
    })
  );
}

export function getUsernameByUserId(userId: string) {
  return defaultCredentials.find((credential) => credential.userId === userId)?.username;
}

export function canManageBookings(role: AppUser["role"]) {
  return role === "ADMIN" || role === "BARBER";
}

export function getRoleLabel(role: AppUser["role"]) {
  const labels = {
    ADMIN: "Administrador",
    BARBER: "Barbeiro",
    USER: "Usuario"
  };

  return labels[role];
}
