import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import {
  GUIDE_CATEGORIES,
  MAIN_FLOORING_TYPES,
  SPACE_RECOMMENDATIONS,
  ALL_GUIDE_FAQS
} from "../../data/guideData";
import { ChevronDown, ArrowRight, HelpCircle, Compass, Sparkles } from "lucide-react";
import "./Guide.css";

export default function GuideMain() {
  const [activeTab, setActiveTab] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const jsonLdFaq = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": ALL_GUIDE_FAQS.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    };
  }, []);

  return (
    <div className="guide-container">
      <SEO
        title="어떤 바닥재가 맞을까요? | 바닥재 가이드 | 동경바닥재"
        description="집, 상가, 사무실 등 공간과 예산에 맞는 바닥재(장판, 데코타일, 강마루)를 비교하고 실제 판매 제품과 예상 견적까지 확인해 보세요."
        canonical="https://dkfloor.co.kr/guide"
        jsonLd={jsonLdFaq}
      />

      {/* Header */}
      <header className="guide-header">
        <span className="guide-header-badge">FLOORING GUIDE SYSTEM</span>
        <h1>어떤 바닥재가 맞을까요?</h1>
        <p>
          집, 상가, 사무실 등 공간 특성과 시공 예산에 꼭 맞는 바닥재를 손쉽게 비교하고,<br />
          실제 판매 중인 브랜드 자재와 맞춤 견적문의까지 원스톱으로 확인해 보세요.
        </p>
      </header>

      {/* Category Tabs */}
      <div className="guide-category-tabs">
        {GUIDE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`guide-tab-btn ${activeTab === cat.id ? "active" : ""}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* AI Search GEO Direct Answer Banner */}
      <div className="ai-summary-box">
        <div className="ai-summary-header">
          <Sparkles size={16} /> GEO / AI 추천 핵심 요약
        </div>
        <div className="ai-summary-text">
          주거용 아파트·빌라에는 난방 전달이 빠르고 청소가 용이한 <b>2.2T~3.2T 가정용 장판</b>이나 <b>강마루</b>가 가장 추천됩니다.
          반면, 신발을 신고 이동하거나 가구 긁힘이 빈번한 상가, 매장, 사무실에는 표면 강도가 높고 낱개 보수가 쉬운 <b>3.0mm 데코타일</b>이 최선의 선택입니다.
        </div>
      </div>

      {/* Section 1: 바닥재 종류 알아보기 */}
      {(activeTab === "all" || activeTab === "types" || activeTab === "price" || activeTab === "thickness") && (
        <section className="guide-section">
          <h2 className="guide-section-title">
            <Compass size={22} style={{ color: "#c99c47" }} /> 바닥재 종류 알아보기
          </h2>
          <p className="guide-section-subtitle">
            자재 특성, 시공 방식, 사용감에 따라 달라지는 5대 대표 바닥재를 정리했습니다.
          </p>

          <div className="guide-card-grid">
            {MAIN_FLOORING_TYPES.map(item => (
              <div key={item.id} className="guide-card">
                <div className="guide-card-header">
                  {item.badge && <span className="guide-card-badge">{item.badge}</span>}
                  <h3 className="guide-card-title">{item.name}</h3>
                  <p className="guide-card-tagline">{item.tagline}</p>
                </div>
                <ul className="guide-card-features">
                  {item.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <Link to={item.link} className="guide-card-link">
                  상세 가이드 보기 <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: 핵심 비교 가이드 */}
      {(activeTab === "all" || activeTab === "types") && (
        <section className="guide-section">
          <h2 className="guide-section-title">
            <Sparkles size={22} style={{ color: "#c99c47" }} /> 가장 많이 궁금해하는 비교
          </h2>
          <p className="guide-section-subtitle">
            선택의 갈림길에서 고민되는 대표적인 바닥재 조합을 정밀 비교해 드립니다.
          </p>

          <div className="guide-card-grid">
            <div className="guide-card">
              <span className="guide-card-badge">인기 비교 1위</span>
              <h3 className="guide-card-title">장판 vs 데코타일</h3>
              <p className="guide-card-tagline">
                물에 강하고 폭신한 장판과, 스크래치에 강하고 낱개 교체되는 데코타일의 9가지 차이점
              </p>
              <Link to="/guide/vinyl-vs-decotile" className="guide-card-link">
                비교표 및 상세 가이드 보기 <ArrowRight size={16} />
              </Link>
            </div>

            <div className="guide-card">
              <span className="guide-card-badge">두께별 선택</span>
              <h3 className="guide-card-title">장판 두께별 차이 (1.8T ~ 5.0T)</h3>
              <p className="guide-card-tagline">
                원룸 알뜰 1.8T부터 표준 가정용 2.2T, 층간소음 완화 3.2T/4.5T 쿠션 장판 비교
              </p>
              <Link to="/guide/vinyl-thickness" className="guide-card-link">
                두께 가이드 보기 <ArrowRight size={16} />
              </Link>
            </div>

            <div className="guide-card">
              <span className="guide-card-badge">견적 원리</span>
              <h3 className="guide-card-title">바닥재 가격 계산 방식</h3>
              <p className="guide-card-tagline">
                자재비, 필요 수량, 인건비, 부자재(본드/마감재), 철거비 합산 견적 구조
              </p>
              <Link to="/guide/flooring-price" className="guide-card-link">
                가격 산정 가이드 보기 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: 공간별 바닥재 추천 */}
      {(activeTab === "all" || activeTab === "space") && (
        <section className="guide-section">
          <h2 className="guide-section-title">
            <Compass size={22} style={{ color: "#c99c47" }} /> 공간에 맞는 바닥재 찾기
          </h2>
          <p className="guide-section-subtitle">
            아파트, 상가, 사무실, 반려동물 가구 등 사용 공간의 환경에 맞는 맞춤 추천입니다.
          </p>

          <div className="guide-card-grid">
            {SPACE_RECOMMENDATIONS.map((space, idx) => (
              <div key={idx} className="guide-card">
                <h3 className="guide-card-title">{space.title}</h3>
                <p className="guide-card-tagline">{space.desc}</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {space.tags.map((t, ti) => (
                    <span
                      key={ti}
                      style={{
                        fontSize: "12px",
                        padding: "3px 8px",
                        background: "#f3f4f6",
                        borderRadius: "4px",
                        color: "#4b5563"
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <Link to={space.link} className="guide-card-link">
                  추천 가이드 보기 <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 5: FAQ 대량 아코디언 */}
      <section className="guide-section">
        <h2 className="guide-section-title">
          <HelpCircle size={22} style={{ color: "#c99c47" }} /> 자주 묻는 질문 (FAQ)
        </h2>
        <p className="guide-section-subtitle">
          바닥재 선택 및 시공 과정에서 고객분들이 가장 자주 물어보시는 Q&A 모음입니다.
        </p>

        <div className="guide-faq-list">
          {ALL_GUIDE_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`guide-faq-item ${openFaqIndex === idx ? "open" : ""}`}
            >
              <div className="guide-faq-question" onClick={() => toggleFaq(idx)}>
                <span>Q. {faq.question}</span>
                <ChevronDown className="guide-faq-toggle-icon" />
              </div>
              {openFaqIndex === idx && (
                <div className="guide-faq-answer">
                  <p style={{ marginTop: "12px", marginBottom: "8px" }}>{faq.answer}</p>
                  {faq.linkText && (
                    <Link to={faq.linkUrl} className="guide-faq-link">
                      👉 {faq.linkText}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <div className="guide-cta-banner">
        <h2>우리 집 기준 실제 비용이 궁금하신가요?</h2>
        <p>
          평수와 원하시는 브랜드 자재를 직접 선택해 견적문의를 남겨주시면 담당자가 맞춤 견적을 상세히 안내해 드립니다.
        </p>
        <Link to="/estimate/request" className="guide-cta-btn">
          견적문의 접수하기 <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
