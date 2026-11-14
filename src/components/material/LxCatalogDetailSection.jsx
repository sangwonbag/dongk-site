import React from 'react';
import { getLxCatalogProduct, getLxLineupConfig } from '../../utils/lxProductUtils';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function LxCatalogDetailSection({ item, spaceExamples = [] }) {
  if (!item) return null;

  const catalog = getLxCatalogProduct(item);
  if (!catalog) return null;

  const config = getLxLineupConfig(catalog.lineup);
  if (!config) return null;

  const code = catalog.code;
  const pattern = catalog.pattern || item.pattern || '';
  const specType = catalog.specType;
  const isPrestige = catalog.lineup === 'PRESTIGE';
  const isHouseStyle = catalog.lineup === 'HOUSE_STYLE';
  const isBotanic = catalog.lineup === 'BOTANIC';
  const isEditone = catalog.lineup === 'EDITONE';

  return (
    <div className="lx-catalog-detail-container" style={{ width: '100%' }}>
      {/* ------------------------------------------------------------- */}
      {/* 라인업별 필수 최우선 경고 / 시공 제한 배너 */}
      {/* ------------------------------------------------------------- */}
      {isBotanic && (
        <section className="detail-doc-section" style={{ marginBottom: '24px' }}>
          <div
            className="lx-prohibition-banner"
            style={{
              background: '#fff1f2',
              border: '2px solid #f43f5e',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.08)'
            }}
          >
            <div
              style={{
                background: '#e11d48',
                color: '#fff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'inline-block', background: '#be123c', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
                {config.prohibitionWarning.badge}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#9f1239', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                {config.prohibitionWarning.strongText}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#4c0519', margin: 0, lineHeight: '1.6' }}>
                {config.prohibitionWarning.desc}
              </p>
            </div>
          </div>
        </section>
      )}

      {isHouseStyle && (
        <section className="detail-doc-section" style={{ marginBottom: '24px' }}>
          <div
            className="lx-guideline-banner"
            style={{
              background: '#fffbeb',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
            }}
          >
            <div
              style={{
                background: '#d97706',
                color: '#fff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Info size={24} />
            </div>
            <div>
              <div style={{ display: 'inline-block', background: '#b45309', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
                {config.mandatoryWarning.badge}
              </div>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#78350f', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                {config.mandatoryWarning.strongText}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
                {config.mandatoryWarning.desc}
              </p>
            </div>
          </div>
        </section>
      )}

      {isEditone && (
        <section className="detail-doc-section" style={{ marginBottom: '24px' }}>
          <div
            className="lx-editone-banner"
            style={{
              background: '#f8fafc',
              border: '2px solid #334155',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              boxShadow: '0 4px 12px rgba(51, 65, 85, 0.06)'
            }}
          >
            <div
              style={{
                background: '#1e293b',
                color: '#fff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
                {config.floorWallNotice.badge}
              </div>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                {config.floorWallNotice.strongText}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: '1.6' }}>
                {config.floorWallNotice.desc}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. 제품 상세 규격 (4열 표) */}
      {/* ------------------------------------------------------------- */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h2 className="doc-section-title">제품 상세 규격</h2>
          <span className="section-badge-kcc" style={{ background: '#1e293b' }}>
            {config.brand} 2025 공식 카탈로그
          </span>
          {catalog.eir && (
            <span
              style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fcd34d',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              동조엠보(EIR) 적용
            </span>
          )}
          {catalog.has600Option && (
            <span
              style={{
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              600각 규격 선택 가능
            </span>
          )}
        </div>
        <div className="doc-accent-bar"></div>

        <div className="spec-table-frame" style={{ marginBottom: '24px' }}>
          <table className="tech-spec-table">
            <tbody>
              <tr>
                <th>제조 브랜드</th>
                <td>{config.brand} ({config.brandEn})</td>
                <th>제품 라인업</th>
                <td>{config.lineupName} · {specType}</td>
              </tr>
              <tr>
                <th>제조사 제품코드</th>
                <td><strong>{code}</strong></td>
                <th>패턴 / 디자인</th>
                <td>{pattern}</td>
              </tr>
              <tr>
                <th>제품 두께 (T)</th>
                <td><strong>{catalog.thickness}</strong> ({config.materialType})</td>
                <th>제품 가로세로 규격</th>
                <td><strong>{catalog.size}</strong></td>
              </tr>
              <tr>
                <th>박스당 포장 수량</th>
                <td><strong>{catalog.pcsPerBox}장</strong> / BOX</td>
                <th>박스당 시공 면적</th>
                <td><strong>{catalog.areaPerBox}</strong> ({catalog.pyeongPerBox})</td>
              </tr>
              <tr>
                <th>권장 접착제</th>
                <td><strong>{config.recommendedAdhesive}</strong></td>
                <th>판매 가격</th>
                <td><strong>견적 문의</strong> (현장 실측 및 맞춤 단가 안내)</td>
              </tr>
              <tr>
                <th>카탈로그 출처</th>
                <td colSpan="3">
                  {config.catalogTitle} 공식 수록 규격
                  {catalog.has600Option && (
                    <span style={{ color: '#0284c7', marginLeft: '12px', fontWeight: '600' }}>
                      (※ 600×600mm 정사각 규격 선택 가능)
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 6. 제품 라인업별 전체 규격 안내 비교표 */}
        {/* ------------------------------------------------------------- */}
        <div className="kcc-trendy-lineup-comparison-wrap">
          <h3 className="kcc-comparison-title">{config.lineupName} 라인업별 규격 안내</h3>
          <div className="kcc-table-scroll-wrapper">
            <table className="kcc-comparison-table">
              <thead>
                <tr>
                  <th>규격 분류</th>
                  <th>두께</th>
                  <th>규격 (폭 × 길이)</th>
                  <th>박스 수량</th>
                  <th>공식 시공면적</th>
                </tr>
              </thead>
              <tbody>
                {config.specsComparison.map((comp, idx) => {
                  const isCurrent = specType.includes(comp.type) || comp.type.includes(specType);
                  return (
                    <tr key={idx} className={isCurrent ? 'row-current-product' : ''}>
                      <td>
                        {comp.type}
                        {isCurrent && <span className="current-product-pill">현재 제품</span>}
                      </td>
                      <td>{comp.thickness}</td>
                      <td><strong>{comp.size}</strong></td>
                      <td>{comp.pcsPerBox ? `${comp.pcsPerBox}장` : comp.pcsPerBox}</td>
                      <td>{comp.areaPerBox} ({comp.pyeongPerBox})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="kcc-table-note" style={{ marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
            {isPrestige && '* 프레스티지 5T는 일반 3T 타일과 두께 및 박스당 면적(1.80㎡ / 2.09㎡)이 상이하므로 실측 평수에 맞추어 수량을 선택해 주시기 바랍니다.'}
            {isHouseStyle && '* 하우스스타일은 온돌 환경에 특화된 3.0T 규격으로, 전용 접착제인 하우스풀을 사용하여 시공해야 안정적인 접착력을 유지합니다.'}
            {isBotanic && '* 보타닉 450각의 공식 규격은 450 × 450mm(16장/3.24㎡)이며, 타 브랜드의 457.2각과 규격이 다르므로 확인 후 수량을 산정하십시오.'}
            {isEditone && '* 에디톤 스톤 5T 기본형은 450 × 900mm(4장/1.62㎡)이며, 일부 제품(EDT7724, 7725, 7732, 7734)은 600×600mm 선택이 가능합니다.'}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. 제품 특장점 (아이콘 그리드 UI) */}
      {/* ------------------------------------------------------------- */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 특장점</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          {config.lineupName}는 {config.brand}의 차별화된 제조 기술을 적용하여 공간의 품격과 시공 안정성을 극대화합니다.
        </p>
        <div className="kcc-features-grid">
          {config.features.map((feat, idx) => (
            <div key={idx} className="kcc-feature-card">
              <div className="feature-icon-badge">{feat.icon}</div>
              <div className="feature-card-content">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. 제품 구조 (Layer 카드형 UI) */}
      {/* ------------------------------------------------------------- */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 구조 ({config.layers.length}-Layer System)</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          {config.brand} {config.lineupName}의 고기능성 다층 구조 설계로 탁월한 치수 안정성과 내구성을 완성합니다.
        </p>

        <div className="kcc-structure-layer-stack">
          {config.layers.map((layer, idx) => (
            <div key={idx} className="structure-layer-card">
              <span className="layer-step-num" style={{ background: '#1e293b' }}>
                {layer.step}
              </span>
              <div className="layer-details">
                <h4>{layer.name}</h4>
                <p>{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. 이 자재가 적용된 공간 예시 */}
      {/* ------------------------------------------------------------- */}
      {spaceExamples && spaceExamples.length > 0 && (
        <section className="detail-doc-section">
          <h2 className="doc-section-title">이 자재가 적용된 공간 예시</h2>
          <div className="doc-accent-bar"></div>
          <p className="doc-section-helper">
            현재 선택한 {config.lineupName} 자재를 적용한 인테리어 연출 예시입니다.
          </p>
          <div className="virtual-space-grid">
            {spaceExamples.map((ex, idx) => (
              <div key={idx} className="virtual-space-card category-floor">
                <div className="space-card-img-wrapper">
                  <img
                    src={ex.image}
                    alt={ex.title}
                    className="space-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = item.thumbnail || '/images/no-image.svg';
                    }}
                  />
                  <div className="space-card-overlay"></div>
                  <div className="space-card-info">
                    <h3 className="space-card-title">{ex.title}</h3>
                    <p className="space-card-desc">{ex.subtitle}</p>
                    <span className="space-card-badge">{config.brand} {code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 10. 시공 전 유의사항 (번호형 안내 UI) */}
      {/* ------------------------------------------------------------- */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">시공 전 유의사항</h2>
        <div className="doc-accent-bar"></div>

        <div className="guidelines-card-list" style={{ marginTop: '16px' }}>
          {config.guidelines.map((guide) => (
            <div key={guide.num} className="guide-card-item">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  flexShrink: 0
                }}
              >
                {guide.num}
              </div>
              <div className="guide-card-text">
                <h5>{guide.title}</h5>
                <p>{guide.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
