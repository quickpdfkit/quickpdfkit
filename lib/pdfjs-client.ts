export async function loadPdfjs() {
  if (typeof window === "undefined") {
    throw new Error("pdfjs can only be loaded in the browser");
  }

  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjsLib;
}
