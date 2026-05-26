import React from "react";
import { FaTrash } from "react-icons/fa";

const ChatItem = ({
  chat,
  active,
  onClick,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-3 rounded-xl mb-2 cursor-pointer transition
      ${
        active
          ? "bg-[#1f1f1f]"
          : "hover:bg-[#1a1a1a]"
      }`}
    >
      <span className="truncate text-white">
        {chat.title}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default ChatItem;