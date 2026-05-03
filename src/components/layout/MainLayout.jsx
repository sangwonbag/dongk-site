import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingPhoneButton from "../ui/FloatingPhoneButton";
import RightFloatingBox from "../ui/RightFloatingBox";
import AICounselor from "../ui/AICounselor";
import "./MainLayout.css";

export default function MainLayout({ children }) {
    return (
        <div className="main-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <FloatingPhoneButton />
            <RightFloatingBox />
            <AICounselor />
        </div>
    );
}
