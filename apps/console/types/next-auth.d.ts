import type { DefaultSession } from "next-auth";

// Augments the types NextAuth returns everywhere: useSession().data,
// getServerSession(), and the jwt/session callbacks. Add custom fields here.
declare module "next-auth" {
    interface Session {
        user: {
            user_id: string;
            first_name: string;
            last_name: string;
            email: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        name: string;
        email: string;
        orgId?: string;
    }
}
