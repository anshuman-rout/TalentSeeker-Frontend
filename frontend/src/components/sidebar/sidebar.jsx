import React from "react";
import ChatItem from "./ChatItem";
import { FaPlus } from "react-icons/fa";

const Sidebar = ({
  chats,
  currentChatId,
  selectChat,
  createNewChat,
  deleteChat,
}) => {
  return (
    <div className="w-[280px] bg-[#0f0f0f] border-r border-[#2a2a2a] h-screen flex flex-col">
      
      {/* New Chat */}
      <div className="p-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center gap-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#333] p-4 rounded-xl transition"
        >
          <FaPlus />
          <span>New Chat</span>
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-gray-400 text-sm mb-4">
          Today
        </p>

        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            active={currentChatId === chat.id}
            onClick={() => selectChat(chat)}
            onDelete={() => deleteChat(chat.id)}
          />
        ))}
      </div>

      {/* User */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
            U
          </div>

          <div>
            <p className="font-medium">
              User
            </p>

            <p className="text-sm text-gray-400">
              admin@123.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;