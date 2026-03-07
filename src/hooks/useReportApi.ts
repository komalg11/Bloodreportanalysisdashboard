import { useState, useEffect } from "react";
import {
    uploadReportApi,
    getReportsApi,
    getReportDetailsApi,
    getReportTrendsApi,
    getCompareReportsApi,
} from "../services/reportApi";

export const useUploadReport = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File, userId?: string) => {
        setIsUploading(true);
        setError(null);
        try {
            const data = await uploadReportApi(file, userId);
            setIsUploading(false);
            return data;
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || "Failed to upload.");
            setIsUploading(false);
            throw err;
        }
    };

    return { upload, isUploading, error };
};

export const useReports = (userId: string = "demo-user") => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const result = await getReportsApi(userId);
            setReports(result.data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || "Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [userId]);

    return { reports, loading, error, refetch: fetchReports };
};

export const useReportDetails = (reportId: string | null) => {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!reportId) return;

        const fetchReport = async () => {
            setLoading(true);
            try {
                const result = await getReportDetailsApi(reportId);
                setReport(result.data);
                setError(null);
            } catch (err: any) {
                setError(err?.message || "Failed to fetch report details");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    // Expose an easy way to just get insights if needed
    const insights = report?.analysisResult;
    const parameters = report?.parameters;

    return { report, insights, parameters, loading, error };
};

export const useReportTrends = (userId: string = "demo-user") => {
    const [trends, setTrends] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const result = await getReportTrendsApi(userId);
            setTrends(result.data && !Array.isArray(result.data) ? result.data : {});
        } catch (err) {
            console.error("Failed to fetch trends", err);
            setTrends({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, [userId]);

    return { trends, loading, refetch: fetchTrends };
};
