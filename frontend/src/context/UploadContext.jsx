import React, {
  createContext,
  useContext,
  useState,
} from "react";

const UploadContext =
  createContext();

export const UploadProvider = ({
  children,
}) => {

  const [selectedFiles,
    setSelectedFiles] =
    useState([]);

  const [showUploadBox,
    setShowUploadBox] =
    useState(false);

  return (
    <UploadContext.Provider
      value={{
        selectedFiles,
        setSelectedFiles,
        showUploadBox,
        setShowUploadBox,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () =>
  useContext(UploadContext);