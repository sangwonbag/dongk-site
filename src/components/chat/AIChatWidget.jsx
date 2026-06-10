import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import ChatWindow from './ChatWindow';
import './AIChatWidget.css';

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Generate a random session ID for this user session
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessionId(Math.random().toString(36).substring(2, 15));
    }, []);

    return (
        <div className="chat-widget-container">
            {!isOpen && (
                <button 
                    className="chat-floating-btn" 
                    onClick={() => setIsOpen(true)}
                    aria-label="AI 상담 비서 열기"
                >
                    <Bot size={24} />
                    <span>AI 상담</span>
                </button>
            )}

            {isOpen && (
                <ChatWindow 
                    onClose={() => setIsOpen(false)} 
                    sessionId={sessionId}
                />
            )}
        </div>
    );
}
