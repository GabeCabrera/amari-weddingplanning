import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { RedditPixelTracker } from "@/components/reddit-pixel-tracker";
import "./globals.css";

const REDDIT_PIXEL_ID = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;

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
      <head>
        {REDDIT_PIXEL_ID && (
          <Script
            id="reddit-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
                rdt('init','${REDDIT_PIXEL_ID}');
                rdt('track', 'PageVisit');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <RedditPixelTracker />
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 300,
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
