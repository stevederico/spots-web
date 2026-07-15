import { useEffect, useId, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../types/spots';

/** CARTO Voyager — clean, readable basemap (no API key). */
const LIGHT_TILES =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
/** CARTO Dark Matter — matches app dark theme. */
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const SF_CENTER: L.LatLngExpression = [37.7749, -122.4194];
const DEFAULT_ZOOM = 13;
const DETAIL_ZOOM = 16;

interface SpotMapProps {
  /** Spots to plot. */
  spots: Spot[];
  /** Selected spot id (highlighted + focused). */
  selectedId?: string;
  /** Called when a pin is activated. */
  onSelect?: (spot: Spot) => void;
  /** Map height/layout class. */
  className?: string;
}

/**
 * Escape text for safe injection into marker HTML.
 *
 * @param value - Raw string
 * @returns HTML-escaped string
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Format hourly price for pin label (whole dollars when clean).
 *
 * @param price - Hourly rate
 * @returns Display string with $
 */
function formatPinPrice(price: number): string {
  const rounded = Math.round(price);
  if (Math.abs(price - rounded) < 0.01) return `$${rounded}`;
  return `$${price.toFixed(2)}`;
}

/**
 * Whether the document is currently in dark mode.
 *
 * @returns true when `html.dark` is set
 */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * Prefer reduced motion when set by the user.
 *
 * @returns true when fly animations should be skipped
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Build an Airbnb-style price pill DivIcon.
 *
 * @param price - Hourly rate
 * @param selected - Whether this pin is selected
 * @param title - Accessible name
 * @returns Leaflet DivIcon
 */
function createPriceIcon(price: number, selected: boolean, title: string): L.DivIcon {
  const label = formatPinPrice(price);
  const selectedClass = selected ? ' is-selected' : '';
  return L.divIcon({
    className: `spot-pin${selectedClass}`,
    html: `<span class="spot-pin__label" role="img" aria-label="${escapeHtml(title)}, ${escapeHtml(label)} per hour">${escapeHtml(label)}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

/**
 * Location dot icon for single-spot detail maps.
 *
 * @param title - Accessible name
 * @returns Leaflet DivIcon
 */
function createDotIcon(title: string): L.DivIcon {
  return L.divIcon({
    className: 'spot-pin is-selected spot-pin--dot',
    html: `<span class="spot-pin__label spot-pin__label--dot" role="img" aria-label="${escapeHtml(title)}"></span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

/**
 * Popup HTML for a spot (plain links — no React root needed).
 *
 * @param spot - Spot to describe
 * @returns Popup markup
 */
function popupHtml(spot: Spot): string {
  const href = `/app/spots/${encodeURIComponent(spot._id)}`;
  return `
    <div class="spot-pin-popup">
      <p class="spot-pin-popup__title">${escapeHtml(spot.title)}</p>
      <p class="spot-pin-popup__meta">${escapeHtml(spot.style)} · ${escapeHtml(spot.streetAddress)}</p>
      <p class="spot-pin-popup__price">${escapeHtml(formatPinPrice(spot.price))}<span>/hr</span></p>
      <a class="spot-pin-popup__link" href="${href}">View spot</a>
    </div>
  `;
}

/**
 * Fit the map to spot coordinates (or SF default when empty).
 *
 * @param map - Leaflet map
 * @param spots - Spots to frame
 */
function fitSpots(map: L.Map, spots: Spot[]): void {
  if (spots.length === 0) {
    map.setView(SF_CENTER, DEFAULT_ZOOM);
    return;
  }

  if (spots.length === 1) {
    const only = spots[0];
    if (!only) return;
    const target: L.LatLngExpression = [only.latitude, only.longitude];
    if (prefersReducedMotion()) map.setView(target, 15);
    else map.flyTo(target, 15, { duration: 0.55 });
    return;
  }

  const points: L.LatLngTuple[] = spots.map((s) => [s.latitude, s.longitude]);
  const bounds = L.latLngBounds(points);
  map.fitBounds(bounds.pad(0.18), {
    animate: !prefersReducedMotion(),
    maxZoom: 15,
  });
}

/**
 * Interactive multi-pin map of parking spots (Leaflet + CARTO tiles).
 *
 * Fits bounds to inventory, supports selection, dark-mode tiles, and
 * keyboard-friendly price markers. No map API key required.
 *
 * @param props - SpotMap props
 * @returns Map region
 */
export default function SpotMap({ spots, selectedId, onSelect, className }: SpotMapProps) {
  const mapId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tilesRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const layerRef = useRef<L.LayerGroup | null>(null);
  const spotsRef = useRef(spots);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  /** Last spot-id signature we fit the camera to — avoid re-fit on selection-only updates. */
  const fitSignatureRef = useRef<string>('');

  spotsRef.current = spots;
  selectedIdRef.current = selectedId;
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(SF_CENTER, DEFAULT_ZOOM);

    const tiles = L.tileLayer(isDarkMode() ? DARK_TILES : LIGHT_TILES, {
      attribution: TILE_ATTR,
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    mapRef.current = map;
    tilesRef.current = tiles;
    layerRef.current = layer;

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(el);
    requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    const themeObserver = new MutationObserver(() => {
      tilesRef.current?.setUrl(isDarkMode() ? DARK_TILES : LIGHT_TILES);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      tilesRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
      fitSignatureRef.current = '';
    };
  }, []);

  // Sync markers when the spot list changes (not on selection alone)
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    const selected = selectedIdRef.current;

    for (const spot of spots) {
      const isSelected = spot._id === selected;
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: createPriceIcon(spot.price, isSelected, spot.title),
        riseOnHover: true,
        keyboard: true,
        title: `${spot.title} — ${formatPinPrice(spot.price)}/hr`,
        zIndexOffset: isSelected ? 1000 : 0,
      });
      marker.bindPopup(popupHtml(spot), {
        closeButton: true,
        offset: L.point(0, -28),
        className: 'spot-pin-popup-wrap',
      });
      marker.on('click', () => {
        onSelectRef.current?.(spot);
      });
      marker.addTo(layer);
      markersRef.current.set(spot._id, marker);
    }

    // Fit when inventory set changes; avoid fighting user pan on re-select
    const signature = spots.map((s) => s._id).join(',');
    if (fitSignatureRef.current !== signature) {
      fitSignatureRef.current = signature;
      fitSpots(map, spots);
    }
  }, [spots]);

  // Highlight + fly to selected pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of markersRef.current) {
      const spot = spotsRef.current.find((s) => s._id === id);
      if (!spot) continue;
      const isSelected = id === selectedId;
      marker.setIcon(createPriceIcon(spot.price, isSelected, spot.title));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
      if (!isSelected) marker.closePopup();
    }

    if (!selectedId) return;

    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    const ll = marker.getLatLng();
    const zoom = Math.max(map.getZoom(), 14);
    if (prefersReducedMotion()) {
      map.setView(ll, zoom, { animate: false });
    } else {
      map.flyTo(ll, zoom, { duration: 0.45 });
    }
    marker.openPopup();
  }, [selectedId]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border ${className ?? 'h-[min(70vh,36rem)] min-h-72 w-full'}`}
      role="region"
      aria-label="Map of parking spots"
    >
      <div
        ref={containerRef}
        id={mapId}
        className="spot-map absolute inset-0 z-0 size-full bg-muted"
      />
      {spots.length === 0 && (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40 text-sm text-muted-foreground backdrop-blur-[1px]">
          No spots to show on the map
        </p>
      )}
    </div>
  );
}

/**
 * Single-spot location map (real tiles) for listing detail.
 *
 * @param props - center lat/lng and optional className
 * @returns Map embed
 */
export function SpotOsmEmbed({
  latitude,
  longitude,
  className,
  title = 'Spot location',
}: {
  latitude: number;
  longitude: number;
  className?: string;
  title?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
    }).setView([latitude, longitude], DETAIL_ZOOM);

    const tiles = L.tileLayer(isDarkMode() ? DARK_TILES : LIGHT_TILES, {
      attribution: TILE_ATTR,
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    L.marker([latitude, longitude], {
      icon: createDotIcon(title),
      keyboard: true,
      title,
    }).addTo(map);

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(el);
    requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    const themeObserver = new MutationObserver(() => {
      tiles.setUrl(isDarkMode() ? DARK_TILES : LIGHT_TILES);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
      map.remove();
    };
  }, [latitude, longitude, title]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border ${className ?? 'h-64 w-full md:h-80'}`}
      role="region"
      aria-label={title}
    >
      <div ref={containerRef} className="spot-map absolute inset-0 size-full bg-muted" />
    </div>
  );
}
