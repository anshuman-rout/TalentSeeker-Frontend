import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { searchCandidates } from "../services/searchService";
import { getAllContexts, deleteContext, compareCandidates } from "../services/contextService";

const ChatContext = createContext();

// ─── Single source of truth for page size ────────────────────────────────────
// Change this one constant if the backend default ever changes.
const DEFAULT_LIMIT = 5;

// ─── helpers ──────────────────────────────────────────────────────────────────

const isCompareItem = (item) =>
  item.query?.startsWith("Shortlisted comparison:") &&
  Array.isArray(item.response?.candidates);

// currentPage is a derived value — always Math.floor(offset / limit) + 1.
// It is never stored as state; it is computed wherever needed.
const deriveCurrentPage = (offset, limit) =>
  Math.floor((offset ?? 0) / (limit ?? DEFAULT_LIMIT)) + 1;

// contextId is passed in from buildChats so every ai message always has
// the correct context_id, even when rebuilt from history after a page refresh.
const buildMessages = (historyItems = [], contextId) =>
  historyItems.map((item) => {
    if (isCompareItem(item)) {
      // Compare messages are never paginated — no query/context_id needed.
      return { sender: "compare", compareResult: item.response };
    }
    const r = item.response;
    const limit = r.limit ?? DEFAULT_LIMIT;
    const offset = r.offset ?? 0;
    const allCandidates = r.matching_candidates || [];
    const visibleCandidates = allCandidates.length > limit? allCandidates.slice(offset, offset + limit): allCandidates;
    return [
      { sender: "user", text: item.query },
      {
        sender: "ai",
        messageId: crypto.randomUUID(),   // stable ID for targeting updates
        text: r.reason_for_search,
        query: item.query,
        context_id: contextId,             // always set — never null
        total: r.total ?? 0,
        limit,
        offset,
        total_pages: r.total_pages ?? 1,
        has_next: r.has_next ?? false,
        has_prev: r.has_prev ?? false,
        next_offset: r.next_offset ?? null,
        prev_offset: r.prev_offset ?? null,
        bulk_download_url: r.bulk_download_url ?? null,
        pageLoading: false,
        candidates: visibleCandidates,
      },
    ];
  }).flat();

// Deduplicate history items before building messages.
// When the user clicks Next/Previous, POST /api/v1/search is called each time
// and the backend records every paginated call as a new history entry.
// On refresh this produces duplicate user+ai bubbles for the same query.
//
// Fix: for each run of consecutive identical queries, keep only the LAST one
// (the most recently viewed page). Compare items are always kept as-is.
const deduplicateItems = (items) => {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    // Always keep compare messages.
    if (isCompareItem(current)) {
      result.push(current);
      continue;
    }
    // Only deduplicate against the IMMEDIATELY NEXT search.
    // Stop as soon as we hit a compare message.
    const next = items[i + 1];
    if (
      next &&
      !isCompareItem(next) &&
      next.query === current.query
    ) {
      // Consecutive duplicate search (pagination)
      continue;
    }
    result.push(current);
  }
  return result;
};

