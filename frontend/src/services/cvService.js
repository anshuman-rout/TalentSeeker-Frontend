const BASE_URL =
  "http://192.168.7.12:8001";

export const getCVViewUrl = (
  filePath
) => {

  return `${BASE_URL}/api/v1/cv/view?file_path=${encodeURIComponent(
    filePath
  )}`;
};