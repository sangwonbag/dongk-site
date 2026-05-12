import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { supabase } from '../../../lib/supabase';
import { Printer, Download, Copy, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import './AdminEstimateDetail.css';

// 한글 금액 변환 함수
function numberToKorean(number) {
  const numStr = number.toString();
  const unitWords = ['', '만 ', '억 ', '조 ', '경 '];
  const digitWords = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const posWords = ['', '십', '백', '천'];
  
  if (number === 0) return '영';

  let result = '';
  let unitIndex = 0;

  for (let i = numStr.length; i > 0; i -= 4) {
    const chunk = numStr.substring(Math.max(0, i - 4), i);
    let chunkResult = '';

    for (let j = 0; j < chunk.length; j++) {
      const digit = parseInt(chunk[j]);
      if (digit !== 0) {
        chunkResult += digitWords[digit] + posWords[chunk.length - 1 - j];
      }
    }

    if (chunkResult !== '') {
      result = chunkResult + unitWords[unitIndex] + result;
    }
    unitIndex++;
  }

  return result + '원정';
}

export default function AdminEstimateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [est, setEst] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      const { data: estData, error: estError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();
      if (estError) throw estError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', id)
        .order('created_at', { ascending: true });
      if (itemsError) throw itemsError;

      setEst(estData);
      setItems(itemsData || []);
    } catch (err) {
      console.error(err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 계산 로직 (수량 변경, 단가 변경, 할인/추가비용, VAT모드 시 재계산)
  const recalculate = (currentEst, currentItems) => {
    let subtotal = 0;
    const newItems = currentItems.map(item => {
      const supplyAmt = (item.quantity || 0) * (item.unit_price || 0);
      subtotal += supplyAmt;
      return { ...item, supply_amount: supplyAmt };
    });

    let vat = 0;
    if (currentEst.vat_mode === '별도') {
      vat = subtotal * 0.1;
    } else if (currentEst.vat_mode === '포함') {
      // 공급가액에 이미 부가세가 포함되어 있다고 간주하는 모드 (기본적으로는 소계=총액)
      vat = 0;
    } else {
      vat = 0; // 없음
    }

    const discount = parseFloat(currentEst.discount) || 0;
    const extraCost = parseFloat(currentEst.extra_cost) || 0;
    
    const total = subtotal + vat - discount + extraCost;

    setItems(newItems);
    setEst({ ...currentEst, subtotal, vat, total });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    recalculate(est, newItems);
  };

  const handleAddItem = () => {
    const newItems = [...items, { product_name: '직접 입력', unit: 'EA', quantity: 1, unit_price: 0, supply_amount: 0 }];
    recalculate(est, newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    recalculate(est, newItems);
  };

  const handleEstChange = (field, value) => {
    const newEst = { ...est, [field]: value };
    recalculate(newEst, items);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update estimates
      const { error: estErr } = await supabase
        .from('estimates')
        .update({
          status: est.status,
          discount: est.discount,
          extra_cost: est.extra_cost,
          vat_mode: est.vat_mode,
          subtotal: est.subtotal,
          vat: est.vat,
          total: est.total,
          admin_memo: est.admin_memo
        })
        .eq('id', id);
      if (estErr) throw estErr;

      // 2. Update items (upsert would be better if ids match, but simple way is delete and re-insert)
      // Delete existing
      await supabase.from('estimate_items').delete().eq('estimate_id', id);
      // Re-insert
      const insertItems = items.map((i, idx) => ({
        estimate_id: id,
        sort_order: idx + 1,
        category: i.category,
        brand: i.brand,
        product_code: i.product_code,
        product_name: i.product_name,
        spec: i.spec,
        unit: i.unit,
        quantity: i.quantity,
        unit_price: i.unit_price,
        supply_amount: i.supply_amount,
        memo: i.memo
      }));
      if (insertItems.length > 0) {
        await supabase.from('estimate_items').insert(insertItems);
      }
      
      alert('저장되었습니다.');
      fetchEstimate();
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('복사되었습니다.');
    });
  };

  const handleCopyText = () => {
    const text = `안녕하세요. 동경바닥재입니다.
요청하신 견적금액은 총 ${est.total.toLocaleString()}원입니다.
품목: ${items.map(i => `${i.product_name} ${i.quantity}${i.unit}`).join(', ')}
입금계좌: 농협 301-0298-9197-81 (주)동경바닥재
감사합니다.`;
    copyToClipboard(text);
  };

  if (loading) return <MainLayout><div className="loading-view">로딩 중...</div></MainLayout>;
  if (!est) return <MainLayout><div className="loading-view">견적서를 찾을 수 없습니다.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="admin-container est-print-container">
        
        {/* 컨트롤 패널 (인쇄시 숨김) */}
        <div className="est-control-panel no-print">
          <div className="control-left">
            <button className="btn-secondary btn-icon" onClick={() => navigate('/admin/estimates')}><ArrowLeft size={16}/> 목록</button>
            <select value={est.status} onChange={(e) => handleEstChange('status', e.target.value)} className="status-select">
              <option value="접수">접수</option>
              <option value="확인중">확인중</option>
              <option value="견적완료">견적완료</option>
              <option value="연락완료">연락완료</option>
              <option value="보류">보류</option>
              <option value="취소">취소</option>
            </select>
          </div>
          <div className="control-right">
            <button className="btn-secondary btn-icon" onClick={handleCopyText}><Copy size={16}/> 문자 복사</button>
            <button className="btn-secondary btn-icon" onClick={handlePrint}><Printer size={16}/> 인쇄/PDF</button>
            <button className="btn-primary btn-icon" onClick={handleSave} disabled={saving}><Save size={16}/> {saving ? '저장중...' : '저장하기'}</button>
          </div>
        </div>

        {/* 견적서 종이 영역 */}
        <div className="paper-document">
          <div className="doc-header">
            <h1 className="doc-title">견 적 서</h1>
          </div>

          <div className="doc-info-section">
            <div className="info-left">
              <table className="meta-table">
                <tbody>
                  <tr>
                    <th>견적번호</th>
                    <td>{est.estimate_no}</td>
                  </tr>
                  <tr>
                    <th>견적일자</th>
                    <td>{new Date(est.created_at).toLocaleDateString('ko-KR')}</td>
                  </tr>
                  <tr>
                    <th>상 호</th>
                    <td>{est.customer_name} ({est.customer_type}) 귀하</td>
                  </tr>
                  <tr>
                    <th>현장주소</th>
                    <td>{est.site_address} {est.site_detail_address}</td>
                  </tr>
                  <tr>
                    <th>연 락 처</th>
                    <td>{est.phone}</td>
                  </tr>
                </tbody>
              </table>
              <div className="greeting-text">
                아래와 같이 견적합니다.
              </div>
            </div>

            <div className="info-right">
              <table className="company-table">
                <tbody>
                  <tr>
                    <th rowSpan="4" className="vertical-th">공<br/>급<br/>자</th>
                    <th>등록번호</th>
                    <td colSpan="3" className="company-no">890-88-02243</td>
                  </tr>
                  <tr>
                    <th>상호</th>
                    <td>(주)동경바닥재</td>
                    <th>대표</th>
                    <td>최화선</td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td colSpan="3">경기도 하남시 서하남로 37</td>
                  </tr>
                  <tr>
                    <th>업태</th>
                    <td>도매</td>
                    <th>업종</th>
                    <td>도배, 장판</td>
                  </tr>
                </tbody>
              </table>
              <div className="contact-info">
                <span>Tel: 02-487-9775</span>
                <span>Fax: 02-487-9787</span>
              </div>
            </div>
          </div>

          <div className="total-amount-box">
            <div className="amount-label">합계금액</div>
            <div className="amount-kor">일금 {numberToKorean(est.total)}</div>
            <div className="amount-num">₩ {est.total.toLocaleString()}</div>
            <div className="vat-selector no-print">
              <select value={est.vat_mode} onChange={(e) => handleEstChange('vat_mode', e.target.value)}>
                <option value="별도">부가세 별도</option>
                <option value="포함">부가세 포함</option>
                <option value="없음">부가세 없음</option>
              </select>
            </div>
            <div className="vat-label print-only">[{est.vat_mode === '별도' ? '부가세별도' : est.vat_mode === '포함' ? '부가세포함' : ''}]</div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="35%">품명</th>
                <th width="10%">단위</th>
                <th width="10%">수량</th>
                <th width="15%">공급단가</th>
                <th width="15%">공급가액</th>
                <th width="10%">비고</th>
                <th width="5%" className="no-print"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <input 
                      type="text" 
                      className="edit-input w-full" 
                      value={item.product_name || ''} 
                      onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    />
                  </td>
                  <td className="text-center">
                    <input 
                      type="text" 
                      className="edit-input w-full text-center" 
                      value={item.unit || ''} 
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    />
                  </td>
                  <td className="text-right">
                    <input 
                      type="number" 
                      className="edit-input w-full text-right" 
                      value={item.quantity || 0} 
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="text-right">
                    <input 
                      type="number" 
                      className="edit-input w-full text-right" 
                      value={item.unit_price || 0} 
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="text-right bg-gray">
                    {item.supply_amount.toLocaleString()}
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="edit-input w-full" 
                      value={item.memo || ''} 
                      onChange={(e) => handleItemChange(index, 'memo', e.target.value)}
                    />
                  </td>
                  <td className="text-center no-print">
                    <button className="btn-del" onClick={() => handleDeleteItem(index)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="no-print">
                <td colSpan="8" className="text-center">
                  <button className="btn-add-row" onClick={handleAddItem}><Plus size={16}/> 품목 추가</button>
                </td>
              </tr>
              <tr>
                <td colSpan="4" rowSpan="3" className="vertical-align-top">
                  <div className="memo-box">
                    <strong>고객 요청사항:</strong><br/>
                    {est.request_memo || '없음'}
                  </div>
                  {est.extra_accessory_text && (
                    <div className="memo-box mt-2">
                      <strong>부자재 기타:</strong> {est.extra_accessory_text}
                    </div>
                  )}
                  {est.accessory_options && est.accessory_options.length > 0 && (
                    <div className="memo-box mt-2">
                      <strong>선택 부자재:</strong> {est.accessory_options.join(', ')}
                    </div>
                  )}
                </td>
                <th className="text-right">소 계</th>
                <td colSpan="2" className="text-right font-bold">{est.subtotal.toLocaleString()}</td>
                <td className="no-print"></td>
              </tr>
              <tr>
                <th className="text-right">V.A.T</th>
                <td colSpan="2" className="text-right">{est.vat.toLocaleString()}</td>
                <td className="no-print"></td>
              </tr>
              <tr>
                <th className="text-right">총 액</th>
                <td colSpan="2" className="text-right font-bold text-lg">{est.total.toLocaleString()}</td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>

          {/* 추가 수정 항목 (할인/추가) - 인쇄시는 총액에 포함되어 있으니 숨기거나 필요시 노출 */}
          <div className="extra-costs no-print">
            <div className="cost-row">
              <label>할인 금액 (-):</label>
              <input type="number" value={est.discount || 0} onChange={(e) => handleEstChange('discount', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="cost-row">
              <label>추가 비용 (+):</label>
              <input type="number" value={est.extra_cost || 0} onChange={(e) => handleEstChange('extra_cost', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="cost-row w-full">
              <label>관리자 메모 (내부용):</label>
              <textarea value={est.admin_memo || ''} onChange={(e) => handleEstChange('admin_memo', e.target.value)}></textarea>
            </div>
          </div>

          <div className="doc-footer">
            <div className="bank-info">
              <div className="bank-title">입금계좌 안내</div>
              <div className="bank-number">농협 301-0298-9197-81</div>
              <div className="bank-owner">예금주: (주)동경바닥재</div>
            </div>
            <div className="page-number">1 / 1</div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
