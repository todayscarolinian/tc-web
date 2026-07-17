import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SearchBar } from "@/components/site/search-bar";
import { ENABLE_SUBSCRIPTION } from "@/src/lib/flags";

export function Masthead() {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Today's Carolinian — home" className="min-w-0 shrink">
          <Image
            src="/logos/tc-logotype-onwhite.png"
            alt="Today's Carolinian"
            width={340}
            height={50}
            priority
            className="block h-auto w-5/6 max-w-full dark:hidden"
          />
          <Image
            src="/logos/tc-logotype-onred.png"
            alt="Today's Carolinian"
            width={340}
            height={50}
            priority
            className="hidden h-auto w-5/6 max-w-full dark:block"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <SearchBar />
          <ThemeToggle />
          {ENABLE_SUBSCRIPTION && (
            <Button type="button" className="ml-2">
              Subscribe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
