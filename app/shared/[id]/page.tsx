/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ChatMessage } from "@/db/schema";
import { useAuth } from "@/lib/hooks/useAuth";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SharedChatSession {
  id: number;
  userId: number;
  title: string;
  timestamp: string;
  modelName: string;
  modelSubText?: string;
  isShared?: boolean;
}

interface SharedChatPageProps {
  session: SharedChatSession;
  messages: ChatMessage[];
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mt-4">
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SharedChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<SharedChatPageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthBanner, setShowAuthBanner] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shared/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch shared chat");
        }
        
        const data = await response.json();
        setData(data);
        
        // Check if the current user is the owner of the chat
        if (user && data.session.userId === user.id) {
          setIsOwner(true);
        } else if (user) {
          // User is logged in but not the owner
          setShowAuthBanner(false); // They're already authenticated
        } else {
          // User is not logged in
          setShowAuthBanner(true);
        }
      } catch (error) {
        console.error("Error fetching shared chat:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSharedChat();
    }
  }, [params.id, user]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Chat Not Found</h2>
          <p className="text-muted-foreground">The shared chat you're looking for doesn't exist or is no longer shared.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl mt-4">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{data.session.title}</h1>
              <div className="text-sm text-muted-foreground">
                {new Date(data.session.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Model:</span> {data.session.modelName}
              {data.session.modelSubText && ` (${data.session.modelSubText})`}
            </div>
          </div>
          
          <div className="p-6">
            {data.messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                This chat has no messages.
              </div>
            ) : (
              <div className="space-y-6">
                {data.messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.role === 'user' ? (isOwner ? 'You' : 'User') : 'Assistant'}
                      </div>
                      {(() => {
                        // Check if the message contains an image URL
                        const hasImageUrl = message.content.includes("URL:");
                        
                        // Split the content to separate the text and image URL
                        let messageText = message.content;
                        let imageUrl = "";
                        
                        if (hasImageUrl) {
                          const parts = message.content.split("URL:");
                          messageText = parts[0].trim();
                          imageUrl = parts[1].trim();
                        }
                        
                        return (
                          <>
                            <div className="whitespace-pre-wrap">{messageText}</div>
                            
                            {/* Display image if URL is present */}
                            {hasImageUrl && (
                              <div className="mt-2 border-t border-primary-foreground/20 pt-2">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                  Attached Image
                                </div>
                                <Image
                                  width={300}
                                  height={300}
                                  src={imageUrl} 
                                  alt="Attached image" 
                                  className="max-h-48 w-full rounded-sm object-contain bg-white dark:bg-black/5"
                                />
                              </div>
                            )}
                          </>
                        );
                      })()}
                      <div className="text-xs mt-2 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-muted/30 text-center text-sm text-muted-foreground">
            This is a read-only view of a shared chat.
          </div>
        </div>
      </div>

      {/* Authentication Banner */}
      {showAuthBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div>
              <h3 className="font-medium">Want to create your own chats?</h3>
              <p className="text-sm text-muted-foreground">Sign in to create and share your own AI conversations.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAuthBanner(false)}
              >
                <X size={16} className="mr-1" />
                Dismiss
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 