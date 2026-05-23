import type { AppUser } from "@/types/booking";
import { users as defaultUsers } from "@/lib/mock-data";

export const SESSION_STORAGE_KEY = "micro-schedule-user";
export const PASSWORD_STORAGE_KEY = "micro-schedule-passwords";
export const REGISTERED_USERS_STORAGE_KEY = "agende-registered-users";
export const REGISTERED_CREDENTIALS_STORAGE_KEY = "agende-registered-credentials";
export const EMAIL_CONFIRMATIONS_STORAGE_KEY = "agende-email-confirmations";

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

export type Credential = {
  username: string;
  password: string;
  userId: string;
};

type EmailConfirmation = {
  token: string;
  userId: string;
  email: string;
  createdAt: string;
  confirmationUrl: string;
};

export function getCredentials() {
  if (typeof window === "undefined") {
    return defaultCredentials;
  }

  const storedPasswords = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
  const passwordByUsername = storedPasswords
    ? (JSON.parse(storedPasswords) as Record<string, string>)
    : {};

  const registeredCredentials = getRegisteredCredentials();
  const credentials = [...defaultCredentials, ...registeredCredentials];

  return credentials.map((credential) => ({
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
  return getCredentials().find((credential) => credential.userId === userId)?.username;
}

export function getUsers() {
  if (typeof window === "undefined") {
    return defaultUsers;
  }

  const storedUsers = window.localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
  const registeredUsers = storedUsers ? (JSON.parse(storedUsers) as AppUser[]) : [];

  return [...defaultUsers, ...registeredUsers];
}

export function saveRegisteredUsers(users: AppUser[]) {
  const defaultUserIds = new Set(defaultUsers.map((user) => user.id));
  const registeredUsers = users.filter((user) => !defaultUserIds.has(user.id));
  window.localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
  window.dispatchEvent(new Event("agende-users-updated"));
}

function getRegisteredCredentials() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedCredentials = window.localStorage.getItem(REGISTERED_CREDENTIALS_STORAGE_KEY);
  return storedCredentials ? (JSON.parse(storedCredentials) as Credential[]) : [];
}

function saveRegisteredCredentials(credentials: Credential[]) {
  window.localStorage.setItem(REGISTERED_CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
}

export function confirmEmailToken(token: string) {
  const storedConfirmations = window.localStorage.getItem(EMAIL_CONFIRMATIONS_STORAGE_KEY);
  const confirmations = storedConfirmations
    ? (JSON.parse(storedConfirmations) as EmailConfirmation[])
    : [];
  const confirmation = confirmations.find((item) => item.token === token);

  if (!confirmation) {
    return false;
  }

  const users = getUsers();
  const updatedUsers = users.map((user) =>
    user.id === confirmation.userId ? { ...user, emailVerified: true } : user
  );
  const remainingConfirmations = confirmations.filter((item) => item.token !== token);

  saveRegisteredUsers(updatedUsers);
  window.localStorage.setItem(EMAIL_CONFIRMATIONS_STORAGE_KEY, JSON.stringify(remainingConfirmations));

  return true;
}

export function registerUser(input: {
  username: string;
  password: string;
  fullName: string;
  nickname: string;
  phone: string;
  email: string;
}) {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const users = getUsers();
  const credentials = getCredentials();

  if (credentials.some((credential) => credential.username === username)) {
    return { ok: false as const, message: "Este login ja esta em uso." };
  }

  if (users.some((user) => user.email.toLowerCase() === email)) {
    return { ok: false as const, message: "Este e-mail ja esta cadastrado." };
  }

  const user: AppUser = {
    id: `user_${Date.now()}`,
    name: input.fullName.trim(),
    nickname: input.nickname.trim(),
    email,
    phone: input.phone.replace(/\D/g, ""),
    role: "USER",
    emailVerified: false
  };
  const credential: Credential = {
    username,
    password: input.password,
    userId: user.id
  };
  const token = `confirm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const origin = window.location.origin;
  const confirmation: EmailConfirmation = {
    token,
    userId: user.id,
    email,
    createdAt: new Date().toISOString(),
    confirmationUrl: `${origin}/login?confirmEmail=${encodeURIComponent(token)}`
  };
  const storedConfirmations = window.localStorage.getItem(EMAIL_CONFIRMATIONS_STORAGE_KEY);
  const confirmations = storedConfirmations
    ? (JSON.parse(storedConfirmations) as EmailConfirmation[])
    : [];

  saveRegisteredUsers([...users, user]);
  saveRegisteredCredentials([...getRegisteredCredentials(), credential]);
  window.localStorage.setItem(
    EMAIL_CONFIRMATIONS_STORAGE_KEY,
    JSON.stringify([...confirmations, confirmation])
  );

  return {
    ok: true as const,
    message: "Cadastro criado. Enviamos a confirmacao para o e-mail informado.",
    confirmationUrl: confirmation.confirmationUrl
  };
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
