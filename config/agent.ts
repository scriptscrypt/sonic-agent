import { validateEnvironment } from "@/lib/utils";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatDeepSeek } from "@langchain/deepseek";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
// import { createSonicTools, SonicAgentKit } from "@sendaifun/sonic-agent-kit";
import {
  BaseWallet,
  createVercelAITools,
  SolanaAgentKit,
} from "../agent-kit-v2/packages/core/src";

export async function initializeAgent(
  modelName: string,
  chainType: "solana" | "sonic", 
  wallet: any
) {
  // Removed the usePrivy hook as it can't be used in server components
  // const { user } = usePrivy();
  
  const llm = modelName?.includes("OpenAI")
    ? new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.3,
        apiKey: process.env.OPENAI_API_KEY!,
      })
    : modelName?.includes("Claude")
    ? new ChatAnthropic({
        modelName: "claude-3-sonnet-latest",
        temperature: 0.3,
        apiKey: process.env.ANTHROPIC_API_KEY!,
      })
    : new ChatDeepSeek({
        model: "deepseek-chat",
        temperature: 0,
        apiKey: process.env.DEEPSEEK_API_KEY!,
      });

  validateEnvironment();

  // Use the provided wallet or fallback to null if not provided
  const sonicAgent = new SolanaAgentKit(
    wallet || null as unknown as BaseWallet,
    process.env.SOLANA_RPC_URL! as string,
    {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY! as string,
    }
  );
  console.log("sonicAgent", sonicAgent);
  const sonicTools = createVercelAITools(sonicAgent, sonicAgent?.actions);
  const memory = new MemorySaver();
  const config = {
    configurable: { thread_id: Math.random().toString(36).substring(2, 15) },
  };

  return { tools: sonicTools };
}
