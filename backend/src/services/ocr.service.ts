import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Dynamic import for pdfjs-dist
let pdfjsLib: any = null;

const getPdfJsLib = async () => {
    if (!pdfjsLib) {
        pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    }
    return pdfjsLib;
};

/**
 * Clean OCR text
 */
const cleanOCRText = (text: string): string => {
    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        // Collapse horizontal whitespace but preserve line breaks
        .replace(/[^\S\n]+/g, " ")
        .replace(/\n+/g, "\n")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();
};

/**
 * OCR for Images using Gemini Vision
 */
export const extractTextFromImage = async (imageBuffer: Buffer): Promise<string> => {
    try {
        console.log("Starting Gemini Vision OCR...");
        const startTime = Date.now();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const base64Image = imageBuffer.toString("base64");

        const prompt = `
You are reading a BLOOD TEST LAB REPORT.

Extract ALL visible text from the document.

IMPORTANT:
- Preserve test names (Hemoglobin, WBC, RBC, Platelets, etc.)
- Preserve numeric values
- Preserve units (g/dL, mg/dL, x10^3/uL etc.)
- Preserve reference ranges
- Preserve table structure when possible

Return ONLY the extracted text exactly as written.
Do NOT summarize or explain anything.
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
        ]);

        const extractedText = result.response.text();

        const elapsed = Date.now() - startTime;
        console.log(`Gemini Image OCR completed in ${elapsed}ms`);

        return cleanOCRText(extractedText);
    } catch (error: any) {
        console.error("Gemini Vision OCR Error:", error?.message || error);
        throw new Error("Failed to extract text from image");
    }
};

/**
 * Extract text from PDF
 */
export const extractTextFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
    try {
        console.log("Starting PDF extraction...");
        const startTime = Date.now();

        const pdfjs = await getPdfJsLib();
        const uint8Array = new Uint8Array(pdfBuffer);

        const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
        });

        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;

        let fullText = "";

        console.log(`PDF has ${numPages} pages`);

        for (let pageNum = 1; pageNum <= Math.min(numPages, 5); pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            fullText += pageText + "\n";
        }

        const elapsed = Date.now() - startTime;
        console.log(`PDF text extraction completed in ${elapsed}ms`);

        if (fullText.trim().length > 20) {
            return cleanOCRText(fullText);
        }

        console.log("PDF seems scanned → switching to Gemini OCR");

        return await extractPdfWithGemini(pdfBuffer);

    } catch (error: any) {
        console.error("PDF extraction error:", error?.message || error);

        console.log("Trying Gemini fallback...");
        return await extractPdfWithGemini(pdfBuffer);
    }
};

/**
 * Gemini OCR for scanned PDFs
 */
const extractPdfWithGemini = async (pdfBuffer: Buffer): Promise<string> => {
    try {
        console.log("Using Gemini OCR for PDF...");
        const startTime = Date.now();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const base64Pdf = pdfBuffer.toString("base64");

        const prompt = `
You are reading a BLOOD TEST REPORT PDF.

Extract ALL readable text from the document.

Important:
- Include test names
- Include numeric values
- Include units
- Include reference ranges
- Include patient details if visible

Return ONLY raw text exactly as written.
Do not summarize.
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf,
                },
            },
        ]);

        const extractedText = result.response.text();

        const elapsed = Date.now() - startTime;
        console.log(`Gemini PDF OCR completed in ${elapsed}ms`);

        return cleanOCRText(extractedText);

    } catch (error: any) {
        console.error("Gemini PDF OCR error:", error?.message || error);
        throw new Error("Failed to extract text from PDF");
    }
};

/**
 * Main OCR handler
 */
export const processFileForText = async (fileBuffer: Buffer, mimetype: string): Promise<string> => {

    console.log(`Processing file type: ${mimetype}`);

    let extractedText = "";

    if (mimetype === "application/pdf") {
        extractedText = await extractTextFromPdf(fileBuffer);
    } else if (mimetype.startsWith("image/")) {
        extractedText = await extractTextFromImage(fileBuffer);
    } else {
        throw new Error("Unsupported file type. Upload PDF, JPG, or PNG.");
    }

    extractedText = cleanOCRText(extractedText);

    console.log("========== OCR OUTPUT ==========");
    console.log(extractedText);
    console.log("================================");

    if (!extractedText || extractedText.trim().length < 10) {
        throw new Error(
            "Could not extract sufficient text from the document. Ensure the report is clear."
        );
    }

    return extractedText;
};
