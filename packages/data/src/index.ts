// SERVER-ONLY entry point.
// Import this from server components, API routes, and server actions.
// Never import this in client components — it pulls in the Prisma runtime.
// For client components, use `@homerepair/data/types` instead.

import "server-only";

export { prisma } from "./client";
export * from "./types";
