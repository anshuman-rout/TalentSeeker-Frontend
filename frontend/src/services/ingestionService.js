import API from "./api";

// Upload Multiple CVs
export const uploadCVs = async (
  files
) => {

  const formData =
    new FormData();

  for (let i = 0; i < files.length; i++) {

    formData.append(
      "files",
      files[i]
    );
  }

  const response = await API.post(
    "/api/v1/ingest/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};