"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { BsBoxArrowRight, BsList, BsShop } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import { authClient } from "@/lib/authClient";
import { adminMenu } from "@/data/adminMenu";
import { cn } from "@/lib/utils";

import Logo from "@/components/logo";
import ThemeToggle from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// The admin shell: waits for the session, then a sidebar + top bar around
// the page. Signed-out visitors are already redirected by src/middleware.ts;
// an expired session is caught here.
export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending }: any = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !data) router.push(`/auth/login?next=${encodeURIComponent(pathname || "/admin")}`);
  }, [isPending, data, pathname, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isPending || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LuLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const signOut = async () => {
    await authClient.signOut();
    router.push("/auth/login");
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {adminMenu.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-card p-4 lg:flex">
        <Link href="/admin" className="mb-8 px-2">
          <Logo size={28} />
        </Link>
        {nav}
        <Link
          href="/"
          target="_blank"
          className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <BsShop className="h-4 w-4" /> View store
        </Link>
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-4">
          <SheetTitle className="mb-6">
            <Logo size={26} />
          </SheetTitle>
          {nav}
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/90 px-4 backdrop-blur">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <BsList className="h-5 w-5" />
          </Button>
          <span className="ml-auto hidden text-sm text-muted-foreground sm:block">{data.user.email}</span>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <BsBoxArrowRight className="mr-2" /> Sign out
          </Button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
