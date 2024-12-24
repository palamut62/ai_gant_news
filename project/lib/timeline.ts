import { TimelineOptions } from './types';

export const DEFAULT_TIMELINE_OPTIONS: TimelineOptions = {
  height: '80vh',
  width: '100%',
  minDate: new Date(2022, 0, 1),
  maxDate: new Date(2024, 11, 31),
  zoomMin: 1000 * 60 * 60 * 24 * 31, // One month
  zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // Two years
  orientation: 'both',
  stack: false,
  showCurrentTime: false,
};

export function getTimelineOptions(customOptions?: Partial<TimelineOptions>) {
  return {
    ...DEFAULT_TIMELINE_OPTIONS,
    ...customOptions,
    margin: { item: { horizontal: 40, vertical: 20 } },
    verticalScroll: true,
    horizontalScroll: true,
    timeAxis: { scale: 'month', step: 1 },
    format: {
      minorLabels: { month: 'MM', year: 'yyyy' }
    },
    zoomable: true,
    moveable: true,
  };
}