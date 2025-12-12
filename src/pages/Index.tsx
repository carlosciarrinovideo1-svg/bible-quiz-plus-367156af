import { LanguageProvider } from '@/contexts/LanguageContext';
import BibleQuiz from '@/components/BibleQuiz';

const Index = () => {
  return (
    <LanguageProvider>
      <BibleQuiz />
    </LanguageProvider>
  );
};

export default Index;
