import { validateEnvironment } from "@/lib/utils";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenAI } from "@langchain/openai";
import {
  SolanaAgentKit,
  createVercelAITools
} from "../agent-kit/packages/core/src";
import BlinksPlugin from "../agent-kit/packages/plugin-blinks/src";
import DefiPlugin from "../agent-kit/packages/plugin-defi/src";
import MiscPlugin from "../agent-kit/packages/plugin-misc/src";
import NFTPlugin from "../agent-kit/packages/plugin-nft/src";
import TokenPlugin from "../agent-kit/packages/plugin-token/src";

export async function initializeAgent(
  modelName: string,
  chainType: "solana" | "sonic",
  wallet?: any
) {
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

  if (!wallet) {
    console.error("No wallet provided to initializeAgent");
    return { tools: [] };
  }

  const solanaAgent = new SolanaAgentKit(wallet, process.env.SOLANA_RPC_URL!, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  })
    .use(TokenPlugin)
    .use(NFTPlugin)
    .use(DefiPlugin)
    .use(MiscPlugin)
    .use(BlinksPlugin);

  console.log("solanaAgent", solanaAgent);

  const actions = solanaAgent.actions;
  const tools = createVercelAITools(solanaAgent, actions);

  return { tools };
}
