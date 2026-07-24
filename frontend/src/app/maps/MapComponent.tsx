'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BIBLE_LOCATIONS,
  BIBLE_ROUTES,
  BibleLocation,
  DEFAULT_ROUTE_ID,
  SEARCHABLE_LOCATIONS,
  getRouteById,
  getRouteLocations,
} from '@/data/bibleMaps';

// 带序号的自定义标记图标
function numberedIcon(number: number, color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// 控制地图视野：路线切换时适配边界，搜索时飞抵目标地点
function MapViewportController({
  orderedPositions,
  searchLocationId,
}: {
  orderedPositions: [number, number][];
  searchLocationId: string | null;
}) {
  const map = useMap();
  const lastSearchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (orderedPositions.length === 0) return;
    const bounds = L.latLngBounds(orderedPositions.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
  }, [map, orderedPositions]);

  useEffect(() => {
    if (!searchLocationId || searchLocationId === lastSearchIdRef.current) return;
    const loc = BIBLE_LOCATIONS[searchLocationId];
    if (loc) {
      lastSearchIdRef.current = searchLocationId;
      // 使用 panTo + setZoom 替代 flyTo，减少动画过程中瓦片不加载的等待感
      map.panTo([loc.lat, loc.lng], { animate: true, duration: 0.6 });
      map.setZoom(11, { animate: true });
    }
  }, [map, searchLocationId]);

  return null;
}

interface MapComponentProps {
  routeId: string;
  searchLocationId: string | null;
}

export default function MapComponent({ routeId, searchLocationId }: MapComponentProps) {
  const route = useMemo(
    () => getRouteById(routeId) || getRouteById(DEFAULT_ROUTE_ID)!,
    [routeId]
  );
  const uniqueLocations = useMemo(() => getRouteLocations(route), [route]);
  const orderedPositions = useMemo<[number, number][]>(
    () =>
      route.locations
        .map((id) => BIBLE_LOCATIONS[id])
        .filter(Boolean)
        .map((loc) => [loc.lat, loc.lng]),
    [route]
  );
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // 搜索时打开对应 popup
  useEffect(() => {
    if (!searchLocationId) return;
    const marker = markerRefs.current[searchLocationId];
    if (marker) {
      marker.openPopup();
    }
  }, [searchLocationId]);

  return (
    <MapContainer
      center={[33.5, 35.5]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: '#f5f0e8' }}
    >
      <TileLayer
        attribution='&copy; 高德地图'
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
        subdomains="1234"
        maxZoom={18}
        maxNativeZoom={18}
        keepBuffer={6}
        detectRetina
      />
      <Polyline
        positions={orderedPositions}
        pathOptions={{ color: route.color, weight: 3, opacity: 0.85, dashArray: '6 8' }}
      />
      {uniqueLocations.map((loc, index) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={numberedIcon(index + 1, route.color)}
          ref={(ref) => {
            markerRefs.current[loc.id] = ref;
          }}
        >
          <Popup>
            <div className="min-w-[200px] max-w-[260px]">
              <h3 className="text-base font-bold text-bible-dark mb-1">
                {index + 1}. {loc.name}
                {loc.nameEn && (
                  <span className="text-xs font-normal text-bible-muted ml-1">
                    {loc.nameEn}
                  </span>
                )}
              </h3>
              <p className="text-xs text-bible-muted mb-2">{loc.description}</p>
              <div className="text-xs mb-1">
                <span className="font-semibold text-bible-gold">经文：</span>
                <span className="text-bible-text">{loc.scripture}</span>
              </div>
              <div className="text-xs leading-relaxed text-bible-text">
                <span className="font-semibold text-bible-gold">意义：</span>
                {loc.significance}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapViewportController
        orderedPositions={orderedPositions}
        searchLocationId={searchLocationId}
      />
    </MapContainer>
  );
}

// 搜索框与路线选择器
export function MapControls({
  routeId,
  onRouteChange,
  onSearch,
}: {
  routeId: string;
  onRouteChange: (id: string) => void;
  onSearch: (locationId: string | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BibleLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const route = getRouteById(routeId) || getRouteById(DEFAULT_ROUTE_ID)!;

  const getMatchedLocations = (value: string) => {
    const q = value.toLowerCase().trim();
    if (!q) return [];
    return SEARCHABLE_LOCATIONS.filter(
      (loc) =>
        loc.name.includes(value) ||
        (loc.nameEn && loc.nameEn.toLowerCase().includes(q))
    ).slice(0, 8);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearch(null);
      return;
    }
    const matched = getMatchedLocations(value);
    setSuggestions(matched);
    setShowSuggestions(true);
  };

  const selectLocation = (loc: BibleLocation) => {
    setQuery(loc.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(loc.id);
    inputRef.current?.blur();
  };

  const executeSearch = () => {
    const matched = getMatchedLocations(query);
    if (matched.length === 0) return;
    // 优先精确匹配名称；否则取第一个建议
    const exact = matched.find((loc) => loc.name === query.trim());
    selectLocation(exact || matched[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row gap-3 pointer-events-none">
      <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-bible-warm p-3 sm:min-w-[260px]">
        <label className="block text-xs font-semibold text-bible-muted mb-1.5">
          选择路线
        </label>
        <select
          value={routeId}
          onChange={(e) => onRouteChange(e.target.value)}
          className="w-full text-sm bg-transparent border border-bible-warm rounded px-2 py-1.5 text-bible-dark focus:outline-none focus:border-bible-gold"
        >
          {BIBLE_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-bible-muted leading-relaxed">
          {route.description}
        </p>
      </div>

      <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-bible-warm p-3 sm:ml-auto sm:min-w-[240px] relative">
        <label className="block text-xs font-semibold text-bible-muted mb-1.5">
          搜索地名
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="输入地名，如：耶路撒冷"
            className="flex-1 text-sm bg-transparent border border-bible-warm rounded px-2 py-1.5 text-bible-dark placeholder:text-bible-muted/60 focus:outline-none focus:border-bible-gold"
          />
          <button
            type="button"
            onClick={executeSearch}
            className="px-3 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors"
          >
            搜索
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-bible-warm max-h-48 overflow-auto">
            {suggestions.map((loc) => (
              <li
                key={loc.id}
                onClick={() => selectLocation(loc)}
                className="px-3 py-2 text-sm text-bible-dark hover:bg-bible-warm/30 cursor-pointer border-b border-bible-warm/50 last:border-0"
              >
                {loc.name}
                {loc.nameEn && (
                  <span className="text-xs text-bible-muted ml-1">{loc.nameEn}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
