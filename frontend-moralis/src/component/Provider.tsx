"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { sepolia, localhost } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { MoralisProvider } from "react-moralis"

const config = getDefaultConfig({
    appName: "NFT-Mart",
    projectId: "YOUR_PROJECT_ID",
    chains: [sepolia, localhost],
    ssr: true, // If your dApp uses server side rendering (SSR)
})

const queryClient = new QueryClient()
export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>{children}</RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </MoralisProvider>
    )
}
