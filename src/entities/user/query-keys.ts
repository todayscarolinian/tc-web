export const userKeys = {
  all: ["users"] as const,
  eligibleAuthors: () => [...userKeys.all, "eligible-authors"] as const,
};
