import "@/styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import Provider from "@/components/provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/data/site";

const myFont = localFont({
  src: [
    { path: "../fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "../fonts/Poppins-SemiBold.ttf", weight: "600" },
    { path: "../fonts/Poppins-Bold.ttf", weight: "700" },
    { path: "../fonts/Poppins-Bold.ttf", weight: "900" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={myFont.className} suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
