import React from "react";

const MessageBubble = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div
      className={`flex mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-white
        ${
          isUser
            ? "bg-[#10A37F]"
            : "bg-[#444654]"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;