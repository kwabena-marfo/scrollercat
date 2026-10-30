"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";

import { store } from "@/store";
import { Toaster } from "@/components/ui/toaster";

export default function ProviderComp({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Provider store={store}>
        <NextTopLoader color="hsl(21 90% 50%)" showSpinner={false} />
        {children}
        <Toaster />
      </Provider>
    </ThemeProvider>
  );
}
