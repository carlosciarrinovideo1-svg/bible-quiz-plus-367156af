import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { QUESTIONS, CATEGORY_COLORS, Question } from '@/data/quizQuestions';
import { getTranslatedQuestions } from '@/data/translatedQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Home, Trophy, Volume2, VolumeX, 
  Clock, Flame, Play, ChevronRight, RotateCcw,
  Zap, Target, Award, Medal, Share2, Twitter, Facebook, Linkedin
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementPopup } from './AchievementPopup';
import { AchievementsPanel } from './AchievementsPanel';

type Screen = 'home' | 'difficulty' | 'category' | 'quiz' | 'results' | 'achievements';
type Difficulty = 'easy' | 'medium' | 'hard' | 'all';

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  it: {
    pentateuco: 'Pentateuco',
    vangeli: 'Vangeli',
    antico_testamento: 'Antico Testamento',
    nuovo_testamento: 'Nuovo Testamento',
    profeti: 'Profeti',
    lettere_paoline: 'Lettere Paoline',
    salmi: 'Salmi',
    proverbi: 'Proverbi',
  },
  en: {
    pentateuco: 'Pentateuch',
    vangeli: 'Gospels',
    antico_testamento: 'Old Testament',
    nuovo_testamento: 'New Testament',
    profeti: 'Prophets',
    lettere_paoline: 'Pauline Letters',
    salmi: 'Psalms',
    proverbi: 'Proverbs',
  },
  es: {
    pentateuco: 'Pentateuco',
    vangeli: 'Evangelios',
    antico_testamento: 'Antiguo Testamento',
    nuovo_testamento: 'Nuevo Testamento',
    profeti: 'Profetas',
    lettere_paoline: 'Cartas Paulinas',
    salmi: 'Salmos',
    proverbi: 'Proverbios',
  },
  fr: {
    pentateuco: 'Pentateuque',
    vangeli: 'Évangiles',
    antico_testamento: 'Ancien Testament',
    nuovo_testamento: 'Nouveau Testament',
    profeti: 'Prophètes',
    lettere_paoline: 'Lettres Pauliniennes',
    salmi: 'Psaumes',
    proverbi: 'Proverbes',
  },
  de: {
    pentateuco: 'Pentateuch',
    vangeli: 'Evangelien',
    antico_testamento: 'Altes Testament',
    nuovo_testamento: 'Neues Testament',
    profeti: 'Propheten',
    lettere_paoline: 'Paulusbriefe',
    salmi: 'Psalmen',
    proverbi: 'Sprichwörter',
  },
};

const DIFFICULTY_CONFIG = {
  easy: { time: 30, questions: 10, icon: Target, color: 'from-green-500 to-emerald-500' },
  medium: { time: 20, questions: 15, icon: Zap, color: 'from-yellow-500 to-orange-500' },
  hard: { time: 15, questions: 20, icon: Flame, color: 'from-red-500 to-rose-500' },
  all: { time: 20, questions: 15, icon: Award, color: 'from-purple-500 to-indigo-500' },
};

