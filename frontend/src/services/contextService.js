import API from "./api";

// GET /api/v1/search/contexts
// Returns all contexts with their full history in one call (merged API)
export const getAllContexts = async () => {
  const response = await API.get("/api/v1/search/contexts");
  return response.data;
};

// DELETE /api/v1/delete/contexts/{context_id}
export const deleteContext = async (contextId) => {
  const response = await API.delete(`/api/v1/delete/contexts/${contextId}`);
  return response.data;
};