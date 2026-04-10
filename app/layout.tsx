import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "vendAR — Vending Analytics",
  description: "Analytics dashboard for your vending machine fleet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen">
        <Sidebar />
        <div className="ml-60 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
