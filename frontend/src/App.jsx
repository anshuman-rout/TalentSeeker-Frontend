import React, { useEffect, useState, } from "react";
import { UploadProvider, } from "./context/UploadContext";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home";
import Login from "./pages/login";
import { AuthProvider } from "./context/AuthStore";
import { ChatProvider } from "./context/ChatContext";
const App = () => {

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