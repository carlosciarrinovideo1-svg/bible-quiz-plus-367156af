import { useEffect } from 'react';
import { Achievement } from '@/hooks/useAchievements';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
}

const POPUP_TRANSLATIONS = {
  it: { title: 'Nuovo Badge Sbloccato!', close: 'Fantastico!' },
  en: { title: 'New Badge Unlocked!', close: 'Awesome!' },
  es: { title: '¡Nuevo Logro Desbloqueado!', close: '¡Genial!' },
  fr: { title: 'Nouveau Badge Débloqué!', close: 'Super!' },
  de: { title: 'Neues Abzeichen Freigeschaltet!', close: 'Toll!' },
};

export const AchievementPopup = ({ achievements, onClose }: AchievementPopupProps) => {
  const { language } = useLanguage();
  const t = POPUP_TRANSLATIONS[language] || POPUP_TRANSLATIONS.en;

  useEffect(() => {
    if (achievements.length > 0) {
      // Play celebration sound or haptic feedback could go here
    }
  }, [achievements]);

  if (achievements.length === 0) return null;

  return (
    <Dialog open={achievements.length > 0} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="py-6">
          <div className="mb-6 animate-bounce">
            <span className="text-6xl">🏆</span>
          </div>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {t.title}
          </h2>
          
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                    {achievement.icon}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg">
                      {achievement.name[language] || achievement.name.en}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description[language] || achievement.description.en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={onClose}
            className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
            size="lg"
          >
            {t.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
