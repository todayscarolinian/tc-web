"use client";

import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SubscribeStrip() {
  return (
    <div className="border-t border-border bg-surface-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Get the Daily Carolinian in your inbox
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Campus headlines from USC, every weekday morning. Free for students.
          </p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full items-center gap-2 sm:w-auto"
        >
          <div className="relative w-full sm:w-60">
            <Mail className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="you@usc.edu.ph" className="pl-8" />
          </div>
          <Button type="submit">
            Subscribe
            <ArrowRight />
          </Button>
        </form>
      </div>
    </div>
  );
}
