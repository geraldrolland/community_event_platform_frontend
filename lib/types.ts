export type Role = "customer" | "venue_manager";

export interface UserBase {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  password?: string;
  confirm_password?: string;
}

export interface Accessibility {
  wheel_chair_accessible: boolean;
  elevator: boolean;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export interface ParkingAvailability {
  available: boolean;
  capacity: number | null;
  price: number | null;
  hours: string | null;
}

export interface OperatingHours {
  days: string[];
  opening_time: string;
  closing_time: string;
}

export type VenueStatus = "available" | "reserved" | "booked" | "under_maintenance" | "closed";
export type EventStatus = "pending" | "approved" | "rejected";
export type VoteStatus = "ballot_open" | "ballot_close";

export interface Venue {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  purpose: string;
  venue_type: string;
  amenities: string[];
  accessibility: Accessibility;
  contact: Contact;
  website: string | null;
  rental_price: number;
  status: VenueStatus;
  images: string[];
  parking_availability: ParkingAvailability;
  operating_hours: OperatingHours;
  venue_manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface VenueCreatePayload {
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  purpose: string;
  venue_type: string;
  amenities: string[];
  accessibility: Accessibility;
  contact: Contact;
  website?: string | null;
  rental_price: number;
  status?: VenueStatus;
  images: string[];
  parking_availability: ParkingAvailability;
  operating_hours: OperatingHours;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  proposed_date: string;
  target_venue_id: number;
  status: EventStatus;
  customer_id: number;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventCreatePayload {
  title: string;
  description?: string | null;
  proposed_date: string;
  target_venue_id: number;
}

export interface EventUpdatePayload {
  title?: string;
  description?: string | null;
  proposed_date?: string;
  target_venue_id?: number;
}

export interface Vote {
  id: number;
  event_title: string;
  status: VoteStatus;
  event_id: number;
  created_at: string;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
  input?: unknown;
}

export interface ApiErrorBody {
  detail: string | ApiErrorDetail[];
}
