'use client';

import { formatDate } from '@/lib/utils';
import { AIEvent } from '@/lib/types';

interface TimelineItemProps {
  event: AIEvent;
}

export function TimelineItem({ event }: TimelineItemProps) {
  return (
    <div className="timeline-item">
      <div className="timeline-title line-clamp-2">{event.short_description}</div>
      <div className="timeline-date">
        {formatDate(event.event_date)}
      </div>
    </div>
  );
}