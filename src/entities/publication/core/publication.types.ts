// Singleton config value object — there's no "many publications" concept
// for a single student newspaper's masthead, so this intentionally skips
// the entity/repository pattern used elsewhere (see docs/architecture.md).
export type Publication = {
  bio: string;
  email: string;
  social: {
    facebook: string;
    instagram: string;
    x: string;
    youtube: string;
  };
};
