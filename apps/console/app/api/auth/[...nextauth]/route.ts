import "../../../../env.config";
import { prisma } from "@homerepair/data";
import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const saltRounds = 10;

type TokenData = {
    name: string;
    email: string;
    orgId?: string;
};

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

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token }) {
            if (!token.email) {
                return token;
            }

            const user = await prisma.user.findUnique({
                where: {
                    email: token.email,
                },
            });

            if (user) {
                token.name = `${user.first_name} ${user.first_name}`;
                token.email = user.email;
                token.random = "random";
            }

            return token;
        },
        session({ session, token }) {
            const typedToken = token as TokenData;

            session.user = {
                email: typedToken.email,
                name: typedToken.name,
                ["random" as string]: "found random",
            };

            return session;
        },
    },
    providers: [
        CredentialsProvider({
            name: "email and password",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "email address",
                },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user) {
                        return null;
                    }

                    if (
                        !(await bcrypt.compare(
                            credentials.password,
                            user.password_hash,
                        ))
                    ) {
                        return null;
                    }
                    return user;
                } catch (error) {
                    console.error("[NextAuth] authorize error", error);
                    throw error;
                }
            },
        }),
    ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
