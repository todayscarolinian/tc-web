import { useQuery } from "@tanstack/react-query";
import { userKeys } from "@/src/entities/user/query-keys";
import type { UserProfile } from "@/src/lib/herald/types";

async function fetchStaffAuthors(): Promise<UserProfile[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to load authors");
  const { users } = await response.json();
  return users;
}

export function useStaffAuthors() {
  return useQuery({
    queryKey: userKeys.eligibleAuthors(),
    queryFn: fetchStaffAuthors,
  });
}
