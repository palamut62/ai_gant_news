'use client';

import { formatDate } from '@/lib/utils';
import { AIEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineDialogProps {
  event: AIEvent | null;
  onClose: () => void;
}

export function TimelineDialog({ event, onClose }: TimelineDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-100">{event.short_description}</DialogTitle>
        </DialogHeader>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {formatDate(event.event_date)}
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.long_description}</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}