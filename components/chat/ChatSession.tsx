"use client";

import { AgentLogo } from "@/components/layout/AgentLogo";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChatInput, MOCK_MODELS, CHAIN_TYPES } from "./ChatInput";
import { AGENT_MODES } from "./ModeSelector";
import { useChatSession } from "@/lib/hooks/useChatSessions";
import {
  useChatMessages,
  useSendMessageToAI,
  ChatMessage,
} from "@/lib/hooks/useChatMessages";
import { useWalletContext } from "@/app/providers/WalletProvider";
import { WalletInfo } from "@/lib/hooks/useWallet";
import Link from "next/link";
import Image from "next/image";

interface UserMessageProps {
  content: string;
}

function UserMessage({ content }: UserMessageProps) {
  // Check if the message contains an image URL
  const hasImageUrl = content.includes("URL:");
  
  // Split the content to separate the text and image URL
  let messageText = content;
  let imageUrl = "";
  
  if (hasImageUrl) {
    const parts = content.split("URL:");
    messageText = parts[0].trim();
    imageUrl = parts[1].trim();
  }
  
  return (
    <div className="flex justify-end mb-4 message-animation">
      <div className="flex relative items-end max-w-[85%]">
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-primary text-primary-foreground rounded-br-none shadow-sm">
          <div className="whitespace-pre-wrap">{messageText}</div>
          
          {/* Display image if URL is present */}
          {hasImageUrl && (
            <div className="pt-2 mt-2 border-t border-primary-foreground/20">
              <div className="flex items-center mb-1 text-xs text-primary-foreground/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Attached Image
              </div>
              <Image
                width={100}
                height={100}
                src={imageUrl} 
                alt="Attached image" 
                className="object-contain w-full bg-white rounded-sm max-h-48 dark:bg-black/5"
              />
            </div>
          )}
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
    <div className="flex justify-start mb-4 message-animation">
      <div className="flex relative items-start max-w-[85%]">
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-10 top-1 bg-accent/10">
          <AgentLogo />
        </div>
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-sm">
          <div className="prose-sm prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatSessionProps {
  sessionId: number;
}

export function ChatSession({ sessionId }: ChatSessionProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMode, setSelectedMode] = useState(AGENT_MODES[0]);
  const [selectedWallet, setSelectedWallet] = useState<{
    name: string;
    subTxt: string;
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState(MOCK_MODELS[0]);
  const [selectedChainType, setSelectedChainType] = useState(CHAIN_TYPES[0]);
  const { wallets } = useWalletContext();
  const [error, setError] = useState<string | null>(null);

  // Fetch session and messages using React Query
  const { 
    data: session, 
    isLoading: isSessionLoading,
    error: sessionError
  } = useChatSession(sessionId);
  
  const { 
    data: messages = [], 
    isLoading: isMessagesLoading, 
    refetch: refetchMessages,
    error: messagesError
  } = useChatMessages(sessionId);
  
  const sendMessage = useSendMessageToAI(sessionId, wallets[0]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages on mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      console.log("Fetching messages for session:", sessionId);
      refetchMessages().then(result => {
        if (result.data) {
          console.log("Messages fetched:", result.data);
        }
        if (result.error) {
          console.error("Error fetching messages:", result.error);
          setError("Failed to load messages");
        }
      });
    }
  }, [sessionId, refetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set the first wallet as the selected wallet when wallets are loaded
  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet({
        name: wallets[0].name,
        subTxt: wallets[0].displayAddress,
      });
    }
  }, [wallets, selectedWallet]);

  const handleSubmit = async (e: React.FormEvent, model: any, fullPrompt?: string) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);

    // Use the fullPrompt if provided, otherwise use the input
    const messageToSend = fullPrompt || input;
    
    const currentInput = input;
    setInput("");

    try {
      console.log("Sending message:", messageToSend);
      await sendMessage.mutateAsync({
        message: messageToSend,
        modelName: selectedModel?.name,
      });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
      setInput(currentInput); // Restore the input if there was an error
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent/50 animate-pulse"></div>
            <div className="w-3 h-3 delay-150 rounded-full bg-accent/50 animate-pulse"></div>
            <div className="w-3 h-3 delay-300 rounded-full bg-accent/50 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center max-w-md p-6 space-y-4 text-center border shadow-md bg-card rounded-2xl border-border/50">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
            <AgentLogo className="rounded-lg" />
          </div>
          <h2 className="text-xl font-semibold">Session Error</h2>
          <p className="text-muted-foreground">
            {sessionError instanceof Error ? sessionError.message : "This chat session may have been deleted or doesn't exist."}
          </p>
          <Link
            href="/chat/new"
            className="px-4 py-2 transition-colors rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Create a new session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        <div className="w-full max-w-3xl mx-auto space-y-2">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <UserMessage content={message.content} />
              ) : (
                <AssistantMessage content={message.content} />
              )}
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex justify-start mb-4 message-animation">
              <div className="flex relative items-start max-w-[85%]">
                <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-10 top-1 bg-accent/10">
                  <AgentLogo className="rounded-lg"/>
                </div>
                <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent/50 animate-pulse"></div>
                    <div className="w-2 h-2 delay-150 rounded-full bg-accent/50 animate-pulse"></div>
                    <div className="w-2 h-2 delay-300 rounded-full bg-accent/50 animate-pulse"></div>
                  </div>
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