const BibleQuiz = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const categoryNames = CATEGORY_NAMES[language] || CATEGORY_NAMES.it;

  const [screen, setScreen] = useState<Screen>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreakThisQuiz, setMaxStreakThisQuiz] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Achievements system
  const { 
    achievements, 
    stats, 
    newUnlocks, 
    recordQuizResult, 
    clearNewUnlocks,
    getUnlockedCount,
    getTotalCount 
  } = useAchievements();

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      // Record quiz result for achievements
      recordQuizResult(score, questions.length, selectedCategory, maxStreakThisQuiz);
      setScreen('results');
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    }
  }, [currentIndex, questions.length, difficulty, score, selectedCategory, maxStreakThisQuiz, recordQuizResult]);

  const handleTimeout = useCallback(() => {
    setShowResult(true);
    setStreak(0);
    setTimeout(() => nextQuestion(), 2000);
  }, [nextQuestion]);

  // Timer
  useEffect(() => {
    if (screen !== 'quiz' || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return DIFFICULTY_CONFIG[difficulty].time;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, showResult, difficulty, handleTimeout]);

  const selectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setScreen('category');
  };

  const startQuiz = (category: string) => {
    setSelectedCategory(category);
    // Use translated questions based on current language
    const allQuestions = getTranslatedQuestions(language, category);
    
    // Filter by difficulty
    const filteredQuestions = difficulty === 'all' 
      ? allQuestions 
      : allQuestions.filter(q => q.difficulty === difficulty);
    
    // Shuffle and limit
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, DIFFICULTY_CONFIG[difficulty].questions);
    
    setQuestions(limited);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreakThisQuiz(0);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    setSelectedAnswer(null);
    setShowResult(false);
    setScreen('quiz');
  };

  // Social sharing functions
  const getShareText = () => {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return `🎯 ${t.title}: ${score}/${questions.length} (${percentage}%)! ${categoryNames[selectedCategory]} - ${t[difficulty] || difficulty}`;
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      toast.success(t.copied || 'Copied!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === questions[currentIndex].c;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const newStreak = s + 1;
        setMaxStreakThisQuiz(prev => Math.max(prev, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => nextQuestion(), 2000);
  };

  const goHome = () => {
    setScreen('home');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
  };

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-amber-600" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </header>

          {/* Hero */}
          <Card className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 border-none text-white overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.subtitle}</h2>
                <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">{t.aboutText}</p>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="gap-2 text-lg px-8"
                  onClick={() => setScreen('difficulty')}
                >
                  <Play className="w-5 h-5" />
                  {t.startQuiz}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-4">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats.bestStreak}</p>
              <p className="text-sm text-muted-foreground">{t.bestStreak}</p>
            </Card>
            <Card 
              className="text-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setScreen('achievements')}
            >
              <Medal className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{getUnlockedCount()}/{getTotalCount()}</p>
              <p className="text-sm text-muted-foreground">Badge</p>
            </Card>
            <Card className="text-center p-4">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.totalCorrect}</p>
              <p className="text-sm text-muted-foreground">{t.correctAnswers}</p>
            </Card>
            <Card className="text-center p-4">
              <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Quiz</p>
            </Card>
          </div>
          
          {/* Achievements Popup */}
          <AchievementPopup achievements={newUnlocks} onClose={clearNewUnlocks} />
        </div>
      </main>
    );
  }

  // DIFFICULTY SELECTION
  if (screen === 'difficulty') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={goHome} className="gap-2">
              <Home className="w-5 h-5" />
              {t.home}
            </Button>
            <h1 className="text-xl font-bold">{t.selectDifficulty}</h1>
            <div className="w-20" />
          </header>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {(['easy', 'medium', 'hard', 'all'] as Difficulty[]).map((diff) => {
              const config = DIFFICULTY_CONFIG[diff];
              const Icon = config.icon;
              const label = diff === 'all' ? t.allCategories : t[diff];
              
              return (
                <Card 
                  key={diff}
                  className="cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                  onClick={() => selectDifficulty(diff)}
                >
                  <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                  <CardContent className="p-6 text-center">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-foreground/80" />
                    <h3 className="text-xl font-bold mb-2">{label}</h3>
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {config.time}s
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {config.questions} {t.question}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // CATEGORY SELECTION
  if (screen === 'category') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={() => setScreen('difficulty')} className="gap-2">
              <ChevronRight className="w-5 h-5 rotate-180" />
              {t.difficulty}
            </Button>
            <h1 className="text-xl font-bold">{t.selectCategory}</h1>
            <div className="w-20" />
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(QUESTIONS).map((category) => {
              const colors = CATEGORY_COLORS[category];
              return (
                <Card 
                  key={category}
                  className={`cursor-pointer hover:scale-105 transition-transform ${colors.bg} text-white`}
                  onClick={() => startQuiz(category)}
                >
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="font-bold">{categoryNames[category]}</h3>
                    <p className="text-sm opacity-80 mt-1">
                      {QUESTIONS[category]?.filter(q => difficulty === 'all' || q.difficulty === difficulty).length || 0} {t.question}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // QUIZ SCREEN
  if (screen === 'quiz' && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={goHome} size="sm">
              <Home className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold">{streak}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-muted'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">{timeLeft}s</span>
              </div>
            </div>
          </header>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{t.question} {currentIndex + 1} {t.of} {questions.length}</span>
              <span>{t.score}: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl leading-relaxed">
                {currentQuestion.q}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Answers */}
          <div className="grid gap-3">
            {currentQuestion.a.map((answer, idx) => {
              let variant: 'outline' | 'default' | 'destructive' | 'secondary' = 'outline';
              let extraClasses = 'hover:bg-muted';
              
              if (showResult) {
                if (idx === currentQuestion.c) {
                  variant = 'default';
                  extraClasses = 'bg-green-500 hover:bg-green-500 text-white border-green-500';
                } else if (idx === selectedAnswer && idx !== currentQuestion.c) {
                  variant = 'destructive';
                  extraClasses = '';
                }
              }

              return (
                <Button
                  key={idx}
                  variant={variant}
                  className={`w-full justify-start text-left h-auto py-4 px-6 ${extraClasses}`}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + idx)}.</span>
                  {answer}
                </Button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && (
            <div className={`mt-6 p-4 rounded-lg text-center ${selectedAnswer === currentQuestion.c ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              {selectedAnswer === currentQuestion.c ? t.correct : t.incorrect}
            </div>
          )}
        </div>
      </main>
    );
  }

  // RESULTS SCREEN
  if (screen === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const isPerfect = score === questions.length;

    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Trophy className={`w-20 h-20 mx-auto mb-6 ${percentage >= 70 ? 'text-yellow-500' : percentage >= 50 ? 'text-gray-400' : 'text-amber-700'}`} />
            <h2 className="text-3xl font-bold mb-2">{t.quizCompleted}</h2>
            <p className="text-muted-foreground mb-6">{categoryNames[selectedCategory]}</p>
            
            {isPerfect && (
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                <span className="text-2xl">⭐</span>
                <p className="font-semibold text-amber-700 dark:text-amber-300">
                  {language === 'it' ? 'Punteggio Perfetto!' : 'Perfect Score!'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{score}/{questions.length}</p>
                <p className="text-sm text-muted-foreground">{t.correctAnswers}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">{t.percentage}</p>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">{t.shareResult || 'Share your result'}</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnTwitter}
                  className="hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnFacebook}
                  className="hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnLinkedIn}
                  className="hover:bg-blue-700 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 gap-2" 
                onClick={() => startQuiz(selectedCategory)}
              >
                <RotateCcw className="w-4 h-4" />
                {t.tryAgain}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                onClick={goHome}
              >
                <Home className="w-4 h-4" />
                {t.home}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements Popup */}
        <AchievementPopup achievements={newUnlocks} onClose={clearNewUnlocks} />
      </main>
    );
  }

  // ACHIEVEMENTS SCREEN
  if (screen === 'achievements') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={goHome} className="gap-2">
              <Home className="w-5 h-5" />
              {t.home}
            </Button>
            <h1 className="text-xl font-bold">Badge & Achievements</h1>
            <div className="w-20" />
          </header>

          <AchievementsPanel achievements={achievements} stats={stats} />
        </div>
      </main>
    );
  }

  return null;
};

export default BibleQuiz;
