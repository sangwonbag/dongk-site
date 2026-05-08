import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Pages
import Home from "../pages/Home/Home";
import SampleBooks from "../pages/Samplebooks/SampleBooks";
import Materials from "../pages/Materials/Materials";
import MaterialDetail from "../pages/MaterialDetail/MaterialDetail";
import Cart from "../pages/Cart/Cart";
import Login from "../pages/Login/Login";
import Inquiries from "../pages/Admin/Inquiries";

// Global Components
import AIChatWidget from "../components/chat/AIChatWidget";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/samplebooks" element={<SampleBooks />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/materials/:id" element={<MaterialDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/inquiries" element={<Inquiries />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatWidget />
    </>
  );
}
