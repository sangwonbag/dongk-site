import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import { GUIDE_ARTICLES } from "../../data/guideData";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import MaterialCard from "../../components/material/MaterialCard";
import { ChevronDown, ArrowRight, Sparkles, Calculator, HelpCircle, ChevronRight } from "lucide-react";
import "./Guide.css";

export default function GuideDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const article = GUIDE_ARTICLES[slug];

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Calculator states
  const [calcPyung, setCalcPyung] = useState(24);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryProducts() {
      if (!article || !article.relatedCategory) {
        setLoadingProducts(false);
        return;
      }
      try {
        setLoadingProducts(true);
        const all = await fetchAllProducts();
        const categoryTarget = article.relatedCategory;
        const matched = all.filter(p => {
          if (!p.category) return false;
          if (categoryTarget === "마루" || categoryTarget === "강마루") {
            return p.category.includes("마루") || p.category.includes("강마루");
          }
          return p.category.includes(categoryTarget);
        });

        if (isMounted) {
          setProducts(matched.slice(0, 6)); // Display top 6 matching live products
          setLoadingProducts(false);
        }
      } catch (err) {
        console.error("Failed to fetch category products for guide:", err);
        if (isMounted) setLoadingProducts(false);
      }
    }
    loadCategoryProducts();
    return () => {
      isMounted = false;
    };
  }, [article, slug]);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Calculator computation
  const calcResult = useMemo(() => {
    const p = Math.max(1, parseInt(calcPyung, 10) || 1);
    if (article?.calculatorType === "decotile-quantity") {
      const boxes = Math.ceil(p * 1.05); // 5% loss rate
      const estPrice = boxes * 32000;
      return {
        boxText: `약 ${boxes}박스 (실평수 ${p}평 + 로스율 5% 포함)`,
        priceText: `예상 자재비 약 ${estPrice.toLocaleString()}원~`,
        tip: "* 시공 공간 모양이 다각형이거나 복도가 긴 경우 로스율 8~10% 적용을 권장합니다."
      };
    } else {
      const estJangpan = Math.round(p * 28000);
      const estDeco = Math.ceil(p * 1.05) * 32000;
      const estMaru = Math.round(p * 110000);
      return {
        jangpanText: `2.2T 장판: 약 ${estJangpan.toLocaleString()}원~`,
        decoText: `3.0T 데코타일: 약 ${estDeco.toLocaleString()}원~`,
        maruText: `강마루(시공포함): 약 ${estMaru.toLocaleString()}원~`,
        tip: "* 자재 브랜드 및 두께, 현장 철거 상태에 따라 변동될 수 있습니다."
      };
    }
  }, [calcPyung, article]);

  if (!article) {
    return (
      <div className="guide-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>찾으시는 바닥재 가이드가 존재하지 않습니다.</h2>
        <p style={{ marginTop: "12px", color: "#6b7280" }}>
          요청하신 경로의 가이드 페이지가 없거나 삭제되었습니다.
        </p>
        <Link to="/guide" className="guide-cta-btn" style={{ marginTop: "24px" }}>
          바닥재 가이드 메인으로 이동
        </Link>
      </div>
    );
  }

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": article.breadcrumb.map((b, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": b.label,
          "item": b.link ? `https://dkfloor.kr${b.link}` : `https://dkfloor.kr/guide/${article.slug}`
        }))
      },
      {
        "@type": "Article",
        "headline": article.title,
        "description": article.metaDescription,
        "author": {
          "@type": "Organization",
          "name": "동경바닥재"
        }
      }
    ]
  };

  return (
    <div className="guide-container">
      <SEO
        title={article.metaTitle || `${article.title} | 동경바닥재`}
        description={article.metaDescription}
        canonical={`https://dkfloor.kr/guide/${article.slug}`}
        jsonLd={jsonLdSchema}
      />

      {/* Breadcrumb */}
      <nav className="guide-breadcrumb">
        {article.breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={14} />}
            {b.link ? <Link to={b.link}>{b.label}</Link> : <span>{b.label}</span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Article Header */}
      <header style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", marginBottom: "12px", lineHeight: "1.3" }}>
          {article.title}
        </h1>
        {article.subtitle && (
          <p style={{ fontSize: "17px", color: "#4b5563", lineHeight: "1.6" }}>
            {article.subtitle}
          </p>
        )}
      </header>

      {/* GEO / AI Direct Answer Box */}
      {article.aiSummary && (
        <div className="ai-summary-box">
          <div className="ai-summary-header">
            <Sparkles size={16} /> GEO / AI 핵심 답변
          </div>
          <div className="ai-summary-text">{article.aiSummary}</div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {article.comparisonTable && (
        <section className="guide-section">
          <h2 className="guide-section-title">비교 요약표</h2>
          <div className="guide-table-wrapper">
            <table className="guide-table">
              <thead>
                <tr>
                  {article.comparisonTable.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {article.comparisonTable.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ fontWeight: ci === 0 ? "700" : "normal" }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sections & Details */}
      {article.sections &&
        article.sections.map((sec, idx) => (
          <section key={idx} className="guide-section">
            <h2 className="guide-section-title">{sec.heading}</h2>
            <div
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: "#374151",
                whiteSpace: "pre-line",
                marginBottom: "16px"
              }}
            >
              {sec.content}
            </div>
            {sec.bullets && (
              <ul className="guide-card-features" style={{ background: "#fafafa", padding: "16px", borderRadius: "12px" }}>
                {sec.bullets.map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

      {/* Calculator Widget */}
      {article.calculatorType && (
        <section className="guide-calc-widget">
          <h2 className="guide-calc-header">
            <Calculator size={22} inline style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {article.calculatorType === "decotile-quantity" ? "데코타일 필요 박스 수 계산기" : "공간 평수 기준 금액 계산기"}
          </h2>
          <p className="guide-calc-desc">
            시공할 평수를 입력하시면 필요 수량과 대략적인 자재 예상가를 즉시 계산해 드립니다.
          </p>

          <div className="guide-calc-form" style={{ maxWidth: "320px" }}>
            <div className="guide-calc-field">
              <label>시공할 공간 평수 (평)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={calcPyung}
                onChange={(e) => setCalcPyung(e.target.value)}
              />
            </div>
          </div>

          <div className="guide-calc-result">
            <div>
              {article.calculatorType === "decotile-quantity" ? (
                <>
                  <div className="guide-result-value">{calcResult.boxText}</div>
                  <div style={{ fontSize: "15px", color: "#4b5563", marginTop: "4px" }}>
                    {calcResult.priceText}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
                    {calcPyung}평 기준 예상 가격비교:
                  </div>
                  <div style={{ fontSize: "15px", color: "#374151" }}>{calcResult.jangpanText}</div>
                  <div style={{ fontSize: "15px", color: "#374151" }}>{calcResult.decoText}</div>
                  <div style={{ fontSize: "15px", color: "#374151" }}>{calcResult.maruText}</div>
                </>
              )}
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                {calcResult.tip}
              </div>
            </div>
            <button className="guide-calc-btn" onClick={() => navigate("/estimate/request")}>
              실제 정확한 자동견적 계산하기 <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Real Category Products Grid */}
      {article.relatedCategory && (
        <section className="guide-section">
          <h2 className="guide-section-title">
            현재 판매 중인 추천 {article.relatedCategory} 상품
          </h2>
          <p className="guide-section-subtitle">
            동경바닥재에서 즉시 주문 및 시공 신청이 가능한 실제 {article.relatedCategory} 제품들입니다.
          </p>

          {loadingProducts ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
              관련 상품을 불러오는 중입니다...
            </div>
          ) : products.length > 0 ? (
            <div className="guide-products-grid">
              {products.map(product => (
                <MaterialCard key={product.id} material={product} />
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", color: "#6b7280" }}>
              현재 추천 {article.relatedCategory} 상품이 준비 중입니다. 전체 자재찾기에서 둘러보세요.
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Link
              to={`/materials?category=${encodeURIComponent(article.relatedCategory)}`}
              className="guide-card-link"
              style={{ fontSize: "15px" }}
            >
              더많은 {article.relatedCategory} 상품 보러가기 <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Article FAQs */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="guide-section">
          <h2 className="guide-section-title">
            <HelpCircle size={20} style={{ color: "#c99c47" }} /> 관련 자주 묻는 질문
          </h2>
          <div className="guide-faq-list">
            {article.faqs.map((faq, idx) => (
              <div key={idx} className={`guide-faq-item ${openFaqIndex === idx ? "open" : ""}`}>
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
      )}

      {/* CTA Banner */}
      <div className="guide-cta-banner">
        <h2>실제 내 공간 시공 비용이 궁금하신가요?</h2>
        <p>
          자동견적 계산기에 평수와 자재를 입력하시면 시공 부자재 포함 정확한 소요 비용을 즉시 산출해 드립니다.
        </p>
        <Link to="/estimate/request" className="guide-cta-btn">
          자동견적 계산하기 <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
