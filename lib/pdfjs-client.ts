export async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist/build/pdf");

  if (typeof window !== "undefined") {
    const workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  return pdfjsLib;
}
