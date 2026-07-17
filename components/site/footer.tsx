import Link from "next/link";
import Image from "next/image";
import { SECTIONS } from "@/src/lib/content";
import { PUBLICATION } from "@/src/infrastructure/publication/publication.composition";

const PAPER_LINKS = [
  {
    name: "About Us",
    href: "/about",
  },
  {
    name: "Masthead",
    href: "/masthead",
  },
  {
    name: "Join the staff",
    href: "/join-the-staff",
  },
  {
    name: "Contact",
    href: `mailto:${PUBLICATION.email}`,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-inverse text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[280px_1fr]">
          <div>
            <Image
              src="/logos/tc-logotype-onred.png"
              alt="Today's Carolinian"
              width={280}
              height={41}
              className="h-7 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-[18px] text-white/60">
              {PUBLICATION.bio}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h5 className="font-utility mb-3 text-xs font-semibold tracking-wide text-white/50 uppercase">
                Sections
              </h5>
              <ul className="flex flex-col gap-2">
                {SECTIONS.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/section/${s.slug}`} className="text-sm text-white/80 hover:text-white hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-utility mb-3 text-xs font-semibold tracking-wide text-white/50 uppercase">
                The paper
              </h5>
              <ul className="flex flex-col gap-2">
                {PAPER_LINKS.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-sm text-white/80 hover:text-white hover:underline">
                      {l.name}
                    </Link>
                  </li>
                ))}
                {/* {PAPER_LINKS.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">
                      {l}
                    </a>
                  </li>
                ))} */}
              </ul>
            </div>
            <div>
              <h5 className="font-utility mb-3 text-xs font-semibold tracking-wide text-white/50 uppercase">
                Follow
              </h5>
              <ul className="flex flex-col gap-2">
                {Object.entries(PUBLICATION.social).map(([platform, url]) => (
                  <li key={platform}>
                    <a href={url} className="text-sm text-white/80 hover:text-white hover:underline">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </li>
                ))}
                {/* {FOLLOW_LINKS.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">
                      {l}
                    </a>
                  </li>
                ))} */}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <span className="text-xs text-white/50">
            © 2026 Today&apos;s Carolinian · University of San Carlos. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
