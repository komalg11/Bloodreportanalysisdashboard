import { Router } from "express";
import upload from "../middleware/upload";
import {
    uploadReport,
    getUserReports,
    getReportDetails,
    getReportTrends,
    compareLatestReports,
    deleteReport,
} from "../controllers/report.controller";

const router = Router();

// Endpoint for uploading and processing blood report
router.post("/upload", upload.single("file"), uploadReport);

// Endpoints for fetching data
router.get("/", getUserReports);
router.get("/trends", getReportTrends);
router.get("/compare", compareLatestReports);
router.get("/:id", getReportDetails);

// Endpoint for deleting a report
router.delete("/:id", deleteReport);

export default router;
