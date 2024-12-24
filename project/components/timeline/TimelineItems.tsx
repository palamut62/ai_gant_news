'use client';

import { AIEvent } from '@/lib/types';
import { formatDate, truncateText } from '@/lib/utils';

interface TimelineItemsProps {
  events: AIEvent[];
}

export function TimelineItems({ events }: TimelineItemsProps) {
  return events.map((event, index) => ({
    id: event.id,
    content: `
      <div class="timeline-item-wrapper">
        <div class="timeline-item">
          <div class="timeline-title">${truncateText(event.short_description, 100)}</div>
          <div class="timeline-date">${formatDate(event.event_date)}</div>
        </div>
      </div>
    `,
    start: event.event_date,
    event: event,
    className: `timeline-item-${index % 2 === 0 ? 'left' : 'right'}`
  }));
}