import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { getAccessToken } from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


// ─── Confirm Modal ────────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, confirmLabel, onConfirm, onCancel }) => (
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
          className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Tag Pill ─────────────────────────────────────────────────────────────────
// Used to render each item in skills / experience / education / projects arrays.

const TagPill = ({ text }) => (
  <span className="inline-block bg-[#2a2a2a] text-gray-300 text-xs px-2 py-0.5 rounded-md mr-1 mb-1 leading-relaxed">
    {text}
  </span>
);

// ─── Pagination Controls ──────────────────────────────────────────────────────

const Pagination = ({ msg, chatId }) => {
  const { updateMessagePage, deriveCurrentPage } = useChat();

  if ((msg.total_pages ?? 1) <= 1) return null;

  const isPrevDisabled = !msg.has_prev || msg.pageLoading;
  const isNextDisabled = !msg.has_next || msg.pageLoading;
  // currentPage is always derived — never stored as state
  const currentPage = deriveCurrentPage(msg.offset, msg.limit);

  return (
    <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-[#333]">
      <button
        disabled={isPrevDisabled}
        onClick={() => updateMessagePage(chatId, msg.messageId, "prev")}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isPrevDisabled
            ? "opacity-30 cursor-not-allowed text-gray-500 bg-[#222]"
            : "text-white bg-[#2a2a2a] hover:bg-[#3a3a3a]"
          }`}
      >
        ‹ Prev
      </button>

      <span className="text-gray-400 text-sm">
        {msg.pageLoading
          ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          )
          : <><span className="text-white font-medium">{currentPage}</span> / {msg.total_pages}</>
        }
      </span>

      <button
        disabled={isNextDisabled}
        onClick={() => updateMessagePage(chatId, msg.messageId, "next")}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isNextDisabled
            ? "opacity-30 cursor-not-allowed text-gray-500 bg-[#222]"
            : "text-white bg-[#2a2a2a] hover:bg-[#3a3a3a]"
          }`}
      >
        Next ›
      </button>
    </div>
  );
};

// ─── Compare Result ───────────────────────────────────────────────────────────
// New response shape — no scores, arrays for skills/experience/education/projects.
// Layout: one row per candidate, columns = Candidate | Skills | Experience | Education | Projects | Summary

