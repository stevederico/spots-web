import Header from '@stevederico/skateboard-ui/Header';
import { Button } from '@stevederico/skateboard-ui/shadcn/ui/button';
import { Input } from '@stevederico/skateboard-ui/shadcn/ui/input';
import { Label } from '@stevederico/skateboard-ui/shadcn/ui/label';
import { Textarea } from '@stevederico/skateboard-ui/shadcn/ui/textarea';
import { Skeleton } from '@stevederico/skateboard-ui/shadcn/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@stevederico/skateboard-ui/shadcn/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@stevederico/skateboard-ui/shadcn/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { apiRequest, getCSRFToken } from '@stevederico/skateboard-ui/Utilities';
import type { Spot, SpotInput, SpotStyle } from '../types/spots';

const STYLES: SpotStyle[] = ['Street', 'Driveway', 'Garage'];

const emptyForm: SpotInput = {
  title: '',
  streetAddress: '',
  city: 'San Francisco',
  state: 'CA',
  zipcode: '',
  latitude: 37.7749,
  longitude: -122.4194,
  price: 5,
  overnight: 25,
  style: 'Driveway',
  summary: '',
};

/**
 * Host inventory — list own spots + create listing.
 *
 * @component
 * @returns My spots view
 */
export default function MySpotsView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SpotInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Spot[]>('/spots/mine');
      setSpots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Create a new listing from the form.
   */
  async function handleCreate() {
    setSaving(true);
    setFormError(null);
    try {
      const csrfToken = getCSRFToken();
      await apiRequest<Spot>('/spots', {
        method: 'POST',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create spot');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Soft-delete a listing.
   *
   * @param id - Spot id
   */
  async function handleDelete(id: string) {
    try {
      const csrfToken = getCSRFToken();
      await apiRequest(`/spots/${id}`, {
        method: 'DELETE',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <>
      <Header title="My Spots">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="default">
              <Plus size={16} aria-hidden="true" className="mr-1" />
              List a Spot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>List a parking spot</DialogTitle>
              <DialogDescription>
                Share your driveway, garage, or street space with nearby drivers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Marina Driveway"
                />
              </Field>
              <Field label="Street address">
                <Input
                  value={form.streetAddress}
                  onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="City">
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </Field>
                <Field label="Zip">
                  <Input
                    value={form.zipcode}
                    onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude">
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Longitude">
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="$ / hr">
                  <Input
                    type="number"
                    step="0.5"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Overnight $">
                  <Input
                    type="number"
                    step="1"
                    value={form.overnight}
                    onChange={(e) => setForm({ ...form, overnight: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Style">
                  <Select
                    value={form.style}
                    onValueChange={(v) => setForm({ ...form, style: v as SpotStyle })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Summary (min 30 chars)">
                <Textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={4}
                  placeholder="Describe access, size limits, and nearby landmarks…"
                />
              </Field>
            </div>
            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving…' : 'Publish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {loading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && spots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t listed a spot yet. Publish one to start earning.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {spots.map((spot) => (
            <li
              key={spot._id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{spot.title}</p>
                <p className="text-sm text-muted-foreground">
                  {spot.style} · ${spot.price.toFixed(2)}/hr ·{' '}
                  {spot.isAvailable ? 'Available' : 'Off'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(spot._id)}
                aria-label={`Remove ${spot.title}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * Labeled form field wrapper.
 *
 * @param props - label + children
 * @returns Field block
 */
function Field({ label, children }: { label: string; children: ReactNode }) {
  // yagni: plain Label wrapper; Field compound from skateboard-ui if forms grow
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
