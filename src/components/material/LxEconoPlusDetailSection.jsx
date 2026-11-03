import React from 'react';
import { LX_ECONOPLUS_5_LAYERS, getLxEconoPlusSpecType } from '../../utils/lxEconoPlusUtils';

export default function LxEconoPlusDetailSection({ item }) {
  if (!item) return null;

  const specType = getLxEconoPlusSpecType(item);
  const code = item.code || item.product_code || '';
  const pattern = item.pattern_name || item.pattern || item.name || '';
  const isArtRug = code === 'DET6579' || code === 'DET6580';
  const is600Wood = code === 'DET6523' || code === 'DET6262' || code === 'DET6263';

  return (
    <div className="econoplus-detail-section">
      {/* 1. 공식 제품 기본 스펙 요약표 */}
      <section className="detail-doc-section">
        <div className="doc-section-header">
          <div className="header-badge-row">
            <span className="section-badge-catalog" style={{ background: '#7c3aed', color: '#fff' }}>
              LX하우시스 공식 스펙
            </span>
            <span className="spec-subline-text">
              ECONO PLUS 3T ({specType})
            </span>
          </div>
          <h2 className="doc-section-title">제품 기본 정보</h2>
          <div className="doc-accent-bar"></div>
        </div>

        <div className="kcc-spec-table-wrap">
          <table className="kcc-doc-table">
            <tbody>
              <tr>
                <th>제조사 / 브랜드</th>
                <td>LX하우시스 (LX Hausys)</td>
                <th>제품군 / 라인업</th>
                <td>데코타일 · 에코노플러스 (ECONO PLUS)</td>
              </tr>
              <tr>
                <th>제조사 코드</th>
                <td><strong>{code}</strong></td>
                <th>패턴명</th>
                <td>{pattern}</td>
              </tr>
              <tr>
                <th>규격 (W×L)</th>
                <td>{item.specs?.size || item.size || '600×600mm'}</td>
                <th>제품 두께 (T)</th>
                <td>3.0T (3.0mm 고내구 상업·주거용)</td>
              </tr>
              <tr>
                <th>포장 수량</th>
                <td>{item.specs?.pcs_per_box ? `${item.specs.pcs_per_box} / BOX` : (item.package || 'BOX')}</td>
                <th>박스당 시공면적</th>
                <td>{item.specs?.area || '3.24㎡'} ({item.specs?.box_pyeong || '약 0.98평'})</td>
              </tr>
              <tr>
                <th>표면 처리 기술</th>
                <td>
                  Metal Shield 고강도 표면코팅
                  {item.hasTrueMatte && ' · TrueMatte 무광'}
                  {item.hasTrueView && ' · TrueView 디지털 인쇄'}
                </td>
                <th>배송 / 결제</th>
                <td>동일 브랜드 50평 이상 무료배송 (가격문의 자재)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. 제품 핵심 특징 카드 */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 핵심 특징</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          LX하우시스 에코노플러스는 독자적인 Metal Shield 특수 코팅과 프리미엄 인쇄 기술로 탁월한 내구성과 독보적인 디자인을 선사합니다.
        </p>

        <div className="kcc-features-grid">
          <div className="feature-highlight-card">
            <div className="feature-icon-badge">🛡️</div>
            <div className="feature-card-content">
              <h4>Metal Shield 고강도 표면코팅</h4>
              <p>일반 표면 대비 대폭 강화된 특수 메탈실드 코팅으로 일상 보행 및 집기 마찰 시 발생하는 생활 스크래치와 오염을 강력하게 방지합니다.</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-badge">✨</div>
            <div className="feature-card-content">
              <h4>표면 스크래치 저항성 (마틴데일 B1 최고등급)</h4>
              <p>엄격한 마틴데일 테스트(EN16094)를 거쳐 최고 수준의 스크래치 저항력(B1 등급)을 검증받아 상업·주거 복합 공간에서 오랜 기간 변함없는 품질을 유지합니다.</p>
            </div>
          </div>

          {item.hasTrueMatte && (
            <div className="feature-highlight-card" style={{ borderColor: '#7c3aed' }}>
              <div className="feature-icon-badge">🌫️</div>
              <div className="feature-card-content">
                <h4>TrueMatte 표면 무광 기술</h4>
                <p>빛 반사를 획기적으로 줄이고 자연 소재 특유의 깊이 있는 매트 질감을 사실적으로 연출하여 어떤 조명 아래서도 은은하고 차분한 무드를 연출합니다.</p>
              </div>
            </div>
          )}

          {item.hasTrueView && (
            <div className="feature-highlight-card" style={{ borderColor: '#2563eb' }}>
              <div className="feature-icon-badge">🎨</div>
              <div className="feature-card-content">
                <h4>TrueView 디지털 인쇄 기술</h4>
                <p>초정밀 고해상도 디지털 인쇄 기술을 적용하여 천연 석재, 카펫, 우드의 입체적인 질감과 섬세한 컬러 그라데이션을 실제 자재처럼 구현합니다.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. 제품 5계층 구조도 */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">제품 구조 (5-Layer System)</h2>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          LX하우시스 에코노플러스는 5단계 첨단 다층 구조로 설계되어 상업 공간의 고하중과 보행 스트레스를 견고하게 흡수합니다.
        </p>

        <div className="kcc-structure-layer-stack">
          {LX_ECONOPLUS_5_LAYERS.map((layer) => (
            <div key={layer.step} className="structure-layer-card">
              <span className="layer-step-num" style={{ background: '#7c3aed' }}>{layer.step}</span>
              <div className="layer-details">
                <h4>{layer.name}</h4>
                <p>{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 시공 및 사용 주의사항 */}
      <section className="detail-doc-section">
        <h2 className="doc-section-title">시공 및 취급 주의사항</h2>
        <div className="doc-accent-bar"></div>

        <div className="kcc-application-guideline-box" style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
          <span className="guideline-badge" style={{ background: '#d97706', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            필수 확인 사항
          </span>
          <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '13.5px', lineHeight: '1.7' }}>
            <li>인쇄 색상 및 모니터 해상도 차이로 인해 실제 제품 색상과 다소 차이가 있을 수 있으므로 시공 전 실제 제품 샘플을 반드시 확인하시기 바랍니다.</li>
            <li>천연 원목 및 석재의 자연스러운 질감을 극대화한 제품 특성상 원장별·부위별 무늬와 톤 차이가 발생할 수 있습니다.</li>
            {isArtRug && (
              <li style={{ color: '#b91c1c', fontWeight: '600' }}>
                ※ [아트 러그 특수 주의]: 아트 러그(DET6579, DET6580)는 원장별 무늬 편차가 큰 디자인 제품입니다. 재단 및 시공 시 디자인 배치를 충분히 감안하여 작업하십시오.
              </li>
            )}
            {is600Wood && (
              <li style={{ color: '#b91c1c', fontWeight: '600' }}>
                ※ [600각 우드·모던 특수 주의]: 파켓 우드(DET6523) 및 모던(DET6262, DET6263) 패턴은 장간 무늬 맞춤이 불가하므로 자연스러운 교차시공을 권장합니다.
              </li>
            )}
            <li>시공 시 LX하우시스 권장 친환경 데코타일 전용 접착제를 사용하시고, 충분한 가오픈 적응 시간을 거친 후 시공하십시오.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

