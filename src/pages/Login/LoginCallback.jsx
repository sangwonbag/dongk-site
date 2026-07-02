import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

export default function LoginCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("로그인 정보를 확인하고 있습니다...");

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!supabase) {
          throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
        }

        // 1. Get current OAuth session
        setStatusMsg("세션 정보를 가져오는 중입니다...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session || !session.user) {
          throw new Error("카카오 로그인 세션을 찾을 수 없습니다. 다시 시도해 주세요.");
        }

        const user = session.user;
        const userMetadata = user.user_metadata || {};
        
        setStatusMsg("사용자 프로필을 연동하고 있습니다...");
        
        // 2. Check if profiles row exists for this user.id
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, name, phone, company_name, user_type, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile check error:", profileError);
          throw new Error(`프로필 조회 중 오류가 발생했습니다. (${profileError.message})`);
        }

        let finalProfile = null;

        if (existingProfile) {
          finalProfile = existingProfile;
        } else {
          // 3. Create a new profile row for first-time login
          setStatusMsg("새로운 프로필을 생성하고 있습니다...");
          
          const customUsername = `kakao_${user.id.substring(0, 8)}`;
          const displayName = userMetadata.full_name || userMetadata.name || userMetadata.nickname || userMetadata.profile_nickname || userMetadata.preferred_username || `카카오_${user.id.substring(0, 8)}`;
          const rawPhone = userMetadata.phone_number || "";
          
          // Normalize phone number if present, otherwise store null
          let normalizedPhone = null;
          if (rawPhone) {
            let cleanPhone = rawPhone.replace(/\+82\s?/, "0").replace(/[-\s]/g, "");
            if (cleanPhone && !cleanPhone.startsWith("0")) {
              cleanPhone = "0" + cleanPhone;
            }
            normalizedPhone = cleanPhone || null;
          }

          const newProfile = {
            id: user.id, // Match auth.users.id
            username: customUsername,
            name: displayName,
            phone: normalizedPhone,
            password: null, // Explicitly save password as null for OAuth
            user_type: "일반",
            role: "user"
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile);

          if (insertError) {
            console.error("Profile insert error:", insertError);
            throw new Error(`프로필 생성 중 오류가 발생했습니다. (${insertError.message})`);
          }

          finalProfile = {
            id: user.id,
            username: customUsername,
            name: displayName,
            phone: normalizedPhone,
            user_type: "일반",
            role: "user"
          };
        }

        // 4. Bind profile to local dk_auth_user session
        const authData = {
          ...finalProfile,
          email: user.email || userMetadata.email || null, // Defensive fallback for email if not provided in scopes
          isLoggedIn: true
        };

        localStorage.setItem("dk_auth_user", JSON.stringify(authData));
        setUser(authData);

        setStatusMsg("로그인 완료! 화면을 이동하고 있습니다...");
        
        // Retrieve redirect target URL
        const searchParams = new URLSearchParams(location.search);
        const redirectUrl = searchParams.get("redirect") || "/";
        
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1000);

      } catch (err) {
        console.error("[Kakao OAuth Callback Exception]", err);
        setErrorMsg(`카카오 로그인 처리 중 오류가 발생했습니다. 카카오 로그인 설정(동의 항목 등)을 확인해주세요. (${err.message || String(err)})`);
      }
    }

    handleCallback();
  }, [navigate, location, setUser]);

  return (
    <MainLayout>
      <div 
        style={{
          maxWidth: "480px",
          margin: "120px auto 80px",
          padding: "40px 24px",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
        }}
      >
        {errorMsg ? (
          <div>
            <h2 style={{ color: "#e11d48", fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
              카카오 로그인 실패
            </h2>
            <p style={{ color: "#4b5563", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "28px" }}>
              {errorMsg}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  backgroundColor: "#1e293b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                로그인으로 돌아가기
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                홈으로 이동
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div 
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "4px solid #fef08a",
                borderTopColor: "#eab308",
                animation: "spin 1s linear infinite",
                margin: "0 auto 24px"
              }}
            />
            <h2 style={{ color: "#1e293b", fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>
              카카오 로그인 처리 중
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              {statusMsg}
            </p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  );
}
