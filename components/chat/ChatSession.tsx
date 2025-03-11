"use client";

import { AgentLogo } from "@/components/layout/AgentLogo";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { ChatInput, MOCK_MODELS, CHAIN_TYPES } from "./ChatInput";
import { AGENT_MODES } from "./ModeSelector";
import { useChatSession } from "@/lib/hooks/useChatSessions";
import { useChatMessages, useSendMessageToAI, ChatMessage } from "@/lib/hooks/useChatMessages";

interface UserMessageProps {
  content: string;
}

function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="flex relative items-end max-w-[85%]">
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-primary text-primary-foreground rounded-br-sm">
          <div className="whitespace-pre-wrap">{content}</div>
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
        <div className="px-4 py-3 text-[15px] tracking-[-0.01em] leading-[1.65] font-medium rounded-2xl bg-secondary text-foreground/90 rounded-bl-sm">
          <div className="whitespace-pre-wrap">
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
  const [wallets, setWallets] = useState([{
    name: "Default Agent Wallet",
    subTxt: "AgN7....3Pda",
  }]);
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]);
  const [selectedModel, setSelectedModel] = useState(MOCK_MODELS[0]);
  const [selectedChainType, setSelectedChainType] = useState(CHAIN_TYPES[0]);

  // Fetch session and messages using React Query
  const { data: session, isLoading: isSessionLoading } = useChatSession(sessionId);
  const { data: messages = [], isLoading: isMessagesLoading } = useChatMessages(sessionId);
  const sendMessage = useSendMessageToAI(sessionId);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput("");

    try {
      await sendMessage.mutateAsync({
        message: currentInput,
        modelName: selectedModel?.name,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isSessionLoading) {
    return <div className="p-4 text-center">Loading session...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Session not found</div>;
  }

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
          {sendMessage.isPending && (
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