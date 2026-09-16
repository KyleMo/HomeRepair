import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import UserSessionProvider from "../../components/providers/UserSessionProvider";
import Nav from "@/components/Nav";
import { Box } from "@mui/material";
import { getOrganizationsByUserEmail } from "@/lib/db/get";
import OrganizationProvider from "@/components/providers/OrganizationProvider";
import QueryProvider from "@/components/providers/QueryProvider";

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
    if (!session || !session.user || !session.user.email) {
        redirect("/auth/log-in");
    }

    const orgResult = await getOrganizationsByUserEmail(session.user.email);

    if (!orgResult.success) {
        redirect("/auth/log-in");
    }

    const orgs = orgResult.value;

    return (
        <UserSessionProvider session={session}>
            <OrganizationProvider orgs={orgs}>
                <QueryProvider>
                    <Box
                        component="main"
                        sx={{
                            width: "100%",
                            minHeight: "100vh",
                            display: "flex",
                            // Column on phones so Nav's AppBar sits above the
                            // content; row once the permanent rail takes over.
                            flexDirection: { xs: "column", md: "row" },
                            backgroundColor: "background.default",
                        }}
                    >
                        <Nav organizations={orgs} />
                        <Box
                            sx={{
                                flexGrow: 1,
                                minWidth: 0,
                                padding: { xs: 1.5, sm: 2 },
                            }}
                        >
                            {children}
                        </Box>
                    </Box>
                </QueryProvider>
            </OrganizationProvider>
        </UserSessionProvider>
    );
}
