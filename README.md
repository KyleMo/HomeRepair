# my-project

pnpm monorepo: shared Prisma data layer + two Next.js apps.

```
packages/data      @homerepair/data   — prisma schema, client, shared types
apps/console       @homerepair/console — client settings UI (port 3000)
apps/portal        @homerepair/portal    — iframe-embedded customer portal (port 3001)
```

## Setup

```bash
nvm install 20
nvm use 20
pnpm install
cp .env.example packages/data/.env   # set your real DATABASE_URL
pnpm db:generate                     # generate the prisma client
pnpm db:push                         # sync schema to the database (dev)
pnpm dev                             # runs both apps via turbo
```

## Import rules

| Where                                         | Import                                                 |
| --------------------------------------------- | ------------------------------------------------------ |
| Server components, API routes, server actions | `import { prisma, type User } from "@homerepair/data"` |
| Client components (incl. all portal UI)       | `import type { User } from "@homerepair/data/types"`   |

The root entry is guarded with the `server-only` package — accidentally
importing `prisma` into a client component fails the build instead of
silently bundling the Prisma runtime.

## Embedding the portal

Clients add this to their site:

```html
<script
    src="https://portal.example.com/loader.js"
    data-client-id="abc123"
    defer
></script>
<div id="myproject-portal"></div>
```

See `apps/portal/public/loader.js`.
