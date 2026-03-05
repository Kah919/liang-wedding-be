# Architectural Patterns

## Lazy MongoDB Connection

MongoDB is not connected at startup. A middleware in `src/index.ts:24-36` checks `isConnected` before each request and connects on first use. This is required for serverless environments (Netlify Functions) where there is no persistent process.

## Serverless-HTTP Wrapper

The Express app is defined and exported from `src/index.ts` without a `listen()` call. `netlify/functions/api.ts` wraps it with `serverless-http` for the Netlify Function handler. This keeps the app portable — it can also be run directly with `npm start` (via `dist/index.js`) if a `listen()` is added.

## Consistent API Response Shape

All route handlers return a consistent JSON envelope:
- Success: `{ success: true, data: ..., [count: ...], [message: ...] }`
- Error: `{ success: false, error: "..." }`

See `src/routes/guest.ts` and `src/routes/rsvp.ts` for all examples.

## Case-Insensitive Name Lookup

Guest lookup by name (used in both `GET /guests/lookup` and `POST /rsvp`) uses a case-insensitive regex: `{ $regex: new RegExp('^name$', 'i') }`. This pattern appears in `src/routes/guest.ts:17-20` and `src/routes/rsvp.ts:23-26`.

## Guest + PlusOne Relationship

`Guest` embeds an array of `ObjectId` references to `PlusOne` documents (`src/models/Guest.ts:14`). The `PlusOne` model back-references its parent `Guest` (`src/models/PlusOne.ts:6`). On RSVP update, existing plus ones are deleted and re-inserted (`src/routes/rsvp.ts:40-50`). On guest delete, plus ones are cascade-deleted (`src/routes/guest.ts:76`).

## Admin vs. Guest-Facing Routes

There is no authentication. Admin operations (create/delete guests, list all) live in `src/routes/guest.ts`. Guest-facing operations (name lookup, RSVP submission) are separated into `src/routes/guest.ts` (`/lookup`) and `src/routes/rsvp.ts`. Authentication would need to be added before exposing admin routes publicly.

## Email Guard

Confirmation email is only sent if `guest.email` is set (`src/routes/rsvp.ts:60`). Email is optional on the guest model and is provided by the guest at RSVP time, not pre-populated by the admin.
