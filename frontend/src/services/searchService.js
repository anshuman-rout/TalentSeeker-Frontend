import API from "./api";

export const searchCandidates =
  async ({
    query,
    context_id,
    reset_context = false,
    limit=10,
    offset=0,
  }) => {

    const response = await API.post(
      "/api/v1/search",
      {
        query,
        context_id,
        reset_context,
        limit,
        offset,
      }
    );

    return response.data;
};