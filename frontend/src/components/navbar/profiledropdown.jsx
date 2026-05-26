import React from "react";
import { FaUpload }from "react-icons/fa";
import {useUpload,} from "../../context/UploadContext";
import {
  FaCog,
  FaMoon,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

const ProfileDropdown = ({onLogout}) => {
  const {
  setSelectedFiles,
  setShowUploadBox,
  } = useUpload();
  const handleFileSelect = (e) => {
  const files =
    Array.from(e.target.files);
  setSelectedFiles(files);
  setShowUploadBox(true);
  };
  return (
    <div className="absolute right-0 mt-3 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl z-50">
      
      {/* <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition">
        <FaUser />
        Profile
      </button>

      <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition">
        <FaCog />
        Settings
      </button>

      <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition">
        <FaMoon />
        Theme
      </button> */}
      <label
        className="
        w-full
        px-5
        py-4
        flex
        items-center
        gap-4
        hover:bg-[#2a2a2a]
        transition
        cursor-pointer
        "
      >
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

      <button onClick={onLogout}
        className="
        w-full
        px-5
        py-4
        flex
        items-center
        gap-4
        hover:bg-red-500
        transition">
       <FaSignOutAlt />
       Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;