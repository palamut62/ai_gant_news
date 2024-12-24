'use client';

import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  language: 'tr' | 'en';
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const handleLanguageChange = () => {
    // Dil değişikliği eventi gönder
    window.dispatchEvent(new CustomEvent('languageChange', {
      detail: { language: language === 'tr' ? 'en' : 'tr' }
    }));
    
    // Parent component'e bildir
    onToggle();
  };

  return (
    <div className="flex items-center justify-center w-8 h-8 translate-y-[8px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLanguageChange}
        className="h-8 w-8 hover:bg-accent hover:text-accent-foreground flex items-center justify-center p-0"
      >
        <Languages className="h-4 w-4" />
        <span className="ml-0.5 text-[10px] font-medium">{language.toUpperCase()}</span>
      </Button>
    </div>
  );
} 