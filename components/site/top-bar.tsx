import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/site/social-icons";

export function TopBar() {
  return (
    <div className="border-b border-border bg-surface-inverse text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <span className="font-utility text-xs font-medium tracking-wide text-white/70">
          Wednesday, June 24, 2026 · Cebu City
        </span>
        <div className="flex items-center gap-4 text-white/70">
          <a href="#" aria-label="Facebook" className="hover:text-white">
            <FacebookIcon width={16} height={16} />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-white">
            <InstagramIcon width={16} height={16} />
          </a>
          <a href="#" aria-label="X" className="hover:text-white">
            <XIcon width={16} height={16} />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-white">
            <YoutubeIcon width={16} height={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
