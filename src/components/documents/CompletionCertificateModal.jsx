import React from 'react';
import { Printer, Download, X, Award } from 'lucide-react';
import './DocumentStyles.css';

export default function CompletionCertificateModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const items = order.order_items || [];

  return (
    <div className="doc-modal-overlay">
      <div className="doc-modal-container">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="doc-modal-toolbar no-print">
          <div className="toolbar-title">
            <Award size={18} className="text-gold" />
            <span>동경바닥재 시공완료확인서 (Completion Certificate)</span>
          </div>
          <div className="toolbar-actions">
            <button onClick={handlePrint} className="btn-doc-action print">
              <Printer size={15} /> 인쇄하기
            </button>
            <button onClick={handlePrint} className="btn-doc-action pdf">
              <Download size={15} /> PDF 저장
            </button>
            <button onClick={onClose} className="btn-doc-close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="document-paper A4-sheet">
          <div className="doc-header">
            <div className="company-brand">
              <h2>(주) 동경바닥재</h2>
              <p>바닥재 전문 유통 & 전문 시공 센터 | Tel: 031-795-3084</p>
            </div>
            <div className="doc-title-box">
              <h1>시 공 완 료 확 인 서</h1>
              <span className="doc-no">주문번호: {order.order_no}</span>
            </div>
          </div>

          <div className="doc-meta-grid">
            <div className="meta-block">
              <table>
                <tbody>
                  <tr>
                    <th>고 객 명</th>
                    <td>{order.customer_name} {order.company_name ? `(${order.company_name})` : ''}</td>
                  </tr>
                  <tr>
                    <th>연 락 처</th>
                    <td>{order.phone}</td>
                  </tr>
                  <tr>
                    <th>시 공 현 장 주 소</th>
                    <td>{order.address} {order.address_detail || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="meta-block">
              <table>
                <tbody>
                  <tr>
                    <th>시 공 완 료 일</th>
                    <td>{order.actual_completion_date || order.construction_completed_at?.split('T')[0] || todayStr}</td>
                  </tr>
                  <tr>
                    <th>시 공 담 당 팀 장</th>
                    <td>{order.primary_worker_name || order.construction_manager || '동경바닥재 전문 시공팀'}</td>
                  </tr>
                  <tr>
                    <th>실 제 시 공 면 적</th>
                    <td>{order.actual_construction_area ? `${order.actual_construction_area} 평` : '견적 수량 기준 완료'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Construction Detail Section */}
          <div className="doc-section">
            <h3 className="section-label">1. 시공 자재 및 작업 내역</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th>시공 자재 명칭</th>
                  <th>제품코드</th>
                  <th>규격</th>
                  <th style={{ width: '80px' }}>시공수량</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td><strong>{item.product_name}</strong></td>
                    <td className="font-mono">{item.product_code || '-'}</td>
                    <td>{item.spec || '-'}</td>
                    <td className="text-right font-bold">{item.quantity} {item.unit || '평'}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extra tasks notes if any */}
          {(order.extra_tasks_desc || order.extra_materials_desc || order.site_notes) && (
            <div className="doc-section">
              <h3 className="section-label">2. 현장 추가 작업 및 특이사항</h3>
              <div className="doc-text-box">
                {order.extra_tasks_desc && <p><strong>추가 작업:</strong> {order.extra_tasks_desc}</p>}
                {order.extra_materials_desc && <p><strong>추가 자재:</strong> {order.extra_materials_desc}</p>}
                {order.site_notes && <p><strong>현장 메모:</strong> {order.site_notes}</p>}
              </div>
            </div>
          )}

          {/* Legal Statement & Signatures */}
          <div className="cert-statement-box">
            <p className="statement-text">
              상기 현장의 바닥재 시공이 당사 표준 시공 감리 기준에 따라 정상적으로 완료되었으며,<br />
              품질 및 마감 상태를 고객님과 상호 확인하였음을 확증합니다.
            </p>
            <span className="cert-date">{todayStr.replace(/-/g, '년 ')}월 일</span>
          </div>

          <div className="doc-footer-grid">
            <div className="signatures-box full-width">
              <div className="sign-cell">
                <span>시공 담당자 (팀장)</span>
                <div className="sign-stamp">{order.primary_worker_name || '시공팀장'} ( 서명 / 인 )</div>
              </div>
              <div className="sign-cell">
                <span>고객 (현장 인수자)</span>
                <div className="sign-stamp">{order.customer_name} ( 서명 / 인 )</div>
              </div>
            </div>
          </div>

          <div className="doc-bottom-brand">
            <span>(주) 동경바닥재 전문 시공 센터 | 고객만족센터: 031-795-3084 | www.dkfloor.co.kr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
