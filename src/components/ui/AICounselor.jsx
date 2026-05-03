import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SYSTEM_PROMPT, getNextRuleBasedMessage } from '../../lib/chatLogic';
import './AICounselor.css';

export default function AICounselor() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    // Initial greeting options
    const initialOptions = ["데코타일", "장판", "마루", "벽지", "카페트타일", "잘 모르겠어요"];

    useEffect(() => {
        // Generate a random session ID for this consultation
        setSessionId(Math.random().toString(36).substring(2, 15));
        
        // Initial greeting
        setMessages([
            {
                role: 'assistant',
                content: '안녕하세요. 동경바닥재 AI 상담사입니다. 바닥재, 벽지, 마루, 카페트타일 중 어떤 상담을 도와드릴까요?',
                options: initialOptions
            }
        ]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const saveToSupabase = async (history) => {
        if (!supabase) return;
        try {
            // Only save if there's meaningful interaction
            if (history.length < 3) return;

            // Extract context from history naively
            const userMessages = history.filter(m => m.role === 'user').map(m => m.content);
            const category = userMessages[0] || '';
            const space = userMessages[1] || '';
            const area = userMessages[2] || '';
            const style = userMessages[3] || '';
            const budget = userMessages[4] || '';

            const { error } = await supabase
                .from('ai_consultations')
                .upsert([
                    {
                        session_id: sessionId,
                        category,
                        space_type: space,
                        area,
                        style,
                        budget,
                        full_transcript: history,
                        updated_at: new Date().toISOString()
                    }
                ], { onConflict: 'session_id' });
                
            if (error) {
                console.error("Supabase save error (Ignored):", error.message);
            }
        } catch (err) {
            console.error("Failed to save to Supabase", err);
        }
    };

    const handleSend = async (textOverride = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        const newUserMessage = { role: 'user', content: text };
        const newHistory = [...messages, newUserMessage];
        
        setMessages(newHistory);
        setInputValue('');
        setIsLoading(true);

        try {
            // Remove options from previous messages before sending to API
            const apiMessages = newHistory.map(m => ({ role: m.role, content: m.content }));
            
            // Prepend system prompt
            apiMessages.unshift({ role: 'system', content: SYSTEM_PROMPT });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!response.ok) throw new Error('API failed');

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.response };
            
            const finalHistory = [...newHistory, aiMessage];
            setMessages(finalHistory);
            saveToSupabase(finalHistory);

        } catch (error) {
            console.log("Falling back to rule-based logic", error);
            // Fallback to rule-based if API fails (e.g. no key, local dev without vercel api)
            const fallbackMsg = getNextRuleBasedMessage(newHistory, text);
            const finalHistory = [...newHistory, fallbackMsg];
            
            setTimeout(() => {
                setMessages(finalHistory);
                saveToSupabase(finalHistory);
                setIsLoading(false);
            }, 600); // simulate think time
            return; // return early to not trigger setIsLoading(false) again immediately
        }

        setIsLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleOptionClick = (option) => {
        handleSend(option);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button 
                    className="ai-counselor-btn" 
                    onClick={() => setIsOpen(true)}
                    aria-label="AI 상담사 열기"
                >
                    <Bot className="ai-icon" />
                    <span className="ai-text">AI 상담</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <Bot size={20} />
                            <span>동경바닥재 AI 상담사</span>
                        </div>
                        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="ai-avatar">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div className="ai-message-content">
                                    <div className="ai-bubble">
                                        {msg.content.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i !== msg.content.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    
                                    {/* Show options only for the last message if they exist */}
                                    {msg.options && idx === messages.length - 1 && (
                                        <div className="ai-options">
                                            {msg.options.map((opt, i) => (
                                                <button 
                                                    key={i} 
                                                    className="ai-option-btn"
                                                    onClick={() => handleOptionClick(opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="ai-message-row assistant">
                                <div className="ai-avatar"><Bot size={16} /></div>
                                <div className="ai-message-content">
                                    <div className="ai-bubble typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input-area">
                        <div className="ai-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="메시지를 입력하세요..." 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button 
                                className="ai-send-btn" 
                                onClick={() => handleSend()}
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="ai-chat-footer">
                        <a href="tel:024879775" className="ai-call-btn">
                            <Phone size={16} />
                            <span>전화 상담 02-487-9775</span>
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
