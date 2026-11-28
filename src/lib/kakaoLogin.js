import { supabase } from "./supabaseClient";
import { getSafeRedirectUrl } from "../utils/urlUtils";

export async function startKakaoLogin(returnTo) {
  if (!supabase) {
    throw new Error("로그인 서버에 연결할 수 없습니다.");
  }

  const { hostname, origin } = window.location;
  const callbackOrigin = ["localhost", "127.0.0.1"].includes(hostname)
    ? origin
    : "https://dkfloor.co.kr";
  const callback = new URL("/login-callback", callbackOrigin);
  callback.searchParams.set("redirect", getSafeRedirectUrl(returnTo, "/"));

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: callback.toString(),
      scopes: "profile_nickname profile_image",
    },
  });
  if (error) throw error;
}
