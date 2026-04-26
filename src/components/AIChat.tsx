// src/components/AIChat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGrokAI } from '../hooks/useGrokAI';
import { categorizeTransaction } from '../utils/categorize'; // ← KORREKT STI
import type { Transaction } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  usedGrok?: boolean;
}

interface AIChatProps {
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string | null;
  onPromptSent?: () => void;
}

export default function AIChat({ 
  transactions, 
  isOpen, 
  onClose, 
  initialPrompt, 
  onPromptSent 
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { callGrok, isLoading: isGrokLoading, hasApiKey, error } = useGrokAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll til nyeste besked
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // === INITIAL PROMPT (f.eks. "Få fuld AI-analyse") ===
  useEffect(() => {
    if (!initialPrompt || !isOpen || messages.length > 0) return;

    const sendInitial = async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: initialPrompt,
      };
      setMessages(prev => [...prev, userMessage]);
      
      if (onPromptSent) onPromptSent();

      await generateResponse(initialPrompt, true);
    };

    sendInitial();
  }, [initialPrompt, isOpen, messages.length, onPromptSent]);

  // Gem chat-historik
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('min-okonomi-coach-chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Indlæs gemt chat ved start
  useEffect(() => {
    const saved = localStorage.getItem('min-okonomi-coach-chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  // Lokal fallback-analyse
  const generateLocalResponse = useCallback((prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    const expenses = transactions.filter(t => t.amount < 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
      const cat = categorizeTransaction(t.description);
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
    });
    
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (lowerPrompt.includes('fuld') || lowerPrompt.includes('analyse') || lowerPrompt.includes('budget')) {
      let response = `Her er en **fuld analyse** af din økonomi:\n\n`;
      response += `**Indtægter:** ${income.toLocaleString('da-DK')} kr\n`;
      response += `**Udgifter:** ${totalExpenses.toLocaleString('da-DK')} kr\n`;
      response += `**Balance:** ${(income - totalExpenses).toLocaleString('da-DK')} kr\n\n`;
      
      if (topCategories.length > 0) {
        response += `**Dine største udgiftsposter:**\n`;
        topCategories.forEach(([cat, amount], i) => {
          const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
          response += `${i + 1}. ${cat}: ${amount.toLocaleString('da-DK')} kr (${percent}%)\n`;
        });
      }
      
      response += `\n**Anbefaling:** Du kan potentielt spare 15-25% på de største kategorier ved at justere vaner.`;
      return response;
    }

    if (lowerPrompt.includes('spare') || lowerPrompt.includes('besparelse')) {
      return `Du kan realistisk spare ca. **${Math.round(totalExpenses * 0.20).toLocaleString('da-DK')} kr** om måneden.`;
    }

    if (lowerPrompt.includes('største') || lowerPrompt.includes('hvor bruger')) {
      if (topCategories.length === 0) return "Jeg har ikke nok data til at vise dine største udgifter endnu.";
      let response = `**Dine største udgiftsposter:**\n\n`;
      topCategories.forEach(([cat, amount], i) => {
        response += `${i + 1}. **${cat}** — ${amount.toLocaleString('da-DK')} kr\n`;
      });
      return response;
    }

    return `Tak for dit spørgsmål! Jeg har analyseret dine ${transactions.length} transaktioner. Hvordan kan jeg hjælpe dig mere specifikt?`;
  }, [transactions]);

  // Hoved-funktion til svar
  const generateResponse = useCallback(async (prompt: string, isInitial = false) => {
    setIsProcessing(true);

    let responseContent = '';
    let usedGrok = false;

    // Prøv Grok først
    if (hasApiKey) {
      try {
        const result = await callGrok(prompt);
        if (result.usedGrok && result.content) {
          responseContent = result.content;
          usedGrok = true;
        }
      } catch (e) {
        console.warn('Grok fejlede, bruger lokal fallback');
      }
    }

    // Lokal fallback
    if (!responseContent) {
      responseContent = generateLocalResponse(prompt);
      usedGrok = false;
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      usedGrok,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  }, [hasApiKey, callGrok, generateLocalResponse]);

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');

    await generateResponse(currentInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[380px] sm:w-[420px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🧠</div>
          <div>
            <div className="font-semibold text-lg">Min Økonomi Coach</div>
            <div className="text-xs opacity-80 flex items-center gap-1.5">
              {hasApiKey ? (
                <span className="flex items-center gap-1">✨ Powered by Grok</span>
              ) : (
                <span className="flex items-center gap-1">Lokal AI (tilføj key for Grok)</span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-medium">Hej! Jeg er din personlige økonomi-coach.</p>
            <p className="text-sm mt-1">Spørg mig om alt fra budget til besparelser.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] px-4 py-3 rounded-3xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm border border-gray-100 dark:border-slate-700'
              }`}
            >
              {msg.content}
              {msg.usedGrok && (
                <div className="text-[10px] opacity-60 mt-1.5 flex items-center gap-1">
                  ✨ Grok
                </div>
              )}
            </div>
          </div>
        ))}

        {(isProcessing || isGrokLoading) && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-3xl rounded-bl-none shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="ml-1">Tænker...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv dit spørgsmål..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isProcessing}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 rounded-2xl transition-all active:scale-95"
          >
            →
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>
    </div>
  );
}