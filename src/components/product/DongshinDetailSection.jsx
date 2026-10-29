import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Maximize2, 
  X, 
  ChevronRight,
  Info,
  Wrench,
  Thermometer,
  Sparkles
} from 'lucide-react';
import { DONGSHIN_COMMON_PRECAUTIONS } from '../../utils/dongshinDetailUtils';
import { DONGSHIN_CATALOG_MAP } from '../../services/productDetailImageService';
import './DongshinDetailStyles.css';

export default function DongshinDetailSection({ item, info }) {
  const [modalImage, setModalImage] = useState(null);

  if (!info || !info.spec) return null;

  const {
    group,
    groupName,
    lineupName,
    productName,
    productCode,
    catalogPages,
    spec,
    comparisonTable,
    features,
    layerStructure,
    adhesiveGuide,
    roomScenes
  } = info;

  const isAcoustic = group === 'acoustic';
  const isArtHouse = group === 'arthouse';

  const baseCode = String(productCode || item?.code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const catalogImgs = DONGSHIN_CATALOG_MAP[baseCode] || item?.images || [];
  const swatchImg = catalogImgs.find(u => !u.toLowerCase().includes('2x2') && !u.includes('확장') && !u.includes('시공')) || item?.thumbnail;
  const expandedImg = catalogImgs.find(u => u.toLowerCase().includes('2x2') || u.includes('확장'));

  return (
    <div className="dongshin-detail-container">
      {/* ========================================================
          SECTION 01. 제품 상세 규격 (KCC 스타일 규격표 + 라인업 비교표)
          ======================================================== */}
      <section className="detail-doc-section dongshin-spec-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">제품 상세 규격</h2>
          <span className={`section-badge-dongshin ${isAcoustic ? 'badge-acoustic' : isArtHouse ? 'badge-arthouse' : 'badge-arttile'}`}>
            동신포리마 {catalogPages}
          </span>
        </div>
        <div className="doc-accent-bar"></div>

        {/* 현재 제품 상세 스펙 테이블 */}
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
                <td>
                  <span className="dongshin-code-badge">{productCode}</span>
                </td>
                <th>패턴 / 디자인</th>
                <td>{spec.designType}</td>
              </tr>
              <tr>
                <th>제품 두께</th>
                <td>
                  <strong className={isAcoustic ? 'dongshin-highlight-thick' : ''}>
                    {spec.thickness}
                  </strong>
                </td>
                <th>가로 × 세로 규격</th>
                <td><strong>{spec.size}</strong></td>
              </tr>
              <tr>
                <th>박스당 포장 수량</th>
                <td><strong>{spec.pcs_per_box}</strong> ({spec.packing})</td>
                <th>박스당 시공 면적</th>
                <td><strong>{spec.area}</strong> (약 1평 마감)</td>
              </tr>
              <tr>
                <th>재질 분류</th>
                <td>{spec.materialType}</td>
                <th>권장 전용 접착제</th>
                <td className="adhesive-highlight-cell">
                  <strong>{spec.adhesive}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 라인업별 규격 비교표 (선택된 제품 강조) */}
        {comparisonTable && comparisonTable.length > 0 && (
          <div className="dongshin-lineup-comparison-wrap">
            <div className="comparison-table-header">
              <h3 className="dongshin-comparison-title">{groupName} 전 제품군 규격 비교표</h3>
              <span className="comparison-helper">
                * 동일 컬렉션 내 세부 라인업별 규격 및 포장 단위를 비교할 수 있습니다. (현재 보고 계신 제품이 강조 표시됩니다)
              </span>
            </div>
            <div className="table-responsive-wrapper">
              <table className="dongshin-comparison-table">
                <thead>
                  <tr>
                    <th>세부 제품군</th>
                    <th>두께</th>
                    <th>가로 × 세로 규격</th>
                    <th>박스 수량</th>
                    <th>박스 시공면적</th>
                    <th>특징 및 용도</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className={row.isCurrent ? 'row-current-product' : ''}>
                      <td>
                        <strong>{row.lineup}</strong>
                        {row.isCurrent && <span className="current-product-pill">현재 제품</span>}
                      </td>
                      <td><strong>{row.thickness}</strong></td>
                      <td>{row.size}</td>
                      <td>{row.pcsPerBox}</td>
                      <td>{row.areaPerBox}</td>
                      <td className="note-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dongshin-table-note">
              ※ 현장 실측 평수 대비 5~10%의 여유 물량(로스율)을 감안하여 박스 수량을 산정해 주시기 바랍니다.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 01-2. 자재 원장 및 확장(2x2/연속) 패턴 상세 프리뷰
          ======================================================== */}
      {(swatchImg || expandedImg) && (
        <section className="detail-doc-section">
          <div className="section-title-with-badge">
            <h2 className="doc-section-title">자재 원장 및 확장 패턴 상세</h2>
            <span className="dongshin-sub-pill">{productCode} 실제 텍스처 & 배열</span>
          </div>
          <div className="doc-accent-bar"></div>
          <p className="doc-section-helper">
            자재 1장 단품 원장 이미지와 여러 장을 연속 시공했을 때의 확장(2×2 / 우드 배열) 패턴입니다. 이미지를 클릭하면 크게 확대하여 확인하실 수 있습니다.
          </p>
          <div className="dongshin-scenes-grid" style={{ gridTemplateColumns: expandedImg && swatchImg ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr' }}>
            {swatchImg && (
              <div
                className="dongshin-scene-card"
                onClick={() => setModalImage({ url: swatchImg, title: `${productName} (${productCode}) - 자재 단품 원장` })}
              >
                <div className="scene-img-wrapper" style={{ background: '#f8fafc', padding: '16px' }}>
                  <img
                    src={swatchImg}
                    alt={`${productCode} 자재 원장`}
                    className="scene-img"
                    style={{ objectFit: 'contain' }}
                    loading="lazy"
                  />
                  <span className="scene-match-badge badge-exact">1. 자재 단품 원장</span>
                  <div className="scene-zoom-hint">
                    <Maximize2 size={14} />
                    <span>확대</span>
                  </div>
                </div>
                <div className="scene-info-box">
                  <h4 className="scene-title">{productCode} 자재 원장 (1 PCS)</h4>
                  <p className="scene-subtitle">규격: {spec.size} · 표면 고유 결 및 색감</p>
                </div>
              </div>
            )}
            {expandedImg && (
              <div
                className="dongshin-scene-card"
                onClick={() => setModalImage({ url: expandedImg, title: `${productName} (${productCode}) - 확장 / 2x2 연속 배열 패턴` })}
              >
                <div className="scene-img-wrapper" style={{ background: '#f8fafc', padding: '16px' }}>
                  <img
                    src={expandedImg}
                    alt={`${productCode} 확장 패턴`}
                    className="scene-img"
                    style={{ objectFit: 'contain' }}
                    loading="lazy"
                  />
                  <span className="scene-match-badge badge-exact">2. 확장 / 2×2 연속 배열</span>
                  <div className="scene-zoom-hint">
                    <Maximize2 size={14} />
                    <span>확대</span>
                  </div>
                </div>
                <div className="scene-info-box">
                  <h4 className="scene-title">{productCode} 확장 배열 패턴</h4>
                  <p className="scene-subtitle">연속 시공 시 자연스럽게 이어지는 바닥 패턴 연출</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          SECTION 02. 제품 특장점 (2열 카드 레이아웃)
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">제품 특장점</h2>
          <span className="dongshin-sub-pill">{groupName} 핵심 기술</span>
        </div>
        <div className="doc-accent-bar"></div>
        <div className="dongshin-features-grid">
          {features && features.map((feat, idx) => (
            <div key={idx} className="dongshin-feature-card">
              <div className="dongshin-feature-icon">{feat.icon}</div>
              <div className="dongshin-feature-text">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 03. 제품 구조 (Layer Card Stack UI + 공식 구조도)
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">제품 구조</h2>
          <span className="dongshin-sub-pill">{layerStructure.totalLayers}단계 정밀 다층 구조</span>
        </div>
        <div className="doc-accent-bar"></div>
        <p className="doc-section-helper">
          {groupName}는 제조사 동신포리마의 엄격한 품질 관리 하에 설계된 {layerStructure.totalLayers}단계 다층 구조로, 내구성과 열안정성 및 쾌적한 보행감을 제공합니다.
        </p>

        {/* 구조도 이미지 프리뷰 (클릭 시 확대) */}
        {layerStructure.diagramImage && (
          <div 
            className="dongshin-diagram-banner" 
            onClick={() => setModalImage({ url: layerStructure.diagramImage, title: `${groupName} 공식 제품 구조도` })}
          >
            <div className="diagram-img-wrap">
              <img 
                src={layerStructure.diagramImage} 
                alt={`${groupName} 제품사양 및 구조도`} 
                className="diagram-img" 
              />
            </div>
            <div className="diagram-overlay-hint">
              <Maximize2 size={16} />
              <span>제조사 공식 구조도 크게보기</span>
            </div>
          </div>
        )}

        {/* 레이어 카드 스택 */}
        <div className="dongshin-layer-stack">
          {layerStructure.layers.map((layer, idx) => (
            <div key={idx} className={`dongshin-layer-card ${layer.name.includes('IXPE') ? 'layer-card-acoustic' : ''}`}>
              <span className="layer-step-badge">{layer.step}</span>
              <div className="layer-content">
                <h4>{layer.name}</h4>
                <p>{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 04. 이 자재가 적용된 공간 예시 (3열 이미지 카드 디자인)
          ======================================================== */}
      {roomScenes && roomScenes.length > 0 && (
        <section className="detail-doc-section">
          <div className="section-title-with-badge">
            <h2 className="doc-section-title">이 자재가 적용된 공간 예시</h2>
            <span className="dongshin-sub-pill">동신포리마 공식 카탈로그</span>
          </div>
          <div className="doc-accent-bar"></div>
          <p className="doc-section-helper">
            제조사 공식 샘플북에 수록된 공간 연출 사례입니다. 자재 본연의 컬러와 텍스처를 확인하실 수 있습니다.
          </p>

          <div className="dongshin-scenes-grid">
            {roomScenes.map((scene, idx) => (
              <div 
                key={idx} 
                className="dongshin-scene-card"
                onClick={() => setModalImage({ url: scene.image, title: `${scene.title} (${scene.productCodes})` })}
              >
                <div className="scene-img-wrapper">
                  <img 
                    src={scene.image} 
                    alt={scene.title} 
                    className="scene-img" 
                    loading="lazy"
                  />
                  <span className={`scene-match-badge ${scene.isExactMatch ? 'badge-exact' : 'badge-lineup'}`}>
                    {scene.badge}
                  </span>
                  <div className="scene-zoom-hint">
                    <Maximize2 size={14} />
                    <span>확대</span>
                  </div>
                </div>
                <div className="scene-info-box">
                  <h4 className="scene-title">{scene.title}</h4>
                  <p className="scene-subtitle">{scene.subtitle}</p>
                  <div className="scene-codes-row">
                    <span className="code-label">적용 자재:</span>
                    <span className="code-val">{scene.productCodes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          SECTION 05. 권장 접착제 및 시공 도구 (일반 vs 차음 완벽 분리)
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">권장 접착제 및 시공 도구</h2>
          <span className={`section-badge-dongshin ${isAcoustic ? 'badge-acoustic' : 'badge-arthouse'}`}>
            {isAcoustic ? '차음 전용 접착 시스템' : '동신 공식 표준 접착제'}
          </span>
        </div>
        <div className="doc-accent-bar"></div>

        {/* 접착제 주요 가이드 요약 카드 */}
        <div className={`adhesive-summary-card ${isAcoustic ? 'card-acoustic-theme' : 'card-standard-theme'}`}>
          <div className="adhesive-main-header">
            <Wrench className="adhesive-header-icon" />
            <div>
              <h3 className="adhesive-title">{adhesiveGuide.name}</h3>
              <p className="adhesive-subtitle">{adhesiveGuide.tool} · 표준 도포량: {adhesiveGuide.spreadRate}</p>
            </div>
          </div>

          <div className="adhesive-specs-grid">
            <div className="adhesive-spec-col">
              <span className="col-label">표준 도포량</span>
              <strong className="col-val val-highlight">{adhesiveGuide.spreadRate}</strong>
            </div>
            <div className="adhesive-spec-col">
              <span className="col-label">시공 권장 도구</span>
              <strong className="col-val">{adhesiveGuide.tool}</strong>
            </div>
            <div className="adhesive-spec-col">
              <span className="col-label">오픈타임 (Tack)</span>
              <strong className="col-val">{adhesiveGuide.openTime}</strong>
            </div>
            <div className="adhesive-spec-col">
              <span className="col-label">가사 시간</span>
              <strong className="col-val">{adhesiveGuide.potLife}</strong>
            </div>
            <div className="adhesive-spec-col">
              <span className="col-label">시공 적정 온도</span>
              <strong className="col-val">{adhesiveGuide.temp}</strong>
            </div>
            <div className="adhesive-spec-col">
              <span className="col-label">표면 압착 롤러</span>
              <strong className="col-val">{adhesiveGuide.rollerPress}</strong>
            </div>
          </div>

          <div className="adhesive-notice-box">
            <Info size={18} className="notice-icon" />
            <p>{adhesiveGuide.notice}</p>
          </div>
        </div>

        {/* 적용 가능한 접착제 목록 테이블 */}
        <div className="table-responsive-wrapper" style={{ marginTop: '16px' }}>
          <table className="dongshin-adhesives-table">
            <thead>
              <tr>
                <th>접착제 제품명</th>
                <th>계열 / 분류</th>
                <th>포장 규격</th>
                <th>적용 현장 및 특장점</th>
              </tr>
            </thead>
            <tbody>
              {adhesiveGuide.adhesivesList.map((adh, idx) => (
                <tr key={idx}>
                  <td><strong>{adh.name}</strong></td>
                  <td>{adh.category}</td>
                  <td>{adh.pack}</td>
                  <td>{adh.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================
          SECTION 06. 시공 전 확인사항 및 경고 (제조사 PDF 34~35p 기준)
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">시공 전 확인사항 및 경고</h2>
          <span className="dongshin-sub-pill">제조사 시방 필수 체크리스트</span>
        </div>
        <div className="doc-accent-bar"></div>

        {/* 1. 중요 경고 카드 (Caution Cards) */}
        <div className="dongshin-warnings-grid">
          {DONGSHIN_COMMON_PRECAUTIONS.warnings.map((warn, idx) => (
            <div key={idx} className={`dongshin-warning-card warn-${warn.type}`}>
              <AlertTriangle className="warn-icon" />
              <div className="warn-content">
                <h5>{warn.title}</h5>
                <p>{warn.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2. 사전 확인 체크리스트 */}
        <div className="precheck-container">
          <h4 className="precheck-heading">
            <CheckCircle2 size={18} className="heading-icon text-success" />
            바탕면 점검 및 사전 현장 조건
          </h4>
          <div className="precheck-grid">
            {DONGSHIN_COMMON_PRECAUTIONS.preCheck.map((chk, idx) => (
              <div key={idx} className="precheck-item">
                <span className="precheck-bullet">{idx + 1}</span>
                <div className="precheck-text">
                  <h6>{chk.title}</h6>
                  <p>{chk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 07. 단계별 시공 가이드 (시공 중 주의사항)
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">단계별 표준 시공 가이드</h2>
          <span className="dongshin-sub-pill">제조사 표준 공법</span>
        </div>
        <div className="doc-accent-bar"></div>

        <div className="steps-process-container">
          {DONGSHIN_COMMON_PRECAUTIONS.duringInstallation.map((step, idx) => (
            <div key={idx} className="process-step-card">
              <div className="step-num-circle">{step.step}</div>
              <div className="step-body">
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 08. 시공 후 관리 및 유지보수
          ======================================================== */}
      <section className="detail-doc-section">
        <div className="section-title-with-badge">
          <h2 className="doc-section-title">시공 후 관리 및 유지보수</h2>
          <span className="dongshin-sub-pill">사후 관리 지침</span>
        </div>
        <div className="doc-accent-bar"></div>

        <div className="maintenance-cards-grid">
          {DONGSHIN_COMMON_PRECAUTIONS.postMaintenance.map((m, idx) => (
            <div key={idx} className="maintenance-card">
              <ShieldCheck className="m-icon text-gold" />
              <div className="m-text">
                <h5>{m.title}</h5>
                <p>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 09. 제조사 카탈로그 공식 출처 및 안내 (Notice)
          ======================================================== */}
      <section className="detail-doc-section dongshin-disclaimer-section">
        <div className="disclaimer-inner-card">
          <Info size={20} className="disclaimer-icon" />
          <div className="disclaimer-text">
            <h5 className="disclaimer-title">동신포리마 제조사 공식 기술 안내</h5>
            <p className="disclaimer-desc">{DONGSHIN_COMMON_PRECAUTIONS.disclaimer}</p>
            <p className="disclaimer-sub">
              본 상세 정보는 동신포리마 종합 샘플북({catalogPages})에 수록된 정밀 기술 스펙과 공식 시방서를 근거로 동경바닥재에서 구축하였습니다. 대량 구매 및 현장 전문 시공 문의는 고객센터(02-487-9775)로 연락 주시면 상세히 안내해 드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          이미지 확대 모달 (Lightbox Modal)
          ======================================================== */}
      {modalImage && (
        <div className="dongshin-modal-overlay" onClick={() => setModalImage(null)}>
          <div className="dongshin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="dongshin-modal-header">
              <span className="modal-title">{modalImage.title}</span>
              <button className="dongshin-modal-close" onClick={() => setModalImage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="dongshin-modal-body">
              <img src={modalImage.url} alt={modalImage.title} className="dongshin-modal-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
