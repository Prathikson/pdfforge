import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PDFforge — Visual PDF Toolkit",
  description:
    "12 powerful PDF tools. Real PDF previews. Merge, split, rotate, compress, watermark and more — all in your browser. Zero server uploads, 100% free.",
  keywords: "PDF, merge PDF, split PDF, compress PDF, rotate PDF, PDF tools, free PDF editor",
  authors: [{ name: "PDFforge" }],
  openGraph: {
    title: "PDFforge — Visual PDF Toolkit",
    description: "12 powerful PDF tools, all in your browser. Zero uploads, always free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFforge — Visual PDF Toolkit",
    description: "12 powerful PDF tools, all in your browser. Zero uploads, always free.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📄</text></svg>" />
        {/* Init theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('pdfforge-theme');
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
