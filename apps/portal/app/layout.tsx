import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

export const metadata = {
    title: "Portal",
    description: "Embedded customer portal",
};

const poppins = Poppins({
    weight: ["200", "400", "600", "800"],
    subsets: ["latin"],
});

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en" className={poppins.className}>
            <body>{children}</body>
        </html>
    );
}
