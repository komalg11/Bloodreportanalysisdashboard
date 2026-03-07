import { Request, Response } from "express";
import prisma from "../config/db";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { processFileForText } from "../services/ocr.service";
import { extractParametersFromText } from "../utils/parameterExtractor";
import { normalizeParameters } from "../services/ai.service";
import { generateInsights } from "../services/insight.service";
import { normalizeParameterName } from "../utils/normalization";
import { extractReportMetadata } from "../utils/reportMetadataExtractor";

const generatePatientId = (): string => `PID-${Date.now().toString().slice(-8)}`;

/**
 * Upload a new blood report
 * POST /api/reports/upload
 */
export const uploadReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const file = req.file;
        // We currently use a dummy userId for demonstration. In a real app, get this from JWT.
        const { userId, reportDate } = req.body;

        if (!file) return res.status(400).json({ error: "No file provided" });
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        // Ensure the user exists, creating a mock one if needed for the demo
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: { id: userId, name: "Test User", email: `test_${Date.now()}@example.com` },
            });
        }

        // 1. Upload to Cloudinary
        const cloudinaryResponse = await uploadToCloudinary(file.buffer, "blood_reports");
        const fileUrl = cloudinaryResponse.secure_url;

        // 2. Perform OCR
        const rawText = await processFileForText(file.buffer, file.mimetype);

        if (!rawText || rawText.length < 10) {
            return res.status(400).json({ error: "Could not extract sufficient text from the document." });
        }

        // 3. Extract Parameters using regex-based extractor
        const rawParameters = extractParametersFromText(rawText);
        const metadata = extractReportMetadata(rawText);
        const effectivePatientId = metadata.patientId || generatePatientId();

        if (!rawParameters || rawParameters.length === 0) {
            return res.status(400).json({ error: "Could not identify any blood parameters from the document." });
        }

        // 4. Optional AI normalization (gracefully falls back if unavailable)
        const parameters = await normalizeParameters(rawParameters);

        // 5. Generate health insights based on parameters
        const insightsData = generateInsights(parameters);

        // 6. Save everything in standard Prisma transaction to ensure Atomicity
        const parsedDate = reportDate
            ? new Date(reportDate)
            : metadata.reportDate || new Date();

        const report = await prisma.report.create({
            data: {
                userId: user.id,
                fileUrl,
                fileType: file.mimetype,
                originalFileName: file.originalname || null,
                fileSize: typeof file.size === "number" ? file.size : null,
                reportDate: parsedDate,
                patientName: metadata.patientName,
                patientId: effectivePatientId,
                patientAge: metadata.patientAge,
                gender: metadata.gender,
                bloodGroup: metadata.bloodGroup,
                doctorName: metadata.doctorName,
                parameters: {
                    create: parameters.map((p) => ({
                        name: normalizeParameterName(p.name),
                        value: p.value,
                        unit: p.unit,
                        referenceRange: p.referenceRange,
                        status: p.status,
                    })),
                },
                analysisResult: {
                    create: {
                        insights: insightsData.insights,
                        recommendations: insightsData.recommendations,
                    },
                },
            },
            include: {
                parameters: true,
                analysisResult: true,
            },
        });

        return res.status(201).json({ message: "Report processed successfully", data: report });
    } catch (error: any) {
        console.error("Upload Report Error:", error);
        return res.status(500).json({ error: error.message || "Failed to process report" });
    }
};

/**
 * Get all reports for a user
 * GET /api/reports?userId=...
 */
export const getUserReports = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const reports = await prisma.report.findMany({
            where: { userId: String(userId) },
            orderBy: { reportDate: "desc" },
            include: {
                parameters: true,
                analysisResult: true,
            },
        });

        return res.status(200).json({ data: reports });
    } catch (error: any) {
        return res.status(500).json({ error: "Failed to fetch reports" });
    }
};

/**
 * Get report details
 * GET /api/reports/:id
 */
export const getReportDetails = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const report = await prisma.report.findUnique({
            where: { id: String(id) },
            include: {
                parameters: true,
                analysisResult: true,
            },
        });

        if (!report) return res.status(404).json({ error: "Report not found" });

        return res.status(200).json({ data: report });
    } catch (error: any) {
        return res.status(500).json({ error: "Failed to fetch report details" });
    }
};

/**
 * Get report health trends across time
 * GET /api/reports/trends?userId=...
 */
export const getReportTrends = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const reports = await prisma.report.findMany({
            where: { userId: String(userId) },
            orderBy: { reportDate: "asc" },
            include: { parameters: true },
        });

        if (!reports || reports.length === 0) {
            return res.status(200).json({ data: [] });
        }

        // Grouping by parameter name
        const trends: Record<string, { date: Date; value: number }[]> = {};

        reports.forEach((report: any) => {
            report.parameters.forEach((param: any) => {
                if (!trends[param.name]) {
                    trends[param.name] = [];
                }
                trends[param.name].push({
                    date: report.reportDate,
                    value: param.value,
                });
            });
        });

        return res.status(200).json({ data: trends });
    } catch (error: any) {
        console.error("Trend Analysis Error:", error);
        return res.status(500).json({ error: "Failed to fetch trend data" });
    }
};

/**
 * Compare latest with previous
 * GET /api/reports/compare?userId=...
 */
export const compareLatestReports = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const reports = await prisma.report.findMany({
            where: { userId: String(userId) },
            orderBy: { reportDate: "desc" },
            take: 2,
            include: { parameters: true },
        });

        if (reports.length < 2) {
            return res.status(400).json({ error: "Not enough reports to compare" });
        }

        const [latest, previous] = reports;

        const comparisons = latest.parameters.map((latestParam: any) => {
            const prevParam = previous.parameters.find(
                (p: any) => p.name.toLowerCase() === latestParam.name.toLowerCase()
            );

            return {
                parameter: latestParam.name,
                latestValue: latestParam.value,
                previousValue: prevParam ? prevParam.value : null,
                unit: latestParam.unit,
                changeStatus:
                    prevParam && latestParam.value > prevParam.value
                        ? "Increased"
                        : prevParam && latestParam.value < prevParam.value
                            ? "Decreased"
                            : prevParam
                                ? "Unchanged"
                                : "N/A",
            };
        });

        return res.status(200).json({
            data: {
                latestDate: latest.reportDate,
                previousDate: previous.reportDate,
                comparisons,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ error: "Failed to compare reports" });
    }
};

/**
 * Delete a report
 * DELETE /api/reports/:id
 */
export const deleteReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Check if the report exists
        const report = await prisma.report.findUnique({
            where: { id: String(id) },
        });

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        // Delete related records first (due to foreign key constraints)
        // Delete parameters
        await prisma.bloodParameter.deleteMany({
            where: { reportId: String(id) },
        });

        // Delete analysis result
        await prisma.analysisResult.deleteMany({
            where: { reportId: String(id) },
        });

        // Delete the report itself
        await prisma.report.delete({
            where: { id: String(id) },
        });

        return res.status(200).json({ message: "Report deleted successfully" });
    } catch (error: any) {
        console.error("Delete Report Error:", error);
        return res.status(500).json({ error: error.message || "Failed to delete report" });
    }
};
