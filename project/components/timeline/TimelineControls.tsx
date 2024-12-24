'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, ZoomIn, ZoomOut, Filter } from 'lucide-react';

interface TimelineControlsProps {
  onZoomChange: (zoom: number) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function TimelineControls({
  onZoomChange,
  onCategoryChange,
  categories,
}: TimelineControlsProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    onZoomChange(newZoom);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <ZoomOut className="w-4 h-4 text-muted-foreground" />
        <Slider
          defaultValue={[1]}
          max={2}
          min={0.5}
          step={0.1}
          value={[zoom]}
          onValueChange={handleZoomChange}
          className="w-32"
        />
        <ZoomIn className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}