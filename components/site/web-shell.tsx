import { TopBar } from "@/components/site/top-bar";
import { Masthead } from "@/components/site/masthead";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";

export function WebShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <Masthead />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
