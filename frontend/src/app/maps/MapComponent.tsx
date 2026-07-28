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
import { useI18n } from '@/i18n/I18nContext';

// 带序号+中文名称的标记图标
function labeledIcon(number: number, name: string, color: string) {
  return L.divIcon({
    className: 'custom-marker-label',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div class="marker-circle" style="
        background-color: ${color};
        color: white;
        width: 28px; height: 28px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">${number}</div>
      <div class="marker-label" style="
        margin-top: 2px;
        font-size: 12px; font-weight: 700;
        color: #1a1a2e;
        white-space: nowrap;
        background: rgba(255,255,255,0.88);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.12);
        text-shadow: 0 0 2px rgba(255,255,255,0.9);
        line-height: 1.3;
        pointer-events: none;
      ">${name}</div>
    </div>`,
    iconSize: [120, 48],
    iconAnchor: [60, 48],
    popupAnchor: [0, -50],
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

    // 使用 flyTo 实现平滑飞行动画，zoom 14 获得城市级清晰视图
    map.flyTo([loc.lat, loc.lng], 14, { animate: true, duration: 1.2 });
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
      {/* OSM 法国镜像：全球覆盖，作为底层 */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
        subdomains={['a', 'b', 'c']}
        maxZoom={20}
        maxNativeZoom={20}
        keepBuffer={20}
        updateWhenZooming={false}
        updateInterval={150}
        crossOrigin={true}
        tileSize={256}
      />
      {/* 高德地图：限定中国范围，国内加载极快，覆盖在 OSM 之上 */}
      <TileLayer
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        subdomains={['1', '2', '3', '4']}
        bounds={[[18, 73], [54, 135]]}
        maxZoom={18}
        maxNativeZoom={18}
        keepBuffer={20}
        updateWhenZooming={false}
        updateInterval={150}
        crossOrigin={true}
        tileSize={256}
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
        .custom-marker-label .marker-circle {
          animation: markerPulse 2.5s ease-in-out infinite;
        }
        .custom-marker-label .marker-label {
          transition: opacity 0.2s;
        }
        /* 缩小地图时标签透明度降低，减少视觉杂乱 */
        .leaflet-zoom-anim .custom-marker-label .marker-label {
          opacity: 0.5;
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
          icon={labeledIcon(index + 1, loc.name, route.color)}
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
      fadeAnimation={false}
      zoomAnimation={false}
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
  const { t } = useI18n();

  const getMatchedLocations = (value: string) => {
    const q = value.toLowerCase().trim();
    if (!q) return [];
    return SEARCHABLE_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.id.toLowerCase().includes(q) ||
        (loc.nameEn && loc.nameEn.toLowerCase().includes(q))
    ).slice(0, 8);
  };

  const getMatchedLocations = (value: string) => {
    const q = value.toLowerCase().trim();
    if (!q) return [];
    return SEARCHABLE_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.id.toLowerCase().includes(q) ||
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
    // 优先精确匹配名称（忽略大小写）；否则取第一个建议
    const exact = matched.find((loc) => loc.name.toLowerCase() === query.trim().toLowerCase());
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
          {t('maps.routeLabel')}
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
          {t('maps.searchLabel')}
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
placeholder={t('maps.searchPlaceholder')}
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