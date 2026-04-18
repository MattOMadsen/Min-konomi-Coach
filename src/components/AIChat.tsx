// 1 fil - 1 funktion
// components/AIChat.tsx – rettet import-sti til localCoach.ts (../parsers/localCoach)

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Transaction } from '../../parsers/csvParser';
import { getLocalCoachResponse } from '../parsers/localCoach';

interface AIChatProps {
  transactions: Transaction[];
}

export default function AIChat({ transactions }: AIChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Hej! 😊 Jeg er din AI-økonomi-coach.\nJeg har analyseret alle dine transaktioner og er klar til at hjælpe.\nHvad vil du gerne tale om?'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    if (useLocalMode) {
      const reply = getLocalCoachResponse(userMessage, transactions);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setIsLoading(false);
      return;
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ API-nøglen mangler. Skifter til lokal coach nu.' }]);
      setUseLocalMode(true);
      setIsLoading(false);
      return;
    }

    try {
      const transactionList = transactions
        .map(t => `${t.date} | ${t.description} | ${t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)} kr`)
        .join('\n');

      const summary = `Brugeren har ${transactions.length} transaktioner.\n\nAlle poster:\n${transactionList}\n\nIndtægter: ${transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(0)} kr\nUdgifter: ${Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toFixed(0)} kr`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Økonomi Coach',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: 'Du er en venlig, praktisk dansk økonomi-coach. Tal naturligt på dansk og giv konkrete råd. Du har adgang til alle transaktioner.'
            },
            {
              role: 'user',
              content: `${summary}\n\nSpørgsmål: ${userMessage}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

      const data = await res.json();
      const aiReply = data.choices?.[0]?.message?.content || 'Beklager, jeg fik intet svar.';

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);

    } catch (err: any) {
      console.error(err);

      if (err.message.includes('overbelastet') || err.message.includes('429') || err.message.includes('503') || err.message.includes('API_ERROR')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '✅ OpenRouter er midlertidigt overbelastet.\nJeg skifter nu til **lokal smart coach** – jeg kan stadig hjælpe dig med alle dine poster!'
        }]);
        setUseLocalMode(true);

        const localReply = getLocalCoachResponse(userMessage, transactions);
        setMessages(prev => [...prev, { role: 'assistant', content: localReply }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Noget gik galt. Prøv igen eller vent et øjeblik.'
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, transactions, useLocalMode]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm">AI tænker...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="border-t p-4 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={useLocalMode ? "Lokal coach aktiv – spørg om poster, udgifter, råd..." : "Skriv dit spørgsmål her..."}
          className="flex-1 border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-2xl font-medium disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}