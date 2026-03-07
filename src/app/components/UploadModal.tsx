import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileText, CheckCircle2, Loader2, Activity, AlertCircle } from 'lucide-react';
import { useUploadReport } from '@/hooks/useReportApi';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => Promise<void> | void;
  onViewResults?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete, onViewResults }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'success' | 'error'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error: uploadError } = useUploadReport();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      // If no file selected, open file picker
      fileInputRef.current?.click();
      return;
    }

    setStep('analyzing');
    setErrorMessage('');

    try {
      const result = await upload(selectedFile);
      setUploadResult(result);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || err.message || 'Failed to upload report');
      setStep('error');
    }
  };

  const handleReset = async () => {
    setStep('upload');
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage('');
    if (onUploadComplete) {
      await onUploadComplete();
    }
    if (onViewResults) {
      onViewResults();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage('');
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Upload New Report</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              {step === 'upload' && (
                <div className="space-y-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800">Drag & drop your report here</p>
                      <p className="text-sm text-slate-500 mt-1">Supports PDF, JPG, or PNG (Max 10MB)</p>
                    </div>
                    <button 
                      type="button"
                      className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                  
                  {selectedFile ? (
                    <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3 border border-blue-100">
                      <FileText className="text-blue-500" size={20} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Selected File</p>
                        <p className="text-sm text-blue-600">{selectedFile.name}</p>
                      </div>
                      <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                      <FileText className="text-slate-400" size={20} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Supported Formats</p>
                        <p className="text-sm text-slate-500">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="text-blue-600 w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Analyzing Your Report</h3>
                    <p className="text-slate-500 mt-2 max-w-xs">
                      Our AI-powered engine is extracting parameters and comparing them with historical data.
                    </p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5 }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Report Processed!</h3>
                    <p className="text-slate-500 mt-2">
                      {uploadResult?.data?.parameters 
                        ? `We've successfully extracted ${uploadResult.data.parameters.length} parameters and updated your trends.`
                        : "Your report has been processed successfully."
                      }
                    </p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              )}

              {step === 'error' && (
                <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircle size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Upload Failed</h3>
                    <p className="text-slate-500 mt-2">
                      {errorMessage || "Something went wrong while processing your report."}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setStep('upload')}
                      className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={handleClose}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
