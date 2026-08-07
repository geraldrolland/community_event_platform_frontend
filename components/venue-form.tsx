"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  FormError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import {
  AMENITIES,
  DAYS,
  VENUE_PURPOSE_MAPPING,
  VENUE_STATUSES,
} from "@/lib/constants";
import { imageUrl } from "@/lib/format";
import type { Venue, VenueCreatePayload, VenueStatus } from "@/lib/types";

const MAX_IMAGES = 5;
const MIN_IMAGES = 3;

interface FormState {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: string;
  rental_price: string;
  purpose: string;
  venue_type: string;
  status: VenueStatus;
  amenities: string[];
  wheel_chair_accessible: boolean;
  elevator: boolean;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  parking_available: boolean;
  parking_capacity: string;
  parking_price: string;
  parking_hours: string;
  days: string[];
  opening_time: string;
  closing_time: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "",
  capacity: "",
  rental_price: "",
  purpose: "",
  venue_type: "",
  status: "available",
  amenities: [],
  wheel_chair_accessible: false,
  elevator: false,
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  parking_available: false,
  parking_capacity: "",
  parking_price: "",
  parking_hours: "",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  opening_time: "09:00",
  closing_time: "18:00",
};

function fromVenue(v: Venue): FormState {
  return {
    name: v.name,
    description: v.description ?? "",
    address: v.address,
    city: v.city,
    state: v.state,
    country: v.country,
    capacity: String(v.capacity),
    rental_price: String(v.rental_price),
    purpose: v.purpose,
    venue_type: v.venue_type,
    status: v.status,
    amenities: v.amenities,
    wheel_chair_accessible: v.accessibility.wheel_chair_accessible,
    elevator: v.accessibility.elevator,
    contact_name: v.contact.name,
    contact_phone: v.contact.phone,
    contact_email: v.contact.email,
    website: v.website ?? "",
    parking_available: v.parking_availability.available,
    parking_capacity: String(v.parking_availability.capacity ?? ""),
    parking_price: String(v.parking_availability.price ?? ""),
    parking_hours: v.parking_availability.hours ?? "",
    days: v.operating_hours.days,
    opening_time: v.operating_hours.opening_time.slice(0, 5),
    closing_time: v.operating_hours.closing_time.slice(0, 5),
  };
}

function buildPayload(f: FormState, images: string[]): VenueCreatePayload {
  return {
    name: f.name.trim(),
    description: f.description.trim() || null,
    address: f.address.trim(),
    city: f.city.trim(),
    state: f.state.trim(),
    country: f.country.trim(),
    capacity: Number(f.capacity),
    rental_price: Number(f.rental_price),
    purpose: f.purpose,
    venue_type: f.venue_type,
    status: f.status,
    amenities: f.amenities,
    accessibility: {
      wheel_chair_accessible: f.wheel_chair_accessible,
      elevator: f.elevator,
    },
    contact: {
      name: f.contact_name.trim(),
      phone: f.contact_phone.trim(),
      email: f.contact_email.trim(),
    },
    website: f.website.trim() || null,
    images,
    parking_availability: f.parking_available
      ? {
          available: true,
          capacity: Number(f.parking_capacity),
          price: Number(f.parking_price),
          hours: f.parking_hours.trim(),
        }
      : { available: false, capacity: null, price: null, hours: null },
    operating_hours: {
      days: f.days,
      opening_time: f.opening_time,
      closing_time: f.closing_time,
    },
  };
}

