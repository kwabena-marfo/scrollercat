import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LogoMark size={56} />
      <h1 className="mt-6 text-3xl font-black">This page wandered off</h1>
      <p className="mt-2 text-muted-foreground">Try searching the shop instead.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/shop">Go to the shop</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
