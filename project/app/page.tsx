'use client';

import { Timeline } from '@/components/Timeline';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { useEffect, useState, useRef } from 'react';
import { Footer } from '@/components/Footer';
import { RightSidebar } from '@/components/RightSidebar';

interface Event {
  id: number;
  event_date: string;
  short_description: string;
  long_description: string;
  short_description_en: string;
  long_description_en: string;
  created_at: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('ai_developments')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    if (data) {
      setEvents(data);
      // Veriler yüklendiğinde en sona scroll yap
      setTimeout(() => {
        if (containerRef.current) {
          const container = containerRef.current.querySelector('[data-timeline-container]');
          if (container) {
            container.scrollLeft = container.scrollWidth;
          }
        }
      }, 100);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Event listener ekle
    const handleUpdate = () => {
      fetchEvents();
    };

    window.addEventListener('aiUpdated', handleUpdate);
    return () => {
      window.removeEventListener('aiUpdated', handleUpdate);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  if (!events?.length) {
    return <div>No events found</div>;
  }

  return (
    <main className={`
      flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'pr-80' : 'pr-0'}
    `}>
      {/* Header */}
      <Header language={language} onToggleLanguage={toggleLanguage} />

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 max-w-7xl w-full mx-auto px-8 pt-16 pb-6 flex flex-col">
        <div className="flex-1 min-h-0 relative overflow-hidden flex items-center">
          <Timeline events={events} language={language} />
        </div>
      </div>

      {/* Sidebar */}
      <RightSidebar language={language} onOpenChange={setIsSidebarOpen} />

      {/* Footer */}
      <Footer language={language} />
    </main>
  );
}