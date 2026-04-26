// src/hooks/useGrokAI.ts
import { useState, useCallback } from 'react';

export function useGrokAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsedGrok, setLastUsedGrok] = useState(false);

  // VIGTIGT: Brug VITE_ prefix til Vite
  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  const callGrok = useCallback(async (userPrompt: string) => {
    setIsLoading(true);
    setError(null);

    if (!apiKey) {
      console.log('%c[Grok] Ingen VITE_GROK_API_KEY fundet i .env', 'color: orange');
      setLastUsedGrok(false);
      setIsLoading(false);
      return { content: '', usedGrok: false };
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-4.20-reasoning',
          messages: [
            { role: 'system', content: 'Du er en dansk, realistisk økonomirådgiver.' },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API fejl ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      setLastUsedGrok(true);
      return { content, usedGrok: true };
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