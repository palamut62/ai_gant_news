'use client';

import { motion } from 'framer-motion';
import { AIEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TimelineCardProps {
  event: AIEvent;
  index: number;
}

export function TimelineCard({ event, index }: TimelineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="timeline-card"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="timeline-item group cursor-pointer">
            <div className="timeline-title line-clamp-2 group-hover:text-primary">
              {event.short_description}
            </div>
            <div className="timeline-date">
              {formatDate(event.event_date)}
            </div>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{event.short_description}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(event.event_date)}
            </p>
            <p className="text-sm">{event.long_description}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </motion.div>
  );
}