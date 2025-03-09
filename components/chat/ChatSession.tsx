"use client";

import { AgentLogo } from "@/components/layout/AgentLogo";
import { useChatStore } from '@/store/useChatStore';
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { ChatInput, MOCK_MODELS, CHAIN_TYPES } from "./ChatInput";
import { AGENT_MODES } from "./ModeSelector";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Add new interfaces for swap functionality
interface SwapDetails {
  fromToken: string;
  toToken: string;
  rate: number;
  fees: string;
  slippage: number;
  route: string;
}

interface SwapUIProps {
  swapDetails: SwapDetails;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UserMessageProps {
  content: string;
}

interface ChatSessionProps {
  sessionId: number;
  initialMessages: Array<Message>;
}

function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%]">
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-accent/10 text-accent rounded-br-sm">
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  content: string;
}

function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="flex relative items-start max-w-[85%]">
        <div className="absolute -left-8 top-2 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <AgentLogo />
        </div>
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl text-foreground/90 rounded-bl-sm">
          <ReactMarkdown
            components={{
              // Style code blocks
              code: ({ inline, className, children, ...props } : any) => {
                if (inline) {
                  return (
                    <code className="bg-accent/10 rounded px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="my-3">
                    <pre className="bg-accent/10 p-3 rounded-lg overflow-x-auto">
                      <code {...props}>{children}</code>
                    </pre>
                  </div>
                );
              },
              // Style lists
              ul: ({ children }) => (
                <ul className="pl-6 my-2 list-disc">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="pl-6 my-2 list-decimal">{children}</ol>
              ),
              // Style headings
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold my-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold my-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold my-2">{children}</h3>
              ),
              // Style paragraphs
              p: ({ children }) => <div className="my-2">{children}</div>,
              // Style links
              a: ({ children, href }) => (
                <a 
                  href={href} 
                  className="text-blue-500 hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              // Add custom image component
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto max-h-[150px] object-contain my-2 rounded-lg"
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// Add SwapUI component
function SwapUI({ swapDetails, onConfirm, onCancel }: SwapUIProps) {
  const [amount, setAmount] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };
  
  const estimatedOutput = parseFloat(amount) * swapDetails.rate;
  
  return (
    <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 my-4">
      <h3 className="font-semibold text-lg mb-4">Swap Tokens</h3>
      
      <div className="space-y-4">
        {/* From Token */}
        <div className="bg-background rounded-lg p-3 border border-accent/10">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-foreground/70">From</span>
            <span className="text-sm text-foreground/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="bg-transparent text-lg font-medium focus:outline-none w-1/2"
              placeholder="0.0"
            />
            <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full">
              <div className="w-5 h-5 rounded-full bg-accent/20 mr-2"></div>
              <span className="font-medium">{swapDetails.fromToken}</span>
            </div>
          </div>
        </div>
        
        {/* Swap Arrow */}
        <div className="flex justify-center">
          <div className="bg-accent/10 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>
        
        {/* To Token */}
        <div className="bg-background rounded-lg p-3 border border-accent/10">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-foreground/70">To (estimated)</span>
            <span className="text-sm text-foreground/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium w-1/2">
              {estimatedOutput.toFixed(6)}
            </div>
            <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full">
              <div className="w-5 h-5 rounded-full bg-accent/20 mr-2"></div>
              <span className="font-medium">{swapDetails.toToken}</span>
            </div>
          </div>
        </div>
        
        {/* Swap Details */}
        <div className="space-y-2 text-sm text-foreground/70 p-2">
          <div className="flex justify-between">
            <span>Rate</span>
            <span>1 {swapDetails.fromToken} = {swapDetails.rate} {swapDetails.toToken}</span>
          </div>
          <div className="flex justify-between">
            <span>Fees</span>
            <span>${swapDetails.fees}</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage</span>
            <span>{swapDetails.slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Route</span>
            <span>{swapDetails.route}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg border border-accent/20 hover:bg-accent/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2 px-4 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Confirm Swap"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatSession({ sessionId, initialMessages }: ChatSessionProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiCallMade = useRef(false);
  const { addMessageToSession, getSessionById } = useChatStore();
  const [selectedMode, setSelectedMode] = useState(AGENT_MODES[0]);
  const [wallets, setWallets] = useState([{
    name: "Default Agent Wallet",
    subTxt: "AgN7....3Pda",
  }]);
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]);
  const [selectedModel, setSelectedModel] = useState(MOCK_MODELS[0]);
  const [selectedChainType, setSelectedChainType] = useState(CHAIN_TYPES[0]);
  const chatStoreInitialMessage = useChatStore((state: any) => state.initialMessage);
  
  // Add state for swap UI
  const [showSwapUI, setShowSwapUI] = useState(false);
  const [currentSwapDetails, setCurrentSwapDetails] = useState<SwapDetails | null>(null);

  // Function to check if message is about token price
  const isTokenPriceQuery = (message: string): boolean => {
    const priceKeywords = [
      'price of', 'token price', 'how much is', 'what is the price', 
      'price for', 'worth', 'value of', 'cost of', 'rate for'
    ];
    const lowercaseMsg = message.toLowerCase();
    return priceKeywords.some(keyword => lowercaseMsg.includes(keyword));
  };

  // Function to check if message is about swapping tokens
  const isSwapQuery = (message: string): boolean => {
    const swapKeywords = [
      'swap', 'exchange', 'trade', 'convert', 'switching', 
      'change from', 'change to', 'for', 'to get'
    ];
    const lowercaseMsg = message.toLowerCase();
    return swapKeywords.some(keyword => lowercaseMsg.includes(keyword));
  };

  // Function to handle token price queries
  const handleTokenPriceQuery = async (message: string) => {
    setIsLoading(true);
    try {
      // Extract token name from message (simplified version)
      const tokenMatches = message.match(/price of ([a-zA-Z0-9]+)|([a-zA-Z0-9]+) price|price for ([a-zA-Z0-9]+)/i);
      let tokenSymbol = "Unknown";
      
      if (tokenMatches) {
        // Find the first non-undefined group (which contains our token)
        tokenSymbol = tokenMatches.slice(1).find(match => match !== undefined) || "Unknown";
      }
      
      // Mock API call for token price (replace with actual API in production)
      const response = await fetch(`/api/tokenPrice?symbol=${tokenSymbol}`);
      
      if (!response.ok) throw new Error("Failed to get token price");
      
      const data = await response.json();
      
      // Add assistant message with token price information
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: `The current price of ${tokenSymbol} is $${data.price}. 
        \n\n24h Change: ${data.change24h}%
        \nMarket Cap: $${data.marketCap}
        \nVolume (24h): $${data.volume24h}`
      });
      
      // Refresh messages from store
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } catch (error) {
      console.error("Error fetching token price:", error);
      
      // Add error message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: "I'm sorry, I couldn't retrieve the token price information at this time. Please try again later."
      });
      
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle swap queries
  const handleSwapQuery = async (message: string) => {
    setIsLoading(true);
    try {
      // Simple regex to extract token pairs (this is a simplified version)
      const swapMatches = message.match(/swap ([a-zA-Z0-9]+) (?:to|for) ([a-zA-Z0-9]+)/i) || 
                          message.match(/([a-zA-Z0-9]+) (?:to|for) ([a-zA-Z0-9]+)/i);
      
      let fromToken = "Unknown";
      let toToken = "Unknown";
      
      if (swapMatches && swapMatches.length >= 3) {
        fromToken = swapMatches[1];
        toToken = swapMatches[2];
      }
      
      // MOCK DATA: Instead of making an API call, use mock data
      // This simulates the response from the /api/swapQuote endpoint
      const mockSwapQuotes = {
        "ETH": {
          "SOL": { rate: 13.45, fees: "2.50", slippage: 0.5, route: "ETH → USDC → SOL" },
          "BTC": { rate: 0.057, fees: "3.75", slippage: 0.3, route: "ETH → WBTC → BTC" },
          "USDC": { rate: 3450.25, fees: "1.20", slippage: 0.1, route: "ETH → USDC" },
          "USDT": { rate: 3445.80, fees: "1.25", slippage: 0.1, route: "ETH → USDT" },
          "AVAX": { rate: 105.32, fees: "2.10", slippage: 0.4, route: "ETH → USDC → AVAX" }
        },
        "SOL": {
          "ETH": { rate: 0.074, fees: "1.80", slippage: 0.5, route: "SOL → USDC → ETH" },
          "BTC": { rate: 0.0042, fees: "2.15", slippage: 0.4, route: "SOL → USDC → BTC" },
          "USDC": { rate: 256.35, fees: "0.90", slippage: 0.2, route: "SOL → USDC" },
          "USDT": { rate: 255.80, fees: "0.95", slippage: 0.2, route: "SOL → USDT" },
          "AVAX": { rate: 7.85, fees: "1.50", slippage: 0.3, route: "SOL → USDC → AVAX" }
        },
        "BTC": {
          "ETH": { rate: 17.52, fees: "4.20", slippage: 0.3, route: "BTC → WETH → ETH" },
          "SOL": { rate: 235.75, fees: "3.80", slippage: 0.4, route: "BTC → USDC → SOL" },
          "USDC": { rate: 60450.25, fees: "2.50", slippage: 0.1, route: "BTC → USDC" },
          "USDT": { rate: 60425.80, fees: "2.55", slippage: 0.1, route: "BTC → USDT" },
          "AVAX": { rate: 1850.32, fees: "3.25", slippage: 0.3, route: "BTC → USDC → AVAX" }
        },
        "USDC": {
          "ETH": { rate: 0.00029, fees: "1.10", slippage: 0.1, route: "USDC → ETH" },
          "SOL": { rate: 0.0039, fees: "0.85", slippage: 0.2, route: "USDC → SOL" },
          "BTC": { rate: 0.000017, fees: "1.25", slippage: 0.1, route: "USDC → BTC" },
          "USDT": { rate: 0.9995, fees: "0.50", slippage: 0.05, route: "USDC → USDT" },
          "AVAX": { rate: 0.031, fees: "0.90", slippage: 0.2, route: "USDC → AVAX" }
        }
      };
      
      // Default mock data in case the tokens aren't in our mock database
      let mockData = { rate: 1.0, fees: "1.00", slippage: 0.1, route: `${fromToken} → ${toToken}` };
      
      // Try to get the specific mock data for this token pair
      if (mockSwapQuotes[fromToken as keyof typeof mockSwapQuotes] && mockSwapQuotes[fromToken as keyof typeof mockSwapQuotes][toToken as keyof typeof mockSwapQuotes]) {
        mockData = mockSwapQuotes[fromToken as keyof typeof mockSwapQuotes][toToken as keyof typeof mockSwapQuotes];
      }
      
      // Store swap details for UI display
      setCurrentSwapDetails({
        fromToken,
        toToken,
        rate: mockData.rate,
        fees: mockData.fees,
        slippage: mockData.slippage,
        route: mockData.route
      });
      
      // Add assistant message with swap information
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: `Here's the current swap rate for ${fromToken} to ${toToken}:
        \n\n1 ${fromToken} = ${mockData.rate} ${toToken}
        \n\nEstimated fees: $${mockData.fees}
        \nSlippage: ${mockData.slippage}%
        \nRoute: ${mockData.route}`
      });
      
      // Refresh messages from store
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
      
      // Show swap UI immediately
      setShowSwapUI(true);
      
    } catch (error) {
      console.error("Error fetching swap quote:", error);
      
      // Add error message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: "I'm sorry, I couldn't retrieve the swap information at this time. Please try again later."
      });
      
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the handleSwapConfirmation function since we're showing the UI immediately
  // and replace with a function to check if the message is a new swap request
  const isNewSwapRequest = (message: string): boolean => {
    // If we're already showing the swap UI and the message contains swap keywords,
    // it's likely a new swap request
    if (showSwapUI && isSwapQuery(message)) {
      return true;
    }
    return false;
  };
  
  // Add function to execute swap
  const executeSwap = async () => {
    if (!currentSwapDetails) return;
    
    setIsLoading(true);
    try {
      // MOCK DATA: Instead of making an API call, use mock data
      // This simulates the response from the /api/executeSwap endpoint
      
      // Generate a random transaction hash
      const generateTxHash = () => {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
          hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
      };
      
      // Calculate mock values based on current swap details
      const mockAmountSent = 1.0; // Assuming 1 token is sent
      const mockAmountReceived = mockAmountSent * currentSwapDetails.rate;
      const mockFeePaid = parseFloat(currentSwapDetails.fees);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        success: true,
        txHash: generateTxHash(),
        amountSent: mockAmountSent,
        amountReceived: mockAmountReceived.toFixed(6),
        feePaid: mockFeePaid
      };
      
      // Add success message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: `✅ Swap completed successfully!
        \n\nTransaction Hash: \`${mockResponse.txHash}\`
        \nAmount Sent: ${mockResponse.amountSent} ${currentSwapDetails.fromToken}
        \nAmount Received: ${mockResponse.amountReceived} ${currentSwapDetails.toToken}
        \nFee Paid: $${mockResponse.feePaid}`
      });
      
      // Refresh messages from store
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
      
      // Hide swap UI
      setShowSwapUI(false);
      setCurrentSwapDetails(null);
    } catch (error) {
      console.error("Error executing swap:", error);
      
      // Add error message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: "I'm sorry, there was an error executing the swap. Please try again later."
      });
      
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add function to cancel swap
  const cancelSwap = () => {
    setShowSwapUI(false);
    
    // Add cancellation message
    addMessageToSession(sessionId, {
      role: 'assistant',
      content: "Swap cancelled. Is there anything else I can help you with?"
    });
    
    // Refresh messages from store
    const updatedSession = getSessionById(sessionId);
    if (updatedSession?.messages) {
      setMessages(updatedSession.messages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => {
        setWallets(data.wallets);
      });
    const session = getSessionById(sessionId);
    if (session?.messages) {
      setMessages(session.messages);
      
      // If only one user message exists and API hasn't been called
      if (session.messages.length === 1 && 
          session.messages[0].role === 'user' && 
          !apiCallMade.current) {
        apiCallMade.current = true;
        handleApiCall(session.messages[0].content);
      }
    }
  }, [sessionId]);

  const handleApiCall = async (message: string) => {
    setIsLoading(true);
    try {
      // Check if this is a new swap request while already showing the swap UI
      if (isNewSwapRequest(message)) {
        // Hide current swap UI before processing new request
        setShowSwapUI(false);
        setCurrentSwapDetails(null);
      }
      
      // Check if the message is about token price or swap
      if (isTokenPriceQuery(message)) {
        await handleTokenPriceQuery(message);
        return;
      } else if (isSwapQuery(message)) {
        await handleSwapQuery(message);
        return;
      }

      // Regular chat API call if not a special query
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, modelName: selectedModel?.name, chainType: selectedChainType?.name }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      // Add assistant message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: data.response
      });

      // Refresh messages from store
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);

    // Add user message and update messages state immediately
    addMessageToSession(sessionId, {
      role: 'user',
      content: input
    });
    
    // Refresh messages from store right away to show user message
    const updatedSession = getSessionById(sessionId);
    if (updatedSession?.messages) {
      setMessages(updatedSession.messages);
    }

    const currentInput = input; // Store input before clearing
    setInput("");

    try {
      // Check if this is a new swap request while already showing the swap UI
      if (isNewSwapRequest(currentInput)) {
        // Hide current swap UI before processing new request
        setShowSwapUI(false);
        setCurrentSwapDetails(null);
      }
      
      // Check if the message is about token price or swap
      if (isTokenPriceQuery(currentInput)) {
        await handleTokenPriceQuery(currentInput);
        return;
      } else if (isSwapQuery(currentInput)) {
        await handleSwapQuery(currentInput);
        return;
      }

      // Regular chat API call if not a special query
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, modelName: selectedModel?.name, chainType: selectedChainType?.name }), // Use stored input
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      // Add assistant message
      addMessageToSession(sessionId, {
        role: 'assistant',
        content: data.response
      });

      // Refresh messages from store
      const updatedSession = getSessionById(sessionId);
      if (updatedSession?.messages) {
        setMessages(updatedSession.messages);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <UserMessage content={message.content} />
              ) : (
                <AssistantMessage content={message.content} />
              )}
            </div>
          ))}
          
          {/* Show Swap UI if needed */}
          {showSwapUI && currentSwapDetails && (
            <div className="flex justify-start">
              <div className="flex relative items-start max-w-[85%] w-full">
                <div className="absolute -left-8 top-2 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <AgentLogo />
                </div>
                <div className="w-full px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl text-foreground/90 rounded-bl-sm">
                  <SwapUI 
                    swapDetails={currentSwapDetails}
                    onConfirm={executeSwap}
                    onCancel={cancelSwap}
                  />
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex relative items-start max-w-[85%]">
                <div className="absolute -left-8 top-2 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <AgentLogo />
                </div>
                <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl text-foreground/90 rounded-bl-sm">
                  <div className="whitespace-pre-wrap">Thinking...</div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            selectedWallet={selectedWallet}
            setSelectedWallet={setSelectedWallet}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedChainType={selectedChainType}
            setSelectedChainType={setSelectedChainType}
          />
        </div>
      </div>
    </div>
  );
}