"use client";

import { useState } from "react";
import { useSolanaAgent } from "../providers/SolanaAgentProvider";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getAgentWithWallet } = useSolanaAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          modelName: "Claude", // or whatever model you want to use
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      setResponse("Error: Failed to get a response");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {response && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p>{response}</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 bg-gray-700 text-white p-2 rounded-l-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r-lg"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
} 