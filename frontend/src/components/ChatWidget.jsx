import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, MessageCircleQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api';

const ChatWidget = ({ siteId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Welcome aboard! I'm the **Helm Intelligence Assistant**. Ask me anything about your site's performance or security." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

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
                <div className="bg-white dark:bg-[#0F172A] border border-border/60 rounded-2xl shadow-2xl w-[350px] sm:w-[400px] mb-4 overflow-hidden pointer-events-auto flex flex-col animate-in slide-in-from-bottom-5 duration-300 h-[600px]">
                    {/* Header */}
                    <div className="bg-primary p-5 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-2 bg-accent/20 rounded-xl shadow-inner border border-white/5">
                                <MessageCircleQuestion className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <span className="block font-heading font-extrabold text-white text-base tracking-tight">Helm Assistant</span>
                                <span className="flex items-center gap-1.5 text-[9px] text-accent font-extrabold uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
                                    Active Intelligence
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-all p-1 hover:bg-white/5 rounded-lg active:scale-90" aria-label="Close chat">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[88%] rounded-2xl px-5 py-4 text-sm font-medium shadow-sm leading-relaxed transition-all ${ 
                                    msg.role === 'user' 
                                        ? 'bg-accent text-white rounded-br-none shadow-accent/20' 
                                        : 'bg-white dark:bg-[#1E293B] text-foreground border border-border/50 rounded-bl-none prose prose-sm dark:prose-invert prose-p:my-0 prose-strong:text-accent prose-headings:text-foreground'
                                }`}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1E293B] border border-border/50 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                        <span className="w-1.5 h-1.5 bg-accent/70 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-2">Analyzing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-[#0F172A] border-t border-border/40">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult the Helm..."
                                className="flex-1 bg-secondary/30 dark:bg-black/20 border border-border/60 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/40 transition-all font-medium"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all active:scale-90 shadow-xl shadow-accent/20 flex items-center justify-center shrink-0"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-primary text-white p-5 rounded-2xl shadow-2xl transition-all hover:scale-105 hover:bg-primary/95 active:scale-90 flex items-center justify-center group relative overflow-hidden"
                aria-label={isOpen ? "Close chat" : "Open chat assistant"}
            >
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <X className="w-7 h-7 relative z-10" />
                ) : (
                    <div className="relative z-10 flex items-center gap-3">
                        <MessageSquare className="w-7 h-7" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-700 font-extrabold text-sm uppercase tracking-widest whitespace-nowrap">Ask Helm</span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
