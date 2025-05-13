import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Provider from "@/component/Provider"
import Header from "@/component/Header"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "NFT-Mart",
    description: "NFT Marketplace",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Provider>
            <html
                lang="en"
                className={`${geistSans.variable} ${geistMono.variable}`}
            >
                <body className="bg-white text-black dark:bg-black dark:text-white">
                    <Header />
                    {children}
                </body>
            </html>
        </Provider>
    )
}
