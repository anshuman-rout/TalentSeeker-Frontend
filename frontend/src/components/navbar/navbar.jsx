import React, { useState, useEffect, useRef, } from "react";
import {
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";

import ProfileDropdown from "./profiledropdown";

const Navbar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside =
      (event) => {

        // If clicked outside
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setOpen(false);
        }
      };

    // Add Listener
    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    // Cleanup
    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);
  return (
    <div className="h-[70px] px-6 flex items-center justify-between border-b border-[#2a2a2a] bg-[#121212]">

      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          Talent Seek
        </h1>
      </div>

      {/* Profile */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center
            transition-all duration-250 hover:scale-110 hover:rotate-5 hover:bg-[#3a3a3a]
            hover:ring-2 hover:ring-gray-400 cursor-pointer"
        >
          <FaUserCircle
            className=" text-2xl transition-transform duration-200 hover:rotate-6"
          />
        </button>

        {open && <ProfileDropdown onLogout={onLogout} />}
      </div>
    </div>
  );
};

export default Navbar;