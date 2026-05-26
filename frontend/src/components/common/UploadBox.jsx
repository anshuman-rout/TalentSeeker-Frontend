import React, {
  useState,
} from "react";

import {
  useUpload,
} from "../../context/UploadContext";

import {
  uploadCVs,
} from "../../services/ingestionService";

const UploadBox = () => {

  const {
    selectedFiles,
    setSelectedFiles,
    showUploadBox,
    setShowUploadBox,
  } = useUpload();

  const [loading,
    setLoading] =
    useState(false);

  if (!showUploadBox) return null;

  // Upload All Files
  const handleUpload =
    async () => {

      try {

        setLoading(true);

        const data =
          await uploadCVs(
            selectedFiles
          );

        console.log(data);

        alert(
          "CVs Indexed Successfully"
        );

        setSelectedFiles([]);

        setShowUploadBox(false);

      } catch (error) {

        console.log(error);

        alert("Upload Failed");

      } finally {

        setLoading(false);
      }
    };

  return (
    <div
      className="
      fixed
      bottom-10
      right-10
      w-[420px]
      bg-[#181818]
      border
      border-[#333]
      rounded-2xl
      p-6
      shadow-2xl
      z-50
      "
    >

      <h2 className="text-xl font-semibold mb-4">
        Selected CV Files
      </h2>

      {/* File List */}
      <div className="space-y-3 max-h-[250px] overflow-y-auto">

        {selectedFiles.map(
          (file, index) => (

            <div
              key={index}
              className="
              bg-[#242424]
              p-3
              rounded-lg
              text-sm
              "
            >
              {file.name}
            </div>
          )
        )}

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={() =>
            setShowUploadBox(false)
          }
          className="
          flex-1
          bg-gray-700
          hover:bg-gray-600
          py-3
          rounded-xl
          "
        >
          Cancel
        </button>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="
          flex-1
          bg-green-600
          hover:bg-green-500
          py-3
          rounded-xl
          "
        >
          {loading
            ? "Uploading..."
            : "Upload All"}
        </button>

      </div>
    </div>
  );
};

export default UploadBox;