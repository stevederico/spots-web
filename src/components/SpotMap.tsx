import { useMemo } from 'react';
import type { Spot } from '../types/spots';

interface SpotMapProps {
  /** Spots to plot. */
  spots: Spot[];
  /** Selected spot id (highlighted). */
  selectedId?: string;
  /** Called when a pin is activated. */
  onSelect?: (spot: Spot) => void;
  /** Map height class. */
  className?: string;
}

/**
 * Dependency-free pin map: plots spots in a lat/lng bounding box.
 *
 * Uses proportional positioning (no tile library). Good enough for browse;
 * listing detail uses an OpenStreetMap embed for real geography.
 *
 * @param props - SpotMap props
 * @returns Pin map region
 */
export default function SpotMap({ spots, selectedId, onSelect, className }: SpotMapProps) {
  const bounds = useMemo(() => {
    if (spots.length === 0) {
      return { minLat: 37.75, maxLat: 37.81, minLng: -122.45, maxLng: -122.38 };
    }
    const lats = spots.map((s) => s.latitude);
    const lngs = spots.map((s) => s.longitude);
    const padLat = 0.008;
    const padLng = 0.01;
    return {
      minLat: Math.min(...lats) - padLat,
      maxLat: Math.max(...lats) + padLat,
      minLng: Math.min(...lngs) - padLng,
      maxLng: Math.max(...lngs) + padLng,
    };
  }, [spots]);

  /**
   * Convert lat/lng to percent position within bounds.
   *
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns CSS left/top percentages
   */
  function toPos(lat: number, lng: number): { left: string; top: string } {
    const x = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1);
    const y = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1);
    return {
      left: `${Math.min(98, Math.max(2, x * 100))}%`,
      top: `${Math.min(98, Math.max(2, y * 100))}%`,
    };
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-muted ${className ?? 'h-72 md:h-96'}`}
      role="img"
      aria-label="Map of parking spots"
    >
      {/* Grid backdrop suggests a map without external tiles */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/10" />

      {spots.map((spot) => {
        const pos = toPos(spot.latitude, spot.longitude);
        const selected = spot._id === selectedId;
        return (
          <button
            key={spot._id}
            type="button"
            className={`absolute -translate-x-1/2 -translate-y-full rounded-md px-2 py-1 text-xs font-medium shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selected
                ? 'z-10 scale-110 bg-primary text-primary-foreground'
                : 'bg-card text-card-foreground hover:scale-105'
            }`}
            style={{ left: pos.left, top: pos.top }}
            onClick={() => onSelect?.(spot)}
            aria-label={`${spot.title}, $${spot.price.toFixed(2)} per hour`}
            aria-pressed={selected}
          >
            ${spot.price.toFixed(0)}
            <span
              className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-6 border-x-transparent ${
                selected ? 'border-t-primary' : 'border-t-card'
              }`}
              aria-hidden
            />
          </button>
        );
      })}

      {spots.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No spots to show on the map
        </p>
      )}
    </div>
  );
}

/**
 * OpenStreetMap embed for a single spot (real tiles, no npm map dep).
 *
 * @param props - center lat/lng and optional className
 * @returns iframe embed
 */
export function SpotOsmEmbed({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const d = 0.008;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - d}%2C${latitude - d}%2C${longitude + d}%2C${latitude + d}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  return (
    <iframe
      title="Spot location map"
      className={className ?? 'h-56 w-full rounded-lg border border-border'}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
