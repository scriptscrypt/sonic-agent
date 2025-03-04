import { validateEnvironment } from "@/lib/utils";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatDeepSeek } from "@langchain/deepseek";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { createSonicTools, SonicAgentKit } from "@sendaifun/sonic-agent-kit";

export async function initializeAgent(modelName: string, chainType: "solana" | "sonic") {
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

  const sonicAgent = new SonicAgentKit(process.env.SONIC_PRIVATE_KEY! as string, process.env.SONIC_RPC_URL! as string, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY! as string,
  });
  console.log("sonicAgent", sonicAgent);
  const sonicTools = createSonicTools(sonicAgent);
  const memory = new MemorySaver();
  const config = { configurable: { thread_id: "1" } };

  const agent = createReactAgent({
    llm,
    tools: sonicTools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
  });

  return { agent, config };
}