const buildChats = (contextsObj = {}) =>
  Object.entries(contextsObj)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([contextId, items]) => {
      const dedupedItems = deduplicateItems(items);
      const firstSearchItem = dedupedItems.find((i) => !isCompareItem(i));
      return {
        id: `backend-${contextId}`,
        context_id: contextId,
        title: firstSearchItem?.query || contextId,
        messages: buildMessages(dedupedItems, contextId),
        updated_at: items[items.length - 1]?.created_at || items[items.length - 1]?.updated_at || "",
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

  const fetchChats = async () => {
    try {
      const data = await getAllContexts();
      const validChats = buildChats(data);
      setChats(validChats);
      const savedChatId = localStorage.getItem("active_chat_id");
      if (savedChatId === "__NEW_CHAT__") { setCurrentChatId(null); return validChats; }
      const exists = validChats.find((chat) => chat.id === savedChatId);
      if (exists) setCurrentChatId(savedChatId);
      else if (validChats.length) setCurrentChatId(validChats[0].id);
      return validChats;
    } catch (err) {
      console.error("fetchChats error:", err);
      return [];
    }
  };

  useEffect(() => { fetchChats(); }, []);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  // ── navigation ────────────────────────────────────────────────────────────

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

  // ── delete ────────────────────────────────────────────────────────────────

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

  // ── helper: update one ai message by its stable messageId ─────────────────

  const updateMessageById = (chatId, messageId, updater) =>
    setChats((prev) =>
      prev.map((c) =>
        c.id !== chatId ? c : {
          ...c,
          messages: c.messages.map((m) =>
            m.messageId === messageId ? updater(m) : m
          ),
        }
      )
    );

  // ── compare ───────────────────────────────────────────────────────────────

  const compareSelected = async () => {
    if (!currentChat || selectedPaths.length < 2) return;
    setComparing(true);
    const tempMsg = { sender: "compare", compareResult: null };
    setChats((prev) => prev.map((c) =>
      c.id === currentChat.id ? { ...c, messages: [...c.messages, tempMsg] } : c
    ));
    try {
      await compareCandidates({
        context_id: currentChat.context_id,
        candidate_paths: selectedPaths,
      });
      const freshChats = await fetchChats();
      const activeChat = freshChats.find((c) => c.context_id === currentChat.context_id);
      if (activeChat) setCurrentChatId(activeChat.id);
      setSelectedPaths([]);
    } catch (err) {
      console.error("compare error:", err);
      setChats((prev) => prev.map((c) =>
        c.id === currentChat.id
          ? { ...c, messages: c.messages.filter((m) => m !== tempMsg) }
          : c
      ));
      alert("Comparison failed. Please try again.");
    } finally {
      setComparing(false);
    }
  };

  // ── pagination ────────────────────────────────────────────────────────────
  // Targets the ai message by stable messageId — not array index.
  // Uses backend-provided next_offset / prev_offset directly.

  const updateMessagePage = async (chatId, messageId, direction) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;
    const msg = chat.messages.find((m) => m.messageId === messageId);
    if (!msg || msg.sender !== "ai") return;

    const newOffset = direction === "next" ? msg.next_offset : msg.prev_offset;
    if (newOffset === null || newOffset === undefined) return;

    // Mark this message as loading
    updateMessageById(chatId, messageId, (m) => ({ ...m, pageLoading: true }));

    try {
      const result = await searchCandidates({
        query: msg.query,
        context_id: msg.context_id,
        reset_context: false,
        limit: msg.limit,
        offset: newOffset,
      });

      const limit = result.limit ?? msg.limit;
      const offset = result.offset ?? newOffset;

      updateMessageById(chatId, messageId, (m) => ({
        ...m,
        candidates: result.matching_candidates || [],
        total: result.total ?? m.total,
        limit,
        offset,
        total_pages: result.total_pages ?? m.total_pages,
        has_next: result.has_next ?? false,
        has_prev: result.has_prev ?? false,
        next_offset: result.next_offset ?? null,
        prev_offset: result.prev_offset ?? null,
        bulk_download_url: result.bulk_download_url ?? null,
        pageLoading: false,
        // currentPage is derived — not stored
      }));
    } catch (err) {
      console.error("pagination error:", err);
      updateMessageById(chatId, messageId, (m) => ({ ...m, pageLoading: false }));
    }
  };

  // ── send message ──────────────────────────────────────────────────────────

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const activeContextId = currentChat?.context_id || `search-${Date.now()}`;
    setLoading(true);
    setSelectedPaths([]);

    // Stable ID used to target this exact message for the in-place update below.
    const aiMessageId = crypto.randomUUID();

    const tempUserMsg = { sender: "user", text };
    const tempAiMsg = {
      sender: "ai",
      messageId: aiMessageId,
      text: "Searching…",
      query: text,
      context_id: activeContextId,
      total: 0,
      limit: DEFAULT_LIMIT,
      offset: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
      next_offset: null,
      prev_offset: null,
      bulk_download_url: null,
      pageLoading: false,
      candidates: [],
    };

    setChats((prev) => {
      const exists = prev.find((c) => c.context_id === activeContextId);
      if (exists) {
        return prev.map((c) =>
          c.context_id === activeContextId
            ? { ...c, messages: [...c.messages, tempUserMsg, tempAiMsg] }
            : c
        );
      }
      return [{
        id: `backend-${activeContextId}`,
        context_id: activeContextId,
        title: text,
        messages: [tempUserMsg, tempAiMsg],
      }, ...prev];
    });

    setCurrentChatId(`backend-${activeContextId}`);
    localStorage.setItem("active_chat_id", `backend-${activeContextId}`);

    try {
      const result = await searchCandidates({
        query: text,
        context_id: activeContextId,
        reset_context: false,
        limit: DEFAULT_LIMIT,
        offset: 0,
      });

      const limit = result.limit ?? DEFAULT_LIMIT;
      const offset = result.offset ?? 0;

      // Update by stable messageId — not object reference, not array index.
      updateMessageById(`backend-${activeContextId}`, aiMessageId, (m) => ({
        ...m,
        text: result.reason_for_search,
        total: result.total ?? 0,
        limit,
        offset,
        total_pages: result.total_pages ?? 1,
        has_next: result.has_next ?? false,
        has_prev: result.has_prev ?? false,
        next_offset: result.next_offset ?? null,
        prev_offset: result.prev_offset ?? null,
        bulk_download_url: result.bulk_download_url ?? null,
        candidates: result.matching_candidates || [],
        // currentPage is derived — not stored
      }));

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
    <ChatContext.Provider value={{
      chats, currentChat, currentChatId, loading,
      selectChat, createNewChat, deleteChat, sendMessage, clearChat,
      selectedPaths, toggleCandidate, clearSelection, compareSelected, comparing,
      updateMessagePage,
      DEFAULT_LIMIT,
      deriveCurrentPage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);