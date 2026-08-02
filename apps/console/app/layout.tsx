import type { ReactNode } from "react";

export const metadata = {
    title: "Console",
    description: "Account settings console",
};

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
