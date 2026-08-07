import { API_BASE } from "./api";

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function initials(user: { first_name: string; last_name: string }): string {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
}

export function fullName(user: {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
}): string {
  return [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ");
}

export function imageUrl(src: string): string {
  if (src.startsWith("http")) return src;
  return `${API_BASE}${src}`;
}

export function toDateTimeLocal(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
