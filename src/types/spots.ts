/** Parking spot style (matches backend + original ParkPro). */
export type SpotStyle = 'Street' | 'Driveway' | 'Garage';

/** Parking spot from GET /api/spots. */
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

/** Booking from GET /api/bookings. */
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

/** Payload for POST /api/spots. */
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
  style: SpotStyle;
  summary: string;
  isAvailable?: boolean;
}
