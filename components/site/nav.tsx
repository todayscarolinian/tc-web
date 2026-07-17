"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { SECTIONS } from "@/lib/content";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <div className="hidden sm:flex sm:items-center">
          {SECTIONS.map((section) => {
            const href = `/section/${section.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={section.slug}
                href={href}
                className={cn(
                  "font-ui border-b-2 border-transparent px-3 py-3 text-sm font-bold whitespace-nowrap text-foreground hover:text-brand",
                  active && "border-brand text-brand"
                )}
              >
                {section.name}
              </Link>
            );
          })}
        </div>
        <span className="grow" />
        <Sheet>
          <SheetTrigger
            aria-label="All sections"
            className="px-3 py-3 text-foreground hover:text-brand sm:hidden"
          >
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <Image
                  src="/logos/tc-symbol-red.png"
                  alt="Today's Carolinian"
                  width={28}
                  height={28}
                  className="block h-7 w-auto dark:hidden"
                />
                <Image
                  src="/logos/tc-symbol-onblack.png"
                  alt="Today's Carolinian"
                  width={28}
                  height={28}
                  className="hidden h-7 w-auto dark:block"
                />
                <span className="sr-only">Sections</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col px-2">
              {SECTIONS.map((section) => {
                const href = `/section/${section.slug}`;
                const active = pathname === href;
                return (
                  <SheetClose
                    key={section.slug}
                    render={<Link href={href} />}
                    className={cn(
                      "font-ui rounded-md px-3 py-3 text-sm font-bold text-foreground hover:text-brand",
                      active && "bg-surface text-brand"
                    )}
                  >
                    {section.name}
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
