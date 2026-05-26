import React from "react";
import { getCVViewUrl } from "../../services/cvService";
const ChatWindow = ({
  messages,
  currentChat,
}) => {

  // No Chat Selected
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        
        <div className="text-center">
          
          <h1 className="text-5xl font-semibold mb-6">
            Welcome
          </h1>

          <p className="text-gray-400 text-lg">
            Create a new chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  // Empty Chat
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        
        <h1 className="text-5xl font-semibold">
          How can I help you today?
        </h1>
      </div>
    );
  }

  // Messages
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10">
      
      <div className="max-w-4xl mx-auto">
        
        {messages.map((msg, index) => (

          <div
            key={index}
            className={`mb-6 flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            
            <div
              className={`max-w-[80%] px-5 py-4 rounded-2xl
              ${
                msg.sender === "user"
                  ? "bg-[#2a2a2a]"
                  : "bg-[#181818]"
              }`}
            >
              
              {/* Message Text */}
              <p>{msg.text}</p>

              {/* Candidate Cards */}
              {msg.candidates && (

                <div className="mt-4 space-y-4">

                  {msg.candidates.map(
                    (candidate, idx) => (

                      <div
                        key={idx}
                        className="
                        bg-[#202020]
                        border
                        border-[#333]
                        p-4
                        rounded-xl
                        "
                      >

                        <h3 className="font-semibold text-lg">
                          {
                            candidate.file_name
                          }
                        </h3>

                        <p className="text-gray-400 text-sm mt-2">
                          {
                            candidate.relevance_reasoning
                          }
                        </p>

                        <a
                          href={getCVViewUrl(candidate.local_file_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="
                          inline-block
                          mt-3
                          text-blue-400
                          hover:underline
                          "
                        >
                          View CV
                        </a>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;