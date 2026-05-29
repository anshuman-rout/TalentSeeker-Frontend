import React, { useState } from "react";
import { FaUpload, FaSignOutAlt } from "react-icons/fa";
import { useUpload } from "../../context/UploadContext";

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

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

const ProfileDropdown = ({ onLogout }) => {

  const { setSelectedFiles, setShowUploadBox } = useUpload();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setShowUploadBox(true);
  };

  return (
    <>
      <div className="absolute right-0 mt-3 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl z-50">

        {/* Upload CVs */}
        <label className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer">
          <FaUpload />
          Upload CVs
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.zip"
            hidden
            onChange={handleFileSelect}
          />
        </label>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-red-600/20 text-red-400 transition-colors"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <ConfirmModal
          title="Confirm logout?"
          message="You will be signed out and returned to the login screen."
          confirmLabel="Logout"
          confirmClass="bg-red-600 hover:bg-red-500"
          onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default ProfileDropdown;