"use client";

import { Button } from "@/components/ui/button";
import {
  CaretLeft,
  CaretRight,
  Plus,
  Keyboard,
  Trash,
  Broadcast,
  DotsThreeVertical,
  Share,
  PencilSimple,
  Copy,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AgentLogo } from "./AgentLogo";
import { UserProfile } from "./UserProfile";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileNav } from "./MobileNav";
import { useRouter } from "next/navigation";
import { MOCK_MODELS } from "../chat/ChatInput";
import {
  useChatSessions,
  useDeleteChatSession,
  useUpdateChatSession,
} from "@/lib/hooks/useChatSessions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function SideNav() {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Use React Query hooks for sessions
  const { data: sessions = [], isLoading: isSessionsLoading } =
    useChatSessions();
  const deleteSessionMutation = useDeleteChatSession();
  const updateSessionMutation = useUpdateChatSession();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSessionClick = async (sessionId: number) => {
    setSelectedConversation(sessionId);
    router.push(`/chat/${sessionId}`);
  };

  const handleDeleteSession = async (
    sessionId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      // If we're on the deleted session's page, redirect to home
      if (selectedConversation === sessionId) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleShareSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Generate a shareable URL
      const shareableUrl = `${window.location.origin}/shared/${sessionId}`;

      // If not already shared, update the session to mark it as shared
      if (!sessions.find((s) => s.id === sessionId)?.isShared) {
        await updateSessionMutation.mutateAsync({
          id: sessionId,
          // Use a string key to avoid TypeScript errors
          isShared: true,
        } as any);
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);

      // Show toast notification
      toast.success("Shareable link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing session:", error);
      toast.error("Failed to share chat");
    }
  };

  const handleRenameClick = (
    sessionId: number,
    currentTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setRenameSessionId(sessionId);
    setNewTitle(currentTitle);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameSessionId && newTitle.trim()) {
      try {
        await updateSessionMutation.mutateAsync({
          id: renameSessionId,
          title: newTitle.trim(),
        });
        setRenameSessionId(null);
      } catch (error) {
        console.error("Error renaming session:", error);
      }
    }
  };

  return (
    <>
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static top-0 left-0 h-screen",
          "bg-card dark:bg-card",
          "flex flex-col z-40",
          "transition-all duration-300 ease-out",
          "border-r border-border",
          "w-[280px] md:w-auto",
          isExpanded ? "md:w-[280px]" : "md:w-[70px]",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Add top spacing for mobile */}
        <div className="h-16 md:hidden" />

        {/* Sidebar Content Container */}
        <div className="relative flex flex-col flex-1 gap-2 h-full max-h-screen">
          {/* Sidebar Header */}
          <div
            className={cn(
              "flex flex-col shrink-0",
              "px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 gap-4 sm:gap-6",
              "bg-gradient-to-b from-muted/50 to-transparent",
              !isExpanded && "md:px-3"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isExpanded ? "justify-between px-1" : "md:justify-center"
              )}
            >
              {/* Desktop Logo - only show on desktop */}
              {isExpanded && !isMobile && (
                <div
                  className={cn(
                    "flex items-center cursor-pointer",
                    "gap-2 sm:gap-3 md:group py-1",
                    !isExpanded && "md:justify-center"
                  )}
                  onClick={() => router.push("/")}
                >
                  <>
                    <AgentLogo />
                    <h1
                      className={cn(
                        "text-base sm:text-[18px] font-semibold",
                        "text-foreground",
                        "transition-all duration-300 ease-out",
                        "group-hover:text-accent"
                      )}
                    >
                      Espio
                    </h1>
                  </>
                </div>
              )}
              
              {isExpanded && !isMobile && (
                <Button
                  variant="ghostNoBackground"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hover:bg-muted"
                >
                  <CaretLeft className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* New Thread Button */}
            <Button
              variant="newThread"
              className={cn(
                "h-11 bg-accent/10 text-accent hover:bg-accent/20",
                !isExpanded && !isMobile && "justify-center p-2"
              )}
              onClick={() => {
                router.push(`/chat/new`);
              }}
            >
              <Plus size={17} weight="bold" />
              {(isExpanded || (!isExpanded && isMobile)) && (
                <>
                  <span className="text-[15px]">New Chat</span>
                </>
              )}
            </Button>
          </div>

          {/* Custom Divider */}
          <div className="h-[1px] w-full bg-border/50 shrink-0" />

          {/* Mobile-only Feed Navigation */}
          {isMobile && (
            <div className="px-3 py-2">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-2 h-10"
                onClick={() => {
                  router.push('/feed');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Broadcast size={18} />
                <span className="text-[15px]">Feed</span>
              </Button>
            </div>
          )}

          {/* Custom Divider for mobile Feed */}
          {isMobile && <div className="h-[1px] w-full bg-border/50 shrink-0" />}
          
          {/* Custom Divider before Recent section */}
          <div className="h-[1px] w-full bg-border/50 shrink-0" />

          {/* Recent Items - Only show when expanded on desktop */}
          {(isExpanded || (!isExpanded && isMobile)) && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-2 shrink-0">
                <div className="text-sm font-medium text-muted-foreground">
                  Recent
                </div>
                <div className="text-xs text-muted-foreground">
                  {sessions.length} chats
                </div>
              </div>
              <div className="px-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
                <div className="space-y-1 py-1">
                  {isSessionsLoading ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No sessions yet
                    </div>
                  ) : (
                    sessions.map((item) => (
                      <div key={item.id} className="relative">
                        {renameSessionId === item.id ? (
                          <form
                            onSubmit={handleRenameSubmit}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-2"
                          >
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="w-full px-2 py-1 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                              autoFocus
                              onBlur={handleRenameSubmit}
                            />
                          </form>
                        ) : (
                          <Button
                            variant="ghost"
                            className={cn(
                              "group flex flex-col items-start w-full px-2 sm:px-3 py-2 sm:py-2.5 h-auto",
                              "overflow-hidden relative",
                              selectedConversation === item.id
                                ? "bg-muted"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => handleSessionClick(item.id)}
                          >
                            <div className="w-full">
                              <div
                                className={cn(
                                  "text-[13px] sm:text-[14px] text-left truncate",
                                  selectedConversation === item.id
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {item.title}
                              </div>
                              <div className="text-[11px] sm:text-[12px] text-muted-foreground mt-1 text-left truncate">
                                {new Date(item.timestamp).toLocaleString()}
                                {item.isShared && (
                                  <span className="ml-2 text-accent">
                                    • Shared
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* More options dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                                >
                                  <DotsThreeVertical size={16} weight="bold" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 p-1"
                              >
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) =>
                                    handleShareSession(item.id, e)
                                  }
                                >
                                  {item.isShared ? (
                                    <>
                                      <Copy size={14} weight="bold" />
                                      <span>Copy Link</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share size={14} weight="bold" />
                                      <span>Share</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) =>
                                    handleRenameClick(item.id, item.title, e)
                                  }
                                >
                                  <PencilSimple size={14} weight="bold" />
                                  <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive focus:text-destructive"
                                  onClick={(e) =>
                                    handleDeleteSession(item.id, e)
                                  }
                                >
                                  <Trash size={14} weight="bold" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Spacer when sidebar is collapsed on desktop */}
          {!isExpanded && !isMobile && <div className="flex-1" />}

          {/* Custom Divider */}
          <div className="h-[1px] w-full bg-border/50 shrink-0" />

          {/* Sidebar Footer */}
          <div
            className={cn(
              "transition-all z-20 duration-300 ease-out p-3 shrink-0",
              "bg-gradient-to-t from-muted/50 to-transparent"
            )}
          >
            {!isExpanded && !isMobile && (
              <Button
                variant="ghostNoBackground"
                size="iconSm"
                className="w-full mb-3 hover:bg-muted/50"
                onClick={toggleSidebar}
              >
                <CaretRight className="h-5 w-5" />
              </Button>
            )}
            <ThemeSwitcher isExpanded={isExpanded} />
            <UserProfile isExpanded={isExpanded} />
          </div>
        </div>
      </div>
    </>
  );
}
