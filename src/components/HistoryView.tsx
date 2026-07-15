import Header from '@stevederico/skateboard-ui/Header';
import { Skeleton } from '@stevederico/skateboard-ui/shadcn/ui/skeleton';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '@stevederico/skateboard-ui/Utilities';
import type { Booking } from '../types/spots';

/**
 * Renter booking history (Park Here transactions).
 *
 * @component
 * @returns History view
 */
export default function HistoryView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Booking[]>('/bookings');
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header title="History" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {loading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No parking sessions yet.{' '}
            <Link to="/app/home" className="underline underline-offset-4">
              Browse spots
            </Link>
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {bookings.map((b) => (
            <li
              key={b._id}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {b.spot ? (
                    <Link
                      to={`/app/spots/${b.spotId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {b.spot.title}
                    </Link>
                  ) : (
                    'Spot'
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRange(b.timeIn, b.timeOut)} · {b.status}
                </p>
              </div>
              <p className="text-lg font-semibold">${b.total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * Format a booking time range for display.
 *
 * @param start - Start ms
 * @param end - End ms
 * @returns Human-readable range
 */
function formatRange(start: number, end: number): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return `${new Date(start).toLocaleString(undefined, opts)} → ${new Date(end).toLocaleString(undefined, opts)}`;
}
