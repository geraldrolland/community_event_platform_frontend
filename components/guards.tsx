"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireRole({
  role,
  children,
}: {
  role: "customer" | "venue_manager";
  children: ReactNode;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (user && user.role !== role) {
      router.replace(
        role === "customer"
          ? `/login/customer?notice=${user.role}`
          : `/login/venue-manager?notice=${user.role}`,
      );
    }
  }, [status, user, role, router]);

  if (status !== "authenticated" || !user || user.role !== role) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <>{children}</>;
}
