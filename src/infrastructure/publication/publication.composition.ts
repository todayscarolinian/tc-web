import type { Publication } from "@/src/domain/publication/publication.value-object";

// No repository/adapter class — a static, non-user-editable singleton has
// no swap-implementation seam to abstract. Pages import this constant
// directly instead of going through a service object.
export const PUBLICATION: Publication = {
  bio: "The official student publication of the University of San Carlos, Cebu City. Our commitment. Your paper.",
  email: "contact@todayscarolinian.com",
  social: {
    facebook: "https://www.facebook.com/todayscarolinian",
    instagram: "https://www.instagram.com/todaysusc/",
    x: "https://x.com/todaysusc",
    youtube: "https://www.youtube.com/@todayscarolinianusc",
  },
};
