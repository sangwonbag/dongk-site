import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingPhoneButton from "../ui/FloatingPhoneButton";
import RightFloatingBox from "../ui/RightFloatingBox";
import AdminOrderNotifier from "../admin/AdminOrderNotifier";
import ScrollRevealMenu from "./ScrollRevealMenu";
import "./MainLayout.css";

export default function MainLayout({ children, className = "" }) {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-orders');

    return (
        <div className="main-layout">
            <Header />
            <ScrollRevealMenu />
            <main className={`main-content ${isHome ? "home-main-content" : ""} ${isAdminRoute ? "admin-main-content" : ""} ${className}`}>
                {children}
            </main>
            <Footer />
            <FloatingPhoneButton />
            <RightFloatingBox />
            <AdminOrderNotifier />
        </div>
    );
}
