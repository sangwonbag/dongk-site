import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, BookOpen, Layers } from "lucide-react";
import "./Header.css";

export default function Header() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;

    // Direct redirection logic based on user request
    const k = keyword.toLowerCase();

    // Category redirection
    if (k.includes("데코타일")) return nav("/materials?category=데코타일");
    if (k.includes("장판")) return nav("/materials?category=장판");
    if (k.includes("마루")) return nav("/materials?category=마루");
    if (k.includes("벽지")) return nav("/materials?category=벽지");
    if (k.includes("카페트")) return nav("/materials?category=카페트타일");

    // Brand redirection
    if (k.includes("kcc")) return nav("/materials?brand=KCC");
    if (k.includes("동신")) return nav("/materials?brand=동신");
    if (k.includes("lx") || k.includes("lg")) return nav("/materials?brand=LX");
    if (k.includes("재영")) return nav("/materials?brand=재영");
    if (k.includes("우성")) return nav("/materials?brand=우성");
    if (k.includes("녹수")) return nav("/materials?brand=녹수");
    if (k.includes("현대")) return nav("/materials?brand=현대");
    if (k.includes("이건")) return nav("/materials?brand=이건");
    if (k.includes("동화")) return nav("/materials?brand=동화");
    if (k.includes("구정")) return nav("/materials?brand=구정");
    if (k.includes("아이리스")) return nav("/materials?brand=아이리스");

    // Default search
    nav(`/materials?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className="mall-header">
      <div className="container header-row">
        {/* Logo */}
        <div className="header-logo" onClick={() => nav("/")}>
          DK Floor
        </div>

        {/* Search */}
        <form className="header-search" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="제품명, 브랜드명으로 검색하세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit">
            <Search size={20} />
          </button>
        </form>

        {/* Nav Icons */}
        <nav className="header-nav">
          <button onClick={() => nav("/samplebooks")}>
            <BookOpen size={20} />
            <span>샘플북</span>
          </button>
          <button onClick={() => nav("/materials")}>
            <Layers size={20} />
            <span>자재</span>
          </button>
          <button onClick={() => nav("/cart")}>
            <ShoppingCart size={20} />
            <span>장바구니</span>
          </button>
          <button onClick={() => nav("/login")}>
            <User size={20} />
            <span>로그인</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
