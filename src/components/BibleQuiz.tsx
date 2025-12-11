import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, Clock, Flame, Star, ChevronRight, X, Home, History, MessageCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import BibleChatbot from '@/components/BibleChatbot';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { QUESTIONS, CATEGORY_COLORS, Question } from '@/data/quizQuestions';

const BibleQuiz: React.FC = () => {
  const { t } = useLanguage();
  const { playCorrect, playIncorrect, playSuccess } = useAudioFeedback();

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('bible-quiz-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [screen, setScreen] = useState<'home' | 'quiz' | 'results'>('home');
  const [category, setCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showChatbot, setShowChatbot] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  const encouragements = ["Corretto! 🎉", "Ottimo! ⭐", "Fantastico! 💪", "Bravo! 🌟"];

  useEffect(() => {
    const streakData = localStorage.getItem('bible-quiz-best-streak');
    if (streakData) setBestStreak(parseInt(streakData));
  }, []);

  useEffect(() => {
    if (screen === 'quiz' && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !answered) handleTimeout();
  }, [timeLeft, answered, screen]);

  const startQuiz = (cat: string) => {
    setCategory(cat);
    const qs = [...QUESTIONS[cat]].sort(() => Math.random() - 0.5);
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(20);
    setScreen('quiz');
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(idx);

    const q = questions[currentQ];
    const correct = idx === q.c;

    if (correct) {
      if (soundEnabled) playCorrect();
      setScore(score + 1);
      setStreak(streak + 1);
      setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setTimeout(() => setEncouragement(''), 2000);

      const newBestStreak = Math.max(bestStreak, streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(newBestStreak);
        localStorage.setItem('bible-quiz-best-streak', newBestStreak.toString());
        if (soundEnabled) playSuccess();
      }
    } else {
      if (soundEnabled) playIncorrect();
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(false);
        setSelectedAnswer(null);
        setTimeLeft(20);
      } else {
        setScreen('results');
      }
    }, 2000);
  };

  const handleTimeout = () => {
    setAnswered(true);
    setStreak(0);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(false);
        setSelectedAnswer(null);
        setTimeLeft(20);
      } else {
        setScreen('results');
      }
    }, 2000);
  };

  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newValue = !soundEnabled;
                setSoundEnabled(newValue);
                localStorage.setItem('bible-quiz-sound-enabled', JSON.stringify(newValue));
              }}
              className="h-10 w-10"
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? '' : 'opacity-40'}`} />
            </Button>
            <ThemeToggle />
            <LanguageSelector />
          </div>

          <div className="relative mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="flex flex-col items-center justify-center text-foreground py-12 px-4">
              <BookOpen className="w-16 h-16 mb-4 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{t.title || 'Quiz Biblico Plus'}</h1>
              <p className="text-lg text-muted-foreground">{t.subtitle || 'Metti alla prova la tua conoscenza della Bibbia'}</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.statistics || 'Statistiche'}</CardTitle>
                <div className="flex items-center gap-2 text-streak">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{t.bestStreak || 'Miglior serie'}: {bestStreak}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t.selectCategory || 'Seleziona categoria'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.keys(QUESTIONS).map(cat => (
                  <Button
                    key={cat}
                    onClick={() => startQuiz(cat)}
                    className={`${CATEGORY_COLORS[cat]?.bg || 'bg-primary'} text-white h-auto py-3 justify-start text-sm hover:opacity-90`}
                    size="lg"
                  >
                    <span className="font-semibold text-left capitalize">
                      {cat.replace('_', ' ')}
                      <span className="text-xs ml-2 opacity-80">({QUESTIONS[cat].length} domande)</span>
                    </span>
                    <ChevronRight className="w-5 h-5 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setShowChatbot(true)} className="w-full h-auto py-4" size="lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            {t.chatbot || 'Assistente Biblico'}
          </Button>
        </div>

        {showChatbot && <BibleChatbot onClose={() => setShowChatbot(false)} onInteraction={() => {}} />}
      </div>
    );
  }

  if (screen === 'quiz') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => setScreen('home')}><Home className="w-5 h-5 mr-2" />Home</Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-streak"><Flame className="w-5 h-5" /><span className="font-bold">{streak}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span className={`font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Domanda {currentQ + 1} di {questions.length}</span>
              <span>Punteggio: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-center mb-6">{q.q}</h2>
              <div className="space-y-3">
                {q.a.map((answer, idx) => {
                  let buttonClass = 'w-full text-left justify-start h-auto py-4 px-4';
                  if (answered) {
                    if (idx === q.c) buttonClass += ' bg-success text-white hover:bg-success';
                    else if (idx === selectedAnswer) buttonClass += ' bg-destructive text-white hover:bg-destructive';
                  }
                  return (
                    <Button key={idx} variant={answered ? 'default' : 'outline'} className={buttonClass} onClick={() => handleAnswer(idx)} disabled={answered}>
                      <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                      <span>{answer}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {encouragement && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
              <div className="bg-success text-white px-6 py-3 rounded-full font-bold shadow-lg">{encouragement}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className={`w-20 h-20 mx-auto mb-4 ${percentage >= 70 ? 'text-warning' : 'text-muted-foreground'}`} />
            <h2 className="text-3xl font-bold mb-2">Quiz completato!</h2>
            <div className="bg-muted rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold text-primary mb-2">{score}/{questions.length}</div>
              <div className="text-lg text-muted-foreground">{percentage}%</div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-6 text-streak">
              <Star className="w-5 h-5" /><span>Miglior serie: {bestStreak}</span>
            </div>
            <div className="space-y-3">
              <Button onClick={() => startQuiz(category!)} className="w-full" size="lg">Riprova</Button>
              <Button onClick={() => setScreen('home')} variant="outline" className="w-full" size="lg"><Home className="w-5 h-5 mr-2" />Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default BibleQuiz;
