import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { getAgent } from "@/lib/solana-agent";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { tokenRepository } from "@/db/repositories/tokenRepository";
import { nftRepository } from "@/db/repositories/nftRepository";

// Helper function to extract token information from response
function extractTokenInfo(response: string) {
  // Look for token creation patterns in the response
  const tokenNameMatch = response.match(/created a new token[:\s]+["']?([^"'\n.]+)["']?/i) || 
                         response.match(/token called ["']?([^"'\n.]+)["']?/i) ||
                         response.match(/token named ["']?([^"'\n.]+)["']?/i);
  
  const symbolMatch = response.match(/symbol[:\s]+["']?([A-Z0-9]{2,10})["']?/i);
  const mintAddressMatch = response.match(/mint address[:\s]+["']?([a-zA-Z0-9]{32,44})["']?/i) ||
                           response.match(/token address[:\s]+["']?([a-zA-Z0-9]{32,44})["']?/i);
  
  if (tokenNameMatch && symbolMatch && mintAddressMatch) {
    return {
      name: tokenNameMatch[1].trim(),
      symbol: symbolMatch[1].trim(),
      mintAddress: mintAddressMatch[1].trim(),
      description: `A token created via the Sonic chat interface.`,
      logoUrl: `https://cryptologos.cc/logos/${tokenNameMatch[1].toLowerCase().replace(/\s+/g, '-')}-logo.png`,
      price: (Math.random() * 10).toString(), // Convert to string
      marketCap: Math.floor(Math.random() * 1000000000).toString(), // Convert to string
      volume24h: Math.floor(Math.random() * 100000000).toString(), // Convert to string
      change24h: ((Math.random() * 20) - 10).toString(), // Convert to string
      metadata: JSON.stringify({ createdViaSonic: true })
    };
  }
  
  return null;
}

// Helper function to extract NFT information from response
function extractNFTInfo(response: string) {
  // Look for NFT creation patterns in the response
  const nftNameMatch = response.match(/created a new NFT[:\s]+["']?([^"'\n.]+)["']?/i) || 
                       response.match(/NFT called ["']?([^"'\n.]+)["']?/i) ||
                       response.match(/NFT named ["']?([^"'\n.]+)["']?/i);
  
  const mintAddressMatch = response.match(/mint address[:\s]+["']?([a-zA-Z0-9]{32,44})["']?/i) ||
                           response.match(/NFT address[:\s]+["']?([a-zA-Z0-9]{32,44})["']?/i);
  
  const imageUrlMatch = response.match(/image URL[:\s]+["']?([^\s"']+)["']?/i) ||
                        response.match(/image[:\s]+["']?([^\s"']+)["']?/i);
  
  if (nftNameMatch && mintAddressMatch) {
    return {
      name: nftNameMatch[1].trim(),
      mintAddress: mintAddressMatch[1].trim(),
      description: `An NFT created via the Sonic chat interface.`,
      imageUrl: imageUrlMatch ? imageUrlMatch[1].trim() : 'https://picsum.photos/seed/nft/500/500',
      metadata: JSON.stringify({ 
        attributes: [
          { trait_type: 'Origin', value: 'Sonic Chat' },
          { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)] }
        ],
        createdViaSonic: true
      })
    };
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json().catch(error => {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body");
    });
    
    const { message, modelName, userId } = body;
    
    if (!message) {
      console.error("Missing message in request");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    console.log("Chat API called with:", { message, modelName, userId });
    
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
    
    // Check if a token was created
    const tokenInfo = extractTokenInfo(response);
    if (tokenInfo && userId) {
      try {
        console.log("Token detected, adding to database:", tokenInfo);
        await tokenRepository.createToken({
          ...tokenInfo,
          userId: parseInt(userId)
        });
        console.log("Token added to database successfully");
      } catch (error) {
        console.error("Error adding token to database:", error);
      }
    }
    
    // Check if an NFT was created
    const nftInfo = extractNFTInfo(response);
    if (nftInfo && userId) {
      try {
        console.log("NFT detected, adding to database:", nftInfo);
        await nftRepository.createNFT({
          ...nftInfo,
          userId: parseInt(userId)
        });
        console.log("NFT added to database successfully");
      } catch (error) {
        console.error("Error adding NFT to database:", error);
      }
    }
    
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