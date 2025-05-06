import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/utils/tanstackProvider";


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
      <body
        className={`antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
