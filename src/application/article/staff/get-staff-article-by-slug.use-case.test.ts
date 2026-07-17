import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/infrastructure/article/in-memory-article.repository";
import { getStaffArticleBySlug } from "./get-staff-article-by-slug.use-case";

describe("getStaffArticleBySlug", () => {
  const repo = new InMemoryArticleRepository();

  it("resolves a draft article — unlike the public use-case, staff can see it", async () => {
    const article = await getStaffArticleBySlug(repo, "library-hours-opinion");
    expect(article?.status).toBe("Draft");
  });

  it("resolves an unknown slug to null", async () => {
    expect(await getStaffArticleBySlug(repo, "does-not-exist")).toBeNull();
  });

  it("resolves an empty slug to null", async () => {
    expect(await getStaffArticleBySlug(repo, "")).toBeNull();
  });
});