const CompareResult = ({ result }) => {
  const { role_context, candidates = [], verdict } = result;

  const columns = [
    { key: "skills", label: "Skills" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "projects", label: "Projects" },
    { key: "summary", label: "Summary" },
  ];

  // Identify strongest candidate by counting their name appearing in the verdict.
  // Since there are no scores, we do a simple name-match heuristic.
  const verdictLower = (verdict || "").toLowerCase();
  const strongestIdx = candidates.reduce((bestIdx, c, i) => {
    const name = c.file_name.replace(/\.[^.]+$/, "").toLowerCase(); // strip extension
    const firstWord = name.split(/[\s_\-[]/)[0];
    const currentMatches = (verdictLower.match(new RegExp(firstWord, "g")) || []).length;
    const bestName = candidates[bestIdx]?.file_name.replace(/\.[^.]+$/, "").toLowerCase();
    const bestFirstWord = bestName?.split(/[\s_\-[]/)[0];
    const bestMatches = (verdictLower.match(new RegExp(bestFirstWord, "g")) || []).length;
    return currentMatches > bestMatches ? i : bestIdx;
  }, 0);

  return (
    <div className="space-y-5 w-full">

      {/* AI Verdict */}
      {verdict && (
        <div className="flex gap-3 bg-green-950/40 border border-green-800 rounded-xl px-4 py-3">
          <span className="text-green-400 text-base mt-0.5 shrink-0">🏆</span>
          <p className="text-10px font-serif text-green-200 leading-relaxed">{verdict}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-widest text-gray-300">Comparison</span>
        {role_context && (
          <span className="text-xs bg-[#1e1e1e] border border-[#333] text-gray-300 px-2 py-0.5 rounded-full">
            {role_context}
          </span>
        )}
      </div>

      {/* Main table — one row per candidate */}
      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full text-sm border-collapse">

          {/* Column headers */}
          <thead>
            <tr className="bg-[#161616] border-b border-[#2a2a2a]">
              <th className="text-left px-4 py-3 text-gray-200 font-medium whitespace-nowrap w-[160px]">
                Candidate
              </th>
              {columns.map(({ label }) => (
                <th key={label} className="text-left px-4 py-3 text-gray-200 font-medium whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          {/* One row per candidate */}
          <tbody>
            {candidates.map((c, i) => {
              const isStrongest = i === strongestIdx;
              return (
                <tr
                  key={i}
                  className={`border-b border-[#2a2a2a] align-top transition-colors ${isStrongest ? "bg-green-950/20" : "hover:bg-[#1a1a1a]"
                    }`}
                >
                  {/* Candidate name */}
                  <td className="px-4 py-4 w-[160px]">
                    <div className="flex flex-col gap-1">
                      {isStrongest && (
                        <span className="text-[10px] bg-green-800 text-green-200 px-2 py-0.5 rounded-full w-fit whitespace-nowrap">
                          Strongest
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold leading-snug break-all ${isStrongest ? "text-green-300" : "text-white"
                          }`}
                        title={c.file_name}
                      >
                        {c.file_name}
                      </span>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-4 max-w-[180px]">
                    <ul className="space-y-1">
                      {(c.skills || []).map((e, j) => (
                        <li key={j} className="text-xs text-gray-300 leading-relaxed">
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Experience */}
                  <td className="px-4 py-4 max-w-[200px]">
                    <ul className="space-y-1">
                      {(c.experience || []).map((e, j) => (
                        <li key={j} className="text-xs text-gray-300 leading-relaxed">
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Education */}
                  <td className="px-4 py-4 max-w-[180px]">
                    <ul className="space-y-1">
                      {(c.education || []).map((e, j) => (
                        <li key={j} className="text-xs text-gray-300 leading-relaxed">
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Projects */}
                  <td className="px-4 py-4 max-w-[200px]">
                    <ul className="space-y-1">
                      {(c.projects || []).map((e, j) => (
                        <li key={j} className="text-xs text-gray-300 leading-relaxed">
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Summary */}
                  <td className="px-4 py-4 max-w-[200px]">
                    <p className="text-xs text-gray-400 leading-relaxed italic">{c.summary}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

// ─── Main ChatWindow ──────────────────────────────────────────────────────────

const ChatWindow = ({ messages, currentChat }) => {

  const {
    selectedPaths,
    toggleCandidate,
    clearSelection,
    compareSelected,
    comparing,
  } = useChat();

  const bottomRef = useRef(null);
  const [pendingBulkUrl, setPendingBulkUrl] = useState(null);

  // Only scroll to bottom when a new message is added (count increases).
  // Pagination updates mutate an existing message's content — not the count —
  // so they correctly do NOT trigger this scroll.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── no chat selected ──────────────────────────────────────────────────────
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-semibold mb-6">Welcome</h1>
          <p className="text-gray-400 text-lg">Type a query below to start searching CVs</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-semibold">How can I help you today?</h1>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 relative">
      <div className="max-w-4xl mx-auto">

        {/* Search messages */}
        {messages.map((msg, index) => {

          // Compare result bubble
          if (msg.sender === "compare") {
            return (
              <div key={index} className="mb-6 flex justify-start">
                <div className="w-full max-w-[90%] bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-5">
                  {msg.compareResult
                    ? <CompareResult result={msg.compareResult} />
                    : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span>Comparing candidates…</span>
                      </div>
                    )
                  }
                </div>
              </div>
            );
          }

          if (msg.sender === "user") {
            return (
              <div key={index} className="mb-6 flex justify-end">
                <div className="max-w-[80%] px-5 py-4 rounded-2xl bg-[#2a2a2a]">
                  <p className="text-white">{msg.text}</p>
                </div>
              </div>
            );
          }

          // ── AI bubble ─────────────────────────────────────────────────────

          // Chatbot mode: total === 0 and no candidates → plain conversational reply
          const isChatbotMode = (msg.total === 0) && (!msg.candidates || msg.candidates.length === 0);

          // Searching spinner (optimistic temp message)
          if (msg.text === "Searching…") {
            return (
              <div key={index} className="mb-6 flex justify-start">
                <div className="w-full max-w-[90%] px-5 py-4 rounded-2xl bg-[#1b1c1c] ">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            );
          }

          // Plain chatbot reply — no cards, no pagination
          if (isChatbotMode) {
            return (
              <div key={index} className="mb-6 flex justify-start">
                <div className="w-full max-w-[90%] px-5 py-4 rounded-2xl bg-[#1b1c1c] ">
                  <p className="text-gray-200 text-10px mt font-serif ">{msg.text}</p>
                </div>
              </div>
            );
          }

          // Normal search result with candidates + pagination
          return (
            <div key={index} className="mb-6 flex justify-start">
              <div className="w-full max-w-[90%] px-5 py-4 rounded-2xl bg-[#1b1c1c] ">

                {/* reason_for_search + bulk download link on the same row */}
                {msg.text && msg.text !== "Searching…" && (
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-gray-200 text-10px mt font-serif ">{msg.text}</p>
                    {msg.bulk_download_url && (
                      <button
                        onClick={() => {
                          const accessToken = getAccessToken();
                          const downloadUrl =
                            `${BASE_URL}${msg.bulk_download_url}&access_token=${encodeURIComponent(accessToken)}`;
                          setPendingBulkUrl(downloadUrl);
                        }}
                        className="text-green-400 hover:underline text-sm whitespace-nowrap shrink-0"
                      >
                        ⬇ Download All
                      </button>
                    )}
                  </div>
                )}

                {/* Candidate cards */}
                {msg.candidates && msg.candidates.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {msg.candidates.map((candidate, idx) => {
                      const isSelected = selectedPaths.includes(candidate.local_file_path);
                      const atMax = selectedPaths.length >= 5 && !isSelected;
                      return (
                        <div
                          key={idx}
                          onClick={() => !atMax && !msg.pageLoading && toggleCandidate(candidate.local_file_path)}
                          className={`
                            relative border rounded-xl p-4 transition-all cursor-pointer select-none
                            ${isSelected
                              ? "border-blue-500 bg-blue-950/30"
                              : atMax
                                ? "border-[#333] bg-[#202020] opacity-40 cursor-not-allowed"
                                : "border-[#333] bg-[#202020] hover:border-[#555]"
                            }
                          `}
                        >
                          {/* Checkbox */}
                          <div className={`
                            absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-500 bg-transparent"}
                          `}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <h3 className="font-semibold text-white pr-8">{candidate.file_name}</h3>

                          {candidate.relevance_reasoning && (
                            <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                              {candidate.relevance_reasoning}
                            </p>
                          )}

                          <div className="flex gap-4 mt-3" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`${BASE_URL}${candidate.cv_view_url}`}
                              target="_blank" rel="noreferrer"
                              className="text-blue-400 hover:underline text-sm"
                            >
                              View CV
                            </a>
                            <a
                              href={`${BASE_URL}${candidate.cv_download_url}`}
                              rel="noreferrer"
                              className="text-green-400 hover:underline text-sm"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination controls */}
                <Pagination
                  msg={msg}
                  chatId={currentChat.id}
                />

              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Bulk download confirmation modal */}
      {pendingBulkUrl && (
        <ConfirmModal
          title="Download all CVs?"
          message="This will download all matching CVs for this search as a ZIP file."
          confirmLabel="Download"
          onConfirm={() => {
            window.open(pendingBulkUrl, "_blank",);
            setPendingBulkUrl(null);
          }}
          onCancel={() => setPendingBulkUrl(null)}
        />
      )}

      {/* Floating compare bar */}
      {selectedPaths.length >= 2 && (
        <div className="sticky bottom-4 flex justify-center mt-4">
          <div className="flex items-center gap-4 bg-[#1a1a1a] border border-blue-600 rounded-2xl px-5 py-3 shadow-2xl">
            <span className="text-sm text-gray-300">
              <span className="text-blue-400 font-semibold">{selectedPaths.length}</span>
              {" "}candidate{selectedPaths.length > 1 ? "s" : ""} selected
              <span className="text-gray-500 ml-1">(max 5)</span>
            </span>
            <button
              onClick={compareSelected}
              disabled={comparing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {comparing ? "Comparing…" : "Compare"}
            </button>
            <button
              onClick={clearSelection}
              className="text-gray-500 hover:text-red-400 text-xs transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;