import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useOutletContext } from 'react-router-dom'; // To get siteId if generic
import { api } from '../api';

const ChatWidget = () => {
    // We need to access selectedSite. Since this might be in Layout, we might need to pass it down
    // or use context. If Layout uses Outlet, the context is usually passed TO the Outlet.
    // Ideally, Layout should know about selectedSite.
    // For now, I'll assume this component is used where selectedSite is available or 
    // I will try to read it from local storage/global state if possible. 
    // Actually, `useOutletContext` works inside Outlet components. 
    // If this is in Layout, it can't use useOutletContext to get data from itself.
    // I will modify Layout to pass selectedSite to this widget.
    
    // Props will be passed from Layout
    
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m Sentinel AI. Ask me anything about your traffic.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // This component will receive siteId as a prop in the real implementation
    // But for now let's expose a setter or use a hook if we modify Layout.
    
    // Actually, let's make it accept siteId as prop.
    // If siteId is missing, it should probably be hidden or ask to select a site.
    
    return (siteId) => {
        // ... hook logic
    }
};

// Re-defining properly
const ChatWindow = ({ siteId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m Sentinel AI. Ask me anything about your traffic.' }
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
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I\'m having trouble connecting to my brain right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!siteId) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto flex flex-col transition-all duration-200 ease-in-out h-[500px]">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-200">Sentinel Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${ 
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your data..."
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
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
                className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center group"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6" />
                )}
                {/* Tooltip */}
                {!isOpen && (
                   <span className="absolute right-full mr-4 bg-slate-900 text-slate-200 text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                       Ask Sentinel
                   </span> 
                )}
            </button>
        </div>
    );
};

export default ChatWindow;
