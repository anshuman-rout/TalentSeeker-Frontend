import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { searchCandidates } from "../services/searchService";
import { getAllContexts, deleteContext } from "../services/contextService";

const ChatContext = createContext();

// ─── helpers ────────────────────────────────────────────────────────────────

// GET /api/v1/search/contexts response shape:
// {
//   "search-123": [{ query, response: { reason_for_search, matching_candidates: [...] } }],
//   "search-456": [...],
// }
// Keys are context_ids, values are arrays of history items.

const buildMessages = (historyItems = []) =>
  historyItems.flatMap((item) => [
    {
      sender: "user",
      text: item.query,
    },
    {
      sender: "ai",
      text: item.response.reason_for_search,
      candidates: item.response.matching_candidates || [],
    },
  ]);

const buildChats = (contextsObj = {}) =>
  Object.entries(contextsObj)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([contextId, items]) => ({
      id: `backend-${contextId}`,
      context_id: contextId,
      // Use the last query in this context as the sidebar title
      title: items[items.length - 1]?.query || contextId,
      messages: buildMessages(items),
    }))
    .slice(-15)
    .reverse();

// ─── provider ───────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── fetch all chats ───────────────────────────────────────────────────────
  // Single call to GET /api/v1/search/contexts — returns everything.
  // Returns built chats so sendMessage can use them immediately.

  const fetchChats = async () => {
    try {
      const data = await getAllContexts();
      // data is a plain object: { "search-123": [...], ... }
      const validChats = buildChats(data);
      setChats(validChats);
      return validChats;
    } catch (error) {
      console.error("fetchChats error:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // ── derived ───────────────────────────────────────────────────────────────

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  // ── create new chat ───────────────────────────────────────────────────────

  const createNewChat = () => setCurrentChatId(null);

  // ── select chat ───────────────────────────────────────────────────────────
  // Messages already loaded in state — just switch selection.

  const selectChat = (chat) => setCurrentChatId(chat.id);

  // ── delete chat ───────────────────────────────────────────────────────────
  // DELETE /api/v1/delete/contexts/{context_id}

  const deleteChat = async (id) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;

    try {
      await deleteContext(chat.context_id);
    } catch (error) {
      console.error("deleteContext error:", error);
    }

    const remaining = chats.filter((c) => c.id !== id);
    setChats(remaining);
    setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
  };

  // ── send message ──────────────────────────────────────────────────────────
  // POST /api/v1/search  →  re-fetch GET /api/v1/search/contexts

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const activeContextId =
      currentChat?.context_id || `search-${Date.now()}`;

    setLoading(true);

    // Optimistic user bubble so the UI feels instant
    const tempUserMsg = { sender: "user", text };
    const tempAiMsg   = { sender: "ai", text: "Searching…", candidates: [] };

    setChats((prev) => {
      const exists = prev.find((c) => c.context_id === activeContextId);
      if (exists) {
        return prev.map((c) =>
          c.context_id === activeContextId
            ? { ...c, messages: [...c.messages, tempUserMsg, tempAiMsg] }
            : c
        );
      }
      // Brand new chat — add a placeholder so the window switches immediately
      return [
        {
          id: `backend-${activeContextId}`,
          context_id: activeContextId,
          title: text,
          messages: [tempUserMsg, tempAiMsg],
        },
        ...prev,
      ];
    });

    // Switch to it right away so the user sees the optimistic messages
    setCurrentChatId(`backend-${activeContextId}`);

    try {
      // POST /api/v1/search
      await searchCandidates({
        query: text,
        context_id: activeContextId,
        reset_context: false,
      });

      // Replace optimistic messages with real data from backend
      const freshChats = await fetchChats();
      const activeChat = freshChats.find(
        (c) => c.context_id === activeContextId
      );
      if (activeChat) setCurrentChatId(activeChat.id);

    } catch (error) {
      console.error("sendMessage error:", error);

      // Roll back optimistic messages
      setChats((prev) =>
        prev
          .map((c) =>
            c.context_id === activeContextId
              ? {
                  ...c,
                  messages: c.messages.filter(
                    (m) => m !== tempUserMsg && m !== tempAiMsg
                  ),
                }
              : c
          )
          .filter((c) => c.messages.length > 0)
      );

      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── clear view ────────────────────────────────────────────────────────────

  const clearChat = () => setCurrentChatId(null);

  // ── provider ──────────────────────────────────────────────────────────────

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        currentChatId,
        loading,
        selectChat,
        createNewChat,
        deleteChat,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);