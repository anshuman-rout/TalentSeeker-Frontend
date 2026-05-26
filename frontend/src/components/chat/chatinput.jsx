import React, { useState,useEffect, } from "react";
import {
  FaArrowUp,
  FaTrash,
} from "react-icons/fa";

const ChatInput = ({
  sendMessage,
  clearChat,
  currentChatId,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] =useState(false);
  useEffect(() => {
  // Reset input
  setInput("");
  // Stop loading
  setLoading(false);
  }, [currentChatId]);
  const handleSend = async() => {
    if (!input.trim()) return;
    try {
      setLoading(true);
        await new Promise((resolve) =>setTimeout(resolve, 500));
          await sendMessage(input);
      setInput("");
    }catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      
      <div className="w-full max-w-4xl bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl px-6 py-4 flex items-center gap-4">
        
        {/* Input */}
        <input
          type="text"
          disabled={loading}
          placeholder= {loading ? "Searching resumes...": "Type your message..."}
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
        />

        {/* Loading Animation */}
        {loading && (
        <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-2 rounded-xl ">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
    )}
        {/* Clear */}
        <button
          disabled={loading}
          onClick={clearChat}
          className={`text-gray-400 transition
            ${ loading ? "opacity-50 cursor-not-allowed": "hover:text-red-500"}`}
        >
          <FaTrash />
        </button>

        {/* Send */}
        <button
          disabled={loading}
          onClick={handleSend}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition
           ${loading ? "bg-gray-700 text-white cursor-not-allowed": "bg-white text-black hover:scale-105"}`}
        >
          <FaArrowUp />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;