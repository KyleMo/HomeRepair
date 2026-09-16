import { authOptions } from "../../../../lib/auth";
import "../../../../env.config";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

export const saltRounds = 10;

export type SessionUserData = {
    email: string;
    name: string;
};

export async function hashPassword(
    password: string,
    salt: number,
): Promise<string | null> {
    try {
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error(error);
        return null;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
