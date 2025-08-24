import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Braces, Github } from "lucide-react";
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-6 md:px-8">
        {/* Left side - Logo, Title and Subtitle */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center">
              <Braces className="h-7 w-7 text-primary font-bold" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {t('header.title')}
              </h1>
              <p className="hidden text-sm text-muted-foreground sm:block font-medium">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-10 w-10"
          >
            <a
              href="https://github.com/nikaum-js"
              target="_blank"
              rel="noopener noreferrer"
              title={t('header.visitGithub')}
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>


          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}