export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log("PDF conversion started");

        // ✅ FIX: only run in browser
        if (typeof window === "undefined") {
            return {
                imageUrl: "",
                file: null,
                error: "Cannot run on server",
            };
        }

        // ✅ dynamic import (VERY IMPORTANT)
        const pdfjsLib = await import("pdfjs-dist");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log("PDF loaded");

        const page = await pdf.getPage(1);
        console.log("Page loaded");

        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return {
                imageUrl: "",
                file: null,
                error: "Canvas context failed",
            };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvas,
            canvasContext: context,
            viewport,
        }).promise;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    return resolve({
                        imageUrl: "",
                        file: null,
                        error: "Blob failed",
                    });
                }

                const imageFile = new File([blob], "resume.png", {
                    type: "image/png",
                });

                resolve({
                    imageUrl: URL.createObjectURL(blob),
                    file: imageFile,
                });
            });
        });
    } catch (err) {
        console.error("PDF conversion error:", err);

        return {
            imageUrl: "",
            file: null,
            error: `Failed: ${err}`,
        };
    }
}