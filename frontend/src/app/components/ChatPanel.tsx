'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { matchFAQ } from '../lib/faqBot';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_API = 'http://localhost:3003';

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [serverUp, setServerUp] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, isSupported, startListening, stopListening } = useSpeechRecognition();

  // Sync voice transcript into input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    fetch(`${CHAT_API}/health`, { mode: 'cors' })
      .then(r => r.ok && setServerUp(true))
      .catch(() => setServerUp(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setSending(true);

    // Try FAQ bot first
    const faqAnswer = matchFAQ(text);
    if (faqAnswer && !serverUp) {
      setMessages(prev => [...prev, { role: 'assistant', content: faqAnswer }]);
      setSending(false);
      return;
    }

    // Try remote chat agent
    if (serverUp) {
      try {
        const res = await fetch(`${CHAT_API}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.answer || 'No response.' }]);
          setSending(false);
          return;
        }
      } catch {}
    }

    // Fallback to FAQ
    const fallback = faqAnswer || "I'm not sure about that. Try asking about stamp duty, EMI, GST, PMAY, or how to compare properties.";
    setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    setSending(false);
  }, [input, serverUp]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl"
        aria-label="Toggle chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full sm:w-[380px] bg-sand-50/95 backdrop-blur-xl shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0 animate-slide-in-right' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-sand-200 bg-gradient-to-r from-sand-100 to-sand-50">
          <h2 className="font-serif font-bold text-espresso text-lg">PropCalc Assistant</h2>
          <p className="text-xs text-sand-400">
            {serverUp ? 'AI-powered · Ask anything' : 'FAQ mode · Chat agent offline'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-sand-400 text-sm mt-8">
              <p className="font-serif text-lg text-espresso mb-2">Welcome!</p>
              <p>Ask about stamp duty, EMI, PMAY, city rules, or anything property-related.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === 'user' ? 'chat-bubble-user ml-8' : 'chat-bubble-assistant mr-8'}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="chat-bubble-assistant mr-8 animate-pulse">Thinking...</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-sand-200 bg-sand-50">
          <div className="flex gap-2">
            <input
              className="input-luxury flex-1 !py-2.5"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={sending}
            />
            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-3 py-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse-gold'
                    : 'bg-sand-200 text-sand-500 hover:bg-sand-300'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                🎤
              </button>
            )}
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="btn-gold !px-4 !py-2.5 disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
