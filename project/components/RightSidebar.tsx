"use client";

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatDate, getTimeAgo, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface RightSidebarProps {
  language: 'tr' | 'en';
  onOpenChange?: (isOpen: boolean) => void;
}

interface Log {
  id: number;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  event_date: string;
  created_at: string;
}

export function RightSidebar({ language, onOpenChange }: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const fetchLogs = async () => {
    try {
      console.log('Fetching logs...');
      const { data, error } = await supabase
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      if (data) {
        console.log('Logs fetched:', data);
        setLogs(data);
      }
    } catch (err) {
      console.error('Error in fetchLogs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Realtime subscription
    const channel = supabase
      .channel('ai_logs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ai_logs',
          filter: `created_at.gt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`
        }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchLogs();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime changes');
        }
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOpenSidebar = () => {
      console.log('Opening sidebar and fetching latest logs...');
      setIsOpen(true);
      fetchLogs();
    };

    window.addEventListener('openSidebar', handleOpenSidebar);
    
    return () => {
      window.removeEventListener('openSidebar', handleOpenSidebar);
    };
  }, []);

  const getTitle = (log: Log) => {
    return language === 'en' ? (log.title_en || log.title) : log.title;
  };

  const getDescription = (log: Log) => {
    return language === 'en' ? (log.description_en || log.description) : log.description;
  };

  return (
    <div className={`
      fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-sm border-l border-border/10
      transform transition-transform duration-300 ease-in-out z-50
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-24 -left-8 bg-background/95 backdrop-blur-sm
          p-2 rounded-l-lg border border-r-0 border-border/10
          transform transition-transform duration-300
          ${isOpen ? 'rotate-0' : 'rotate-180'}
        `}
      >
        <svg
          className="w-4 h-4 text-foreground/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      <div className={cn(
        "p-4 overflow-y-auto h-full",
        !isOpen && "hidden"
      )}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {language === 'en' ? 'New Updates' : 'Yeni Güncellemeler'}
          </h2>
          <span className="text-xs text-muted-foreground">
            {logs.length} {language === 'en' ? 'new records' : 'yeni kayıt'}
          </span>
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            {language === 'en' ? 'No new updates yet' : 'Henüz yeni güncelleme yok'}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg"
              >
                <h3 className="font-semibold text-foreground">
                  {getTitle(log)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getDescription(log)}
                </p>
                <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {language === 'en' ? 'Event Date: ' : 'Olay Tarihi: '}
                      {formatDate(log.event_date, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      {language === 'en' ? 'Added: ' : 'Eklenme: '}
                      {formatDate(log.created_at, language)}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {getTimeAgo(log.created_at, language)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 