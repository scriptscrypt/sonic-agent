"use client";

import { Button } from "@/components/ui/button";
import {
	CaretLeft,
	CaretRight,
	Plus,
	Keyboard,
	Trash,
	Broadcast,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AgentLogo } from "./AgentLogo";
import { UserProfile } from "./UserProfile";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileNav } from "./MobileNav";
import { useRouter } from "next/navigation";
import { MOCK_MODELS } from "../chat/ChatInput";
import { useChatSessions, useDeleteChatSession } from "@/lib/hooks/useChatSessions";

export default function SideNav() {
	const [selectedConversation, setSelectedConversation] = useState<
		number | null
	>(null);
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	// Use React Query hooks for sessions
	const { data: sessions = [], isLoading: isSessionsLoading } = useChatSessions();
	const deleteSessionMutation = useDeleteChatSession();

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

	const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await deleteSessionMutation.mutateAsync(sessionId);
			// If we're on the deleted session's page, redirect to home
			if (selectedConversation === sessionId) {
				router.push('/');
			}
		} catch (error) {
			console.error("Error deleting session:", error);
		}
	};

	return (
		<>
			<MobileNav
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
			/>

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
						: "-translate-x-full md:translate-x-0",
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
							!isExpanded && "md:px-3",
						)}
					>
						<div
							className={cn(
								"flex items-center",
								isExpanded ? "justify-between px-1" : "md:justify-center",
							)}
						>
							<div
								className={cn(
									"flex items-center cursor-pointer",
									"gap-2 sm:gap-3 md:group py-1",
									!isExpanded && "md:justify-center",
								)}
								onClick={() => router.push("/")}
							>
								<AgentLogo />
								{(isExpanded || (!isExpanded && isMobile)) && (
									<h1
										className={cn(
											"text-base sm:text-[18px] font-semibold",
											"text-foreground",
											"transition-all duration-300 ease-out",
											"group-hover:text-accent",
										)}
									>
										Espio
									</h1>
								)}
							</div>
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
								!isExpanded && !isMobile && "justify-center p-2",
							)}
							onClick={() => {
								router.push(`/chat/new`);
							}}
						>
							<Plus size={17} weight="bold" />
							{(isExpanded || (!isExpanded && isMobile)) && (
								<>
									<span className="text-[15px]">New Chat</span>
									{/* <div className="ml-auto flex items-center gap-1.5 text-[13px] opacity-60">
										<Keyboard size={13} weight="bold" />
										<span>K</span>
									</div> */}
								</>
							)}
						</Button>
					</div>

					{/* Custom Divider */}
					<div className="h-[1px] w-full bg-border/50 shrink-0" />

					{/* Navigation Links */}
					{(isExpanded || (!isExpanded && isMobile)) && (
						<div className="px-3 space-y-1">
							<Button
								variant="ghost"
								className={cn(
									"w-full justify-start",
									!isExpanded && "md:justify-center"
								)}
								onClick={() => router.push("/feed")}
							>
								<Broadcast size={18} className="mr-2" />
								<span>Feed</span>
							</Button>
						</div>
					)}

					{/* Custom Divider */}
					<div className="h-[1px] w-full bg-border/50 shrink-0" />

					{/* Recent Items - Only show when expanded on desktop */}
					{(isExpanded || (!isExpanded && isMobile)) && (
						<div className="flex-1 min-h-0">
							<div className="flex items-center justify-between px-6 py-2 shrink-0">
								<div className="text-sm font-medium text-muted-foreground">
									Recent
								</div>
								<div className="text-xs text-muted-foreground">
									{sessions.length} chats
								</div>
							</div>
							<div className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
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
										<Button
											key={item.id}
											variant="ghost"
											className={cn(
												"group flex flex-col items-start w-full px-2 sm:px-3 py-2 sm:py-2.5 h-auto",
												"overflow-hidden relative",
												selectedConversation === item.id
													? "bg-muted"
													: "hover:bg-muted/50",
											)}
											onClick={() => handleSessionClick(item.id)}
										>
											<div className="w-full">
												<div
													className={cn(
														"text-[13px] sm:text-[14px] text-left truncate",
														selectedConversation === item.id
															? "text-foreground"
															: "text-muted-foreground",
													)}
												>
													{item.title}
												</div>
												<div className="text-[11px] sm:text-[12px] text-muted-foreground mt-1 text-left truncate">
													{new Date(item.timestamp).toLocaleString()}
												</div>
											</div>

											{/* Delete button */}
											<Button
												variant="ghost"
												size="icon"
												className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
												onClick={(e) => handleDeleteSession(item.id, e)}
											>
												<Trash size={14} weight="bold" />
											</Button>
										</Button>
									))
								)}
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
