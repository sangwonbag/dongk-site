import React from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Building2, 
  Home, 
  Coffee, 
  Briefcase,
  AlertTriangle,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import { NOX_PRECAUTIONS } from '../../utils/noxDetailUtils';

export default function NoxDetailSection({ item, info }) {
  if (!info || !info.spec) return null;

  const {
    code,
    lineup,
    group,
    productName,
    pattern,
    spec,
    swatchImage,
    sceneImage,
    features,
    layers,
    spaces,
    comparisonTable,
    isRusticEdge,
    isBuiltInGrout,
    isEir,
    isBigSlab,
    isParquet,
    isCrossInstall
  } = info;

  return (
    <div className="kcc-trendy-detail-container nox-detail-container">
      {/* 견본 확인 안내 배너 */}
      <div style={{
        margin: '0 0 28px 0',
        padding: '16px 20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.6'
      }}>
        <Info size={18} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#1e293b' }}>PDF 카탈로그 색상표 견본 안내:</strong> 화면에 표시되는 색상표 이미지는 공식 카탈로그 인쇄본에서 추출한 참조용 견본입니다. 인쇄 특성 및 디스플레이 환경에 따라 실제 원장 자재와 차이가 있을 수 있으므로, 최종 시공 전 실물 샘플 확인을 권장합니다.
        </div>
      </div>

      {/* ========================================================
          SECTION 01. 상품 상세 규격 (KCC 스타일 스펙 테이블 + 라인업 규격표)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-spec-section">
        <h2 className="doc-section-title">상품 상세 규격</h2>
        <div className="doc-accent-bar"></div>

        <div className="spec-table-frame" style={{ marginBottom: '24px' }}>
          <table className="tech-spec-table">
            <tbody>
              <tr>
                <th>제조 브랜드</th>
                <td>{spec.brand}</td>
                <th>제품 라인업</th>
                <td><strong>{spec.lineup}</strong></td>
              </tr>
              <tr>
                <th>제품 식별 코드</th>
                <td>{code || "코드 정보 없음"}</td>
                <th>패턴 / 디자인</th>
                <td>{spec.designType}</td>
              </tr>
              <tr>
                <th>제품 두께</th>
                <td><strong>{spec.thickness}</strong></td>
                <th>가로 × 세로 규격</th>
                <td><strong>{spec.size}</strong></td>
              </tr>
              <tr>
                <th>박스당 포장 수량</th>
                <td><strong>{spec.pcs_per_box}</strong> ({spec.packing})</td>
                <th>박스당 시공 면적</th>
                <td><strong>{spec.area}</strong></td>
              </tr>
              <tr>
                <th>제품 분류</th>
                <td>{spec.materialType}</td>
                <th>시공 방식</th>
                <td>{spec.method}</td>
              </tr>
              <tr>
                <th>권장 접착제</th>
                <td colSpan="3">{spec.adhesive}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 라인업별 규격 안내표 */}
        <div className="kcc-trendy-lineup-comparison-wrap">
          <h3 className="kcc-comparison-title">녹수 {lineup} 제품군 상세 규격 안내</h3>
          <div className="kcc-table-scroll-wrapper">
            <table className="kcc-comparison-table">
              <thead>
                <tr>
                  <th>제품 구분</th>
                  <th>두께</th>
                  <th>규격 (가로×세로)</th>
                  <th>박스 수량</th>
                  <th>박스 면적</th>
                  <th>시공 방식</th>
                  <th>비고 / 특징</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, idx) => {
                  const isCurrent = row.codes ? row.codes.includes(code) : false;
                  return (
                    <tr 
                      key={idx} 
                      className={isCurrent ? "current-product-row" : ""}
                      style={isCurrent ? { backgroundColor: '#fef3c7', fontWeight: 'bold' } : {}}
                    >
                      <td>
                        {row.groupName}
                        {isCurrent && <span className="current-badge" style={{ marginLeft: '6px', fontSize: '11px', color: '#b45309' }}>[현재 상품]</span>}
                      </td>
                      <td>{row.thickness}</td>
                      <td>{row.size}</td>
                      <td>{row.pcs}</td>
                      <td>{row.area}</td>
                      <td>{row.method}</td>
                      <td>{row.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="kcc-comparison-notice" style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
            ※ 위 규격은 녹수 NOX 공식 카탈로그 기준이며, 실제 공급 규격 및 포장 수량은 주문 전 확인이 필요합니다.
          </p>
        </div>
      </section>

      {/* ========================================================
          SECTION 02. 제품 특장점 (2x2 카드)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-features-section">
        <h2 className="doc-section-title">제품 특장점</h2>
        <div className="doc-accent-bar"></div>

        <div className="kcc-features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="kcc-feature-card">
              <div className="feature-icon-wrap">
                <CheckCircle2 size={24} className="feature-icon" />
              </div>
              <div className="feature-content">
                <h4 className="feature-card-title">{feat.title}</h4>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {lineup === '오키드3000' && (
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>
            ※ 카탈로그에 명시된 5년 품질보증은 적용 조건 및 현장 계약 범위에 따라 상이할 수 있으므로 주문 전 최신 약관 확인이 필요합니다.
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 03. 제품 구조 (Structure 5-Layer)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-structure-section">
        <h2 className="doc-section-title">제품 구조</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-intro-text">
          녹수 NOX LVT는 EPT™ Shield 표면 보호 기술과 고밀도 EMT™ Core 치수안정 다층 구조를 통해 장기적인 내구성과 평탄도를 보장합니다.
        </p>

        <div className="kcc-structure-cards-grid">
          {layers.map((lay, idx) => (
            <div key={idx} className="kcc-structure-card">
              <span className="layer-badge">{lay.layer}</span>
              <h4 className="layer-name">{lay.name}</h4>
              <p className="layer-desc">{lay.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 04. 카탈로그 공간 연출 예시
          ======================================================== */}
      {spaces && spaces.length > 0 && (
        <section className="detail-doc-section kcc-trendy-spaces-section">
          <h2 className="doc-section-title">카탈로그 공간 연출 예시</h2>
          <div className="doc-accent-bar"></div>
          <p className="section-intro-text">
            녹수 공식 카탈로그에 수록된 인테리어 공간 연출 컷입니다. (실제 현장 완공 시공사진이 아닌 카탈로그 연출 이미지입니다.)
          </p>

          <div style={{ maxWidth: '840px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <img 
              src={spaces[0].image} 
              alt={spaces[0].title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
            />
            <div style={{ padding: '16px 20px', backgroundColor: '#ffffff' }}>
              <span style={{ 
                display: 'inline-block', 
                padding: '4px 8px', 
                backgroundColor: '#e0f2fe', 
                color: '#0369a1', 
                borderRadius: '4px', 
                fontSize: '11px', 
                fontWeight: 600,
                marginBottom: '6px'
              }}>
                카탈로그 연출 이미지
              </span>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {spaces[0].subtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          SECTION 05. 시공 전 유의사항 (10개 카드)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-precautions-section">
        <h2 className="doc-section-title">시공 전 유의사항</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-intro-text">
          바닥재의 수명과 시공 품질을 확보하기 위해 녹수 카탈로그의 시공 가이드라인을 반드시 준수하여 주십시오.
        </p>

        <div className="kcc-precautions-grid">
          {NOX_PRECAUTIONS.map((pre, idx) => (
            <div key={idx} className="kcc-precaution-card">
              <div className="precaution-num">{pre.num}</div>
              <div className="precaution-body">
                <h4 className="precaution-card-title">{pre.title}</h4>
                <p className="precaution-card-desc">{pre.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '18px', padding: '14px 18px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
          <strong>주의:</strong> 본 시공 지침은 오키드3000, 프라임1500, 에코홈2000 Dry Back 접착식 LVT 전용입니다. (무접착 방식인 SETAGRIP 등 별도 라인업의 시공법은 적용되지 않습니다.)
        </div>
      </section>
    </div>
  );
}

