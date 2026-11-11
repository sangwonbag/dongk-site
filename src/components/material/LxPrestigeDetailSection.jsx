import React from 'react';
import {
  LX_PRESTIGE_6_LAYERS,
  LX_PRESTIGE_SPEC_INFO,
  getLxPrestigeSpecType,
  hasLxPrestigeEir
} from '../../utils/lxPrestigeUtils';

export default function LxPrestigeDetailSection({ item }) {
  if (!item) return null;

  const specType = getLxPrestigeSpecType(item);
  const specInfo = LX_PRESTIGE_SPEC_INFO[specType] || LX_PRESTIGE_SPEC_INFO['600각'];
  const code = item.code || item.product_code || '';
  const pattern = item.pattern || item.pattern_name || item.name || '';
  const isEirApplied = hasLxPrestigeEir(item);
  const isWood = specType === '우드';
  const isRectStone = specType === '장방형 스톤';

  return (
    <div className="prestige-detail-section">
      {/* 1. 제품 기본 정보 및 규격 비교표 */}
      <section className="detail-doc-section">
        <div className="doc-section-header">
          <div className="header-badge-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className="section-badge-catalog" style={{ background: '#1e293b', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
              LX하우시스 공식 카탈로그
            </span>
            <span className="spec-subline-text" style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              프레스티지 5T (PRESTG) · {specType}
            </span>
            {isEirApplied && (
              <span
                className="prestige-eir-badge"
                data-testid="prestige-eir-badge"
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fcd34d',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                동조엠보(EIR) 적용
              </span>
            )}
          </div>
          <h2 className="doc-section-title">제품 상세 규격</h2>
          <div className="doc-accent-bar"></div>
        </div>

        <div className="kcc-spec-table-wrap">
          <table className="kcc-doc-table">
            <tbody>
              <tr>
                <th>제조사 / 브랜드</th>
                <td>LX하우시스 (LX Hausys)</td>
                <th>라인업</th>
                <td>데코타일 · 프레스티지 5T (PRESTG)</td>
              </tr>
              <tr>
                <th>제조사 제품코드</th>
                <td><strong>{code}</strong></td>
                <th>패턴명 / 분류</th>
                <td>{pattern}{item.pattern_group ? ` (${item.pattern_group})` : ''}</td>
              </tr>
              <tr>
                <th>규격 (폭 × 길이)</th>
                <td><strong>{item.specs?.size || item.size || specInfo.size}</strong></td>
                <th>두께 (T)</th>
                <td><strong>5.0T</strong> (5.0mm 프리미엄 고두께 LVT)</td>
              </tr>
              <tr>
                <th>박스 포장 수량</th>
                <td><strong>{item.specs?.pcs_per_box || specInfo.pcs}</strong> / BOX</td>
                <th>공식 박스 면적</th>
                <td><strong>{item.specs?.area || specInfo.area}</strong> ({item.specs?.box_pyeong || specInfo.pyeong})</td>
              </tr>
              <tr>
                <th>표면 처리</th>
                <td>Metal Shield 고강도 표면처리</td>
                <th>동조엠보(EIR)</th>
                <td>
                  {isEirApplied ? (
                    <strong style={{ color: '#92400e' }}>적용 (스톤 장방형·우드 EIR 라인)</strong>
                  ) : (
                    <span>600각 라인 (EIR 해당 표시 미확인)</span>
                  )}
                </td>
              </tr>
              <tr>
                <th>판매 가격</th>
                <td><strong>가격 문의</strong> (현장 조건·수량별 1:1 견적 안내)</td>
                <th>배송 조건</th>
                <td>동일 브랜드 50평 이상 주문 시 무료배송</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 프레스티지 5T 3대 규격 비교표 */}
        <div className="kcc-spec-comparison" style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>
            프레스티지 5T 라인업별 규격 안내
          </h3>
          <div className="kcc-spec-table-wrap">
            <table className="kcc-doc-table">
              <thead>
                <tr>
                  <th>규격 분류</th>
                  <th>두께</th>
                  <th>규격 (W×L)</th>
                  <th>포장 매수</th>
                  <th>공식 박스면적</th>
                </tr>
              </thead>
              <tbody>
                <tr className={specType === '600각' ? 'row-current-product' : ''}>
                  <td>
                    600각 (8종)
                    {specType === '600각' && <span className="current-product-pill">현재 제품</span>}
                  </td>
                  <td>5.0T</td>
                  <td>600 × 600mm</td>
                  <td>5매 / BOX</td>
                  <td>1.80㎡</td>
                </tr>
                <tr className={specType === '장방형 스톤' ? 'row-current-product' : ''}>
                  <td>
                    장방형 스톤 (2종)
                    {specType === '장방형 스톤' && <span className="current-product-pill">현재 제품</span>}
                  </td>
                  <td>5.0T</td>
                  <td>457.2 × 914.4mm</td>
                  <td>5매 / BOX</td>
                  <td>2.09㎡</td>
                </tr>
                <tr className={specType === '우드' ? 'row-current-product' : ''}>
                  <td>
                    우드 (4종)
                    {specType === '우드' && <span className="current-product-pill">현재 제품</span>}
                  </td>
                  <td>5.0T</td>
                  <td>228.6 × 1523mm</td>
                  <td>6매 / BOX</td>
                  <td>2.09㎡</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="kcc-table-note" style={{ marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
            * 프레스티지 5T는 3T 에코노플러스 제품군과 두께 및 박스 포장 면적이 상이하므로 반드시 5T 공식 박스 면적(1.80㎡ / 2.09㎡) 기준으로 수량을 산정해 주세요.
          </p>
        </div>
      </section>

      {/* 2. 제품 특장점 (카탈로그 공식 정보 기준) */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 특장점</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          LX하우시스 프레스티지 5T는 5.0mm 고두께 구조에 Metal Shield 고강도 표면처리와 바닥 전사방지 기술을 결합한 프리미엄 LVT 데코타일입니다.
        </p>

        <div className="kcc-features-grid">
          <div className="kcc-feature-card">
            <div className="feature-icon-badge">🛡️</div>
            <div className="feature-card-content">
              <h4>Metal Shield 고강도 표면처리</h4>
              <p>
                특수 고강도 표면 코팅(Metal Shield)으로 일상적인 스크래치와 생활 오염에 강한 내구성을 구현했습니다
                (내스크래치성 자체 시험 B1 등급).
              </p>
              <span style={{ display: 'block', marginTop: '6px', fontSize: '11.5px', color: '#64748b' }}>
                ※ LX하우시스 연구소 자체 시험 기준이며 실제 사용 환경에 따라 달라질 수 있음
              </span>
            </div>
          </div>

          <div className="kcc-feature-card">
            <div className="feature-icon-badge">🧱</div>
            <div className="feature-card-content">
              <h4>바닥 전사방지 기술 (이염 차단)</h4>
              <p>
                제품 하부 전사방지층 및 전사방지·Balance층을 이중 설계하여 바닥면이나 접착 성분으로 인한
                상부 이염 및 변색 발생을 억제합니다.
              </p>
            </div>
          </div>

          <div className="kcc-feature-card">
            <div className="feature-icon-badge">🎨</div>
            <div className="feature-card-content">
              <h4>고해상도 디자인층</h4>
              <p>
                초정밀 고해상도 인쇄층을 통해 천연 석재, 마블, 콘크리트 및 원목 소재 본연의 깊이감 있는 색감과
                디테일을 사실적으로 표현합니다.
              </p>
            </div>
          </div>

          {isWood && (
            <div className="kcc-feature-card" style={{ borderColor: '#b57a50' }}>
              <div className="feature-icon-badge">🪵</div>
              <div className="feature-card-content">
                <h4>와이드 규격 우드 디자인 (228.6×1523mm)</h4>
                <p>
                  기존 일반 우드 규격보다 넓고 긴 228.6×1523mm 와이드 규격을 적용하여 공간에 시각적 개방감과
                  고급 원목 마루 같은 웅장한 비례감을 부여합니다.
                </p>
              </div>
            </div>
          )}

          {isEirApplied && (
            <div className="kcc-feature-card" style={{ borderColor: '#d97706' }}>
              <div className="feature-icon-badge">✨</div>
              <div className="feature-card-content">
                <h4>동조엠보 (EIR · Embossed in Register) 적용</h4>
                <p>
                  {isRectStone
                    ? '장방형 스톤 패턴의 자연스러운 결에 맞춰 표면 엠보를 정밀하게 동조시켜 실제 석재에 가까운 입체 촉감과 사실감을 제공합니다.'
                    : '원목 나뭇결 디자인과 표면 엠보 질감을 정교하게 일치(EIR)시켜 원목 특유의 입체감과 촉감을 사실적으로 구현했습니다.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. 제품 구조 (PDF 3쪽 6계층 도면 표기 기준) */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 구조 (6-Layer System)</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          프레스티지 5T는 5.0mm 고두께의 6단계 다층 구조로 설계되어 치수 안정성과 전사방지 성능, 내마모성을 균형 있게 확보합니다.
        </p>

        <div className="kcc-structure-layer-stack">
          {LX_PRESTIGE_6_LAYERS.map((layer) => (
            <div key={layer.step} className="structure-layer-card">
              <span className="layer-step-num" style={{ background: '#1e293b' }}>{layer.step}</span>
              <div className="layer-details">
                <h4>{layer.name}</h4>
                <p>{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 시공 및 취급 주의사항 */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">확인 및 취급 주의사항</h2>
        <div className="doc-accent-bar"></div>

        <div
          className="kcc-application-guideline-box"
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '16px'
          }}
        >
          <span
            className="guideline-badge"
            style={{
              background: '#d97706',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            필수 확인 안내
          </span>
          <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '13.5px', lineHeight: '1.7' }}>
            <li>
              <strong>실물 샘플 확인 권장:</strong> 화면에 표시되는 이미지 색상은 인쇄 및 모니터·모바일 디스플레이 환경에 따라
              실제 원장과 차이가 있을 수 있으므로, 발주 및 시공 전 반드시 실물 샘플을 확인하시기 바랍니다.
            </li>
            <li>
              <strong>자체 시험 기준 안내:</strong> 표기된 내스크래치성(B1)은 LX하우시스 연구소 자체 시험 기준 결과이며
              실제 사용 환경 및 관리 상태에 따라 달라질 수 있습니다.
            </li>
            <li>
              <strong>현장 시방 및 가격 문의:</strong> 바닥난방 적합 여부, 현장 조건에 맞는 전용 접착제 선택 및 정확한 자재·시공 단가는
              견적문의를 통해 1:1로 확인해 드립니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

