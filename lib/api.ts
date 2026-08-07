import type {
  ApiErrorBody,
  Event,
  EventCreatePayload,
  EventUpdatePayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UserBase,
  Venue,
  VenueCreatePayload,
  Vote,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ROLE_ENDPOINT: Record<"customer" | "venue_manager", string> = {
  customer: "customer",
  venue_manager: "venue-manager",
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(ApiError.extractMessage(detail) ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  static extractMessage(detail: unknown): string | null {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) =>
          d && typeof d === "object" && "msg" in d ? String(d.msg) : null,
        )
        .filter(Boolean)
        .join("; ");
    }
    return null;
  }
}

type SessionErrorHandler = () => void;

let sessionErrorHandler: SessionErrorHandler | null = null;

export function onSessionError(handler: SessionErrorHandler): void {
  sessionErrorHandler = handler;
}

function notifySessionError(path: string): void {
  const isAuthFlow =
    path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
  if (!isAuthFlow) sessionErrorHandler?.();
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; formData?: FormData } = {},
): Promise<T> {
  const { method = "GET", body, formData } = options;

  const headers: Record<string, string> = {};
  if (formData) {
    // browser sets multipart boundary automatically
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (method !== "GET") {
    const csrf = getCookie("csrf_token");
    if (csrf) headers["x-csrf-token"] = csrf;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: "include",
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the API server. Is it running?");
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      notifySessionError(path);
    }
    let errBody: ApiErrorBody | null = null;
    try {
      errBody = (await res.json()) as ApiErrorBody;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, errBody?.detail ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export const api = {
  auth: {
    me: () => request<UserBase>("/api/auth/me"),
    login: (role: "customer" | "venue_manager", payload: LoginPayload) =>
      request<UserBase>(`/api/auth/login/${ROLE_ENDPOINT[role]}`, {
        method: "POST",
        body: payload,
      }),
    register: (role: "customer" | "venue_manager", payload: RegisterPayload) =>
      request<UserBase>(`/api/auth/register/${ROLE_ENDPOINT[role]}`, {
        method: "POST",
        body: payload,
      }),
    updateMe: (payload: UpdateProfilePayload) =>
      request<UserBase>("/api/auth/me/update", { method: "PATCH", body: payload }),
    logout: () => request<undefined>("/api/auth/logout", { method: "POST" }),
  },
  venue: {
    all: (limit = 30, page = 1) =>
      request<Venue[]>(`/api/venue/all?limit=${limit}&page_num=${page}`),
    get: (id: number) => request<Venue>(`/api/venue/${id}`),
    mine: () => request<Venue[]>("/api/venue/me/all"),
    getMine: (id: number) => request<Venue>(`/api/venue/me/${id}`),
    create: (payload: VenueCreatePayload) =>
      request<Venue>("/api/venue/create", { method: "POST", body: payload }),
    update: (id: number, payload: Partial<VenueCreatePayload>) =>
      request<Venue>(`/api/venue/${id}`, { method: "PATCH", body: payload }),
    remove: (id: number) =>
      request<undefined>(`/api/venue/${id}`, { method: "DELETE" }),
  },
  event: {
    upcoming: () => request<Event[]>("/api/event/all/upcoming?limit=100"),
    pending: () => request<Event[]>("/api/event/all/pending?limit=100"),
    mine: () => request<Event[]>("/api/event/me/all"),
    get: (id: number) => request<Event>(`/api/event/${id}`),
    create: (payload: EventCreatePayload) =>
      request<Event>("/api/event/create", { method: "POST", body: payload }),
    update: (id: number, payload: EventUpdatePayload) =>
      request<Event>(`/api/event/${id}`, { method: "PATCH", body: payload }),
    remove: (id: number) =>
      request<undefined>(`/api/event/${id}`, { method: "DELETE" }),
    setStatus: (id: number, status: "approved" | "rejected") =>
      request<Event>(`/api/event/${id}/status?status=${status}`, { method: "PATCH" }),
    byStatus: (venueId: number, status: string) =>
      request<Event[]>(`/api/event/status?venue_id=${venueId}&status=${status}&limit=50`),
  },
  vote: {
    cast: (eventId: number) =>
      request<Vote>(`/api/vote/cast?event_id=${eventId}`, {
        method: "POST",
      }),
    mine: () => request<Vote[]>("/api/vote/me/all"),
    remove: (voteId: number) =>
      request<undefined>(`/api/vote/${voteId}`, { method: "DELETE" }),
  },
  media: {
    upload: (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      return request<string[]>("/api/media/upload", {
        method: "POST",
        formData,
      });
    },
  },
};
