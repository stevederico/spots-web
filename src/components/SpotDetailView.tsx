import Header from '@stevederico/skateboard-ui/Header';
import { Button } from '@stevederico/skateboard-ui/shadcn/ui/button';
import { Input } from '@stevederico/skateboard-ui/shadcn/ui/input';
import { Label } from '@stevederico/skateboard-ui/shadcn/ui/label';
import { Skeleton } from '@stevederico/skateboard-ui/shadcn/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@stevederico/skateboard-ui/shadcn/ui/card';
import { Car } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiRequest, getCSRFToken } from '@stevederico/skateboard-ui/Utilities';
import type { Booking, Spot } from '../types/spots';
import { SpotOsmEmbed } from './SpotMap';

/**
 * Listing detail + Park Here booking flow.
 *
 * @component
 * @returns Spot detail view
 */
export default function SpotDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [timeIn, setTimeIn] = useState(() => toLocalInput(Date.now() + 15 * 60 * 1000));
  const [timeOut, setTimeOut] = useState(() => toLocalInput(Date.now() + 2 * 60 * 60 * 1000));
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Spot>(`/spots/${id}`);
        if (!cancelled) setSpot(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const total = useMemo(() => {
    if (!spot) return 0;
    const start = new Date(timeIn).getTime();
    const end = new Date(timeOut).getTime();
    if (!(end > start)) return 0;
    const hours = Math.max((end - start) / (1000 * 60 * 60), 0.25);
    return Math.round(spot.price * hours * 100) / 100;
  }, [spot, timeIn, timeOut]);

  /**
   * Create a booking for this spot.
   */
  async function handleParkHere() {
    if (!spot) return;
    const start = new Date(timeIn).getTime();
    const end = new Date(timeOut).getTime();
    if (!(end > start)) {
      setBookError('End time must be after start time');
      return;
    }
    setBooking(true);
    setBookError(null);
    try {
      const csrfToken = getCSRFToken();
      await apiRequest<Booking>('/bookings', {
        method: 'POST',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
        body: JSON.stringify({ spotId: spot._id, timeIn: start, timeOut: end }),
      });
      navigate('/app/history');
    } catch (err) {
      setBookError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBooking(false);
    }
  }

  return (
    <>
      <Header title={spot?.title ?? 'Spot'} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {loading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {spot && (
          <>
            <SpotOsmEmbed
              latitude={spot.latitude}
              longitude={spot.longitude}
              title={spot.title}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-balance">{spot.title}</CardTitle>
                  <CardDescription>
                    {spot.streetAddress}, {spot.city}, {spot.state} {spot.zipcode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <Row label="Type" value={spot.style} />
                  <Row label="Price / hr" value={`$${spot.price.toFixed(2)}`} />
                  <Row label="Overnight" value={`$${spot.overnight.toFixed(2)}`} />
                  <Row
                    label="Status"
                    value={spot.isAvailable ? 'Available' : 'Unavailable'}
                  />
                  <div>
                    <p className="mb-1 text-muted-foreground">Summary</p>
                    <p className="text-pretty text-foreground">{spot.summary}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Park Here</CardTitle>
                  <CardDescription>Choose your time window and confirm.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="time-in">Time in</Label>
                    <Input
                      id="time-in"
                      type="datetime-local"
                      value={timeIn}
                      onChange={(e) => setTimeIn(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="time-out">Time out</Label>
                    <Input
                      id="time-out"
                      type="datetime-local"
                      value={timeOut}
                      onChange={(e) => setTimeOut(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span className="text-sm text-muted-foreground">Total due</span>
                    <span className="text-lg font-semibold">${total.toFixed(2)}</span>
                  </div>
                  {bookError && (
                    <p className="text-sm text-destructive" role="alert">
                      {bookError}
                    </p>
                  )}
                  <Button
                    onClick={handleParkHere}
                    disabled={booking || !spot.isAvailable}
                    className="w-full"
                  >
                    <Car size={16} aria-hidden="true" className="mr-2" />
                    {booking ? 'Booking…' : spot.isAvailable ? 'Buy' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/**
 * Label/value row for listing attributes.
 *
 * @param props - label and value
 * @returns Row
 */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/**
 * Format a timestamp for datetime-local input.
 *
 * @param ms - Unix ms
 * @returns Local datetime string
 */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
