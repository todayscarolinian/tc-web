"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { FacebookIcon, XIcon } from "@/components/site/social-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

interface ShareRowProps {
  url: string;
}

export function ShareRow({ url }: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const btn = "flex items-center gap-2 border border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-muted";
  const disabledBtn = "flex items-center gap-2 border border-border px-3 py-2 text-sm font-bold text-muted-foreground opacity-60 cursor-not-allowed";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
      <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Share this story
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button type="button" className={disabledBtn} aria-disabled="true">
              <FacebookIcon width={16} height={16} /> Facebook
            </button>
          }
        />
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <button type="button" className={disabledBtn} aria-disabled="true">
              <XIcon width={16} height={16} /> Post
            </button>
          }
        />
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
      <button type="button" className={cn(btn, copied && "border-brand text-brand")} onClick={copyLink}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
