import Header from '@stevederico/skateboard-ui/Header';
import { Button } from '@stevederico/skateboard-ui/shadcn/ui/button';
import { Input } from '@stevederico/skateboard-ui/shadcn/ui/input';
import { Skeleton } from '@stevederico/skateboard-ui/shadcn/ui/skeleton';
import { List, Map as MapIcon, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '@stevederico/skateboard-ui/Utilities';
import type { Spot } from '../types/spots';
import SpotMap from './SpotMap';

/**
 * Browse parking spots — map + list (ParkPro home).
 *
 * @component
 * @returns Spot browse view
 */
export default function HomeView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Spot[]>('/spots');
        if (!cancelled) setSpots(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.streetAddress.toLowerCase().includes(q) ||
        s.style.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
    );
  }, [spots, query]);

  // Keep the list card in view when a map pin is selected
  useEffect(() => {
    if (!selectedId) return;
    const node = cardRefs.current.get(selectedId);
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  return (
    <>
      <Header title="Spots">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
          >
            <MapIcon size={16} aria-hidden="true" className="mr-1" />
            Map
          </Button>
          <Button
            size="sm"
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <List size={16} aria-hidden="true" className="mr-1" />
            List
          </Button>
        </div>
      </Header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Search by title, city, style…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search spots"
          />
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && view === 'map' && (
          <div className="flex flex-col gap-4">
            <SpotMap
              spots={filtered}
              selectedId={selectedId}
              onSelect={(s) => setSelectedId(s._id)}
            />
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((spot) => (
                <li
                  key={spot._id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(spot._id, el);
                    else cardRefs.current.delete(spot._id);
                  }}
                >
                  <SpotCard
                    spot={spot}
                    selected={spot._id === selectedId}
                    onFocus={() => setSelectedId(spot._id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && !error && view === 'list' && (
          <ul className="flex flex-col gap-2">
            {filtered.map((spot) => (
              <li key={spot._id}>
                <SpotCard spot={spot} />
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No spots match your search.</p>
        )}
      </div>
    </>
  );
}

/**
 * Compact spot row/card linking to detail.
 *
 * @param props - Spot card props
 * @returns Link card
 */
function SpotCard({
  spot,
  selected,
  onFocus,
}: {
  spot: Spot;
  selected?: boolean;
  onFocus?: () => void;
}) {
  return (
    <Link
      to={`/app/spots/${spot._id}`}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
        selected ? 'border-primary bg-accent/30' : 'border-border bg-card'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{spot.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {spot.style} · {spot.streetAddress}, {spot.city}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold text-foreground">${spot.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">/ hour</p>
      </div>
    </Link>
  );
}
