import { prisma } from "@homerepair/data";
import bcrypt from "bcryptjs";
import { AuthOptions, Session, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
                token.userId = user.id;
                token.email = user.email;
                token.first_name = user.first_name;
                token.last_name = user.last_name;
            }

            return token;
        },
        session({ session, token }) {
            session.user = token as Session["user"];
            return session;
        },
        redirect({ baseUrl }) {
            return `${baseUrl}/overview`;
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

export const requireSession = async () => {
    const session = await getServerSession(authOptions);
    return session?.user?.email ? session : null;
};
