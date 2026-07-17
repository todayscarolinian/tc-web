import { WebShell } from "@/components/site/web-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <WebShell>{children}</WebShell>;
}
