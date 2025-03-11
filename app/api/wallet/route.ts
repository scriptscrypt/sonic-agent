import { NextRequest, NextResponse } from "next/server";

// get the wallet address from the user
export async function GET(req: NextRequest) {
    // Use a mock wallet address instead of trying to decode an invalid private key
    const mockWalletAddress = "AgN7XCg3PdaEUJ8W6QYYzxMJYeCxdYuLdh9X3tkZJCdN";
    
    let wallets = [
        {
            name: "Default Agent Wallet",
            subTxt: mockWalletAddress.slice(0, 4) + "..." + mockWalletAddress.slice(-4)
        }
    ]
    return NextResponse.json({ wallets });
}