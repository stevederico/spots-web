import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const markerHandlers = new Map();
const markers = [];
const mapApi = {
  setView: vi.fn().mockReturnThis(),
  flyTo: vi.fn().mockReturnThis(),
  fitBounds: vi.fn().mockReturnThis(),
  panTo: vi.fn().mockReturnThis(),
  invalidateSize: vi.fn(),
  remove: vi.fn(),
  getZoom: vi.fn(() => 13),
  getContainer: vi.fn(() => document.createElement('div')),
};

const tileApi = {
  addTo: vi.fn().mockReturnThis(),
  setUrl: vi.fn(),
};

const layerApi = {
  addTo: vi.fn().mockReturnThis(),
  clearLayers: vi.fn(),
  addLayer: vi.fn(),
};

function createMarker() {
  const marker = {
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn((event, handler) => {
      markerHandlers.set(event, handler);
      return marker;
    }),
    addTo: vi.fn().mockReturnThis(),
    setIcon: vi.fn(),
    setZIndexOffset: vi.fn(),
    openPopup: vi.fn(),
    closePopup: vi.fn(),
    getLatLng: vi.fn(() => ({ lat: 37.8, lng: -122.4 })),
  };
  markers.push(marker);
  return marker;
}

vi.mock('leaflet', () => {
  const L = {
    map: vi.fn(() => mapApi),
    tileLayer: vi.fn(() => tileApi),
    layerGroup: vi.fn(() => layerApi),
    marker: vi.fn(() => createMarker()),
    divIcon: vi.fn((opts) => opts),
    point: vi.fn((x, y) => ({ x, y })),
    latLngBounds: vi.fn(() => ({
      pad: vi.fn().mockReturnThis(),
    })),
  };
  return { default: L, ...L };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

import SpotMap, { SpotOsmEmbed } from './SpotMap';

const sampleSpot = {
  _id: '1',
  userId: 'u1',
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
  summary: 'Quiet residential driveway near the green with easy access for midsize cars.',
  isAvailable: true,
  createdAt: 1,
  updatedAt: 1,
};

describe('SpotMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markers.length = 0;
    markerHandlers.clear();
    // Leaflet needs a sized container; jsdom elements report 0 — mock observe only
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders an accessible map region', () => {
    render(<SpotMap spots={[sampleSpot]} />);
    expect(screen.getByRole('region', { name: 'Map of parking spots' })).toBeInTheDocument();
  });

  it('shows empty state when there are no spots', () => {
    render(<SpotMap spots={[]} />);
    expect(screen.getByText('No spots to show on the map')).toBeInTheDocument();
  });

  it('creates a leaflet map and plots markers', async () => {
    const L = await import('leaflet');
    render(<SpotMap spots={[sampleSpot]} />);
    expect(L.map).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalledWith(
      [sampleSpot.latitude, sampleSpot.longitude],
      expect.objectContaining({ keyboard: true })
    );
    expect(L.tileLayer).toHaveBeenCalled();
  });
});

describe('SpotOsmEmbed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a detail location map', async () => {
    const L = await import('leaflet');
    render(
      <SpotOsmEmbed latitude={37.8} longitude={-122.4} title="Marina Driveway" />
    );
    expect(screen.getByRole('region', { name: 'Marina Driveway' })).toBeInTheDocument();
    expect(L.map).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalled();
  });
});
