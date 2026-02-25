import type { Metadata } from "next";
import "@/styles/globals.css";

const SITE_URL = "https://pdfnope.xtoicstudio.com";
const SITE_NAME = "PDFnope";
const TITLE = "PDFnopr — Free Online PDF Tools | Merge, Split, Compress & More";
const DESCRIPTION =
  "Free online PDF tools — no login, no uploads, no limits. Merge PDFs, split pages, compress files, rotate, watermark, protect, convert images to PDF and more. 100% private, runs in your browser.";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    // Primary high-volume
    "PDF tools",
    "free PDF editor",
    "online PDF tools",
    "PDF editor online free",
    "PDF tools online",
    // Merge
    "merge PDF",
    "merge PDF files online free",
    "combine PDF",
    "combine PDF files",
    "join PDF files",
    "PDF merger",
    // Split
    "split PDF",
    "split PDF online free",
    "extract pages from PDF",
    "PDF splitter",
    "separate PDF pages",
    // Compress
    "compress PDF",
    "reduce PDF size",
    "compress PDF online free",
    "PDF compressor",
    "shrink PDF file size",
    "reduce PDF file size online",
    // Convert
    "convert image to PDF",
    "JPG to PDF",
    "PNG to PDF",
    "images to PDF converter",
    "PDF to image",
    "PDF to JPG",
    "PDF to PNG",
    // Rotate
    "rotate PDF",
    "rotate PDF pages online",
    "rotate pages in PDF",
    // Protect / unlock
    "protect PDF with password",
    "PDF password protection",
    "unlock PDF",
    "remove PDF password",
    "PDF security",
    // Watermark
    "add watermark to PDF",
    "PDF watermark online",
    "watermark PDF free",
    // Reorder / edit
    "reorder PDF pages",
    "rearrange PDF pages",
    "PDF page reorder",
    "edit PDF online",
    "PDF editor no login",
    // Metadata
    "edit PDF metadata",
    "PDF metadata editor",
    // Grayscale
    "convert PDF to grayscale",
    "black and white PDF",
    // Privacy / no upload
    "PDF tools no upload",
    "offline PDF tools",
    "browser based PDF editor",
    "private PDF editor",
    "no login PDF tools",
    "free PDF tools without registration",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Productivity",

  // ── Canonical ────────────────────────────────────────────────────────────
  alternates: {
    canonical: "/",
  },

  // ── Robots ───────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFnope — Free Online PDF Tools",
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@pdfnope",
    site: "@pdfnope",
  },

  // ── App / PWA ────────────────────────────────────────────────────────────
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },

  // ── Verification (fill in when you have these) ────────────────────────────
  verification: {
    // google: "your-google-site-verification-token",
    // yandex: "your-yandex-verification-token",
    // bing: "your-bing-verification-token",
  },
};

// ── JSON-LD Structured Data ───────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // WebSite
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?tool={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    // WebApplication
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Merge PDF files",
        "Split PDF pages",
        "Compress PDF",
        "Rotate PDF pages",
        "Convert images to PDF",
        "Convert PDF to images",
        "Add watermark to PDF",
        "Protect PDF with password",
        "Unlock PDF password",
        "Reorder PDF pages",
        "Convert PDF to grayscale",
        "Edit PDF metadata",
      ],
      screenshot: `${SITE_URL}/og-image.png`,
    },
    // Organization
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    // BreadcrumbList
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "PDF Tools",
          item: `${SITE_URL}/#tools`,
        },
      ],
    },
    // FAQPage
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is PDFnope completely free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. PDFnope is 100% free with no login, no subscription, and no hidden fees.",
          },
        },
        {
          "@type": "Question",
          name: "Are my PDF files uploaded to a server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. All PDF processing happens entirely in your browser using Web APIs. Your files never leave your device.",
          },
        },
        {
          "@type": "Question",
          name: "How do I merge PDF files online?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open the Merge tool, drop your PDF files in, drag to reorder them, then click Merge. Your combined PDF downloads instantly.",
          },
        },
        {
          "@type": "Question",
          name: "Can I split a PDF into individual pages?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Use the Split tool to select specific pages, define ranges, or split every N pages automatically.",
          },
        },
        {
          "@type": "Question",
          name: "How do I compress a PDF to reduce its file size?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open the Compress tool, upload your PDF, and click Compress. PDFnope optimizes the file structure to reduce size.",
          },
        },
        {
          "@type": "Question",
          name: "What file formats can I convert to PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PDFnope supports JPG, PNG, WEBP, GIF, and BMP image formats. Use the Images → PDF tool to combine multiple images into a single PDF.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ── Favicons ── */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />

        {/* ── Theme color ── */}
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090e" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f9f9fc" />
        <meta name="color-scheme" content="dark light" />

        {/* ── Geo / language ── */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />

        {/* ── JSON-LD Structured Data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── Init theme before paint (prevents flash) ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('pdfnope-theme');
                var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var theme = stored || preferred;
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}