# liang-wedding-be

Backend API for a wedding RSVP web app (Mike & Ari, Sept 26 2026). Guests look up their name, see their invite details, and submit an RSVP. Admins manage the guest list via the same API.

## Tech Stack

- **Runtime**: Node.js + TypeScript (ES2020, CommonJS output)
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose 9
- **Email**: SendGrid (`@sendgrid/mail`)
- **Deployment**: Netlify Functions via `serverless-http` wrapper
- **Dev**: `nodemon` + `ts-node`

## Key Directories

| Path | Purpose |
|------|---------|
| `src/index.ts` | App entry — Express setup, CORS, lazy MongoDB connection, route mounting |
| `src/models/` | Mongoose schemas: `Guest`, `PlusOne` |
| `src/routes/` | Express routers: `guest.ts` (CRUD), `rsvp.ts` (RSVP submission) |
| `src/services/email.ts` | SendGrid confirmation email |
| `netlify/functions/api.ts` | Netlify Function entrypoint — wraps Express app with `serverless-http` |
| `netlify.toml` | Build config + `/api/*` redirect to Netlify Function |

## Environment Variables

```
MONGO_URI=
SENDGRID_API_KEY=
FROM_EMAIL=
```

## Commands

```bash
npm run dev      # nodemon + ts-node (local)
npm run build    # tsc -> dist/
npm start        # node dist/index.js
```

Deployment is automatic via Netlify on push to main. Build command: `npm run build`.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/guests` | List all guests (admin) |
| POST | `/api/guests` | Create guest (admin) |
| DELETE | `/api/guests/:id` | Delete guest + plus ones (admin) |
| GET | `/api/guests/lookup?firstName=&lastName=` | Look up guest by name (RSVP flow) |
| POST | `/api/rsvp` | Submit RSVP |

## Additional Documentation

- `.claude/docs/architectural_patterns.md` — patterns, conventions, and design decisions used throughout the codebase
