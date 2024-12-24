'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimelineEvent } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

interface TimelineProps {
  events: TimelineEvent[];
  language: 'tr' | 'en';
}

// Renk paleti - Tema bazlı renkler
const eventColors = {
  light: [
    { bg: '#2196F3', text: '#FFFFFF', border: '#90CAF9' }, // Mavi
    { bg: '#E91E63', text: '#FFFFFF', border: '#F48FB1' }, // Pembe
    { bg: '#4CAF50', text: '#FFFFFF', border: '#A5D6A7' }, // Yeşil
    { bg: '#9C27B0', text: '#FFFFFF', border: '#CE93D8' }, // Mor
    { bg: '#FF9800', text: '#000000', border: '#FFCC80' }  // Turuncu
  ],
  dark: [
    { bg: '#64B5F6', text: '#FFFFFF', border: '#BBDEFB' }, // Mavi
    { bg: '#F06292', text: '#FFFFFF', border: '#F8BBD0' }, // Pembe
    { bg: '#81C784', text: '#FFFFFF', border: '#C8E6C9' }, // Yeşil
    { bg: '#BA68C8', text: '#FFFFFF', border: '#E1BEE7' }, // Mor
    { bg: '#FFB74D', text: '#000000', border: '#FFE0B2' }  // Turuncu
  ]
};

