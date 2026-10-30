import type { Metadata } from "next";

import SessionWrapper from "@/components/sessionWrapper";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionWrapper>{children}</SessionWrapper>;
}
