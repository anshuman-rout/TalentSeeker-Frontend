import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {useNavigate} from "react-router"
import { useAuthStore } from "../context/AuthStore";


export const ProtectedRoute = ({ children }) => {
  
  const {isLoggedIn} = useAuthStore()
  
  const navigate = useNavigate()

   // Redirect if not logged in
  useEffect(() => {

    if (!isLoggedIn) {
      navigate("/login");
    }
    console.log(isLoggedIn)
  }, [
    isLoggedIn,
    navigate,
  ]);

  if (isLoggedIn)  return null;

};

