import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Phone, ClipboardList } from 'lucide-react';
import ChatContactForm from './ChatContactForm';
import { SYSTEM_PROMPT, getNextRuleBasedMessage } from '../../lib/chatLogic';

const QUICK_ACTIONS = [
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
    }, [messages, showForm, isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (textOverride = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        const newUserMessage = { role: 'user', content: text };
        const newHistory = [...messages, newUserMessage];
        
        setMessages(newHistory);
        setInputValue('');
        setIsLoading(true);
        setShowForm(false); // Hide form if they type something else

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
        if (e.key === 'Enter') handleSend();
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
                {!isLoading && !showForm && (
                    <div className="quick-actions">
                        {QUICK_ACTIONS.map(action => (
                            <button key={action} className="quick-btn" onClick={() => handleSend(action)}>
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
                        onClick={() => handleSend()}
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
