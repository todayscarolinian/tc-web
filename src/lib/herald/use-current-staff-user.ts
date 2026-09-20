"use client";
import { useSession } from "./auth-client";
import type { UserProfile } from "./types";

export type CurrentStaffUser = {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
};

export function useCurrentStaffUser(): {
  user: CurrentStaffUser | null;
  isPending: boolean;
} {
  const { data: session, isPending } = useSession();
  const profile = session?.user as UserProfile | undefined;

  if (!profile) {
    return { user: null, isPending };
  }

  const name = profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const role = profile.positions[0]?.name ?? "Staff";
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const avatarUrl = profile.profilePictureURL;

  return { user: { name, role, initials, avatarUrl }, isPending };
}
