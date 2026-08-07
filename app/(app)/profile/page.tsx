"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Badge,
  Button,
  Card,
  Field,
  FormError,
  FormSuccess,
  Input,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { formatDate, fullName, initials } from "@/lib/format";

function ProfileContent() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(() => ({
    first_name: user?.first_name ?? "",
    middle_name: user?.middle_name ?? "",
    last_name: user?.last_name ?? "",
    password: "",
    confirm_password: "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.auth.updateMe({
        first_name: form.first_name,
        middle_name: form.middle_name || null,
        last_name: form.last_name,
        password: form.password || undefined,
        confirm_password: form.confirm_password || undefined,
      });
      await refresh();
      setForm((f) => ({ ...f, password: "", confirm_password: "" }));
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Profile
      </h1>

      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-xl font-extrabold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            {initials(user)}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {fullName(user)}
              </h2>
              <Badge value={user.role} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {user.email} · joined {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-5 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <ShieldCheck className="size-5 text-violet-500" /> Edit details
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </Field>
            <Field label="Last name">
              <Input
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Middle name" hint="optional">
            <Input
              value={form.middle_name}
              onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
            />
          </Field>

          <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              Change password <span className="font-normal text-slate-400">(optional)</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>
              <Field label="Confirm new password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm({ ...form, confirm_password: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" loading={saving} className="flex-1">
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
