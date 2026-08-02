// TYPES-ONLY entry point — safe to import anywhere, including client
// components and the portal iframe bundle. Contains zero runtime code.

// Re-export all generated Prisma model types (User, Client, Customer, ...)
export type * from "../generated/client/index.js";

// Shared hand-written types that all three surfaces care about:

export type UserSettings = {
  theme: "light" | "dark" | "system";
  notifications: boolean;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: "system",
  notifications: true,
};

// The shape the portal iframe receives from your API — a deliberately
// narrow, public-safe projection of the Customer model.
export type PortalCustomer = {
  id: string;
  email: string;
};
