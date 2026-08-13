import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/components/provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
    title: "알고리그",
    description: "매일 한 문제, 검증 가능한 성장",
    icons: {
        icon: "/brand/algoleague-otter-logo-512.png",
        apple: "/brand/algoleague-otter-logo-512.png",
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ko" className="light" data-theme="light" suppressHydrationWarning>
            <body>
                <Provider>
                    <AppShell>{children}</AppShell>
                </Provider>
            </body>
        </html>
    );
}