export function Timeline({ events, language }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleYear, setVisibleYear] = useState<number | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(events);
  const [isSpinning, setIsSpinning] = useState(false);
  const { theme = 'dark' } = useTheme();

  // Ses efektleri için ref'ler
  const scrollSound = useRef<HTMLAudioElement | null>(null);

  // Ses efektini yükle
  useEffect(() => {
    // Ses dosyasını yükle
    if (!scrollSound.current) {
      scrollSound.current = new Audio('/sounds/scroll.mp3');
      scrollSound.current.volume = 1;
      scrollSound.current.loop = true;
      scrollSound.current.load();
    }

    // Cleanup
    return () => {
      if (scrollSound.current) {
        scrollSound.current.pause();
        scrollSound.current = null;
      }
    };
  }, []);

  // AI güncellemelerini dinle
  useEffect(() => {
    const handleAIUpdate = async () => {
      try {
        // Dönme animasyonunu başlat
        setIsSpinning(true);

        // Supabase'den güncel verileri çek
        const { data: newEvents, error } = await supabase
          .from('ai_developments')
          .select('*')
          .order('event_date', { ascending: true });

        if (error) throw error;
        if (newEvents) {
          setTimelineEvents(newEvents);
          // Timeline'ı en sona kaydır
          if (containerRef.current) {
            setTimeout(() => {
              containerRef.current?.scrollTo({
                left: containerRef.current.scrollWidth,
                behavior: 'smooth'
              });
            }, 100);
          }
        }

        // 2 saniye sonra dönme animasyonunu durdur
        setTimeout(() => {
          setIsSpinning(false);
        }, 2000);
      } catch (err) {
        console.error('Timeline güncellenirken hata:', err);
        setIsSpinning(false);
      }
    };

    // Event listener'ı ekle
    window.addEventListener('aiUpdated', handleAIUpdate);

    // Cleanup
    return () => window.removeEventListener('aiUpdated', handleAIUpdate);
  }, []);

  // events prop'u yerine timelineEvents state'ini kullan
  useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Görünür yılı güncelleme
  const updateVisibleYear = () => {
    if (containerRef.current && timelineEvents.length > 0) {
      const container = containerRef.current;
      const scrollPosition = container.scrollLeft + container.offsetWidth / 2;
      const totalWidth = container.scrollWidth;
      const scrollRatio = scrollPosition / totalWidth;
      
      const sortedYears = timelineEvents
        .map(e => new Date(e.event_date).getFullYear())
        .sort((a, b) => a - b);
      
      const yearIndex = Math.floor(scrollRatio * sortedYears.length);
      setVisibleYear(sortedYears[yearIndex] || sortedYears[0]);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateVisibleYear();
    };

    container.addEventListener('scroll', handleScroll);
    updateVisibleYear(); // İlk yükleme için

    return () => container.removeEventListener('scroll', handleScroll);
  }, [timelineEvents]);

  // Kaydırma kontrolleri
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse sürükleme işlemleri
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = Date.now();
    let animationFrameId: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      setIsDragging(true);
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      lastX = e.pageX;
      lastTime = Date.now();
      velocity = 0;
      
      // Ses başlat
      if (scrollSound.current) {
        scrollSound.current.currentTime = 0;
        scrollSound.current.volume = 1;
        const playPromise = scrollSound.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Ses çalma hatası:", error);
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      
      // Hız hesaplama
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      const deltaX = e.pageX - lastX;
      velocity = deltaX / deltaTime;

      // Scroll sesi hızını ayarla
      const absVelocity = Math.abs(velocity);
      if (scrollSound.current) {
        const minSpeed = 0.5;
        const maxSpeed = 3.0;
        const normalizedSpeed = Math.max(minSpeed, Math.min(maxSpeed, Math.abs(absVelocity) * 3));
        scrollSound.current.playbackRate = normalizedSpeed;
      }

      // Scroll pozisyonunu güncelle
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;

      lastX = e.pageX;
      lastTime = currentTime;
    };

    const handleMouseUp = () => {
      isDown = false;
      setIsDragging(false);

      // Sesi durdur
      if (scrollSound.current) {
        const fadeOut = () => {
          if (scrollSound.current && scrollSound.current.volume > 0.05) {
            scrollSound.current.volume = Math.max(0, scrollSound.current.volume - 0.1);
            requestAnimationFrame(fadeOut);
          } else if (scrollSound.current) {
            scrollSound.current.pause();
            scrollSound.current.volume = 1;
            scrollSound.current.currentTime = 0;
          }
        };
        fadeOut();
      }

      // Yavaşlama animasyonu
      let currentVelocity = velocity * 100;
      const decelerate = () => {
        if (Math.abs(currentVelocity) > 0.1) {
          container.scrollLeft -= currentVelocity;
          currentVelocity *= 0.95;
          animationFrameId = requestAnimationFrame(decelerate);
        }
      };
      decelerate();
    };

    const handleMouseLeave = () => {
      if (isDown) {
        handleMouseUp();
      }
    };

    // Touch olayları için benzer işlemler
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      isDown = true;
      setIsDragging(true);
      startX = touch.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      lastX = touch.pageX;
      lastTime = Date.now();
      velocity = 0;
      
      // Ses başlat
      if (scrollSound.current) {
        scrollSound.current.currentTime = 0;
        scrollSound.current.volume = 1;
        const playPromise = scrollSound.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Ses çalma hatası:", error);
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const touch = e.touches[0];

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      const deltaX = touch.pageX - lastX;
      velocity = deltaX / deltaTime;

      // Scroll sesi hızını ayarla
      const absVelocity = Math.abs(velocity);
      if (scrollSound.current) {
        const minSpeed = 0.5;
        const maxSpeed = 3.0;
        const normalizedSpeed = Math.max(minSpeed, Math.min(maxSpeed, Math.abs(absVelocity) * 3));
        scrollSound.current.playbackRate = normalizedSpeed;
      }

      const x = touch.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;

      lastX = touch.pageX;
      lastTime = currentTime;
    };

    const handleTouchEnd = () => {
      handleMouseUp();
    };

    // Event listener'ları ekle
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Dil bazlı açıklama seçimi
  const getDescription = (event: TimelineEvent, type: 'short' | 'long') => {
    if (language === 'en') {
      return type === 'short' ? 
        event.short_description_en || event.short_description : 
        event.long_description_en || event.long_description;
    }
    return type === 'short' ? event.short_description : event.long_description;
  };

  if (!timelineEvents?.length) return null;

  const colors = theme === 'dark' ? eventColors.dark : eventColors.light;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Yıl göstergesi */}
      {visibleYear && (
        <motion.div 
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/50 text-foreground px-4 py-1 rounded-full text-base font-medium z-30 backdrop-blur-sm border border-border/50"
          animate={isSpinning ? {
            rotate: [0, 720],
            scale: [1, 1.1, 1],
          } : {}}
          transition={isSpinning ? {
            duration: 2,
            ease: "easeOut",
            times: [0, 0.8, 1]
          } : {}}
        >
          {visibleYear}
        </motion.div>
      )}

      {/* Timeline container */}
      <div className="w-full h-full rounded-xl">
        {/* Kaydırma butonları */}
        <div className="hidden md:flex justify-between absolute top-1/2 -translate-y-1/2 left-4 right-4 z-30 pointer-events-none">
          <motion.div
            animate={isSpinning ? {
              rotate: [0, -360],
              scale: [1, 1.2, 1],
            } : {}}
            transition={isSpinning ? {
              duration: 2,
              ease: "easeOut",
              times: [0, 0.8, 1]
            } : {}}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full backdrop-blur border-border/50 hover:bg-accent hover:text-accent-foreground pointer-events-auto"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-5 w-5 text-foreground/70" />
            </Button>
          </motion.div>
          <motion.div
            animate={isSpinning ? {
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            } : {}}
            transition={isSpinning ? {
              duration: 2,
              ease: "easeOut",
              times: [0, 0.8, 1]
            } : {}}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full backdrop-blur border-border/50 hover:bg-accent hover:text-accent-foreground pointer-events-auto"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-5 w-5 text-foreground/70" />
            </Button>
          </motion.div>
        </div>

        {/* Timeline içeriği */}
        <motion.div 
          ref={containerRef}
          data-timeline-container
          className="h-full w-full flex items-center overflow-x-auto select-none transition-all scrollbar-hide"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            background: 'transparent'
          }}
          onScroll={updateVisibleYear}
          animate={isSpinning ? {
            scale: [1, 1.02, 1],
          } : {}}
          transition={isSpinning ? {
            duration: 2,
            ease: "easeOut",
            times: [0, 0.5, 1]
          } : {}}
        >
          <div className="relative min-w-max py-[200px]">
            {/* Ana timeline çizgisi */}
            <div className="absolute w-full h-[4px] top-1/2 -translate-y-1/2">
              {/* Arka plan parlaklık efekti */}
              <div 
                className="absolute inset-0 blur-[8px] bg-gradient-to-r from-transparent via-border/40 to-transparent opacity-75"
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(to right, transparent, var(--border) 50%, transparent)'
                    : 'linear-gradient(to right, transparent, var(--border) 50%, transparent)',
                  filter: 'blur(8px)',
                  transform: 'scaleY(2)'
                }}
              />
              {/* Ana çizgi */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-border/20 via-border to-border/20"
                style={{
                  boxShadow: theme === 'dark'
                    ? '0 0 10px var(--border), 0 0 20px var(--border/50)'
                    : '0 0 15px var(--border/50)'
                }}
              />
              {/* Yıl işaretleri */}
              {timelineEvents.map((event, index) => {
                const year = new Date(event.event_date).getFullYear();
                const position = `${(index / (timelineEvents.length - 1)) * 100}%`;
                
                return (
                  <div
                    key={`year-${index}`}
                    className="absolute top-3 transform -translate-x-1/2"
                    style={{ left: position }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-3 w-[2px] bg-border" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {year}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={`
              flex relative px-4 md:px-[5%]
              ${isMobile ? 'gap-4' : 'gap-16'}
            `}>
              {timelineEvents.map((event, index) => {
                const { bg, text, border } = colors[index % colors.length];
                const isTop = isMobile ? false : index % 2 === 0;
                
                return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: isTop ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`
                    relative 
                    ${isMobile ? 'min-w-[250px] mt-20' : `min-w-[300px] ${isTop ? '-mt-48' : 'mt-36'}`}
                  `}
                >
                  {/* Bağlantı çizgisi */}
                  <div 
                    className={`
                      absolute left-1/2 w-[2px]
                      ${isMobile ? 'h-16 -top-16' : `h-32 ${isTop ? 'top-[90px]' : '-top-[70px]'}`}
                    `}
                    style={{ background: `linear-gradient(${isTop ? 'to bottom' : 'to top'}, ${bg}, transparent)` }}
                  />

                  {/* Bağlantı noktası */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-20">
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: bg, borderColor: border }}
                    />
                  </div>

                  {/* Tarih etiketi */}
                  <div 
                    className={`
                      absolute left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-md
                      text-xs font-medium whitespace-nowrap backdrop-blur-sm
                      ${isMobile ? 'top-[100px]' : isTop ? 'bottom-[100px]' : 'top-[15px]'}
                    `}
                    style={{ color: text, backgroundColor: `${bg}CC` }}
                  >
                    {formatDate(event.event_date)}
                  </div>
                  
                  {/* İçerik kartı */}
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      borderColor: bg,
                      boxShadow: `0 0 20px ${bg}40`
                    }}
                    className={`
                      absolute left-1/2 -translate-x-1/2 w-full p-4 rounded-lg
                      bg-card/80 backdrop-blur-sm border border-border/50
                      shadow-lg transition-all duration-300
                      cursor-pointer
                      ${isMobile ? 'top-32' : isTop ? 'top-0' : 'top-[45px]'}
                    `}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {getDescription(event, 'short')}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {getDescription(event, 'long')}
                      </p>
                      <div className="text-[10px] text-muted-foreground/70 mt-1">
                        {language === 'en' ? 'Click for details' : 'Detaylar için tıklayın'}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )})}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detay Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="bg-background/90 backdrop-blur-sm border-border/50 max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {getDescription(selectedEvent, 'short')}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {formatDate(selectedEvent.event_date)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {getDescription(selectedEvent, 'long')}
                </p>

                {selectedEvent.source_url && (
                  <div className="pt-4 border-t border-border/50">
                    <a
                      href={selectedEvent.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <span>{language === 'en' ? 'Source' : 'Kaynak'}</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}