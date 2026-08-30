import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchApi } from '../api/apiClient';

const ChatWidget = ({ pageType = 'dashboard', contextData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const messagesEndRef = useRef(null);

  // Suggested prompts per page type
  const dashboardPrompts = [
    "Why is my match score this high/low?",
    "Why was this skill recommended?",
    "Which role fits me best?",
    "Which companies match me?"
  ];

  const roadmapPrompts = [
    "What should I learn first?",
    "Can you simplify my roadmap?",
    "Why is this skill a priority?"
  ];

  const suggestedPrompts = pageType === 'roadmap' ? roadmapPrompts : dashboardPrompts;

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load chat history when widget opens
  useEffect(() => {
    if (!isOpen) return;

    const loadHistory = async () => {
      try {
        const data = await fetchApi('/chat/history');
        if (data && data.history) {
          setMessages(data.history);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    loadHistory();
  }, [isOpen]);

  const handleSendMessage = async (textToSend = inputMessage) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setError('');
    setWarnings([]);
    setInputMessage('');

    // Optimistically add user message to list
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetchApi('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmed,
          context: contextData || undefined
        })
      });

      if (response && response.answer) {
        const assistantMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (response.warnings && response.warnings.length > 0) {
          setWarnings(response.warnings);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg = err.message || "Failed to get reply from Pathfinder AI Assistant.";
      setError(errMsg);
      
      // Add safe error notice in conversation
      const errorNoticeMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${errMsg}`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorNoticeMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body-md">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-on-primary hover:bg-surface-tint p-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 elevation-2"
          aria-label="Open Pathfinder AI Assistant"
        >
          <span className="material-symbols-outlined text-[28px]">psychology</span>
          <span className="font-bold text-data-sm hidden sm:inline">Pathfinder AI Assistant</span>
        </button>
      )}

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div className="bg-surface rounded-2xl elevation-3 border border-outline-variant/30 w-[90vw] sm:w-[420px] h-[580px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-primary to-surface-tint text-on-primary p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
              <div>
                <h3 className="font-bold text-data-md leading-tight">Pathfinder AI Assistant</h3>
                <p className="text-[11px] opacity-80">Grounded Career Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-primary hover:bg-white/20 p-1.5 rounded-full transition-colors"
              aria-label="Close Chat"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-bright/50">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-6 px-4">
                <span className="material-symbols-outlined text-[40px] text-primary/40 mb-2">smart_toy</span>
                <p className="text-body-md font-bold text-on-surface mb-1">How can I explain your results?</p>
                <p className="text-body-sm text-secondary mb-4">
                  I can analyze your on-screen role fit, missing skills, and career roadmap.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body-sm shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-none font-medium'
                      : 'bg-surface-container-high text-on-surface rounded-bl-none border border-outline-variant/20'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert text-on-surface leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-secondary mt-1 px-1 opacity-70">
                  {msg.role === 'user' ? 'You' : 'Pathfinder AI'}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-secondary text-body-sm bg-surface-container-high px-4 py-2.5 rounded-2xl rounded-bl-none w-fit border border-outline-variant/20">
                <span className="material-symbols-outlined animate-spin text-[18px] text-primary">progress_activity</span>
                <span>Pathfinder AI is thinking...</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-xl border border-error/20 text-body-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="font-bold">Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Section */}
          <div className="p-2.5 bg-surface border-t border-outline-variant/20 flex flex-wrap gap-1.5 shrink-0 max-h-[120px] overflow-y-auto">
            {suggestedPrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(promptText)}
                disabled={isLoading}
                className="text-[11px] font-medium bg-surface-bright hover:bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full transition-colors text-left disabled:opacity-50 truncate max-w-full"
              >
                💡 {promptText}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-surface border-t border-outline-variant/20 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Pathfinder AI about your results..."
              disabled={isLoading}
              className="flex-1 bg-surface-bright text-on-surface text-body-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-primary text-on-primary p-2.5 rounded-xl hover:bg-surface-tint disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center"
              aria-label="Send Message"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
