/**
 * Spots domain — parking listings + bookings on SQLite via executeQuery.
 *
 * Mirrors the 2012 ParkPro product model (geo spot, $/hr, overnight, style)
 * with ownership + bookings the original never shipped.
 */
import type { BoundDatabase, ExecuteResult, ExecuteSuccess, SqlParam, SqlQueryObject } from '../types.ts';

/** Spot style enum matching the original ParkPro listing types. */
export const SPOT_STYLES = ['Street', 'Driveway', 'Garage'] as const;
export type SpotStyle = (typeof SPOT_STYLES)[number];

/** Parking spot as returned to the client (camelCase JSON). */
export interface Spot {
  _id: string;
  userId: string;
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  price: number;
  overnight: number;
  style: SpotStyle;
  summary: string;
  isAvailable: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Booking (Park Here transaction) as returned to the client. */
export interface Booking {
  _id: string;
  spotId: string;
  userId: string;
  timeIn: number;
  timeOut: number;
  total: number;
  status: string;
  createdAt: number;
  spot?: Spot;
}

/** Fields accepted when creating/updating a spot. */
export interface SpotInput {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  price: number;
  overnight: number;
  style: string;
  summary: string;
  isAvailable?: boolean;
}

/** Fields for creating a booking. */
export interface BookingInput {
  spotId: string;
  timeIn: number;
  timeOut: number;
}

type Exec = (queryObject: SqlQueryObject) => Promise<ExecuteSuccess>;

/**
 * Build an execute helper bound to the app database.
 *
 * @param db - Bound database from server setup
 * @returns execute function that throws on failure
 */
export function makeExec(db: BoundDatabase): Exec {
  return async (queryObject) => {
    const result: ExecuteResult = await db.executeQuery(queryObject);
    if (!result.success) {
      throw new Error(result.error || 'Database query failed');
    }
    return result;
  };
}

/**
 * Ensure Spots and Bookings tables exist.
 *
 * @param exec - Query executor
 */
export async function ensureSpotsSchema(exec: Exec): Promise<void> {
  await exec({
    query: `
      CREATE TABLE IF NOT EXISTS Spots (
        _id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        street_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zipcode TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        price REAL NOT NULL,
        overnight REAL NOT NULL DEFAULT 0,
        style TEXT NOT NULL,
        summary TEXT NOT NULL,
        is_available INTEGER NOT NULL DEFAULT 1,
        deleted_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `,
  });
  await exec({
    query: `
      CREATE TABLE IF NOT EXISTS Bookings (
        _id TEXT PRIMARY KEY,
        spot_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        time_in INTEGER NOT NULL,
        time_out INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at INTEGER NOT NULL
      )
    `,
  });
  await exec({ query: 'CREATE INDEX IF NOT EXISTS idx_spots_user ON Spots(user_id)' });
  await exec({ query: 'CREATE INDEX IF NOT EXISTS idx_spots_available ON Spots(is_available, deleted_at)' });
  await exec({ query: 'CREATE INDEX IF NOT EXISTS idx_bookings_user ON Bookings(user_id)' });
  await exec({ query: 'CREATE INDEX IF NOT EXISTS idx_bookings_spot ON Bookings(spot_id)' });
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Map a raw Spots row to the client Spot shape.
 *
 * @param r - Raw SQL row
 * @returns Spot
 */
export function rowToSpot(r: Record<string, unknown>): Spot {
  const styleRaw = readString(r.style, 'Street');
  const style: SpotStyle = SPOT_STYLES.includes(styleRaw as SpotStyle)
    ? (styleRaw as SpotStyle)
    : 'Street';
  return {
    _id: readString(r._id),
    userId: readString(r.user_id),
    title: readString(r.title),
    streetAddress: readString(r.street_address),
    city: readString(r.city),
    state: readString(r.state),
    zipcode: readString(r.zipcode),
    latitude: readNumber(r.latitude),
    longitude: readNumber(r.longitude),
    price: readNumber(r.price),
    overnight: readNumber(r.overnight),
    style,
    summary: readString(r.summary),
    isAvailable: readNumber(r.is_available, 1) === 1,
    createdAt: readNumber(r.created_at),
    updatedAt: readNumber(r.updated_at),
  };
}

/**
 * Map a raw Bookings row to the client Booking shape.
 *
 * @param r - Raw SQL row
 * @returns Booking
 */
export function rowToBooking(r: Record<string, unknown>): Booking {
  return {
    _id: readString(r._id),
    spotId: readString(r.spot_id),
    userId: readString(r.user_id),
    timeIn: readNumber(r.time_in),
    timeOut: readNumber(r.time_out),
    total: readNumber(r.total),
    status: readString(r.status, 'confirmed'),
    createdAt: readNumber(r.created_at),
  };
}

/**
 * Validate spot create/update input. Returns error message or null if valid.
 *
 * @param input - Candidate spot fields
 * @returns Error string or null
 */
export function validateSpotInput(input: Partial<SpotInput>): string | null {
  if (!input.title || input.title.trim().length < 2) return 'Title is required';
  if (!input.streetAddress || input.streetAddress.trim().length < 3) return 'Street address is required';
  if (!input.city || !/^[a-zA-Z\s]+$/.test(input.city.trim())) return 'City is invalid';
  if (!input.state || !/^[a-zA-Z\s]+$/.test(input.state.trim())) return 'State is invalid';
  if (!input.zipcode || !/^\d{5}(-\d{4})?$/.test(String(input.zipcode).trim())) {
    return 'Zipcode should be 12345 or 12345-1234';
  }
  if (typeof input.latitude !== 'number' || input.latitude < -90 || input.latitude > 90) {
    return 'Latitude must be between -90 and 90';
  }
  if (typeof input.longitude !== 'number' || input.longitude < -180 || input.longitude > 180) {
    return 'Longitude must be between -180 and 180';
  }
  if (typeof input.price !== 'number' || input.price <= 0 || input.price >= 100) {
    return 'Price must be greater than 0 and less than 100';
  }
  if (typeof input.overnight !== 'number' || input.overnight < 0 || input.overnight >= 500) {
    return 'Overnight rate must be 0–500';
  }
  if (!input.style || !SPOT_STYLES.includes(input.style as SpotStyle)) {
    return `Style must be one of: ${SPOT_STYLES.join(', ')}`;
  }
  if (!input.summary || input.summary.trim().length < 30) {
    return 'Summary must be at least 30 characters';
  }
  return null;
}

/**
 * Seed demo SF spots when the table is empty.
 *
 * @param exec - Query executor
 * @param generateId - UUID generator
 * @param hostUserId - Owner id for seed rows (system host)
 */
export async function seedSpotsIfEmpty(
  exec: Exec,
  generateId: () => string,
  hostUserId = 'seed-host'
): Promise<void> {
  const countResult = await exec({ query: 'SELECT COUNT(*) AS c FROM Spots' });
  const rows = Array.isArray(countResult.data) ? countResult.data : [];
  const first = rows[0];
  const count =
    first && typeof first === 'object' && first !== null && 'c' in first
      ? readNumber((first as { c: unknown }).c)
      : 0;
  if (count > 0) return;

  const now = Date.now();
  const seeds: SpotInput[] = [
    {
      title: 'Marina Driveway',
      streetAddress: '2100 Chestnut St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94123',
      latitude: 37.8005,
      longitude: -122.4369,
      price: 4.5,
      overnight: 25,
      style: 'Driveway',
      summary:
        'Quiet residential driveway two blocks from the Marina Green. Level surface, easy in and out, perfect for sedans and small SUVs.',
    },
    {
      title: 'SOMA Garage Spot',
      streetAddress: '450 Folsom St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94105',
      latitude: 37.7872,
      longitude: -122.3937,
      price: 6,
      overnight: 35,
      style: 'Garage',
      summary:
        'Covered garage stall in SOMA near the bridge approach. Security gate, well lit, ideal for weekday office parkers.',
    },
    {
      title: 'Mission Street Curb',
      streetAddress: '2200 Mission St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94110',
      latitude: 37.7609,
      longitude: -122.4194,
      price: 3,
      overnight: 18,
      style: 'Street',
      summary:
        'Legal street space next to a cafe in the Mission. Short walk to BART. Clear of street sweeping on listed days.',
    },
    {
      title: 'North Beach Alley Spot',
      streetAddress: '15 Divisadero St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94117',
      latitude: 37.7706,
      longitude: -122.437,
      price: 3.5,
      overnight: 20,
      style: 'Driveway',
      summary:
        'Private driveway near Divisadero corridor. Spacious enough for a midsize car. Host lives on site and can unlock gate.',
    },
    {
      title: 'Financial District Garage',
      streetAddress: '100 Pine St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94111',
      latitude: 37.7925,
      longitude: -122.3989,
      price: 8,
      overnight: 40,
      style: 'Garage',
      summary:
        'Downtown covered garage with elevator access. Best for daytime meetings near Embarcadero. Height limit 6ft 8in.',
    },
  ];

  for (const s of seeds) {
    const id = generateId();
    await exec({
      query: `
        INSERT INTO Spots (
          _id, user_id, title, street_address, city, state, zipcode,
          latitude, longitude, price, overnight, style, summary,
          is_available, deleted_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, ?, ?)
      `,
      params: [
        id,
        hostUserId,
        s.title,
        s.streetAddress,
        s.city,
        s.state,
        s.zipcode,
        s.latitude,
        s.longitude,
        s.price,
        s.overnight,
        s.style,
        s.summary,
        now,
        now,
      ],
    });
  }
}

/**
 * List non-deleted spots, optionally only available ones.
 *
 * @param exec - Query executor
 * @param opts - Filter options
 * @returns Spots sorted by price ascending
 */
export async function listSpots(
  exec: Exec,
  opts: { availableOnly?: boolean; userId?: string } = {}
): Promise<Spot[]> {
  const clauses = ['deleted_at IS NULL'];
  const params: SqlParam[] = [];
  if (opts.availableOnly) clauses.push('is_available = 1');
  if (opts.userId) {
    clauses.push('user_id = ?');
    params.push(opts.userId);
  }
  const result = await exec({
    query: `SELECT * FROM Spots WHERE ${clauses.join(' AND ')} ORDER BY price ASC`,
    params,
  });
  const data = Array.isArray(result.data) ? result.data : [];
  return data
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map(rowToSpot);
}

/**
 * Fetch a single non-deleted spot by id.
 *
 * @param exec - Query executor
 * @param id - Spot id
 * @returns Spot or null
 */
export async function getSpot(exec: Exec, id: string): Promise<Spot | null> {
  const result = await exec({
    query: 'SELECT * FROM Spots WHERE _id = ? AND deleted_at IS NULL',
    params: [id],
  });
  const data = Array.isArray(result.data) ? result.data : [];
  const row = data[0];
  if (!row || typeof row !== 'object') return null;
  return rowToSpot(row as Record<string, unknown>);
}

/**
 * Insert a new spot owned by userId.
 *
 * @param exec - Query executor
 * @param userId - Owner user id
 * @param input - Validated spot fields
 * @param generateId - UUID generator
 * @returns Created spot
 */
export async function createSpot(
  exec: Exec,
  userId: string,
  input: SpotInput,
  generateId: () => string
): Promise<Spot> {
  const id = generateId();
  const now = Date.now();
  const available = input.isAvailable === false ? 0 : 1;
  await exec({
    query: `
      INSERT INTO Spots (
        _id, user_id, title, street_address, city, state, zipcode,
        latitude, longitude, price, overnight, style, summary,
        is_available, deleted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `,
    params: [
      id,
      userId,
      input.title.trim(),
      input.streetAddress.trim(),
      input.city.trim(),
      input.state.trim(),
      String(input.zipcode).trim(),
      input.latitude,
      input.longitude,
      input.price,
      input.overnight,
      input.style,
      input.summary.trim(),
      available,
      now,
      now,
    ],
  });
  const created = await getSpot(exec, id);
  if (!created) throw new Error('Failed to load created spot');
  return created;
}

/**
 * Update a spot if owned by userId.
 *
 * @param exec - Query executor
 * @param id - Spot id
 * @param userId - Owner user id
 * @param input - Partial fields to update
 * @returns Updated spot or null if not found/not owner
 */
export async function updateSpot(
  exec: Exec,
  id: string,
  userId: string,
  input: Partial<SpotInput>
): Promise<Spot | null> {
  const existing = await getSpot(exec, id);
  if (!existing || existing.userId !== userId) return null;

  const merged: SpotInput = {
    title: input.title ?? existing.title,
    streetAddress: input.streetAddress ?? existing.streetAddress,
    city: input.city ?? existing.city,
    state: input.state ?? existing.state,
    zipcode: input.zipcode ?? existing.zipcode,
    latitude: input.latitude ?? existing.latitude,
    longitude: input.longitude ?? existing.longitude,
    price: input.price ?? existing.price,
    overnight: input.overnight ?? existing.overnight,
    style: input.style ?? existing.style,
    summary: input.summary ?? existing.summary,
    isAvailable: input.isAvailable ?? existing.isAvailable,
  };
  const err = validateSpotInput(merged);
  if (err) throw new Error(err);

  const now = Date.now();
  await exec({
    query: `
      UPDATE Spots SET
        title = ?, street_address = ?, city = ?, state = ?, zipcode = ?,
        latitude = ?, longitude = ?, price = ?, overnight = ?, style = ?,
        summary = ?, is_available = ?, updated_at = ?
      WHERE _id = ? AND user_id = ? AND deleted_at IS NULL
    `,
    params: [
      merged.title.trim(),
      merged.streetAddress.trim(),
      merged.city.trim(),
      merged.state.trim(),
      String(merged.zipcode).trim(),
      merged.latitude,
      merged.longitude,
      merged.price,
      merged.overnight,
      merged.style,
      merged.summary.trim(),
      merged.isAvailable === false ? 0 : 1,
      now,
      id,
      userId,
    ],
  });
  return getSpot(exec, id);
}

/**
 * Soft-delete a spot owned by userId.
 *
 * @param exec - Query executor
 * @param id - Spot id
 * @param userId - Owner user id
 * @returns True if deleted
 */
export async function deleteSpot(exec: Exec, id: string, userId: string): Promise<boolean> {
  const existing = await getSpot(exec, id);
  if (!existing || existing.userId !== userId) return false;
  const now = Date.now();
  await exec({
    query: 'UPDATE Spots SET deleted_at = ?, is_available = 0, updated_at = ? WHERE _id = ? AND user_id = ?',
    params: [now, now, id, userId],
  });
  return true;
}

/**
 * Compute booking total from hourly rate and time window.
 *
 * @param pricePerHour - Spot hourly price
 * @param timeIn - Start ms
 * @param timeOut - End ms
 * @returns Total dollars rounded to 2 decimals
 */
export function computeBookingTotal(pricePerHour: number, timeIn: number, timeOut: number): number {
  const hours = Math.max((timeOut - timeIn) / (1000 * 60 * 60), 0.25);
  return Math.round(pricePerHour * hours * 100) / 100;
}

/**
 * Create a booking for an available spot.
 *
 * @param exec - Query executor
 * @param userId - Renter user id
 * @param input - Booking times + spot
 * @param generateId - UUID generator
 * @returns Created booking with spot attached
 */
export async function createBooking(
  exec: Exec,
  userId: string,
  input: BookingInput,
  generateId: () => string
): Promise<Booking> {
  if (!input.spotId) throw new Error('spotId is required');
  if (typeof input.timeIn !== 'number' || typeof input.timeOut !== 'number') {
    throw new Error('timeIn and timeOut are required');
  }
  if (input.timeOut <= input.timeIn) throw new Error('timeOut must be after timeIn');
  if (input.timeOut - input.timeIn > 1000 * 60 * 60 * 24 * 7) {
    throw new Error('Booking cannot exceed 7 days');
  }

  const spot = await getSpot(exec, input.spotId);
  if (!spot) throw new Error('Spot not found');
  if (!spot.isAvailable) throw new Error('Spot is not available');

  const total = computeBookingTotal(spot.price, input.timeIn, input.timeOut);
  const id = generateId();
  const now = Date.now();
  await exec({
    query: `
      INSERT INTO Bookings (_id, spot_id, user_id, time_in, time_out, total, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `,
    params: [id, input.spotId, userId, input.timeIn, input.timeOut, total, now],
  });

  return {
    _id: id,
    spotId: input.spotId,
    userId,
    timeIn: input.timeIn,
    timeOut: input.timeOut,
    total,
    status: 'confirmed',
    createdAt: now,
    spot,
  };
}

/**
 * List bookings for a user, newest first, with spot details when available.
 *
 * @param exec - Query executor
 * @param userId - Renter user id
 * @returns Bookings
 */
export async function listBookingsForUser(exec: Exec, userId: string): Promise<Booking[]> {
  const result = await exec({
    query: 'SELECT * FROM Bookings WHERE user_id = ? ORDER BY created_at DESC',
    params: [userId],
  });
  const data = Array.isArray(result.data) ? result.data : [];
  const bookings = data
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map(rowToBooking);

  const withSpots: Booking[] = [];
  for (const b of bookings) {
    const spot = await getSpot(exec, b.spotId);
    withSpots.push(spot ? { ...b, spot } : b);
  }
  return withSpots;
}
