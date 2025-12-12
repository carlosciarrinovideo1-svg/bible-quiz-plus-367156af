import { Achievement, QuizStats } from '@/hooks/useAchievements';
import { useLanguage } from '@/contexts/LanguageContext';
import { AchievementBadge } from './AchievementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, BookOpen, Star } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
  stats: QuizStats;
}

const PANEL_TRANSLATIONS = {
  it: {
    title: 'Badge e Progressi',
    all: 'Tutti',
    unlocked: 'Sbloccati',
    locked: 'Da Sbloccare',
    stats: 'Statistiche',
    totalQuizzes: 'Quiz Completati',
    totalCorrect: 'Risposte Corrette',
    perfectQuizzes: 'Quiz Perfetti',
    bestStreak: 'Miglior Serie',
    progress: 'Progresso',
  },
  en: {
    title: 'Badges & Progress',
    all: 'All',
    unlocked: 'Unlocked',
    locked: 'Locked',
    stats: 'Statistics',
    totalQuizzes: 'Quizzes Completed',
    totalCorrect: 'Correct Answers',
    perfectQuizzes: 'Perfect Quizzes',
    bestStreak: 'Best Streak',
    progress: 'Progress',
  },
  es: {
    title: 'Insignias y Progreso',
    all: 'Todos',
    unlocked: 'Desbloqueados',
    locked: 'Bloqueados',
    stats: 'Estadísticas',
    totalQuizzes: 'Cuestionarios Completados',
    totalCorrect: 'Respuestas Correctas',
    perfectQuizzes: 'Cuestionarios Perfectos',
    bestStreak: 'Mejor Racha',
    progress: 'Progreso',
  },
  fr: {
    title: 'Badges et Progrès',
    all: 'Tous',
    unlocked: 'Débloqués',
    locked: 'Verrouillés',
    stats: 'Statistiques',
    totalQuizzes: 'Quiz Complétés',
    totalCorrect: 'Réponses Correctes',
    perfectQuizzes: 'Quiz Parfaits',
    bestStreak: 'Meilleure Série',
    progress: 'Progrès',
  },
  de: {
    title: 'Abzeichen & Fortschritt',
    all: 'Alle',
    unlocked: 'Freigeschaltet',
    locked: 'Gesperrt',
    stats: 'Statistiken',
    totalQuizzes: 'Quiz Abgeschlossen',
    totalCorrect: 'Richtige Antworten',
    perfectQuizzes: 'Perfekte Quiz',
    bestStreak: 'Beste Serie',
    progress: 'Fortschritt',
  },
};

export const AchievementsPanel = ({ achievements, stats }: AchievementsPanelProps) => {
  const { language } = useLanguage();
  const t = PANEL_TRANSLATIONS[language] || PANEL_TRANSLATIONS.en;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const progressPercentage = achievements.length > 0 
    ? Math.round((unlockedAchievements.length / achievements.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
          <p className="text-xs text-muted-foreground">{t.totalQuizzes}</p>
        </Card>
        <Card className="text-center p-4">
          <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats.totalCorrect}</p>
          <p className="text-xs text-muted-foreground">{t.totalCorrect}</p>
        </Card>
        <Card className="text-center p-4">
          <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.perfectQuizzes}</p>
          <p className="text-xs text-muted-foreground">{t.perfectQuizzes}</p>
        </Card>
        <Card className="text-center p-4">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{stats.bestStreak}</p>
          <p className="text-xs text-muted-foreground">{t.bestStreak}</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{t.progress}</span>
            <span className="text-muted-foreground">
              {unlockedAchievements.length}/{achievements.length} ({progressPercentage}%)
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">{t.all}</TabsTrigger>
              <TabsTrigger value="unlocked">{t.unlocked}</TabsTrigger>
              <TabsTrigger value="locked">{t.locked}</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <AchievementBadge 
                    key={achievement.id} 
                    achievement={achievement}
                    size="md"
                    showProgress
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="unlocked">
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementBadge 
                      key={achievement.id} 
                      achievement={achievement}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'it' ? 'Nessun badge sbloccato ancora' : 'No badges unlocked yet'}
                </p>
              )}
            </TabsContent>

            <TabsContent value="locked">
              {lockedAchievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {lockedAchievements.map((achievement) => (
                    <AchievementBadge 
                      key={achievement.id} 
                      achievement={achievement}
                      size="md"
                      showProgress
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  🎉 {language === 'it' ? 'Hai sbloccato tutti i badge!' : 'You unlocked all badges!'}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
