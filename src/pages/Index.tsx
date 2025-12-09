import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Play, Settings, Trophy } from 'lucide-react';

const QuizHome = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-amber-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          <LanguageSelector />
        </header>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 border-none text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">{t.subtitle}</h2>
            <p className="text-lg opacity-90 mb-6">{t.aboutText}</p>
            <Button size="lg" variant="secondary" className="gap-2">
              <Play className="w-5 h-5" />
              {t.startQuiz}
            </Button>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                {t.challenges}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t.weeklyChallenges}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                {t.statistics}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t.viewHistory}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                {t.settings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t.selectDifficulty}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <QuizHome />
    </LanguageProvider>
  );
};

export default Index;
