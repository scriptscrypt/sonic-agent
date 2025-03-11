'use client';

import { Chatcomp } from "@/components/chat/Chatcomp";
import { useChatSessions } from "@/lib/hooks/useChatSessions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const { data: sessions, isLoading } = useChatSessions();

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // If there are sessions, redirect to the first one
  if (sessions && sessions.length > 0) {
    redirect(`/chat/${sessions[0].id}`);
  }

  // If no sessions, show the new chat component
  return <Chatcomp />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
