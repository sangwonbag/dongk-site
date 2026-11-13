import React from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Building2, 
  Home, 
  Coffee, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { JAEYOUNG_PRECAUTIONS } from '../../utils/jaeyoungDetailUtils';

export default function JaeyoungDetailSection({ item, info }) {
  if (!info || !info.spec) return null;

  const {
    group,
    groupName,
    lineup,
    productName,
    productCode,
    spec,
    structureImg,
    sceneImg,
    layers,
    features,
    spaces,
    comparisonTable
  } = info;

  const isHomeWood = group === 'homewood';

  return (
    <div className="kcc-trendy-detail-container jaeyoung-detail-container">
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
                <td>{productCode || "코드 정보 없음"}</td>
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
          <h3 className="kcc-comparison-title">재영 Jflor 데코타일 제품군 규격 안내</h3>
          <div className="kcc-table-scroll-wrapper">
            <table className="kcc-comparison-table">
              <thead>
                <tr>
                  <th>제품군</th>
                  <th>두께</th>
                  <th>규격</th>
                  <th>박스 수량</th>
                  <th>박스 면적</th>
                  <th>시공 방식</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, idx) => {
                  const isCurrent = row.group === group;
                  return (
                    <tr key={idx} className={isCurrent ? 'row-current-product' : ''}>
                      <td>
                        {row.lineupName}
                        {isCurrent && <span className="current-product-pill">현재 제품</span>}
                      </td>
                      <td><strong>{row.thickness}</strong></td>
                      <td>{row.size}</td>
                      <td>{row.pcs}</td>
                      <td>{row.area}</td>
                      <td>{row.method}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="kcc-table-note">
            * 위 규격은 재영 Jflor 2019 카탈로그 기준이며, 실제 공급 규격 및 포장 수량은 주문 전 확인이 필요합니다.
          </p>
        </div>
      </section>

      {/* ========================================================
          SECTION 02. 제품 특장점 (KCC 스타일 2x2 카드)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-features-section">
        <h2 className="doc-section-title">제품 특장점</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-subtext">
          재영 Jflor LVT 데코타일은 다양한 자연 질감과 뛰어난 실용성을 갖춘 바닥재입니다.
        </p>

        <div className="kcc-features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="kcc-feature-card">
              <div className="kcc-feature-icon-box">
                <Sparkles size={20} className="kcc-icon-gold" />
              </div>
              <h3 className="kcc-feature-title">{feat.title}</h3>
              <p className="kcc-feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 03. 제품 구조 (공식 카탈로그 Structure & 층별 카드)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-structure-section">
        <h2 className="doc-section-title">제품 구조</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-subtext">
          재영 Jflor 카탈로그 공식 LVT 제품 구조로, 뛰어난 내구성과 안정성을 제공합니다.
          {isHomeWood && ' (홈우드는 온돌 환경을 고려하여 치수 안정 보강 설계를 적용했습니다)'}
        </p>

        {structureImg && (
          <div className="kcc-structure-diagram-wrap" style={{ textAlign: 'center', margin: '20px 0 28px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <img 
              src={structureImg} 
              alt={`${lineup} 공식 제품 단면 구조도`} 
              style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', margin: '0 auto', display: 'block' }} 
            />
            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              재영 Jflor 2019 카탈로그 LVT {lineup} 공식 제품 구조도
            </span>
          </div>
        )}

        <div className="kcc-structure-layers-list">
          {layers.map((l, idx) => (
            <div key={idx} className="kcc-layer-card">
              <div className="kcc-layer-badge">
                <Layers size={14} />
                <span>{l.layer}</span>
              </div>
              <div className="kcc-layer-content">
                <h3 className="kcc-layer-title">{l.title}</h3>
                <p className="kcc-layer-desc">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 04. 이 자재가 적용된 공간 예시
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-spaces-section">
        <h2 className="doc-section-title">이 자재가 적용된 공간 예시</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-subtext">
          재영 Jflor {lineup} 제품이 다양한 실내 공간에서 완성도 높은 인테리어를 연출합니다.
        </p>

        {sceneImg && (
          <div style={{ margin: '16px 0 24px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img 
              src={sceneImg} 
              alt="재영 Jflor 카탈로그 공간 연출 예시" 
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ background: '#f8fafc', padding: '8px 14px', fontSize: '12px', color: '#64748b' }}>
              카탈로그 공간 연출 예시 (실제 자재의 색상과 질감은 조명 및 모니터 해상도에 따라 차이가 있을 수 있습니다)
            </div>
          </div>
        )}

        <div className="kcc-spaces-grid">
          {spaces.map((sp, idx) => {
            const IconComponent = idx === 0 ? Home : idx === 1 ? (group.includes('wood') ? Home : Briefcase) : Coffee;
            return (
              <div key={idx} className="kcc-space-card">
                <div className="kcc-space-card-header">
                  <div className="kcc-space-icon-box">
                    <IconComponent size={18} />
                  </div>
                  <span className="kcc-space-tag">{sp.tag}</span>
                </div>
                <h3 className="kcc-space-title">{sp.title}</h3>
                <p className="kcc-space-desc">{sp.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 05. 시공 전 유의사항 (KCC 스타일 번호 카드 7종)
          ======================================================== */}
      <section className="detail-doc-section kcc-trendy-precautions-section">
        <h2 className="doc-section-title">시공 전 유의사항</h2>
        <div className="doc-accent-bar"></div>
        <p className="section-subtext">
          완벽한 시공 품질과 하자 예방을 위해 시공 전 반드시 아래 핵심 수칙을 확인해 주시기 바랍니다.
        </p>

        <div className="kcc-precautions-list">
          {JAEYOUNG_PRECAUTIONS.map((pr, idx) => (
            <div key={idx} className="kcc-precaution-card">
              <div className="kcc-precaution-num-box">
                <span className="kcc-precaution-num">{pr.num}</span>
              </div>
              <div className="kcc-precaution-body">
                <h3 className="kcc-precaution-title">
                  <CheckCircle2 size={16} className="kcc-precaution-check" />
                  {pr.title}
                </h3>
                <p className="kcc-precaution-desc">{pr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

