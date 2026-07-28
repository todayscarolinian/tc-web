export type Author = {
  authorId: string;
  name: string;
  slug: string;
  initials: string;
  role: string;
  bio: string;
  avatarUrl: string;
  active: boolean;
  updatedAt: Date;
};

export function assertValidArticle(author: Author): Author {
  if (!author.slug.trim()) throw new Error("Author.slug must not be empty");
  if (!author.name.trim()) throw new Error("Author.name must not be empty");
  return author;
}
