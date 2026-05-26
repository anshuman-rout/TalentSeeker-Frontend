import React from "react";
import UploadBox from "../components/common/UploadBox";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";

import { useChat } from "../context/ChatContext";

const Home = ({onLogout}) => {
  const {
    chats,
    currentChat,
    currentChatId,

    setCurrentChatId,

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
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
      />

      {/* Main Area */}
      <div className="flex flex-col flex-1 bg-[#121212] h-screen">
        
        {/* Navbar */}
        <Navbar onLogout={onLogout}/>

        {/* Chat Section */}
        <div className="flex flex-col flex-1 overflow-hidden">
          
          <ChatWindow
            currentChat={currentChat}
            messages={currentChat?.messages || []}
          />

          {currentChat && (
           <ChatInput
              sendMessage={sendMessage}
              clearChat={clearChat}
              currentChatId={currentChatId}
            />
          )}
          <UploadBox />
        </div>
      </div>
    </div>
  );
};

export default Home;