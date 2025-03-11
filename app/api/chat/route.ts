import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { getAgent } from "@/lib/solana-agent";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json().catch(error => {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body");
    });
    
    const { message, modelName } = body;
    
    if (!message) {
      console.error("Missing message in request");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    console.log("Chat API called with:", { message, modelName });
    
    // Get the agent
    const { agent, config } = await getAgent(modelName || "default", "sonic");

    const messages = [
      new HumanMessage({
        content: message
      })
    ];

    console.log("Streaming response from agent...");
    const stream = await agent.stream({ messages }, config);

    let response = "";

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        console.log("Agent chunk received:", chunk.agent);
        response += chunk.agent.messages[0].content + "\n";
      } else if ("tools" in chunk) {
        console.log("Tools chunk received:", chunk.tools.messages[0].content);
      }
    }

    console.log("Final response:", response);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// get the wallet address from the user
export async function GET(req: NextRequest) {
  try {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.SONIC_PRIVATE_KEY!)
    );
    return NextResponse.json({ walletAddress: keypair.publicKey.toBase58() });
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return NextResponse.json({ 
      error: "Failed to get wallet address", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}