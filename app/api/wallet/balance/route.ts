import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const [solanaBalance, sonicBalance] = await Promise.all([
      // Fetch Solana balance
      new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`)
        .getBalance(new PublicKey(address))
        .then(bal => bal / 1e9),
      // Fetch Sonic balance
      new Connection(`https://api.mainnet-alpha.sonic.game`)
        .getBalance(new PublicKey(address))
        .then(bal => bal / 1e9)
    ]);

    return NextResponse.json({
      solana: solanaBalance,
      sonic: sonicBalance
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }
} 