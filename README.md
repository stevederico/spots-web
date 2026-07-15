# Spots Web

Airbnb-style parking marketplace — remake of [ParkPro](archive/) on the latest Skateboard stack.

**A New Way to Park** — browse map/list, book a time window, host your own spots.

## Stack

- React 19 + Vite + react-router v7 + skateboard-ui `4.14.0`
- Hono + SQLite + JWT auth (node:crypto)
- Skateboard `4.11.1`

## Quick start

```bash
bun install
ln -sf ~/Dropbox/BixbyApps/DefaultEnv/.env backend/.env
bun run start
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:8000  

## Product

| Surface | What |
|---------|------|
| **Browse** | Map + list of spots (seeded SF inventory) |
| **Spot detail** | OSM map, rates, Park Here booking |
| **My Spots** | Host CRUD (create + soft-delete) |
| **History** | Your bookings |

Original 2012 sources live in `archive/parkpro-ios-archive` and `archive/parkpro-backend-archive`.

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/spots` | JWT |
| GET | `/api/spots/mine` | JWT |
| GET | `/api/spots/:id` | JWT |
| POST | `/api/spots` | JWT + CSRF |
| PUT | `/api/spots/:id` | JWT + CSRF (owner) |
| DELETE | `/api/spots/:id` | JWT + CSRF (owner, soft) |
| GET | `/api/bookings` | JWT |
| POST | `/api/bookings` | JWT + CSRF |

Plus stock skateboard auth/payments routes.

## Archive domain → remake

| 2012 | Now |
|------|-----|
| Spot only, no ownership | Spot + `userId` |
| No bookings | Bookings with time window + total |
| Devise `auth_token` | HttpOnly JWT cookies |
| AFIncrementalStore | Explicit REST |
| Stripe planned | Host Pro Stripe product shell (skateboard) |
