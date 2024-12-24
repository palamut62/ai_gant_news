'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { UpdateToggle } from '@/components/update-toggle';

interface HeaderProps {
  language: 'tr' | 'en';
  onToggleLanguage: () => void;
}

export function Header({ language, onToggleLanguage }: HeaderProps) {
  return (
    <header className="w-full border-b border-border/10">
      <div className="max-w-7xl mx-auto px-8 py-2 flex items-center justify-between">
        <div className="h-8 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8">
            <UpdateToggle />
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-sm font-medium text-gray-900 dark:text-white leading-none translate-y-[8px]">
            {language === 'en' ? 'AI Development Timeline' : 'Yapay Zeka Gelişim Süreci'}
          </h1>
        </div>
        <div className="h-8 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8">
            <ThemeToggle />
          </div>
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
        </div>
      </div>
    </header>
  );
} 