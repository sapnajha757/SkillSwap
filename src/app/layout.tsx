import type { Metadata, Viewport } from "next";
import { Fraunces, Sora, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers/ConvexClientProvider";
import "./globals.css";

// ── Fonts — optimized weights only ───────────────────────────────
// WHY: We removed weight "300" (unused) and narrowed to only what renders.
// next/font automatically: self-hosts, adds preload link, uses font-display:swap,
// eliminates render-blocking Google Fonts requests entirely.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Only weights actually used: 400 (body display), 600 (headings), 700 (hero)
  weight: ["400", "600", "700"],
  // Reduce font file size — we only need normal style
  style: ["normal"],
  preload: true,
  fallback: ["Georgia", "serif"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  // Only weights actually used: 400 (body), 500 (medium), 600 (semi-bold)
  weight: ["400", "500", "600"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Mono only needs 400 (code) and 500 (labels)
  weight: ["400", "500"],
  preload: false, // mono font is not above-the-fold critical
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

// ── Viewport — required for mobile SEO ───────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1512",
  colorScheme: "dark",
};

// ── Root Metadata ─────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SkillSwap | The AI Career OS",
    template: "%s | SkillSwap OS",
  },
  description:
    "The intelligent operating system for a student's career. Speak your intent. Watch the AI map the network and connect you with top-tier peers globally.",
  keywords: [
    "AI career",
    "student skills",
    "peer learning",
    "hackathons",
    "skill exchange",
    "career OS",
    "AI matching",
    "portfolio builder",
  ],
  authors: [{ name: "SkillSwap" }],
  creator: "SkillSwap",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SkillSwap",
    title: "SkillSwap | The AI Career OS",
    description:
      "Speak your intent. Watch the AI map the network and connect you with top-tier peers globally.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkillSwap — The AI Career OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwap | The AI Career OS",
    description: "Speak your intent. Watch the AI map the network.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      // Prevent flash of unstyled content
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data — JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SkillSwap",
              description:
                "The intelligent AI operating system for student careers",
              applicationCategory: "EducationApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${sora.variable} ${jetbrainsMono.variable} font-body bg-background text-text-primary antialiased`}
      >
        {/* Skip to main content — Accessibility requirement for score 100 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:font-medium"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
