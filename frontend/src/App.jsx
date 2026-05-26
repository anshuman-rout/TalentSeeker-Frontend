import React, {useEffect,useState,} from "react";
import {UploadProvider,} from "./context/UploadContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

import { ChatProvider } from "./context/ChatContext";
const App = () => {

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  // Check Existing Token
  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {
      setIsLoggedIn(true);
    }

  }, []);

  // Login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Logout
  const handleLogout = () => {

    // Remove Tokens
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    // Logout User
    setIsLoggedIn(false);
};

  return (
    <UploadProvider>
      <ChatProvider>

        {isLoggedIn ? (

          <Home onLogout={handleLogout} />

        ) : (

          <Login onLogin={handleLogin} />

        )}

      </ChatProvider>
    </UploadProvider>
  );
};

export default App;