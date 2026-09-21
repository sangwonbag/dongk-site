import React from 'react';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import './DocumentStyles.css';

export default function ReleaseNoteModal({ order, onClose }) {
  if (!order) return null;

  const items = order.shipment_checklist && order.shipment_checklist.length > 0 
    ? order.shipment_checklist 
    : (order.order_items || []).map(i => ({
        product_name: i.product_name,
        product_code: i.product_code || '-',
        expected_qty: i.quantity,
        actual_qty: i.quantity,
        unit: i.unit || '평',
        prepared: true,
        note: ''
      }));

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="doc-modal-overlay">
      <div className="doc-modal-container">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="doc-modal-toolbar no-print">
          <div className="toolbar-title">
            <CheckCircle2 size={18} className="text-gold" />
            <span>동경바닥재 자재 출고증 (Release Note)</span>
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
              <h1>자 재 출 고 증</h1>
              <span className="doc-no">주문번호: {order.order_no}</span>
            </div>
          </div>

          <div className="doc-meta-grid">
            <div className="meta-block">
              <table>
                <tbody>
                  <tr>
                    <th>출 고 일 자</th>
                    <td>{order.shipment_prepared_at ? order.shipment_prepared_at.split('T')[0] : todayStr}</td>
                  </tr>
                  <tr>
                    <th>고 객 명</th>
                    <td>{order.customer_name} {order.company_name ? `(${order.company_name})` : ''}</td>
                  </tr>
                  <tr>
                    <th>연 락 처</th>
                    <td>{order.phone}</td>
                  </tr>
                  <tr>
                    <th>현 장 주 소</th>
                    <td>{order.address} {order.address_detail || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="meta-block">
              <table>
                <tbody>
                  <tr>
                    <th>배 송 방 식</th>
                    <td>
                      {order.delivery_method_label || '대신화물 지점 배송'} 
                      {order.delivery_fee_status === '착불' && <span className="print-badge-red"> [착불]</span>}
                    </td>
                  </tr>
                  <tr>
                    <th>시 공 예 정 일</th>
                    <td>{order.construction_date || '미정'} ({order.construction_time_slot || '시간미정'})</td>
                  </tr>
                  <tr>
                    <th>시 공 담 당</th>
                    <td>{order.primary_worker_name || order.construction_manager || '담당자 미정'}</td>
                  </tr>
                  <tr>
                    <th>출 고 담 당</th>
                    <td>{order.shipment_prepared_by || '물류팀 담당자'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <div className="doc-section">
            <h3 className="section-label">1. 출고 자재 품목 명세서</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th>품 목 명 (자재/부자재)</th>
                  <th>제품코드</th>
                  <th style={{ width: '70px' }}>예정수량</th>
                  <th style={{ width: '70px' }}>실제출고</th>
                  <th style={{ width: '50px' }}>단위</th>
                  <th style={{ width: '60px' }}>상태</th>
                  <th>비고 (메모)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td><strong>{item.product_name}</strong></td>
                    <td className="font-mono">{item.product_code || '-'}</td>
                    <td className="text-right">{item.expected_qty}</td>
                    <td className="text-right font-bold">{item.actual_qty}</td>
                    <td className="text-center">{item.unit || '평'}</td>
                    <td className="text-center">
                      {item.prepared ? '확인완료' : '미출고'}
                    </td>
                    <td>{item.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Special Notes & Signatures */}
          <div className="doc-footer-grid">
            <div className="notes-box">
              <h4>※ 출고 및 현장 인수 유의사항</h4>
              <p>1. 자재 수령 시 제품의 파손, 이염, 수량 파악을 즉시 현장에서 확인해 주세요.</p>
              <p>2. 개봉되었거나 시공이 진행된 자재는 교환 및 반품이 제한될 수 있습니다.</p>
              <p>3. 하남 물류창고 출고 문의: 031-795-3084</p>
            </div>

            <div className="signatures-box">
              <div className="sign-cell">
                <span>출고 담당자 확인</span>
                <div className="sign-stamp">( 서명 / 인 )</div>
              </div>
              <div className="sign-cell">
                <span>현장 수령인 확인</span>
                <div className="sign-stamp">( 서명 / 인 )</div>
              </div>
            </div>
          </div>

          <div className="doc-bottom-brand">
            <span>동경바닥재 공식 자재 출고증 | www.dkfloor.co.kr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
