import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/utils/tanstackProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "TaskSphere",
  description: "Manage projects for various teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
