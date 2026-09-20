export const articleKeys = {
  all: ["articles"] as const,
  staffLists: () => [...articleKeys.all, "staff", "list"] as const,
  staffList: () => [...articleKeys.staffLists()] as const,
  staffDetails: () => [...articleKeys.all, "staff", "detail"] as const,
  staffDetail: (slug: string) => [...articleKeys.staffDetails(), slug] as const,
  publicLists: () => [...articleKeys.all, "public", "list"] as const,
  publicList: () => [...articleKeys.publicLists()] as const,
};
