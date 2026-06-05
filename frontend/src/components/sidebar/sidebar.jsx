import React, { useState } from "react";
import ChatItem from "./chatitem";
import { FaPlus } from "react-icons/fa";

// ─── Confirm Modal ────────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-[340px] shadow-2xl">
      <h2 className="text-white font-semibold text-lg mb-2">{title}</h2>
      <p className="text-gray-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({
  chats,
  currentChatId,
  selectChat,
  createNewChat,
  deleteChat,
}) => {

  // Which chat is pending deletion (holds the chat id, null = modal closed)
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleDeleteClick = (id) => setPendingDeleteId(id);

  const handleDeleteConfirm = () => {
    deleteChat(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const handleDeleteCancel = () => setPendingDeleteId(null);

  return (
    <>
      <div className="w-[280px] bg-[#0f0f0f] border-r border-[#2a2a2a] h-screen flex flex-col">

        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#333] p-4 rounded-xl transition-colors"
          >
            <FaPlus />
            <span>New Chat</span>
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-3">
          <p className="text-gray-400 text-sm mb-4">Today</p>

          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={currentChatId === chat.id}
              onClick={() => selectChat(chat)}
              onDelete={() => handleDeleteClick(chat.id)}
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
              <p className="font-medium">User</p>
              <p className="text-sm text-gray-400">admin@123.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {pendingDeleteId && (
        <ConfirmModal
          title="Delete chat?"
          message="This will permanently remove the chat and its history. This cannot be undone."
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-500"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

export default Sidebar;