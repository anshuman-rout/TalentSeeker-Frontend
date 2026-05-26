import API from "./api";

export const loginUser = async (
  username,
  password
) => {

  // Form URL Encoded Data
  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    username
  );

  formData.append(
    "password",
    password
  );

  const response = await API.post(
    "/api/v1/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};