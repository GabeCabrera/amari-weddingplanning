import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aisle - Wedding Planner",
  description: "A calm, beautiful space to plan your wedding together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 300,
            },
          }}
        />
      </body>
    </html>
  );
}
