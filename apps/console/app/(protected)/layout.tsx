import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserSessionProvider from "../../components/providers/UserSessionProvider";
import Nav from "@/components/Nav";

export const metadata = {
    title: "Console",
    description: "Account settings console",
};

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/auth/log-in");

    return (
        <UserSessionProvider session={session}>
            <main>
                <Nav />
                {children}
            </main>
        </UserSessionProvider>
    );
}
