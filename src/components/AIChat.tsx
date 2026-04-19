import { useState, useRef, useEffect } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  onClose: () => void;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'min-okonomi-coach-chat';

export default function AIChat({ transactions, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hej! Jeg er din økonomi-coach. Spørg mig om dine udgifter, besparelser eller budgetmål.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMessages(JSON.parse(saved));
    scrollToBottom();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const lower = userMsg.toLowerCase();
    let reply = '';

    // Beregn top kategorier
    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const cat = categorizeTransaction(t.description);
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
    });
    const topCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

    if (lower.includes('spare') || lower.includes('besparelse')) {
      reply = `💡 **Dine bedste besparelsesmuligheder:**\n\n`;
      topCategories.forEach(([cat, amount]) => {
        reply += `• **${cat}**: ${amount.toLocaleString('da-DK')} kr\n`;
      });
      reply += `\n**Mit bedste råd:** Reducer takeaway og café med 30-40% – det kan give dig 2.000-3.500 kr ekstra om måneden.`;
    } 
    else if (lower.includes('største') || lower.includes('hvor bruger')) {
      if (topCategories.length > 0) {
        reply = `🔥 **Dine største udgiftskategorier:**\n\n`;
        topCategories.forEach(([cat, amount], i) => {
          reply += `${i + 1}. ${cat} — ${amount.toLocaleString('da-DK')} kr\n`;
        });
      } else {
        reply = 'Ingen udgifter fundet endnu.';
      }
    } 
    else if (lower.includes('balance') || lower.includes('oversigt')) {
      const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      reply = `📊 **Din økonomiske oversigt:**\n\nIndtægter: +${income.toLocaleString('da-DK')} kr\nUdgifter: -${expenses.toLocaleString('da-DK')} kr\n**Saldo: ${income - expenses} kr**`;
    } 
    else {
      reply = `Tak for dit spørgsmål! Jeg kan hjælpe med:\n• "Hvad kan jeg spare på?"\n• "Hvad er mine største udgifter?"\n• "Vis min balance"`;
    }

    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden z-[100]">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-semibold">Min Økonomi Coach</p>
            <p className="text-xs opacity-75">Smart lokal AI • Historik gemt</p>
          </div>
        </div>
        <button onClick={onClose} className="text-2xl leading-none hover:scale-110 transition">×</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border px-4 py-3 rounded-3xl text-sm">Tænker...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv dit spørgsmål..."
            className="flex-1 px-5 py-4 bg-gray-100 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 text-white w-12 h-12 rounded-3xl flex items-center justify-center text-2xl hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}