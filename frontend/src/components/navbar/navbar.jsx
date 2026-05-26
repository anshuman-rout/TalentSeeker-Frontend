import React, { useState,useEffect,useRef, } from "react";
import {
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";

import ProfileDropdown from "./ProfileDropdown";

const Navbar = ({onLogout}) => {
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
          Resume Query
        </h1>

        <FaChevronDown className="text-sm text-gray-400" />
      </div>

      {/* Profile */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center"
        >
          <FaUserCircle className="text-2xl" />
        </button>

        {open && <ProfileDropdown onLogout={onLogout}/>}
      </div>
    </div>
  );
};

export default Navbar;