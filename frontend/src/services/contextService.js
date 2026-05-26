import API from "./api";

export const getSearchContext =
  async (contextId) => {

    const response = await API.get(
      `/api/v1/search/contexts/${contextId}`
    );

    return response.data;
};