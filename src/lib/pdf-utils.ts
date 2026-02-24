// PDF.js singleton loader
let pdfjsLib: any = null;

export async function getPDFJS(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (typeof window === "undefined") throw new Error("PDF.js requires browser");

  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      pdfjsLib = (window as any).pdfjsLib;
      resolve(pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfjsLib = (window as any).pdfjsLib;
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// pdf-lib singleton loader
let pdfLibCache: any = null;

export async function getPDFLib(): Promise<any> {
  if (pdfLibCache) return pdfLibCache;
  if (typeof window === "undefined") throw new Error("pdf-lib requires browser");

  return new Promise((resolve, reject) => {
    if ((window as any).PDFLib) {
      pdfLibCache = (window as any).PDFLib;
      resolve(pdfLibCache);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = () => {
      pdfLibCache = (window as any).PDFLib;
      resolve(pdfLibCache);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** Render a PDF page to a data URL using PDF.js */
export async function renderPageToDataURL(
  pdfDoc: any,
  pageNum: number,
  scale = 0.4,
  format: "jpeg" | "png" = "jpeg",
  quality = 0.8
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL(`image/${format}`, quality);
}

/** Load a PDF file and return pdfjs doc + page count */
export async function loadPDFFile(file: File): Promise<{ pdf: any; count: number }> {
  const pdfjs = await getPDFJS();
  const ab = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: ab }).promise;
  return { pdf, count: pdf.numPages };
}

/** Render ALL pages of a PDF to thumbnails */
export async function renderAllThumbs(
  pdf: any,
  count: number,
  scale = 0.35
): Promise<string[]> {
  const thumbs: string[] = [];
  for (let i = 1; i <= count; i++) {
    thumbs.push(await renderPageToDataURL(pdf, i, scale));
  }
  return thumbs;
}

/** Create a blob URL from pdf bytes and schedule cleanup */
export function createPDFBlobURL(
  bytes: Uint8Array,
  ttl = 300_000
): string {
  // ✅ Force a real ArrayBuffer by copying
  const safeBytes = new Uint8Array(bytes);

  const blob = new Blob([safeBytes], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  setTimeout(() => URL.revokeObjectURL(url), ttl);

  return url;
}

/** Create an image blob URL from bytes and schedule cleanup */
export function createImageBlobURL(
  bytes: Blob,
  mimeType: string,
  ttl = 300_000
): string {
  const url = URL.createObjectURL(bytes);
  setTimeout(() => URL.revokeObjectURL(url), ttl);
  return url;
}

/** Format bytes to human-readable */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
