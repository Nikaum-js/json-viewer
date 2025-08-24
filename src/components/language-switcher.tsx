import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const getCurrentLanguageIndex = () => {
    return languages.findIndex(lang => lang.code === i18n.language);
  };

  const cycleLanguage = () => {
    const currentIndex = getCurrentLanguageIndex();
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLanguage = languages[nextIndex];
    i18n.changeLanguage(nextLanguage.code);
  };

  const currentLanguage = languages[getCurrentLanguageIndex()] || languages[0];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleLanguage}
      className="h-9 w-9"
      title={currentLanguage.name}
    >
      <span className="text-lg" role="img" aria-label={currentLanguage.name}>
        {currentLanguage.flag}
      </span>
      <span className="sr-only">{currentLanguage.name}</span>
    </Button>
  );
}