export function VenueForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Venue;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    initial ? fromVenue(initial) : emptyForm,
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const venueTypes = useMemo(
    () => VENUE_PURPOSE_MAPPING[form.purpose] ?? [],
    [form.purpose],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInList = (key: "amenities" | "days", value: string) =>
    setForm((f) => {
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(value)
          ? list.filter((x) => x !== value)
          : [...list, value],
      };
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const selected = Array.from(files);
    if (images.length + selected.length > MAX_IMAGES) {
      setError(`Maximum of ${MAX_IMAGES} images allowed.`);
      return;
    }
    setUploading(true);
    try {
      const urls = await api.media.upload(selected);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length < MIN_IMAGES) {
      setError(`At least ${MIN_IMAGES} images are required (uploaded ${images.length}).`);
      return;
    }
    if (form.days.length === 0) {
      setError("Select at least one operating day.");
      return;
    }
    if (form.parking_available) {
      if (!form.parking_capacity || !form.parking_price || !form.parking_hours.trim()) {
        setError("Fill in parking capacity, price, and hours, or turn parking off.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(form, images);
      if (mode === "create") {
        await api.venue.create(payload);
      } else if (initial) {
        await api.venue.update(initial.id, payload);
      }
      router.replace("/manager/venues");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save venue.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basics */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basics</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Venue name">
              <Input
                required
                placeholder="e.g. Maple Community Hall"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description" hint="optional">
              <Textarea
                placeholder="What makes this venue special?"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Street address">
              <Input
                required
                placeholder="12 King's Road"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
          </div>
          <Field label="City">
            <Input
              required
              placeholder="Lagos"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
          <Field label="State / Region">
            <Input
              required
              placeholder="Lagos State"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </Field>
          <Field label="Country">
            <Input
              required
              placeholder="Nigeria"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </Field>
          <Field label="Guest capacity">
            <Input
              required
              type="number"
              min={1}
              placeholder="200"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
          </Field>
          <Field label="Rental price (per event)">
            <Input
              required
              type="number"
              min={1}
              placeholder="250000"
              value={form.rental_price}
              onChange={(e) => set("rental_price", e.target.value)}
            />
          </Field>
          <Field label="Website" hint="optional">
            <Input
              type="url"
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value as VenueStatus)}
            >
              {VENUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {/* Purpose & type */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Purpose & venue type
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Venue types are grouped by purpose — the type list updates when you
          change the purpose.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Purpose">
            <Select
              required
              value={form.purpose}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  purpose: e.target.value,
                  venue_type: "",
                }))
              }
            >
              <option value="" disabled>
                Select a purpose…
              </option>
              {Object.keys(VENUE_PURPOSE_MAPPING).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Venue type">
            <Select
              required
              disabled={!form.purpose}
              value={form.venue_type}
              onChange={(e) => set("venue_type", e.target.value)}
            >
              <option value="" disabled>
                {form.purpose ? "Select a type…" : "Pick a purpose first"}
              </option>
              {venueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {/* Amenities */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Amenities</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select everything the venue offers.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                form.amenities.includes(amenity)
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/10 dark:text-violet-300"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => toggleInList("amenities", amenity)}
                className="size-4 accent-violet-600"
              />
              {amenity}
            </label>
          ))}
        </div>
      </Card>

      {/* Accessibility, contact, parking, hours */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Accessibility
          </h2>
          <div className="mt-4 space-y-3">
            {[
              {
                key: "wheel_chair_accessible" as const,
                label: "Wheelchair accessible",
              },
              { key: "elevator" as const, label: "Elevator available" },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={form[opt.key]}
                  onChange={(e) => set(opt.key, e.target.checked)}
                  className="size-4 accent-violet-600"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">
            Parking
          </h2>
          <div className="mt-4 space-y-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.parking_available}
                onChange={(e) => set("parking_available", e.target.checked)}
                className="size-4 accent-violet-600"
              />
              Parking available
            </label>
            {form.parking_available && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Spaces">
                  <Input
                    required
                    type="number"
                    min={1}
                    placeholder="50"
                    value={form.parking_capacity}
                    onChange={(e) => set("parking_capacity", e.target.value)}
                  />
                </Field>
                <Field label="Price">
                  <Input
                    required
                    type="number"
                    min={0}
                    placeholder="500"
                    value={form.parking_price}
                    onChange={(e) => set("parking_price", e.target.value)}
                  />
                </Field>
                <Field label="Hours">
                  <Input
                    required
                    placeholder="6am - 10pm"
                    value={form.parking_hours}
                    onChange={(e) => set("parking_hours", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact</h2>
          <div className="mt-4 space-y-4">
            <Field label="Contact name">
              <Input
                required
                placeholder="Jane Manager"
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <Input
                required
                placeholder="+234 800 000 0000"
                value={form.contact_phone}
                onChange={(e) => set("contact_phone", e.target.value)}
              />
            </Field>
            <Field label="Contact email">
              <Input
                required
                type="email"
                placeholder="bookings@venue.com"
                value={form.contact_email}
                onChange={(e) => set("contact_email", e.target.value)}
              />
            </Field>
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">
            Operating hours
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Open days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleInList("days", day)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      form.days.includes(day)
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opens at">
                <Input
                  required
                  type="time"
                  value={form.opening_time}
                  onChange={(e) => set("opening_time", e.target.value)}
                />
              </Field>
              <Field label="Closes at">
                <Input
                  required
                  type="time"
                  value={form.closing_time}
                  onChange={(e) => set("closing_time", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Card>
      </div>

      {/* Images */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Photos <span className="font-normal text-slate-400">({images.length}/5)</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload between {MIN_IMAGES} and {MAX_IMAGES} photos (jpg, jpeg, or png).
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img, i) => (
            <div key={img} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600">
              <img src={imageUrl(img)} alt={`Venue photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((x) => x !== img))}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-rose-600 group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-violet-400 hover:text-violet-500 disabled:opacity-60 dark:border-slate-600"
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="size-6" />
                  <span className="text-xs font-semibold">Add photo</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Card>

      <FormError message={error} />

      <div className="flex gap-3 pb-4">
        <Button type="submit" size="lg" loading={submitting} className="flex-1 sm:flex-none sm:px-10">
          {mode === "create" ? "Create venue" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
