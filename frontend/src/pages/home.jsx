import React from "react";

import UploadBox   from "../components/common/UploadBox";
import Sidebar     from "../components/Sidebar/Sidebar";
import Navbar      from "../components/Navbar/Navbar";
import ChatWindow  from "../components/Chat/ChatWindow";
import ChatInput   from "../components/Chat/ChatInput";
import { useAuthStore } from "../context/AuthStore"
import { useChat } from "../context/ChatContext";

const Home = ({ onLogout }) => {

  const {handleLogout} = useAuthStore()
  const {
    chats,
    currentChat,
    currentChatId,
    loading,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
    clearChat,
  } = useChat();

  return (
    <div className="flex h-screen bg-black text-white">

      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        selectChat={selectChat}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 bg-[#121212] h-screen overflow-hidden">

        {/* Navbar */}
        <Navbar onLogout={handleLogout} />

        {/* Chat section — fills remaining height */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Message window — scrollable */}
          <ChatWindow
            currentChat={currentChat}
            messages={currentChat?.messages || []}
          />

          {/* Input — always visible so users can start a new chat */}
          <ChatInput
            sendMessage={sendMessage}
            clearChat={clearChat}
            currentChatId={currentChatId}
            loading={loading}
          />

        </div>
      </div>

      {/* CV upload overlay */}
      <UploadBox />

    </div>
  );
};

export default Home;