// src/hooks/useGrokAI.ts
import { useState, useCallback } from 'react';
import type { Transaction } from '../types';

interface GrokResponse {
  content: string;
  usedGrok: boolean;
}

export function useGrokAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsedGrok, setLastUsedGrok] = useState(false);

  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  const buildSystemPrompt = (transactions: Transaction[] = []) => {
    let base = `Du er en dansk, realistisk og empatisk økonomirådgiver. 
Du taler altid på dansk, er direkte men venlig, og giver konkrete, handlingsorienterede råd.
Undgå at foreslå at spare på faste udgifter som husleje, el eller internet. 
Fokuser på variable udgifter som mad, transport, fritid, takeaway, streaming osv.`;

    if (transactions.length > 0) {
      const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = Math.abs(
        transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
      );

      base += `\n\nBrugerens aktuelle situation:
- Samlede indtægter: ${totalIncome.toLocaleString('da-DK')} kr
- Samlede udgifter: ${totalExpenses.toLocaleString('da-DK')} kr
- Antal transaktioner: ${transactions.length}

Brug denne information til at give personlige og relevante råd.`;
    }

    return base;
  };

  const callGrok = useCallback(async (
    userPrompt: string, 
    transactions: Transaction[] = []
  ): Promise<GrokResponse> => {
    setIsLoading(true);
    setError(null);

    if (!apiKey) {
      console.log('%c[Grok] Ingen VITE_GROK_API_KEY fundet – bruger lokal fallback', 'color: orange');
      setLastUsedGrok(false);
      setIsLoading(false);
      return { content: '', usedGrok: false };
    }

    try {
      const systemPrompt = buildSystemPrompt(transactions);

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-4.20-reasoning',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.65,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API fejl ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      setLastUsedGrok(true);
      return { content: content, usedGrok: true };
    } catch (err: any) {
      console.error('%c[Grok] API fejl:', 'color: red', err.message);
      setError(err.message);
      setLastUsedGrok(false);
      return { content: '', usedGrok: false };
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return {
    callGrok,
    isLoading,
    error,
    lastUsedGrok,
    hasApiKey: !!apiKey,
  };
}