import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useOutletContext } from 'react-router-dom'; // To get siteId if generic
import { api } from '../api';

const ChatWidget = ({ siteId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Welcome aboard! I'm the Helm Intelligence Assistant. Ask me anything about your site's performance or security." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !siteId) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.chatWithAI(siteId, userMsg);
            setMessages(prev => [...prev, { role: 'assistant', text: response.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Apologies, captain. I'm having trouble connecting to the intelligence core." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!siteId) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-[#0F172A] border border-border/60 rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto flex flex-col animate-in slide-in-from-bottom-5 duration-300 h-[500px]">
                    {/* Header */}
                    <div className="bg-primary p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-accent/20 rounded-lg">
                                <Bot className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <span className="block font-heading font-extrabold text-white text-sm">Helm Assistant</span>
                                <span className="block text-[8px] text-accent font-bold uppercase tracking-widest">Active Intelligence</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors p-1" aria-label="Close chat">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm transition-all ${ 
                                    msg.role === 'user' 
                                        ? 'bg-accent text-white rounded-br-none' 
                                        : 'bg-white dark:bg-[#1E293B] text-foreground border border-border/50 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1E293B] border border-border/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[#0F172A] border-t border-border/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult the Helm..."
                                className="flex-1 bg-secondary/30 dark:bg-black/20 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/50 transition-all font-medium"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-accent/20"
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-primary text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden"
                aria-label={isOpen ? "Close chat" : "Open chat assistant"}
            >
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <X className="w-6 h-6 relative z-10" />
                ) : (
                    <div className="relative z-10 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold text-xs uppercase tracking-widest">Ask Helm</span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
