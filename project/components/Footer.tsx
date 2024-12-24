'use client';

import { Github, Twitter, Globe } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
  language: 'tr' | 'en';
}

export function Footer({ language }: FooterProps) {
  return (
    <footer className="w-full mt-auto border-t border-border/10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {language === 'en' ? 'Designed with 🚀 by' : 'Tasarlayan  🚀'}{' '}
          <a
            href="https://github.com/palamut62"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium hover:underline"
          >
            <Github className="h-4 w-4" />
            palamut62
          </a>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/palamut62"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://twitter.com/palamut62"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <Twitter className="h-6 w-6" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://umutcelik.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <Globe className="h-6 w-6" />
            <span className="sr-only">Website</span>
          </Link>
        </div>
      </div>
    </footer>
  );
} 