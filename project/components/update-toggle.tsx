"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import { fetchAIUpdates, saveUpdatesToDatabase } from '@/lib/gemini';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from '@supabase/supabase-js'

interface AIUpdate {
  event_date: string;
  short_description: string;
  long_description: string;
  short_description_en: string;
  long_description_en: string;
  source_url?: string;
}

interface UpdateRecord {
  id: number;
  update_time: string;
  success_count: number;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function UpdateToggle() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [updates, setUpdates] = useState<AIUpdate[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleAiUpdated = () => {
      window.dispatchEvent(new CustomEvent('openSidebar'));
    };

    window.addEventListener('aiUpdated', handleAiUpdated);
    return () => {
      window.removeEventListener('aiUpdated', handleAiUpdated);
    };
  }, []);

  useEffect(() => {
    async function fetchLastUpdate() {
      try {
        const { data, error } = await supabase
          .from('ai_updates')
          .select('update_time')
          .order('update_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setLastUpdateTime(new Date(data.update_time));
        }
      } catch (err) {
        console.error('Son güncelleme zamanı alınamadı:', err);
      }
    }

    fetchLastUpdate();
  }, []);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const updates = await fetchAIUpdates();
      setUpdates(updates);
      setIsOpen(true);

      const results = await saveUpdatesToDatabase(updates);
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        console.log('Updates saved successfully, opening sidebar...');
        window.dispatchEvent(new CustomEvent('openSidebar'));

        try {
          const { data, error } = await supabase
            .from('ai_updates')
            .select('update_time')
            .order('update_time', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setLastUpdateTime(new Date(data.update_time));
          }
        } catch (err) {
          console.error('Son güncelleme zamanı alınamadı:', err);
        }

        toast({
          title: language === 'en' ? "Update Successful" : "Güncelleme Başarılı",
          description: language === 'en' 
            ? `${successCount} new developments added.`
            : `${successCount} yeni gelişme kaydedildi.`,
        });
      } else {
        toast({
          title: language === 'en' ? "No Updates" : "Güncelleme Yok",
          description: language === 'en' 
            ? "No new developments found."
            : "Yeni gelişme bulunamadı.",
        });
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast({
        title: language === 'en' ? "Update Failed" : "Güncelleme Başarısız",
        description: language === 'en'
          ? "An error occurred. Please try again."
          : "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (language === 'en') {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } else {
      if (minutes < 1) return 'Az önce';
      if (minutes < 60) return `${minutes} dk önce`;
      if (hours < 24) return `${hours} sa önce`;
      return `${days} gün önce`;
    }
  };

  return (
    <>
      <div className="absolute left-16 top-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Güncellemeleri kontrol et</span>
        </Button>
        {lastUpdateTime && (
          <span className="text-xs text-muted-foreground">
            {formatLastUpdate(lastUpdateTime)}
          </span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yapay Zeka Gelişmeleri / AI Developments</DialogTitle>
            <DialogDescription>
              Son bir ay içindeki önemli AI gelişmeleri / Important AI developments in the last month
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {updates.map((update, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">🇹🇷 Türkçe</h2>
                  <h3 className="font-semibold text-lg">{update.short_description}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{update.long_description}</p>
                </div>

                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">🇬🇧 English</h2>
                  <h3 className="font-semibold text-lg">{update.short_description_en}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{update.long_description_en}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{update.event_date}</span>
                  </div>
                  {update.source_url && (
                    <a 
                      href={update.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      Kaynak / Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>
              Kapat / Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 