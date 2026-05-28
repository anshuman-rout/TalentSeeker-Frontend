import React, { useEffect, useState, } from "react";
import { UploadProvider, } from "./context/UploadContext";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ProtectedRoute } from "./Providers/ProtectRoute"
import { AuthProvider } from "./context/AuthStore";
import { ChatProvider } from "./context/ChatContext";
const App = () => {


  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // // Check Existing Token
  // useEffect(() => {

  //   const token =
  //     localStorage.getItem(
  //       "access_token"
  //     );

  //   if (token) {
  //     setIsLoggedIn(true);
  //   }

  // }, []);

  // Login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // // Logout
  // const handleLogout = () => {

  //   // Remove Tokens
  //   localStorage.removeItem(
  //     "access_token"
  //   );

  //   localStorage.removeItem(
  //     "refresh_token"
  //   );

  //   // Logout User
  //   setIsLoggedIn(false);
  // };



  return (
    <Routes>

      <Route path="/" element={
        <AuthProvider>
           <UploadProvider>
            <ChatProvider>
              <Home />
            </ChatProvider>
           </UploadProvider>
        </AuthProvider>
        
      } />
      <Route path="/login" element={
        <AuthProvider>
            <Login  />
        </AuthProvider>
        } />
    </Routes>


  );
};

export default App;