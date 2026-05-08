import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Phone, ClipboardList } from 'lucide-react';
import ChatContactForm from './ChatContactForm';
import { SYSTEM_PROMPT, getNextRuleBasedMessage } from '../../lib/chatLogic';

const INITIAL_ACTIONS = [
    "장판 추천",
    "데코타일 추천",
    "벽지 상담",
    "견적 문의",
    "제품번호 검색",
    "영업시간/위치"
];

export default function ChatWindow({ onClose, sessionId }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [chatMode, setChatMode] = useState('idle');
    const [options, setOptions] = useState(INITIAL_ACTIONS);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initial greeting
        setMessages([
            {
                role: 'assistant',
                content: '안녕하세요. 동경바닥재 AI 상담 비서입니다. 바닥재, 장판, 데코타일, 마루, 벽지 등에 대해 무엇이든 물어보세요!'
            }
        ]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, showForm, isLoading, options]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleQuickAction = (action) => {
        if (action === "처음으로") {
            setChatMode('idle');
            setOptions(INITIAL_ACTIONS);
            return;
        }

        let newMsg = "";
        let newOptions = [];
        let newMode = chatMode;

        if (action === "데코타일 추천") {
            newMode = "recommend_deco";
            newMsg = "데코타일은 상가, 사무실, 원룸, 매장 바닥에 많이 쓰이는 자재입니다. 내구성이 좋고 관리가 편해서 많이 찾으세요.\n\n추천은 시공 공간에 따라 달라집니다. 어디에 시공하실 예정인가요?";
            newOptions = ["주거공간", "상가/매장", "사무실", "원룸/임대", "기타", "처음으로"];
        } else if (action === "장판 추천") {
            newMode = "recommend_flooring";
            newMsg = "장판은 주거공간, 원룸, 아파트에 많이 사용하는 바닥재입니다. 두께에 따라 가격, 쿠션감, 내구성이 달라집니다.\n\n어떤 공간에 시공하실 예정인가요?";
            newOptions = ["아파트", "원룸", "빌라", "상가", "기타", "처음으로"];
        } else if (action === "벽지 상담") {
            newMode = "wallpaper";
            newMsg = "벽지는 공간 분위기와 예산에 따라 선택이 달라집니다. 실크벽지, 합지벽지, 포인트벽지 등으로 나눠서 상담할 수 있습니다.\n\n벽지를 바꾸실 공간은 어디인가요?";
            newOptions = ["거실", "방", "전체시공", "상가", "기타", "처음으로"];
        } else if (action === "견적 문의") {
            newMode = "estimate";
            newMsg = "견적은 자재 종류, 평수, 현장 상태, 철거 여부에 따라 달라집니다. 정확한 견적은 상담이 필요하지만, 대략적인 안내를 위해 몇 가지를 확인하겠습니다.\n\n먼저 어떤 자재 견적이 필요하신가요?";
            newOptions = ["장판", "데코타일", "마루", "벽지", "카페트타일", "처음으로"];
        } else if (action === "제품번호 검색") {
            newMode = "product_search";
            newMsg = "제품번호나 브랜드명을 입력해주시면 관련 자재를 찾아드릴게요.\n\n예시:\nKCC, LX, 동신, 현대디럭스, 600각, AR502, FO3305 처럼 입력하시면 됩니다.";
            newOptions = [];
        } else if (action === "영업시간/위치") {
            newMode = "business_info";
            newMsg = "동경바닥재 위치와 운영시간입니다.\n\n주소: 경기 하남시 서하남로 37\n고객센터: 02-487-9775\n운영시간: 평일 07:00 - 18:00 / 주말 07:00 - 12:00\n\n급한 문의는 전화 상담을 이용하시면 빠릅니다.";
            newOptions = ["처음으로"]; // "전화 상담", "온라인 상담 접수" are already in the footer
        } else if (action === "온라인 상담 접수") {
             setShowForm(true);
             return;
        } else {
             // Sub-options selected. Echo user message and fall back to handleSendMessage
             handleSendMessage(action);
             return;
        }

        setChatMode(newMode);
        setOptions(newOptions);
        setMessages(prev => [...prev, { role: 'assistant', content: newMsg }]);
    };

    const handleSendMessage = async (textOverride = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        const newUserMessage = { role: 'user', content: text };
        const newHistory = [...messages, newUserMessage];
        
        setMessages(newHistory);
        setInputValue('');
        setIsLoading(true);
        setShowForm(false);

        try {
            const apiMessages = newHistory.map(m => ({ role: m.role, content: m.content }));
            apiMessages.unshift({ role: 'system', content: SYSTEM_PROMPT });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!response.ok) throw new Error('API failed');

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.response };
            
            setMessages([...newHistory, aiMessage]);

        } catch (error) {
            console.log("API Error, falling back to basic logic", error);
            const fallbackMsg = getNextRuleBasedMessage(newHistory, text);
            
            setTimeout(() => {
                setMessages([...newHistory, fallbackMsg]);
                setIsLoading(false);
            }, 600);
            return;
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title">
                    <Bot size={20} />
                    <span>동경바닥재 AI 상담 비서</span>
                </div>
                <button className="close-btn" onClick={onClose} aria-label="닫기">
                    <X size={20} />
                </button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-row ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="avatar"><Bot size={16} /></div>
                        )}
                        <div className="message-content">
                            <div className="bubble">
                                {msg.content.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i !== msg.content.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="message-row assistant">
                        <div className="avatar"><Bot size={16} /></div>
                        <div className="bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                {showForm && (
                    <div className="message-row assistant" style={{maxWidth: '100%'}}>
                        <div className="avatar"><ClipboardList size={16} /></div>
                        <ChatContactForm 
                            sessionId={sessionId} 
                            onCancel={() => setShowForm(false)} 
                            onSuccess={() => {
                                setShowForm(false);
                                setMessages(prev => [...prev, { role: 'assistant', content: '상담 접수가 성공적으로 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.'}]);
                            }}
                        />
                    </div>
                )}
                
                {/* Quick Actions (only show at the end if not showing form and not loading) */}
                {!isLoading && !showForm && options.length > 0 && (
                    <div className="quick-actions">
                        {options.map(action => (
                            <button key={action} className="quick-btn" onClick={() => handleQuickAction(action)}>
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="input-wrapper">
                    <input 
                        type="text" 
                        placeholder="메시지를 입력하세요..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || showForm}
                    />
                    <button 
                        className="send-btn" 
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim() || showForm}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <div className="chat-footer">
                <a href="tel:024879775" className="footer-link">
                    <Phone size={14} /> 전화 상담 02-487-9775
                </a>
                <button 
                    className="footer-link" 
                    style={{background:'none', border:'none', cursor:'pointer'}} 
                    onClick={() => setShowForm(true)}
                >
                    <ClipboardList size={14} /> 온라인 상담 접수
                </button>
            </div>
        </div>
    );
}
