import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { fakeDb, setDocs } = vi.hoisted(() => {
  let docs: Record<string, unknown>[] = [];

  function makeQuery(source: Record<string, unknown>[]) {
    let filtered = [...source];
    let orderField: string | null = null;
    let orderDir: "asc" | "desc" = "asc";

    const query = {
      where: vi.fn((field: string, op: string, value: unknown) => {
        filtered = filtered.filter((d) => {
          const v = d[field];
          if (op === "==") return v === value;
          throw new Error(`Unsupported operator in fake Firestore: ${op}`);
        });
        return query;
      }),
      orderBy: vi.fn((field: string, dir: "asc" | "desc" = "asc") => {
        orderField = field;
        orderDir = dir;
        return query;
      }),
      get: vi.fn(async () => {
        const result = [...filtered];
        if (orderField) {
          const field = orderField;
          result.sort((a, b) => {
            const av = String(a[field]);
            const bv = String(b[field]);
            if (av === bv) return 0;
            const cmp = av < bv ? -1 : 1;
            return orderDir === "asc" ? cmp : -cmp;
          });
        }
        return {
          docs: result.map((data) => ({ data: () => data })),
          empty: result.length === 0,
        };
      }),
    };
    return query;
  }

  const collection = vi.fn(() => makeQuery(docs));

  return {
    fakeDb: { collection },
    setDocs: (next: Record<string, unknown>[]) => {
      docs = next;
    },
  };
});

vi.mock("@/src/lib/firebase/admin", () => ({ db: fakeDb }));

const { FirestoreArticleRepository } = await import(
  "@/src/entities/article/infrastructure/firestore-article.repository"
);

const TS = (date: Date) => ({ toDate: () => date });
const NOW = new Date("2026-01-01T00:00:00Z");
const SCHEDULED_FOR = new Date("2026-02-01T00:00:00Z");

function doc(overrides: Partial<Record<string, unknown>>) {
  return {
    slug: "slug",
    sectionSlug: "news",
    title: "Title",
    titleLower: "title",
    dek: "dek",
    authorName: "Author",
    status: "Published",
    publishedAt: TS(NOW),
    publishAt: null,
    createdAt: TS(NOW),
    updatedAt: TS(NOW),
    ...overrides,
  };
}

describe("FirestoreArticleRepository field mapping", () => {
  const repo = new FirestoreArticleRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    setDocs([]);
  });

  it("converts publishAt from a Firestore Timestamp to a Date", async () => {
    setDocs([doc({ slug: "scheduled", publishAt: TS(SCHEDULED_FOR) })]);

    const [article] = await repo.listPublished();

    expect(article.publishAt).toBeInstanceOf(Date);
    expect(article.publishAt?.getTime()).toBe(SCHEDULED_FOR.getTime());
  });

  it("resolves a missing publishAt to null instead of leaving it undefined", async () => {
    setDocs([doc({ slug: "unscheduled", publishAt: null })]);

    const [article] = await repo.listPublished();

    expect(article.publishAt).toBeNull();
  });
});
