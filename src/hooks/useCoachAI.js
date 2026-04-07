import { useState, useCallback } from 'react';

export function useCoachAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage, workoutHistory = []) => {
    setIsLoading(true);
    setError(null);

    try {
      // En production, ce serait un vrai appel à Claude API
      // Pour now, on simule une réponse
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            text: "C'est une excellente question! Basé sur ton historique d'entraînement, voici mon analyse...",
            suggestions: [
              'Augmente les poids de 2.5kg la prochaine fois',
              'Repose-toi 2 jours avant de refaire ce groupe musculaire',
              'Essaye une variation pour casser la routine'
            ]
          });
        }, 1000);
      });

      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendMessage, isLoading, error };
}