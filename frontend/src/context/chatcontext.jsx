import React, { createContext, useContext, useEffect, useState,} from "react";
import { searchCandidates }
from "../services/searchService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  
  // All Chats
  const [chats, setChats] = useState(() => {
    const savedChats =
      localStorage.getItem("chat-app");

    return savedChats
      ? JSON.parse(savedChats)
      : [];
  });

  // Current Chat
  const [currentChatId, setCurrentChatId] =
    useState(null);

  // Save Chats in LocalStorage
  useEffect(() => {
    localStorage.setItem(
      "chat-app",
      JSON.stringify(chats)
    );
  }, [chats]);

  // Current Selected Chat
  const currentChat = chats.find(
    (chat) => chat.id === currentChatId
  );

  // Create Chat
const createNewChat = () => {
  // Find existing empty chat
  const emptyChat = chats.find(
    (chat) => chat.messages.length === 0
  );

  // If empty chat already exists
  if (emptyChat) {
    setCurrentChatId(emptyChat.id);
    return;
  }

  // Create new chat only if no empty chat exists
  const newChat = {
    id: Date.now(),
    title: "New Chat",
    context_id: `search-${Date.now()}`,
    messages: [],
  };

  setChats((prev) => [newChat, ...prev]);

  setCurrentChatId(newChat.id);
};

  // Delete Chat
  const deleteChat = (id) => {
    const filteredChats = chats.filter(
      (chat) => chat.id !== id
    );

    setChats(filteredChats);

    if (filteredChats.length > 0) {
      setCurrentChatId(filteredChats[0].id);
    }
  };

  // Send Message
  const sendMessage = async (text) => {

    // Query Limit
    const currentChat = chats.find(
      (chat) => chat.id === currentChatId
    );
    const userMessages =
      currentChat.messages.filter(
        (msg) => msg.sender === "user"
      );
    if (userMessages.length >= 12) {
      alert(
        "Maximum query limit reached"
      );
      return;
    }

    // Add User Message First
    const updatedChats = chats.map(
      (chat) => {

        if (chat.id === currentChatId) {

          return {

            ...chat,

            title:
              chat.messages.length === 0
                ? text.slice(0, 25)
                : chat.title,

            messages: [
              ...chat.messages,
              {
                sender: "user",
                text,
              },
            ],
          };
        }

        return chat;
      }
    );

    setChats(updatedChats);

    try {

      // Search API Call
      const data =
        await searchCandidates({

          query: text,

          context_id:
            currentChat.context_id,

          reset_context: false,
        });

      console.log(data);

    // AI Response Message
      const aiMessage = {

        sender: "ai",
        text:
          data.reason_for_search,
        candidates:
          data.matching_candidates,
      };

    // Append AI Response
      const finalChats =
        updatedChats.map((chat) => {
          if (
            chat.id === currentChatId
          ) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                aiMessage,
              ],
            };
          }

          return chat;
        });

      setChats(finalChats);

    } catch (error) {

      console.log(error);

      alert("Search Failed");
    }
  };

  // Clear Current Chat
  const clearChat = () => {
    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [],
        };
      }

      return chat;
    });

    setChats(updatedChats);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        currentChatId,

        setCurrentChatId,

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

// Custom Hook
export const useChat = () =>
  useContext(ChatContext);