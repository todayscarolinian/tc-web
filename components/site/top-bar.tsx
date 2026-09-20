import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";
import { PUBLICATION } from "@/src/entities/publication/infrastructure/publication.composition";
import { getTodayFormatted } from "@/src/lib/utils";
import type { ComponentType } from "react";

type SocialKey = keyof typeof PUBLICATION.social;

const SOCIAL_ICONS: Record<
  SocialKey,
  ComponentType<{ width?: number; height?: number }>
> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x: XIcon,
  youtube: YoutubeIcon,
};

const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  youtube: "YouTube",
};

export function TopBar() {
  const socialLinks = Object.entries(PUBLICATION.social) as [
    SocialKey,
    string,
  ][];

  return (
    <div className="border-b border-border bg-surface-inverse text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <span className="font-utility text-xs font-medium tracking-wide text-white/70">
          {getTodayFormatted()} • {PUBLICATION.location}
        </span>
        <div className="flex items-center gap-4 text-white/70">
          {socialLinks.map(([key, href]) => {
            if (!href || href === "--") return null;

            const Icon = SOCIAL_ICONS[key];
            return (
              <a
                key={key}
                href={href}
                aria-label={SOCIAL_LABELS[key]}
                className="hover:text-white"
                target="_blank"
              >
                <Icon width={16} height={16} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
