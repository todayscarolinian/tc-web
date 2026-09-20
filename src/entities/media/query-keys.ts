export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: () => [...mediaKeys.lists()] as const,
};
