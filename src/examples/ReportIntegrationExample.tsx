import React, { useState } from "react";
import { useUploadReport, useReports } from "../hooks/useReportApi";

/**
 * Example Component demonstrating how to integrate the backend APIs
 * into the existing React + Tailwind CSS dashboard.
 */
const ReportIntegrationExample: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const { upload, isUploading, error: uploadError } = useUploadReport();
    const { reports, loading, refetch } = useReports("demo-user");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            const result = await upload(file, "demo-user");
            console.log("Upload Success:", result);
            setFile(null); // Reset
            refetch(); // Refresh the report history list
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Blood Report Analysis Dashboard</h2>

            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload New Report</h3>
                <input
                    type="file"
                    accept=".pdf, image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className={`px-6 py-2 rounded-full font-bold text-white transition-colors duration-200 
            ${!file || isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
                >
                    {isUploading ? "Extracting Data with AI..." : "Upload & Analyze"}
                </button>

                {uploadError && <p className="mt-4 text-red-500 text-sm font-medium">{uploadError}</p>}
            </div>

            {/* History Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Report History</h3>
                {loading ? (
                    <p className="text-gray-500">Loading reports...</p>
                ) : reports.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No reports found. Upload your first test to see insights.</p>
                ) : (
                    <ul className="space-y-3">
                        {reports.map((report) => (
                            <li
                                key={report.id}
                                className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
                            >
                                <div>
                                    <p className="font-semibold text-gray-700">Report from: {new Date(report.reportDate).toLocaleDateString()}</p>
                                </div>
                                <button
                                    className="text-blue-600 font-medium hover:underline text-sm"
                                    onClick={() => console.log("Navigate to details with ID:", report.id)}
                                >
                                    View Analysis
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ReportIntegrationExample;
