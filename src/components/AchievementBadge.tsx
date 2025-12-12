import { Achievement } from '@/hooks/useAchievements';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const AchievementBadge = ({ 
  achievement, 
  size = 'md',
  showProgress = false 
}: AchievementBadgeProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            'rounded-full flex items-center justify-center transition-all duration-300',
            sizeClasses[size],
            achievement.unlocked
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
              : 'bg-muted grayscale opacity-50'
          )}
        >
          <span className={achievement.unlocked ? '' : 'opacity-50'}>
            {achievement.icon}
          </span>
        </div>
        {achievement.unlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={cn('font-semibold', textSizeClasses[size])}>
          {achievement.name[language] || achievement.name.en}
        </p>
        <p className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-xs')}>
          {achievement.description[language] || achievement.description.en}
        </p>
        {showProgress && !achievement.unlocked && (
          <div className="mt-2 w-full">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.progress}/{achievement.requirement}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
