import axios from "axios";

// Base instance of Axios configured for our API
const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Uploads a blood report file (PDF/Image) to be processed.
 * @param file The file object from an input field
 * @param userId Optional user id (will default to a mock in backend if omitted here for demo)
 */
export const uploadReportApi = async (file: File, userId: string = "demo-user") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    // Note: Report Date can also be appended here if you let users pick a date
    // formData.append("reportDate", new Date().toISOString());

    const response = await apiClient.post("/reports/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

/**
 * Fetches the user's report history.
 * @param userId The ID of the user
 */
export const getReportsApi = async (userId: string = "demo-user") => {
    const response = await apiClient.get(`/reports?userId=${userId}`);
    return response.data;
};

/**
 * Fetches the full details of a single report, including parameters and AI insights.
 * @param reportId The unique ID of the report
 */
export const getReportDetailsApi = async (reportId: string) => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
};

/**
 * Fetches the health trends across multiple reports.
 * Returns an object keyed by parameter (e.g., Hemoglobin) containing an array of dates and values.
 * @param userId The ID of the user
 */
export const getReportTrendsApi = async (userId: string = "demo-user") => {
    const response = await apiClient.get(`/reports/trends?userId=${userId}`);
    return response.data;
};

/**
 * Compares the user's latest report against their previous one to highlight changes.
 * @param userId The ID of the user
 */
export const getCompareReportsApi = async (userId: string = "demo-user") => {
    const response = await apiClient.get(`/reports/compare?userId=${userId}`);
    return response.data;
};

/**
 * Deletes a specific report by ID.
 * @param reportId The unique ID of the report to delete
 */
export const deleteReportApi = async (reportId: string) => {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
};
