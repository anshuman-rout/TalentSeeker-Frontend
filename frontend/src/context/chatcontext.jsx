import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { searchCandidates } from "../services/searchService";
import { getAllContexts, deleteContext, compareCandidates } from "../services/contextService";

const ChatContext = createContext();

// ─── helpers ──────────────────────────────────────────────────────────────────

// Detect whether a history item is a compare result or a regular search.
// Compare items have query starting with "Shortlisted comparison:" and
// response.candidates (array of objects with skills/experience/etc.)
const isCompareItem = (item) =>
  item.query?.startsWith("Shortlisted comparison:") &&
  Array.isArray(item.response?.candidates);

const buildMessages = (historyItems = []) =>
  historyItems.map((item) => {
    if (isCompareItem(item)) {
      // Compare message — sender "compare", carries the full result object
      return {
        sender: "compare",
        compareResult: item.response,
      };
    }
    // Regular search message — split into user + ai pair
    return [
      { sender: "user", text: item.query },
      {
        sender: "ai",
        text: item.response.reason_for_search,
        candidates: item.response.matching_candidates || [],
      },
    ];
  }).flat();

const buildChats = (contextsObj = {}) =>
  Object.entries(contextsObj)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([contextId, items]) => {

      const firstSearchItem =
        items.find((i) => !isCompareItem(i));

      return {
        id: `backend-${contextId}`,
        context_id: contextId,
        title: firstSearchItem?.query || contextId,
        messages: buildMessages(items),
        updated_at:
          items[items.length - 1]?.created_at ||
          items[items.length - 1]?.updated_at ||
          "",
      };
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 15);

// ─── provider ─────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [comparing, setComparing] = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  // GET /api/v1/search/contexts — returns both search and compare history

  const fetchChats = async () => {
    try {
      const data = await getAllContexts();
      const validChats = buildChats(data);
      setChats(validChats);
      const savedChatId = localStorage.getItem("active_chat_id");
      if (savedChatId === "__NEW_CHAT__") 
      {
        setCurrentChatId(null);
        return validChats;
      }
      const exists = validChats.find((chat) => chat.id === savedChatId);
      if (exists) {
        setCurrentChatId(savedChatId);
      } else if (validChats.length > 0) {
        setCurrentChatId(validChats[0].id);
      }
      return validChats;
    } catch (err) {
      console.error("fetchChats error:", err);
      return [];
    }
  };

  useEffect(() => { fetchChats(); }, []);

  // ── derived ───────────────────────────────────────────────────────────────

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  // Compare messages already live inside currentChat.messages as
  // { sender: "compare", compareResult: {...} } entries — no separate state needed.

  // ── chat navigation ───────────────────────────────────────────────────────

  const createNewChat = () => {
    setCurrentChatId(null);
    localStorage.setItem("active_chat_id", "__NEW_CHAT__");
    setSelectedPaths([]);
  };

  const selectChat = (chat) => {
    setCurrentChatId(chat.id);
    localStorage.setItem("active_chat_id", chat.id);
    setSelectedPaths([]);
  };

  const clearChat = () => {
    setCurrentChatId(null);
    setSelectedPaths([]);
  };

  // ── delete chat ───────────────────────────────────────────────────────────

  const deleteChat = async (id) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;

    try { await deleteContext(chat.context_id); }
    catch (err) { console.error("deleteContext error:", err); }

    const remaining = chats.filter((c) => c.id !== id);
    setChats(remaining);
    setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
    setSelectedPaths([]);
  };

  // ── candidate selection ───────────────────────────────────────────────────

  const toggleCandidate = (path) => {
    setSelectedPaths((prev) => {
      if (prev.includes(path)) return prev.filter((p) => p !== path);
      if (prev.length >= 5) return prev;
      return [...prev, path];
    });
  };

  const clearSelection = () => setSelectedPaths([]);

  // ── compare ───────────────────────────────────────────────────────────────
  // POST /api/v1/search/compare
  // After a successful compare, re-fetch contexts — the backend now includes
  // the compare result as a new history item inside the same context.

  const compareSelected = async () => {
    if (!currentChat || selectedPaths.length < 2) return;

    setComparing(true);

    // Optimistic compare bubble while waiting for backend
    const tempMsg = { sender: "compare", compareResult: null };
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChat.id
          ? { ...c, messages: [...c.messages, tempMsg] }
          : c
      )
    );

    try {
      await compareCandidates({
        context_id: currentChat.context_id,
        candidate_paths: selectedPaths,
      });

      // Re-fetch — backend now has the compare result in context history
      const freshChats = await fetchChats();
      const activeChat = freshChats.find((c) => c.context_id === currentChat.context_id);
      if (activeChat) setCurrentChatId(activeChat.id);

      setSelectedPaths([]);

    } catch (err) {
      console.error("compare error:", err);
      // Remove optimistic bubble on failure
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChat.id
            ? { ...c, messages: c.messages.filter((m) => m !== tempMsg) }
            : c
        )
      );
      alert("Comparison failed. Please try again.");
    } finally {
      setComparing(false);
    }
  };

  // ── send message ──────────────────────────────────────────────────────────

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const activeContextId = currentChat?.context_id || `search-${Date.now()}`;
    setLoading(true);
    setSelectedPaths([]);

    const tempUserMsg = { sender: "user", text };
    const tempAiMsg = { sender: "ai", text: "Searching…", candidates: [] };

    setChats((prev) => {
      const exists = prev.find((c) => c.context_id === activeContextId);
      if (exists) {
        return prev.map((c) =>
          c.context_id === activeContextId
            ? { ...c, messages: [...c.messages, tempUserMsg, tempAiMsg] }
            : c
        );
      }
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

    setCurrentChatId(`backend-${activeContextId}`);
    localStorage.setItem("active_chat_id", `backend-${activeContextId}`);

    try {
      await searchCandidates({
        query: text,
        context_id: activeContextId,
        reset_context: false,
      });

      const freshChats = await fetchChats();
      const activeChat = freshChats.find((c) => c.context_id === activeContextId);
      if (activeChat) setCurrentChatId(activeChat.id);

    } catch (err) {
      console.error("sendMessage error:", err);
      setChats((prev) =>
        prev
          .map((c) =>
            c.context_id === activeContextId
              ? { ...c, messages: c.messages.filter((m) => m !== tempUserMsg && m !== tempAiMsg) }
              : c
          )
          .filter((c) => c.messages.length > 0)
      );
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        selectedPaths,
        toggleCandidate,
        clearSelection,
        compareSelected,
        comparing,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);