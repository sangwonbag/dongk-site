import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingPhoneButton from "../ui/FloatingPhoneButton";
import RightFloatingBox from "../ui/RightFloatingBox";
import AdminOrderNotifier from "../admin/AdminOrderNotifier";
import "./MainLayout.css";

export default function MainLayout({ children, className = "" }) {
    return (
        <div className="main-layout">
            <Header />
            <main className={`main-content ${className}`}>
                {children}
            </main>
            <Footer />
            <FloatingPhoneButton />
            <RightFloatingBox />
            <AdminOrderNotifier />
        </div>
    );
}
