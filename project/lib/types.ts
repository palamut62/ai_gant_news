export interface AIEvent {
  id: number;
  event_date: string;
  short_description: string;
  long_description: string;
  created_at: string;
  category?: string;
}

export interface TimelineOptions {
  height?: string;
  width?: string;
  minDate?: Date;
  maxDate?: Date;
  zoomMin?: number;
  zoomMax?: number;
  orientation?: 'top' | 'bottom' | 'both';
  stack?: boolean;
  showCurrentTime?: boolean;
}