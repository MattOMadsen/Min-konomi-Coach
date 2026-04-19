// 1 fil - 1 funktion
// Hovedkomponent for AI Chatten – holder styr på state og samler de andre moduler

import { useState } from 'react';
import type { Transaction } from '../../parsers/csvParser';
import { useAIResponses } from './useAIResponses';
import { useBudgetGoals } from './budgetGoals';

interface AIChatProps {
  transactions: Transaction[];
}

export default function AIChat({ transactions }: AIChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { 
      role: 'assistant', 
      content: 'Hej! Jeg er din økonomi-coach. Jeg kan hjælpe med overblik, tidsanalyse, budgetmål og spareforslag.\n\nHvad vil du gerne arbejde med i dag?' 
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { handleUserMessage } = useAIResponses(transactions);
  const { budgetGoals, setBudgetGoal, getBudgetStatus } = useBudgetGoals(transactions);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Brug den splittede logik
    const response = await handleUserMessage(userMessage, budgetGoals, setBudgetGoal, getBudgetStatus);

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col h-[520px]">
      <div className="flex items-center gap-3 mb-4 border-b pb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
        <div>
          <h3 className="font-semibold text-lg">Din Økonomi Coach</h3>
          <p className="text-xs text-emerald-600 font-medium">Modulopbygget version</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm text-gray-500">Coach tænker...</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Skriv dit spørgsmål eller budgetmål her..."
          className="flex-1 border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
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