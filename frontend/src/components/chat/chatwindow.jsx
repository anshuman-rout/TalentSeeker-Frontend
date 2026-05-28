import React, { useEffect, useRef } from "react";

const BASE_URL = "http://192.168.7.12:8001";

const ChatWindow = ({ messages, currentChat }) => {

  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── no chat selected ──────────────────────────────────────────────────────
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-semibold mb-6">Welcome</h1>
          <p className="text-gray-400 text-lg">
            Type a query below to start searching CVs
          </p>
        </div>
      </div>
    );
  }

  // ── empty chat (shouldn't normally happen) ────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-semibold">How can I help you today?</h1>
      </div>
    );
  }

  // ── messages ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-6 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-5 py-4 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-[#2a2a2a]"
                  : "bg-[#181818]"
              }`}
            >
              {/* Searching spinner on optimistic AI bubble */}
              {msg.sender === "ai" &&
                msg.text === "Searching…" &&
                (!msg.candidates || msg.candidates.length === 0) && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

              {/* Candidate cards — only on AI messages with results */}
              {msg.candidates && msg.candidates.length > 0 && (
                <div className="space-y-4">
                  {msg.candidates.map((candidate, idx) => (
                    <div
                      key={idx}
                      className="bg-[#202020] border border-[#333] p-4 rounded-xl"
                    >
                      {/* File name */}
                      <h3 className="font-semibold text-lg text-white">
                        {candidate.file_name}
                      </h3>

                      {/* Relevance reasoning */}
                      {candidate.relevance_reasoning && (
                        <p className="text-gray-400 text-sm mt-2">
                          {candidate.relevance_reasoning}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-4 mt-3">
                        <a
                          href={`${BASE_URL}${candidate.cv_view_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          View CV
                        </a>
                        <a
                          href={`${BASE_URL}${candidate.cv_download_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-400 hover:underline text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message text — shown at bottom, only for AI messages with candidates */}
              {msg.sender === "ai" && msg.text !== "Searching…" && (
                <p className="text-gray-400 text-sm mt-4 italic">{msg.text}</p>
              )}

              {/* User message text */}
              {msg.sender === "user" && (
                <p className="text-white">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;