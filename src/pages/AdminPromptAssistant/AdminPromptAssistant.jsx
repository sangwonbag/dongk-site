import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { ArrowLeft, Copy, FileText, CheckSquare, Save, Trash2, RefreshCw } from 'lucide-react';
import { generatePrompt, TASK_PLACEHOLDERS } from './promptAssistantUtils';
import './AdminPromptAssistant.css';

export default function AdminPromptAssistant() {
  const navigate = useNavigate();

  // Input states
  const [taskType, setTaskType] = useState('사이트 디자인 수정');
  const [customTaskType, setCustomTaskType] = useState('');
  const [taskPurpose, setTaskPurpose] = useState('');
  const [currentIssue, setCurrentIssue] = useState('');
  const [desiredResult, setDesiredResult] = useState('');
  const [nonTouchParts, setNonTouchParts] = useState('');
  const [styleNote, setStyleNote] = useState('');
  const [outputTarget, setOutputTarget] = useState('antigravity');
  const [additionalMemo, setAdditionalMemo] = useState('');
  
  // Prompt history state loaded from local storage
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('dongk_prompt_history');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to parse prompt history:', err);
      return [];
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Sync prompt history with local storage
  useEffect(() => {
    try {
      localStorage.setItem('dongk_prompt_history', JSON.stringify(promptHistory));
    } catch (err) {
      console.error('Failed to save prompt history:', err);
    }
  }, [promptHistory]);

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

  // Save prompt history item
  const handleSavePrompt = () => {
    // Validation check: taskPurpose or currentIssue must have content
    if (!taskPurpose.trim() && !currentIssue.trim()) {
      showToast('작업 목적 또는 문제 내용을 입력해주세요.');
      return;
    }

    const timestamp = new Date().toISOString();
    
    // Generate dynamic fallback title
    const actualTaskType = taskType === '기타 직접 입력' ? (customTaskType || '기타 작업') : taskType;
    const computedTitle = taskPurpose.trim() 
      ? taskPurpose.trim() 
      : `${actualTaskType} - ${new Date().toLocaleString('ko-KR')}`;

    const newPromptItem = {
      id: Date.now().toString(),
      title: computedTitle,
      targetType: outputTarget, // targetType (Antigravity/Codex)
      taskType,
      customTaskType,
      goal: taskPurpose, // goal
      currentProblem: currentIssue, // currentProblem
      desiredResult,
      nonTouchParts,
      styleNote,
      additionalMemo,
      affectedFiles: estimateAffectedFiles ? estimateAffectedFiles(taskType) : [], // affectedFiles array
      generatedPrompt: promptData.fullText,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setPromptHistory(prev => [newPromptItem, ...prev]);
    showToast('프롬프트가 저장되었습니다.');
  };

  // Load prompt history item into form states
  const handleLoadPrompt = (item) => {
    setTaskType(item.taskType || '사이트 디자인 수정');
    setCustomTaskType(item.customTaskType || '');
    setTaskPurpose(item.goal || item.taskPurpose || ''); // Load goal or fallback
    setCurrentIssue(item.currentProblem || item.currentIssue || ''); // Load currentProblem or fallback
    setDesiredResult(item.desiredResult || '');
    setNonTouchParts(item.nonTouchParts || '');
    setStyleNote(item.styleNote || '');
    setOutputTarget(item.targetType || item.outputTarget || 'antigravity'); // Load targetType or fallback
    setAdditionalMemo(item.additionalMemo || '');
    
    showToast('프롬프트를 불러왔습니다.');
  };

  // Delete single prompt history item
  const handleDeletePrompt = (id, event) => {
    event.stopPropagation();
    if (window.confirm('이 저장된 프롬프트를 삭제할까요?')) {
      setPromptHistory(prev => prev.filter(item => item.id !== id));
      showToast('저장된 프롬프트를 삭제했습니다.');
    }
  };

  // Clear all prompt history items
  const handleClearAllPrompts = () => {
    if (window.confirm('저장된 프롬프트 이력을 모두 삭제할까요?')) {
      setPromptHistory([]);
      showToast('저장된 프롬프트를 삭제했습니다.');
    }
  };

  // Format timestamp for displaying
  const formatDateTime = (isoString) => {
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  // Translate target codes to human readable labels
  const getTargetLabel = (targetCode) => {
    switch (targetCode) {
      case 'antigravity': return 'Antigravity';
      case 'codex': return 'Codex';
      case 'developer': return '개발자';
      case 'designer': return '디자이너';
      case 'qa': return 'QA/검수';
      default: return targetCode;
    }
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

            {/* Quick Actions for copy & save operations */}
            <div className="output-actions-grid">
              <button 
                className="btn-copy-action"
                onClick={() => handleCopyText(promptData.fullText, '전체 프롬프트')}
              >
                <Copy size={16} />
                전체 프롬프트 복사
              </button>
              
              <button 
                className="btn-copy-action btn-save-action"
                onClick={handleSavePrompt}
                style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }}
              >
                <Save size={16} />
                프롬프트 저장
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

        {/* Bottom panel: Saved Prompts List */}
        <div className="prompt-history-container" style={{ marginTop: '40px' }}>
          <div className="history-header">
            <h2>저장된 프롬프트 이력 ({promptHistory.length}개)</h2>
            {promptHistory.length > 0 && (
              <button className="btn-clear-all" onClick={handleClearAllPrompts}>
                <Trash2 size={15} />
                전체 이력 삭제
              </button>
            )}
          </div>

          {promptHistory.length === 0 ? (
            <div className="history-empty">
              저장된 프롬프트 이력이 없습니다. 상단 폼을 입력하고 '프롬프트 저장'을 눌러 이력을 남겨보세요.
            </div>
          ) : (
            <div className="history-list-wrapper">
              <div className="history-card-grid">
                {promptHistory.map(item => (
                  <div key={item.id} className="history-item-card">
                    <div className="item-card-header">
                      <span className="badge badge-task">
                        {item.taskType === '기타 직접 입력' ? (item.customTaskType || '기타') : item.taskType}
                      </span>
                      <span className="badge badge-target">
                        {getTargetLabel(item.targetType || item.outputTarget)}
                      </span>
                    </div>
                    
                    <h3 className="item-card-title" title={item.title}>
                      {item.title}
                    </h3>
                    
                    <div className="item-card-date">
                      {formatDateTime(item.createdAt)}
                    </div>
                    
                    <div className="item-card-actions">
                      <button 
                        className="btn-item-action btn-load" 
                        onClick={() => handleLoadPrompt(item)}
                      >
                        <RefreshCw size={13} />
                        불러오기
                      </button>
                      
                      <button 
                        className="btn-item-action btn-copy" 
                        onClick={() => handleCopyText(item.generatedPrompt, '프롬프트')}
                      >
                        <Copy size={13} />
                        복사
                      </button>
                      
                      <button 
                        className="btn-item-action btn-delete" 
                        onClick={(e) => handleDeletePrompt(item.id, e)}
                      >
                        <Trash2 size={13} />
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
