"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArticleToolbar() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Like"
        aria-pressed={liked}
        onClick={() => setLiked((v) => !v)}
      >
        <Heart className={liked ? "fill-brand text-brand" : undefined} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Save"
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        <Bookmark className={saved ? "fill-brand text-brand" : undefined} />
      </Button>
    </div>
  );
}
