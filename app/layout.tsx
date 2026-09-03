import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { CALL_BAR_HEIGHT } from "@/components/call-bar";
import { ChatWidget } from "@/components/chat-widget";
import { FloatingCall } from "@/components/floating-call";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SavedHomesProvider } from "@/components/saved-homes";
import { chatEmbed } from "@/lib/ghl/chat-embed";
import { callBar, chatWidget, floatingCall } from "@/lib/page-config";
import { skin, skinStyles, type FontChoice } from "@/lib/skin";
import { site } from "@/lib/site";
import "./globals.css";

/* Every family a skin can ask for. `next/font` has to see these calls
   literally to self-host the files at build time, so they are all declared
   here and the active skin picks between them below — see `lib/skin.ts`.
   A family no skin uses costs nothing: unreferenced CSS variables do not
   pull the font files down. */
const uiSans = Geist({ variable: "--font-ui-sans", subsets: ["latin"] });
const monoFace = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"] });
const displaySerif = Fraunces({
  variable: "--font-display-serif",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});
const grotesk = Inter({ variable: "--font-grotesk", subsets: ["latin"] });

const FONT_VARS: Record<FontChoice, string> = {
  "display-serif": "--font-display-serif",
  "ui-sans": "--font-ui-sans",
  grotesk: "--font-grotesk",
  mono: "--font-mono-face",
  /* No webfont behind it — `stack()` special-cases this one. */
  system: "",
};

const FONT_FALLBACKS: Record<FontChoice, string> = {
  "display-serif": "ui-serif, Georgia, serif",
  "ui-sans": "ui-sans-serif, system-ui, sans-serif",
  grotesk: "ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, monospace",
  system:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const stack = (choice: FontChoice) =>
  choice === "system"
    ? FONT_FALLBACKS.system
    : `var(${FONT_VARS[choice]}), ${FONT_FALLBACKS[choice]}`;

/* The skin's palette, radii and typefaces as one stylesheet, inlined ahead
   of anything else in the head. */
const SKIN_CSS =
  skinStyles() +
  `:root:root{--font-family-display:${stack(skin.fonts.display)};` +
  `--font-family-sans:${stack(skin.fonts.sans)};` +
  `--font-family-mono:${stack(skin.fonts.mono)}}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.short}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "manufactured homes",
    "modular homes Maine",
    "Augusta manufactured homes",
    "modular homes",
    "mobile homes",
    "factory-built housing",
    "HUD code homes",
    "double-wide",
    "floor plans",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#100e0c" },
  ],
  colorScheme: "light dark",
};

/**
 * Applies the stored theme before first paint. Kept tiny and inline so there
 * is no flash of the wrong palette on a cold load.
 *
 * The default is **light**, not the reader's system setting. NERTO's brand is
 * a white ground — it is what the business's own site wears and what its
 * printed material matches — and a visitor whose phone is in dark mode was
 * otherwise served a navy site that looked like a different company. The
 * toggle in the header still works and is still remembered; it just has to be
 * asked for. Change `"dark"` to `matchMedia(...).matches` here to follow the
 * system again.
 */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem("nerto:theme");document.documentElement.classList.toggle("dark",s==="dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* GHL's own chat widget, when `CHAT_WIDGET` names one — see
     `lib/ghl/chat-embed.ts`. It replaces the built-in widget rather than
     joining it: one chat bubble in the corner, never two. */
  const embed = chatEmbed();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${uiSans.variable} ${monoFace.variable} ${displaySerif.variable} ${grotesk.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: SKIN_CSS }} />
        {/* The phone strip's height, published where the rest of the page can
            offset against it. `app/globals.css` defaults it to zero, so the
            switch in `lib/page-config.ts` is the only thing to change. */}
        {callBar && (
          <style
            dangerouslySetInnerHTML={{ __html: `:root:root{--callbar-h:${CALL_BAR_HEIGHT}}` }}
          />
        )}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <noscript>
          {/* Scroll reveals start hidden; without JS they must not stay that way. */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <SavedHomesProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          {floatingCall && <FloatingCall />}
          {embed ? (
            <Script
              id="ghl-chat-widget"
              src={embed.src}
              strategy="lazyOnload"
              {...embed.attributes}
            />
          ) : (
            chatWidget && <ChatWidget />
          )}
        </SavedHomesProvider>
      </body>
    </html>
  );
}
