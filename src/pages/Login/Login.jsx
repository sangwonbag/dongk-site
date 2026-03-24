import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

export default function Login() {
    const nav = useNavigate();

    return (
        <MainLayout>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
                <h1 style={{ fontSize: 28, margin: 0 }}>로그인</h1>
                <p style={{ marginTop: 10, color: "#666" }}>준비 중입니다.</p>

                <button
                    onClick={() => nav("/")}
                    style={{
                        marginTop: 18,
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid #111",
                        background: "#111",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    홈으로 돌아가기
                </button>
            </div>
        </MainLayout>
    );
}
