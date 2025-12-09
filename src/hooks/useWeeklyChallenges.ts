import { useState, useEffect, useCallback } from 'react';

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  type: 'questions' | 'streak' | 'perfect' | 'category';
  category?: string;
  completed: boolean;
  claimed: boolean;
}

interface WeeklyChallengesState {
  challenges: WeeklyChallenge[];
  weekStart: string;
  totalRewardsClaimed: number;
}

const generateWeeklyChallenges = (): WeeklyChallenge[] => {
  const categories = ['Antico Testamento', 'Nuovo Testamento', 'Vangeli', 'Lettere', 'Profeti'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  return [
    {
      id: 'weekly-questions',
      title: 'Studioso della Settimana',
      description: 'Rispondi a 50 domande questa settimana',
      target: 50,
      current: 0,
      reward: 100,
      type: 'questions',
      completed: false,
      claimed: false,
    },
    {
      id: 'weekly-streak',
      title: 'Serie Vincente',
      description: 'Raggiungi una serie di 10 risposte corrette consecutive',
      target: 10,
      current: 0,
      reward: 75,
      type: 'streak',
      completed: false,
      claimed: false,
    },
    {
      id: 'weekly-perfect',
      title: 'Perfezione',
      description: 'Completa 3 quiz con il 100% di risposte corrette',
      target: 3,
      current: 0,
      reward: 150,
      type: 'perfect',
      completed: false,
      claimed: false,
    },
    {
      id: 'weekly-category',
      title: `Esperto di ${randomCategory}`,
      description: `Rispondi correttamente a 20 domande su ${randomCategory}`,
      target: 20,
      current: 0,
      reward: 50,
      type: 'category',
      category: randomCategory,
      completed: false,
      claimed: false,
    },
  ];
};

const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

export const useWeeklyChallenges = () => {
  const [state, setState] = useState<WeeklyChallengesState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible-quiz-weekly-challenges');
      if (saved) {
        const parsed = JSON.parse(saved);
        const currentWeekStart = getWeekStart();
        
        // Reset challenges if it's a new week
        if (parsed.weekStart !== currentWeekStart) {
          return {
            challenges: generateWeeklyChallenges(),
            weekStart: currentWeekStart,
            totalRewardsClaimed: parsed.totalRewardsClaimed || 0,
          };
        }
        return parsed;
      }
    }
    return {
      challenges: generateWeeklyChallenges(),
      weekStart: getWeekStart(),
      totalRewardsClaimed: 0,
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible-quiz-weekly-challenges', JSON.stringify(state));
    }
  }, [state]);

  const updateChallenge = useCallback((type: string, value: number, category?: string) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(challenge => {
        if (challenge.type !== type) return challenge;
        if (type === 'category' && challenge.category !== category) return challenge;
        
        const newCurrent = Math.min(challenge.current + value, challenge.target);
        return {
          ...challenge,
          current: newCurrent,
          completed: newCurrent >= challenge.target,
        };
      }),
    }));
  }, []);

  const claimReward = useCallback((challengeId: string): number => {
    let reward = 0;
    setState(prev => {
      const challenge = prev.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.completed && !challenge.claimed) {
        reward = challenge.reward;
        return {
          ...prev,
          challenges: prev.challenges.map(c =>
            c.id === challengeId ? { ...c, claimed: true } : c
          ),
          totalRewardsClaimed: prev.totalRewardsClaimed + reward,
        };
      }
      return prev;
    });
    return reward;
  }, []);

  const getTimeUntilReset = useCallback((): string => {
    const now = new Date();
    const nextMonday = new Date(state.weekStart);
    nextMonday.setDate(nextMonday.getDate() + 7);
    
    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}g ${hours}h`;
    }
    return `${hours}h`;
  }, [state.weekStart]);

  return {
    challenges: state.challenges,
    totalRewardsClaimed: state.totalRewardsClaimed,
    updateChallenge,
    claimReward,
    getTimeUntilReset,
  };
};
