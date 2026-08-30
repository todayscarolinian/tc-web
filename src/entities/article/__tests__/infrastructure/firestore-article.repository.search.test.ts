import { beforeEach, describe, expect, it, vi } from "vitest";

// `src/lib/firebase/admin.ts` imports the "server-only" marker package, whose
// index.js unconditionally throws outside the react-server bundler condition
// (see node_modules/server-only/index.js) — stub it so the adapter is
// importable under plain Vitest.
vi.mock("server-only", () => ({}));

// A minimal in-memory Firestore query fake supporting exactly the operators
// FirestoreArticleRepository.search() issues: `==` where-clauses and orderBy.
const { fakeDb, setDocs } = vi.hoisted(() => {
  let docs: Record<string, unknown>[] = [];

  function makeQuery(source: Record<string, unknown>[]) {
    let filtered = [...source];
    let orderField: string | null = null;
    let orderDir: "asc" | "desc" = "asc";
    let limitN: number | null = null;

    const query = {
      where: vi.fn((field: string, op: string, value: unknown) => {
        filtered = filtered.filter((d) => {
          const v = d[field];
          if (op === "==") return v === value;
          if (op === ">=") return (v as string) >= (value as string);
          if (op === "<") return (v as string) < (value as string);
          throw new Error(`Unsupported operator in fake Firestore: ${op}`);
        });
        return query;
      }),
      orderBy: vi.fn((field: string, dir: "asc" | "desc" = "asc") => {
        orderField = field;
        orderDir = dir;
        return query;
      }),
      limit: vi.fn((n: number) => {
        limitN = n;
        return query;
      }),
      get: vi.fn(async () => {
        let result = [...filtered];
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
        if (limitN != null) result = result.slice(0, limitN);
        return { docs: result.map((data) => ({ data: () => data })), empty: result.length === 0 };
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

describe("FirestoreArticleRepository.search", () => {
  const repo = new FirestoreArticleRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    setDocs([]);
  });

  it("matches on title, case-insensitively", async () => {
    setDocs([doc({ slug: "tuition", titleLower: "usc board defers tuition adjustment" })]);
    const results = await repo.search("TUITION");
    expect(results.map((a: { slug: string }) => a.slug)).toEqual(["tuition"]);
  });

  it("matches on dek and author name", async () => {
    setDocs([
      doc({ slug: "by-dek", dek: "a buzzer-beating three from Andrei Booc" }),
      doc({ slug: "by-author", authorName: "Aisha Cruz" }),
    ]);
    expect((await repo.search("buzzer-beating")).map((a: { slug: string }) => a.slug)).toEqual(["by-dek"]);
    expect((await repo.search("aisha cruz")).map((a: { slug: string }) => a.slug)).toEqual(["by-author"]);
  });

  it("matches on derived section name", async () => {
    setDocs([doc({ slug: "sports-article", sectionSlug: "sports" })]);
    const results = await repo.search("sports");
    expect(results.map((a: { slug: string }) => a.slug)).toEqual(["sports-article"]);
  });

  it("excludes non-Published articles even when title matches", async () => {
    setDocs([doc({ slug: "hidden-draft", titleLower: "hidden draft exclusive", status: "Draft" })]);
    expect(await repo.search("hidden")).toEqual([]);
  });

  it("resolves a blank query to [] without touching Firestore", async () => {
    setDocs([doc({ slug: "irrelevant" })]);
    expect(await repo.search("   ")).toEqual([]);
    expect(fakeDb.collection).not.toHaveBeenCalled();
  });

  it("does not throw when a doc is missing titleLower/dek/authorName", async () => {
    const sparse = doc({
      slug: "sparse",
      titleLower: undefined,
      dek: undefined,
      authorName: undefined,
    });
    setDocs([sparse, doc({ slug: "matches", dek: "a rare word" })]);
    await expect(repo.search("rare")).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ slug: "matches" })]),
    );
  });
});
