'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { DEFAULT_ROUTE_ID } from '@/data/bibleMaps';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-bible-cream">
      <div className="text-bible-gold text-lg animate-pulse">地图加载中...</div>
    </div>
  ),
});

const MapControls = dynamic(
  () => import('./MapComponent').then((mod) => mod.MapControls),
  { ssr: false }
);

export default function BibleMapsPage() {
  const [routeId, setRouteId] = useState(DEFAULT_ROUTE_ID);
  const [searchLocationId, setSearchLocationId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[calc(100vh-7rem)] min-h-[500px] -mx-4 -my-8 sm:-mx-4">
      <MapControls
        routeId={routeId}
        onRouteChange={setRouteId}
        onSearch={setSearchLocationId}
      />
      <MapComponent routeId={routeId} searchLocationId={searchLocationId} />

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-bible-warm px-3 py-2 text-xs text-bible-muted max-w-xs">
        提示：坐标为近似值，仅用于辅助读经，不代表考古定论。
      </div>
    </div>
  );
}
