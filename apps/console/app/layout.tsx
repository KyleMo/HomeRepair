import type { ReactNode } from "react";
import "./global.css";
import { Manrope } from "next/font/google";
import MaterialUiThemeProvider from "@/components/providers/MaterialUiThemeProvider";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
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
            <body className={manrope.className}>
                <MaterialUiThemeProvider>{children}</MaterialUiThemeProvider>
            </body>
        </html>
    );
}
