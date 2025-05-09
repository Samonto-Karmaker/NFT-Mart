import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex justify-between items-center">
            <h1 className="p-4 font-bold text-3xl">NFT-Mart</h1>
            <div className="flex items-center gap-5">
                <Link href="/">
                    <span className="bg-gray-500 p-3 rounded-lg font-bold hover:bg-gray-700">
                        Home
                    </span>
                </Link>
                <Link href="/sell-nft">
                    <span className="bg-gray-500 p-3 rounded-lg font-bold hover:bg-gray-700">
                        Sell NFT
                    </span>
                </Link>
                <ConnectButton />
            </div>
        </nav>
    )
}
