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
    className: 'custom-marker pulse-marker',
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// ====================== 地图内部子组件 ======================

// 地图控制器：处理路线切换时的 fitBounds 和搜索时的 flyTo
function MapController({
  routeId,
  searchTrigger,
}: {
  routeId: string;
  searchTrigger: { locationId: string; ts: number } | null;
}) {
  const map = useMap();
  const lastRouteIdRef = useRef<string | null>(null);
  const lastSearchTsRef = useRef(0);

  // 路线切换时自动适配视图（仅在 routeId 真正变化时触发）
  useEffect(() => {
    if (routeId === lastRouteIdRef.current) return;
    lastRouteIdRef.current = routeId;

    const route = getRouteById(routeId);
    if (!route || route.locations.length === 0) return;

    const positions: [number, number][] = route.locations
      .map((id) => BIBLE_LOCATIONS[id])
      .filter(Boolean)
      .map((loc) => [loc.lat, loc.lng] as [number, number]);

    if (positions.length === 0) return;

    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [map, routeId]);

  // 搜索定位：通过 searchTrigger 的时间戳确保每次搜索都触发
  useEffect(() => {
    if (!searchTrigger || searchTrigger.ts <= lastSearchTsRef.current) return;
    lastSearchTsRef.current = searchTrigger.ts;

    const loc = BIBLE_LOCATIONS[searchTrigger.locationId];
    if (!loc) return;

    // 使用 flyTo 实现平滑飞行动画
    map.flyTo([loc.lat, loc.lng], 11, { animate: true, duration: 1.2 });
  }, [map, searchTrigger]);

  return null;
}

// 动态流动路线：底层光晕 + 顶层金色流动虚线
function AnimatedRoute({
  positionsKey,
  positions,
}: {
  positionsKey: string;
  positions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length < 2) return;

    // 底层光晕：更宽的半透明路线，呼吸效果
    const glow = L.polyline(positions, {
      color: '#ffffff',
      weight: 7,
      opacity: 0.35,
      className: 'animated-route-glow',
    }).addTo(map);

    // 顶层流动虚线：金色醒目
    const flow = L.polyline(positions, {
      color: '#ffd700',
      weight: 3,
      opacity: 0.9,
      dashArray: '12 18',
      className: 'animated-route-flow',
    }).addTo(map);

    return () => {
      map.removeLayer(glow);
      map.removeLayer(flow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, positionsKey]);

  return null;
}

// 地图主内容（稳定子组件，避免 TileLayer 不必要的重挂载）
function MapContent({
  routeId,
  searchTrigger,
}: {
  routeId: string;
  searchTrigger: { locationId: string; ts: number } | null;
}) {
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
        .map((loc) => [loc.lat, loc.lng] as [number, number]),
    [route]
  );
  // 用字符串 key 代替数组引用，避免 useEffect 因引用变化而重复触发
  const positionsKey = useMemo(
    () => orderedPositions.map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join('|'),
    [orderedPositions]
  );
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // 搜索时自动打开对应地点的 popup
  useEffect(() => {
    if (!searchTrigger) return;
    // 延迟打开 popup，等待 flyTo 动画完成
    const timer = setTimeout(() => {
      const marker = markerRefs.current[searchTrigger.locationId];
      if (marker) {
        marker.openPopup();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTrigger]);

  return (
    <>
      {/* 高德地图瓦片（深色风格 style=7，适合圣经主题） */}
      <TileLayer
        attribution='&copy; 高德地图'
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
        subdomains="1234"
        maxZoom={18}
        maxNativeZoom={18}
        keepBuffer={4}
        updateWhenZooming={false}
      />

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes dashFlow {
          to { stroke-dashoffset: -60; }
        }
        .animated-route-flow {
          animation: dashFlow 1.5s linear infinite;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animated-route-glow {
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        @keyframes markerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
        }
        .pulse-marker > div {
          animation: markerPulse 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* 静态底层路线 */}
      <Polyline
        positions={orderedPositions}
        pathOptions={{ color: route.color, weight: 3, opacity: 0.75, dashArray: '6 8' }}
      />

      {/* 动态流动路线：光晕 + 金色流动虚线 */}
      <AnimatedRoute positionsKey={positionsKey} positions={orderedPositions} />

      {/* 地点标记 */}
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

      {/* 地图控制器 */}
      <MapController routeId={routeId} searchTrigger={searchTrigger} />
    </>
  );
}

// ====================== 主组件 ======================

interface MapComponentProps {
  routeId: string;
  searchTrigger: { locationId: string; ts: number } | null;
}

export default function MapComponent({ routeId, searchTrigger }: MapComponentProps) {
  return (
    <MapContainer
      key="bible-map"
      center={[33.5, 35.5]}
      zoom={6}
      scrollWheelZoom
      zoomControl
      className="h-full w-full"
      style={{ background: '#f5f0e8' }}
    >
      <MapContent routeId={routeId} searchTrigger={searchTrigger} />
    </MapContainer>
  );
}

// ====================== 搜索框与路线选择器 ======================

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
          <ul className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-bible-warm max-h-48 overflow-auto z-50">
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