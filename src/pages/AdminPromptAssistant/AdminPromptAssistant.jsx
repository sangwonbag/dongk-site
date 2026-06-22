import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { ArrowLeft, Copy, FileText, CheckSquare } from 'lucide-react';
import { generatePrompt, TASK_PLACEHOLDERS } from './promptAssistantUtils';
import './AdminPromptAssistant.css';

export default function AdminPromptAssistant() {
  const navigate = useNavigate();

  // State definitions
  const [taskType, setTaskType] = useState('사이트 디자인 수정');
  const [customTaskType, setCustomTaskType] = useState('');
  const [taskPurpose, setTaskPurpose] = useState('');
  const [currentIssue, setCurrentIssue] = useState('');
  const [desiredResult, setDesiredResult] = useState('');
  const [nonTouchParts, setNonTouchParts] = useState('');
  const [styleNote, setStyleNote] = useState('');
  const [outputTarget, setOutputTarget] = useState('antigravity');
  const [additionalMemo, setAdditionalMemo] = useState('');
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Get current placeholders dynamically based on task type
  const currentPlaceholders = useMemo(() => {
    return TASK_PLACEHOLDERS[taskType] || TASK_PLACEHOLDERS['기타 직접 입력'];
  }, [taskType]);

  // Compute prompt contents dynamically based on state
  const promptData = useMemo(() => {
    return generatePrompt({
      taskType,
      customTaskType,
      taskPurpose,
      currentIssue,
      desiredResult,
      nonTouchParts,
      styleNote,
      outputTarget,
      additionalMemo
    });
  }, [
    taskType,
    customTaskType,
    taskPurpose,
    currentIssue,
    desiredResult,
    nonTouchParts,
    styleNote,
    outputTarget,
    additionalMemo
  ]);

  // Display toast feedback
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // Clipboard copy handler with fallback
  const handleCopyText = async (text, typeLabel) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${typeLabel} 복사 완료!`);
        return;
      } catch (err) {
        console.warn('navigator.clipboard failed, attempting fallback...', err);
      }
    }
    
    // Fallback approach
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast(`${typeLabel} 복사 완료!`);
      } else {
        showToast('복사에 실패했습니다.');
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      showToast('복사에 실패했습니다.');
    }
    document.body.removeChild(textarea);
  };

  return (
    <MainLayout>
      <div className="admin-container">
        {/* Back Link */}
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          관리자 대시보드로 돌아가기
        </span>

        {/* Page Header */}
        <div className="admin-header">
          <h1>작업 프롬프트 비서</h1>
        </div>

        <p style={{ color: '#666', marginTop: '-10px', marginBottom: '24px', fontSize: '0.95rem' }}>
          작업 요청 사항을 입력하고 출력 대상에 맞추어 완성된 고품질 프롬프트를 에이전트나 동료 작업자에게 전달하십시오.
        </p>

        {/* Layout grid */}
        <div className="prompt-assistant-layout">
          {/* Left panel: Form Inputs */}
          <div className="assistant-form-card">
            <h2>작업 세부 사항 입력</h2>

            <div className="form-field">
              <label>작업 종류</label>
              <select value={taskType} onChange={e => {
                setTaskType(e.target.value);
                // Reset user input fields when switching to prevent confusion
                setTaskPurpose('');
                setCurrentIssue('');
                setDesiredResult('');
              }}>
                <option value="사이트 디자인 수정">사이트 디자인 수정</option>
                <option value="홈 화면 수정">홈 화면 수정</option>
                <option value="자재 목록/카드 UI 수정">자재 목록/카드 UI 수정</option>
                <option value="자재 상세페이지 수정">자재 상세페이지 수정</option>
                <option value="장바구니/주문 플로우 수정">장바구니/주문 플로우 수정</option>
                <option value="로그인/회원 기능 수정">로그인/회원 기능 수정</option>
                <option value="관리자 주문관리 수정">관리자 주문관리 수정</option>
                <option value="Supabase 데이터 연동 수정">Supabase 데이터 연동 수정</option>
                <option value="오류 수정">오류 수정</option>
                <option value="배포/Vercel/GitHub 점검">배포/Vercel/GitHub 점검</option>
                <option value="기타 직접 입력">기타 직접 입력</option>
              </select>
            </div>

            {taskType === '기타 직접 입력' && (
              <div className="form-field">
                <label>작업 종류 직접 입력</label>
                <input 
                  type="text" 
                  placeholder="예: 샘플북 다운로드 기능 추가" 
                  value={customTaskType} 
                  onChange={e => setCustomTaskType(e.target.value)} 
                />
              </div>
            )}

            <div className="form-field">
              <label>출력 대상</label>
              <select value={outputTarget} onChange={e => setOutputTarget(e.target.value)}>
                <option value="antigravity">Antigravity (Google pair-programming 에이전트)</option>
                <option value="codex">Codex / Cursor (코드 생성 및 간결성 중심)</option>
                <option value="developer">개발자 전달용 (구조 설계 및 SSO 준수 규칙)</option>
                <option value="designer">디자이너 전달용 (스타일/CSS 및 모바일 반응형)</option>
                <option value="qa">배포 전 검수용 (QA 체크 시나리오 생성)</option>
              </select>
            </div>

            <div className="form-field">
              <label>작업 목적</label>
              <input 
                type="text" 
                placeholder={currentPlaceholders.purpose} 
                value={taskPurpose} 
                onChange={e => setTaskPurpose(e.target.value)} 
              />
            </div>

            <div className="form-field">
              <label>현재 문제점/버그 (입력 없을 시 예시 자동 반영)</label>
              <textarea 
                placeholder={currentPlaceholders.issue} 
                value={currentIssue} 
                onChange={e => setCurrentIssue(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>원하는 작동 및 결과 (입력 없을 시 예시 자동 반영)</label>
              <textarea 
                placeholder={currentPlaceholders.result} 
                value={desiredResult} 
                onChange={e => setDesiredResult(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>절대 수정하거나 건드리면 안 되는 사항 (선택)</label>
              <input 
                type="text" 
                placeholder="예: 주문 DB 저장 로직 및 장바구니 Context 핵심 흐름" 
                value={nonTouchParts} 
                onChange={e => setNonTouchParts(e.target.value)} 
              />
            </div>

            <div className="form-field">
              <label>스타일/분위기 가이드 (선택)</label>
              <input 
                type="text" 
                placeholder="예: 화이트 배경, 얇은 회색 선, 4열 카드 배열, Pretendard 폰트" 
                value={styleNote} 
                onChange={e => setStyleNote(e.target.value)} 
              />
            </div>

            <div className="form-field">
              <label>추가 메모 (선택)</label>
              <textarea 
                placeholder="예: Vercel 배포 캐시 비활성화 체크 요망" 
                value={additionalMemo} 
                onChange={e => setAdditionalMemo(e.target.value)}
              />
            </div>
          </div>

          {/* Right panel: Generated Output */}
          <div className="assistant-output-card">
            <h2>생성된 프롬프트 결과</h2>

            {/* Quick Actions for copy operations */}
            <div className="output-actions-grid">
              <button 
                className="btn-copy-action"
                onClick={() => handleCopyText(promptData.fullText, '전체 프롬프트')}
              >
                <Copy size={16} />
                전체 프롬프트 복사
              </button>
              <button 
                className="btn-copy-action btn-secondary-action"
                onClick={() => handleCopyText(promptData.checklist, '검수 체크리스트')}
              >
                <CheckSquare size={16} />
                체크리스트만 복사
              </button>
              <button 
                className="btn-copy-action btn-secondary-action"
                onClick={() => handleCopyText(promptData.instructions, '개발 지시사항')}
              >
                <FileText size={16} />
                개발 지시만 복사
              </button>
            </div>

            {/* Prompt previewer */}
            <div className="prompt-preview-container">
              <pre className="prompt-preview-content">
                {promptData.fullText}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="prompt-toast">
          {toastMessage}
        </div>
      )}
    </MainLayout>
  );
}
