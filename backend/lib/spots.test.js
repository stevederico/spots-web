/**
 * Unit tests for spots domain helpers (no HTTP server).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSpotInput,
  computeBookingTotal,
  rowToSpot,
  SPOT_STYLES,
} from './spots.ts';

describe('validateSpotInput', () => {
  const valid = {
    title: 'Marina Driveway',
    streetAddress: '2100 Chestnut St',
    city: 'San Francisco',
    state: 'CA',
    zipcode: '94123',
    latitude: 37.8,
    longitude: -122.4,
    price: 4.5,
    overnight: 25,
    style: 'Driveway',
    summary: 'Quiet residential driveway two blocks from the Marina Green with easy access.',
  };

  it('accepts a valid spot', () => {
    assert.equal(validateSpotInput(valid), null);
  });

  it('rejects short summary', () => {
    assert.match(validateSpotInput({ ...valid, summary: 'too short' }) ?? '', /30/);
  });

  it('rejects invalid style', () => {
    assert.match(validateSpotInput({ ...valid, style: 'Roof' }) ?? '', /Style/);
  });

  it('rejects price out of range', () => {
    assert.match(validateSpotInput({ ...valid, price: 0 }) ?? '', /Price/);
  });
});

describe('computeBookingTotal', () => {
  it('charges at least 0.25 hours', () => {
    const total = computeBookingTotal(10, 0, 1);
    assert.equal(total, 2.5);
  });

  it('rounds to cents for multi-hour window', () => {
    const start = 0;
    const end = 2.5 * 60 * 60 * 1000;
    assert.equal(computeBookingTotal(4, start, end), 10);
  });
});

describe('rowToSpot', () => {
  it('maps snake_case row to camelCase spot', () => {
    const spot = rowToSpot({
      _id: 'abc',
      user_id: 'u1',
      title: 'T',
      street_address: '1 Main',
      city: 'SF',
      state: 'CA',
      zipcode: '94105',
      latitude: 1,
      longitude: 2,
      price: 3,
      overnight: 4,
      style: 'Garage',
      summary: 's',
      is_available: 1,
      created_at: 10,
      updated_at: 20,
    });
    assert.equal(spot.userId, 'u1');
    assert.equal(spot.streetAddress, '1 Main');
    assert.equal(spot.isAvailable, true);
    assert.equal(spot.style, 'Garage');
    assert.ok(SPOT_STYLES.includes(spot.style));
  });
});
