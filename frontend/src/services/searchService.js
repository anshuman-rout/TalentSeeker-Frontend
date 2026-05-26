import API from "./api";

export const searchCandidates =
  async ({
    query,
    context_id,
    reset_context = false,
  }) => {

    const response = await API.post(
      "/api/v1/search",
      {
        query,
        context_id,
        reset_context,
      }
    );

    return response.data;
};