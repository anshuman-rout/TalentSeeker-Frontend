import React, { useState } from "react";
import { useUpload } from "../../context/UploadContext";
import { uploadCVs } from "../../services/ingestionService";

const UploadBox = () => {

  const {
    selectedFiles,
    setSelectedFiles,
    showUploadBox,
    setShowUploadBox,
  } = useUpload();

  const [loading, setLoading] = useState(false);
  // null | "success" | "error"
  const [status, setStatus] = useState(null);

  if (!showUploadBox) return null;

  const handleUpload = async () => {
    try {
      setLoading(true);
      setStatus(null);

      await uploadCVs(selectedFiles);

      setStatus("success");
      setSelectedFiles([]);

      // Auto-close after 2s so the user sees the success message
      setTimeout(() => {
        setStatus(null);
        setShowUploadBox(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStatus(null);
    setShowUploadBox(false);
  };

  return (
    <div className="fixed bottom-10 right-10 w-[420px] bg-[#181818] border border-[#333] rounded-2xl p-6 shadow-2xl z-50">

      <h2 className="text-xl font-semibold mb-4">Selected CV Files</h2>

      {/* File list — hidden after success since files are cleared */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="bg-[#242424] px-3 py-2 rounded-lg text-sm text-gray-300">
              {file.name}
            </div>
          ))}
        </div>
      )}

      {/* Inline status message */}
      {status === "success" && (
        <div className="flex items-center gap-2 bg-green-950/50 border border-green-700 text-green-300 text-sm px-4 py-3 rounded-xl mb-4">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          CVs indexed successfully!
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 bg-red-950/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Upload failed. Please try again.
        </div>
      )}

      {/* Buttons — hidden after success since box auto-closes */}
      {status !== "success" && (
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-[#2a2a2a] hover:bg-[#333] py-3 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? "Uploading…" : "Upload All"}
          </button>
        </div>
      )}

    </div>
  );
};

export default UploadBox;