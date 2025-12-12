import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  requirement: number;
  type: 'streak' | 'score' | 'quizzes' | 'category' | 'perfect';
  category?: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

const ACHIEVEMENTS_KEY = 'bible_quiz_achievements';
const STATS_KEY = 'bible_quiz_stats';

export interface QuizStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  perfectQuizzes: number;
  bestStreak: number;
  categoriesCompleted: Record<string, number>;
}

const DEFAULT_STATS: QuizStats = {
  totalQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  perfectQuizzes: 0,
  bestStreak: 0,
  categoriesCompleted: {},
};

const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  // Streak achievements
  {
    id: 'streak_5',
    name: { it: 'Prima Fiamma', en: 'First Flame', es: 'Primera Llama', fr: 'Première Flamme', de: 'Erste Flamme' },
    description: { it: 'Ottieni una serie di 5 risposte corrette', en: 'Get a 5 answer streak', es: 'Consigue una racha de 5', fr: 'Obtenez une série de 5', de: 'Erreiche eine Serie von 5' },
    icon: '🔥',
    requirement: 5,
    type: 'streak',
  },
  {
    id: 'streak_10',
    name: { it: 'Fiamma Ardente', en: 'Burning Flame', es: 'Llama Ardiente', fr: 'Flamme Ardente', de: 'Brennende Flamme' },
    description: { it: 'Ottieni una serie di 10 risposte corrette', en: 'Get a 10 answer streak', es: 'Consigue una racha de 10', fr: 'Obtenez une série de 10', de: 'Erreiche eine Serie von 10' },
    icon: '🔥',
    requirement: 10,
    type: 'streak',
  },
  {
    id: 'streak_20',
    name: { it: 'Inferno Biblico', en: 'Biblical Inferno', es: 'Infierno Bíblico', fr: 'Enfer Biblique', de: 'Biblisches Inferno' },
    description: { it: 'Ottieni una serie di 20 risposte corrette', en: 'Get a 20 answer streak', es: 'Consigue una racha de 20', fr: 'Obtenez une série de 20', de: 'Erreiche eine Serie von 20' },
    icon: '🌟',
    requirement: 20,
    type: 'streak',
  },
  // Quiz completion achievements
  {
    id: 'quizzes_1',
    name: { it: 'Primo Passo', en: 'First Step', es: 'Primer Paso', fr: 'Premier Pas', de: 'Erster Schritt' },
    description: { it: 'Completa il tuo primo quiz', en: 'Complete your first quiz', es: 'Completa tu primer quiz', fr: 'Complétez votre premier quiz', de: 'Schließe dein erstes Quiz ab' },
    icon: '📖',
    requirement: 1,
    type: 'quizzes',
  },
  {
    id: 'quizzes_10',
    name: { it: 'Studente Dedicato', en: 'Dedicated Student', es: 'Estudiante Dedicado', fr: 'Étudiant Dévoué', de: 'Engagierter Student' },
    description: { it: 'Completa 10 quiz', en: 'Complete 10 quizzes', es: 'Completa 10 cuestionarios', fr: 'Complétez 10 quiz', de: 'Schließe 10 Quiz ab' },
    icon: '📚',
    requirement: 10,
    type: 'quizzes',
  },
  {
    id: 'quizzes_50',
    name: { it: 'Maestro Biblico', en: 'Bible Master', es: 'Maestro Bíblico', fr: 'Maître Biblique', de: 'Bibelmeister' },
    description: { it: 'Completa 50 quiz', en: 'Complete 50 quizzes', es: 'Completa 50 cuestionarios', fr: 'Complétez 50 quiz', de: 'Schließe 50 Quiz ab' },
    icon: '🎓',
    requirement: 50,
    type: 'quizzes',
  },
  // Perfect score achievements
  {
    id: 'perfect_1',
    name: { it: 'Perfezione', en: 'Perfection', es: 'Perfección', fr: 'Perfection', de: 'Perfektion' },
    description: { it: 'Ottieni un punteggio perfetto', en: 'Get a perfect score', es: 'Obtén una puntuación perfecta', fr: 'Obtenez un score parfait', de: 'Erreiche eine perfekte Punktzahl' },
    icon: '⭐',
    requirement: 1,
    type: 'perfect',
  },
  {
    id: 'perfect_5',
    name: { it: 'Stella Nascente', en: 'Rising Star', es: 'Estrella Naciente', fr: 'Étoile Montante', de: 'Aufgehender Stern' },
    description: { it: 'Ottieni 5 punteggi perfetti', en: 'Get 5 perfect scores', es: 'Obtén 5 puntuaciones perfectas', fr: 'Obtenez 5 scores parfaits', de: 'Erreiche 5 perfekte Punktzahlen' },
    icon: '🌟',
    requirement: 5,
    type: 'perfect',
  },
  {
    id: 'perfect_10',
    name: { it: 'Leggenda', en: 'Legend', es: 'Leyenda', fr: 'Légende', de: 'Legende' },
    description: { it: 'Ottieni 10 punteggi perfetti', en: 'Get 10 perfect scores', es: 'Obtén 10 puntuaciones perfectas', fr: 'Obtenez 10 scores parfaits', de: 'Erreiche 10 perfekte Punktzahlen' },
    icon: '👑',
    requirement: 10,
    type: 'perfect',
  },
  // Total correct answers
  {
    id: 'score_50',
    name: { it: 'Esploratore', en: 'Explorer', es: 'Explorador', fr: 'Explorateur', de: 'Entdecker' },
    description: { it: 'Rispondi correttamente a 50 domande', en: 'Answer 50 questions correctly', es: 'Responde 50 preguntas correctamente', fr: 'Répondez correctement à 50 questions', de: 'Beantworte 50 Fragen richtig' },
    icon: '🧭',
    requirement: 50,
    type: 'score',
  },
  {
    id: 'score_200',
    name: { it: 'Conoscitore', en: 'Expert', es: 'Conocedor', fr: 'Connaisseur', de: 'Kenner' },
    description: { it: 'Rispondi correttamente a 200 domande', en: 'Answer 200 questions correctly', es: 'Responde 200 preguntas correctamente', fr: 'Répondez correctement à 200 questions', de: 'Beantworte 200 Fragen richtig' },
    icon: '🏆',
    requirement: 200,
    type: 'score',
  },
  {
    id: 'score_500',
    name: { it: 'Saggio Biblico', en: 'Bible Sage', es: 'Sabio Bíblico', fr: 'Sage Biblique', de: 'Bibel-Weiser' },
    description: { it: 'Rispondi correttamente a 500 domande', en: 'Answer 500 questions correctly', es: 'Responde 500 preguntas correctamente', fr: 'Répondez correctement à 500 questions', de: 'Beantworte 500 Fragen richtig' },
    icon: '📜',
    requirement: 500,
    type: 'score',
  },
  // Category-specific achievements
  {
    id: 'cat_pentateuco',
    name: { it: 'Esperto del Pentateuco', en: 'Pentateuch Expert', es: 'Experto del Pentateuco', fr: 'Expert du Pentateuque', de: 'Pentateuch-Experte' },
    description: { it: 'Completa 5 quiz del Pentateuco', en: 'Complete 5 Pentateuch quizzes', es: 'Completa 5 cuestionarios del Pentateuco', fr: 'Complétez 5 quiz du Pentateuque', de: 'Schließe 5 Pentateuch-Quiz ab' },
    icon: '📕',
    requirement: 5,
    type: 'category',
    category: 'pentateuco',
  },
  {
    id: 'cat_vangeli',
    name: { it: 'Discepolo dei Vangeli', en: 'Gospel Disciple', es: 'Discípulo de los Evangelios', fr: 'Disciple des Évangiles', de: 'Evangelien-Jünger' },
    description: { it: 'Completa 5 quiz dei Vangeli', en: 'Complete 5 Gospel quizzes', es: 'Completa 5 cuestionarios de los Evangelios', fr: 'Complétez 5 quiz des Évangiles', de: 'Schließe 5 Evangelien-Quiz ab' },
    icon: '📗',
    requirement: 5,
    type: 'category',
    category: 'vangeli',
  },
  {
    id: 'cat_profeti',
    name: { it: 'Voce dei Profeti', en: 'Voice of Prophets', es: 'Voz de los Profetas', fr: 'Voix des Prophètes', de: 'Stimme der Propheten' },
    description: { it: 'Completa 5 quiz dei Profeti', en: 'Complete 5 Prophet quizzes', es: 'Completa 5 cuestionarios de los Profetas', fr: 'Complétez 5 quiz des Prophètes', de: 'Schließe 5 Propheten-Quiz ab' },
    icon: '📘',
    requirement: 5,
    type: 'category',
    category: 'profeti',
  },
  {
    id: 'cat_salmi',
    name: { it: 'Cantore dei Salmi', en: 'Psalms Singer', es: 'Cantor de los Salmos', fr: 'Chanteur des Psaumes', de: 'Psalmen-Sänger' },
    description: { it: 'Completa 5 quiz dei Salmi', en: 'Complete 5 Psalms quizzes', es: 'Completa 5 cuestionarios de los Salmos', fr: 'Complétez 5 quiz des Psaumes', de: 'Schließe 5 Psalmen-Quiz ab' },
    icon: '🎵',
    requirement: 5,
    type: 'category',
    category: 'salmi',
  },
];

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<QuizStats>(DEFAULT_STATS);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
    const savedStats = localStorage.getItem(STATS_KEY);

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      const initialAchievements: Achievement[] = INITIAL_ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: false,
        progress: 0,
      }));
      setAchievements(initialAchievements);
    }

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    }
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const checkAchievements = useCallback((updatedStats: QuizStats) => {
    const newlyUnlocked: Achievement[] = [];

    setAchievements(prev => {
      return prev.map(achievement => {
        if (achievement.unlocked) return achievement;

        let currentProgress = 0;

        switch (achievement.type) {
          case 'streak':
            currentProgress = updatedStats.bestStreak;
            break;
          case 'quizzes':
            currentProgress = updatedStats.totalQuizzes;
            break;
          case 'perfect':
            currentProgress = updatedStats.perfectQuizzes;
            break;
          case 'score':
            currentProgress = updatedStats.totalCorrect;
            break;
          case 'category':
            currentProgress = achievement.category 
              ? (updatedStats.categoriesCompleted[achievement.category] || 0)
              : 0;
            break;
        }

        const shouldUnlock = currentProgress >= achievement.requirement;

        if (shouldUnlock && !achievement.unlocked) {
          const unlockedAchievement = {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress: currentProgress,
          };
          newlyUnlocked.push(unlockedAchievement);
          return unlockedAchievement;
        }

        return { ...achievement, progress: currentProgress };
      });
    });

    if (newlyUnlocked.length > 0) {
      setNewUnlocks(newlyUnlocked);
    }
  }, []);

  const recordQuizResult = useCallback((
    score: number,
    totalQuestions: number,
    category: string,
    maxStreak: number
  ) => {
    const isPerfect = score === totalQuestions;

    setStats(prev => {
      const newStats: QuizStats = {
        totalQuizzes: prev.totalQuizzes + 1,
        totalCorrect: prev.totalCorrect + score,
        totalQuestions: prev.totalQuestions + totalQuestions,
        perfectQuizzes: prev.perfectQuizzes + (isPerfect ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, maxStreak),
        categoriesCompleted: {
          ...prev.categoriesCompleted,
          [category]: (prev.categoriesCompleted[category] || 0) + 1,
        },
      };

      // Check achievements after updating stats
      setTimeout(() => checkAchievements(newStats), 100);

      return newStats;
    });
  }, [checkAchievements]);

  const clearNewUnlocks = useCallback(() => {
    setNewUnlocks([]);
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const getTotalCount = useCallback(() => {
    return achievements.length;
  }, [achievements]);

  return {
    achievements,
    stats,
    newUnlocks,
    recordQuizResult,
    clearNewUnlocks,
    getUnlockedCount,
    getTotalCount,
  };
};
